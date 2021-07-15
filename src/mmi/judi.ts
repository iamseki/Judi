import EventEmitter from 'events';
import { JudiState, JudiInitialState, JudiEvents, JudiEvent } from '../models/judi';
import { AccountInfoHandler } from '../models/account-info';
import { OrderHandler } from '../models/order';
import { Listener } from '../models/listener';

export class JudiStateMachine extends EventEmitter {
  private readonly symbol = process.env.SYMBOL;
  private readonly asset = process.env.ASSET;
  private readonly currency = process.env.CURRENCY;
  private readonly profit = process.env.PROFIT;
  private readonly spent = Number(process.env.SPENT);
  private readonly sellQty = Number(process.env.SELL_QUANTITY ?? 0);
  private goodBuy = Number(process.env.GOOD_BUY);
  private goodSell = Number(process.env.GOOD_SELL);

  private state = JudiState.Initial;

  constructor(
    private readonly initialState: JudiInitialState,
    private readonly accountInfo: AccountInfoHandler,
    private readonly order: OrderHandler,
    private readonly marketListener: Listener,
  ) {
    super();
  }

  public async start(): Promise<void> {
    try {
      switch (this.initialState) {
        case JudiInitialState.AccountBalance:
          const balance = await this.accountInfo.balance();
          this.state = JudiState.AccountBalanceSuccess;
          this.emitJudiEvent(JudiEvents.Successed, { balance });
          break;
        case JudiInitialState.Buy:
          this.state = JudiState.ListeningMarket;
          this.marketListener.listenToMarket(this.handleBuy.bind(this));
          this.emitJudiEvent(JudiEvents.Processing);
          break;
        case JudiInitialState.Sell:
          this.state = JudiState.ListeningMarket;
          this.marketListener.listenToMarket(this.handleSell.bind(this));
          this.emitJudiEvent(JudiEvents.Processing);
          break;
        default:
          console.log('default initial state');
          break;
      }
    } catch (error) {
      this.emitJudiEvent(JudiEvents.Failed, { error });
    }
  }

  private async handleBuy(symbolPrice: number): Promise<boolean> {
    this.state = JudiState.HandleBuy;
    this.emitJudiEvent(JudiEvents.Processing, { symbolPrice });

    if (symbolPrice >= this.goodBuy && JudiState[this.state] !== JudiState.ProcessingOrder) return false;
    this.state = JudiState.ProcessingOrder;

    const currencyAmount = (await this.accountInfo.currencyAmount(this.currency)) * this.spent;

    if (currencyAmount == 0) {
      this.emitJudiEvent(JudiEvents.Failed, { currencyAmount });
      return true;
    }

    const quantity = Number((currencyAmount / symbolPrice).toFixed(6));

    const orderResult = await this.order.buy(this.symbol, quantity);

    this.state = JudiState.HandleBuySuccess;

    this.emitJudiEvent(JudiEvents.Successed, { orderResult, quantity });
    return true;
  }

  private async handleSell(symbolPrice: number): Promise<boolean> {
    this.state = JudiState.HandleSell;
    this.emitJudiEvent(JudiEvents.Processing, { symbolPrice });

    if (symbolPrice <= this.goodSell && JudiState[this.state] !== JudiState.ProcessingOrder) return false;
    this.state = JudiState.ProcessingOrder;

    // sold half or everything in this.sellQty
    const quantity = this.sellQty ?? (await this.accountInfo.sellQuantityAvailable(this.asset, 0.5));

    const orderResult = await this.order.sell(this.symbol, quantity);

    this.state = JudiState.HandleSellSuccess;

    this.emitJudiEvent(JudiEvents.Successed, { orderResult, quantity });
    return true;
  }

  private emitJudiEvent(name: JudiEvents, data = {}): boolean {
    const e: JudiEvent = {
      state: this.state,
      initialState: this.initialState,
      data,
    };
    return this.emit(name, e);
  }
}
