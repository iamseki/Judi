import EventEmitter from 'events';
import { JudiState, JudiInitialState, JudiEvents, JudiEvent } from '../models/judi';
import { AccountInfoHandler } from '../models/account-info';
import { OrderHandler, OrderResult, OrderStatus } from '../models/order';
import { MarketHandler } from '../models/market';
import { Listener } from '../models/listener';
import BigNumber from 'bignumber.js';

export class JudiStateMachine extends EventEmitter {
  private readonly symbol = process.env.SYMBOL;
  private readonly asset = process.env.ASSET;
  private readonly currency = process.env.CURRENCY;
  private readonly profit = Number(process.env.PROFIT);
  private readonly spent = Number(process.env.SPENT);
  private sellQty = Number(process.env.SELL_QUANTITY ?? 0);
  private goodBuy = Number(process.env.GOOD_BUY);
  private goodSell = Number(process.env.GOOD_SELL);

  private state = JudiState.Initial;

  constructor(
    private readonly initialState: JudiInitialState,
    private readonly accountInfo: AccountInfoHandler,
    private readonly order: OrderHandler,
    private readonly market: MarketHandler,
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
        case JudiInitialState.OperateMyMoney:
          this.state = JudiState[process.env.JUDI_INITIAL_INTENTION];
          this.marketListener.listenToMarket(this.defaultMoneyOperation.bind(this), { loop: true });
          this.emitJudiEvent(JudiEvents.Processing);
          break;
        case JudiInitialState.SymbolPrice:
          const ticker = await this.market.tickerPrice(this.symbol);
          this.state = JudiState.SymbolPriceSuccess;
          this.emitJudiEvent(JudiEvents.Successed, { ticker });
          break;
        default:
          console.log('default initial state');
          break;
      }
    } catch (error) {
      this.emitJudiEvent(JudiEvents.Failed, { error });
    }
  }

  private async handleBuy(symbolPrice: number): Promise<Partial<OrderResult>> {
    this.state = JudiState.HandleBuy;
    this.emitJudiEvent(JudiEvents.Processing, { symbolPrice });

    if (symbolPrice >= this.goodBuy && JudiState[this.state] !== JudiState.ProcessingOrder)
      return { status: OrderStatus.VOID };
    this.state = JudiState.ProcessingOrder;

    const currencyAmount = (await this.accountInfo.currencyAmount(this.currency)) * this.spent;

    if (currencyAmount == 0) {
      this.emitJudiEvent(JudiEvents.Failed, { currencyAmount });
      return { status: OrderStatus.NOT_ENOUGH_MONEY };
    }

    const quantity = Number(new BigNumber(currencyAmount).dividedBy(symbolPrice).toFixed(6));

    const orderResult = await this.order.buy(this.symbol, quantity);

    this.state = JudiState.HandleBuySuccess;

    this.emitJudiEvent(JudiEvents.Successed, { orderResult, quantity });
    return orderResult;
  }

  private async handleSell(symbolPrice: number): Promise<Partial<OrderResult>> {
    this.state = JudiState.HandleSell;
    this.emitJudiEvent(JudiEvents.Processing, { symbolPrice });

    if (symbolPrice <= this.goodSell && JudiState[this.state] !== JudiState.ProcessingOrder)
      return { status: OrderStatus.VOID };
    this.state = JudiState.ProcessingOrder;

    // sold half or everything in this.sellQty
    const quantity = this.sellQty ?? (await this.accountInfo.sellQuantityAvailable(this.asset, 0.5));

    const orderResult = await this.order.sell(this.symbol, quantity);

    this.state = JudiState.HandleSellSuccess;

    this.emitJudiEvent(JudiEvents.Successed, { orderResult, quantity });
    return orderResult;
  }

  private async defaultMoneyOperation(symbolPrice: number): Promise<Partial<OrderResult>> {
    let orderResult: OrderResult;

    switch (this.state) {
      case JudiState.IntentionToBuy:
        orderResult = (await this.handleBuy(symbolPrice)) as OrderResult;
        this.state = JudiState.IntentionToBuy;
        this.emitOperatesMyMoneyProcessing(symbolPrice);
        if (OrderStatus[orderResult.status] === OrderStatus.FILLED) {
          let qty = new BigNumber(0),
            commission = new BigNumber(0);
          for (const fill of orderResult.fills) {
            qty = qty.plus(Number(fill.quantity));
            commission = commission.plus(Number(fill.exchangeComission));
          }
          // calculates the real amount of symbol bought, that we use to sell
          this.sellQty = Number(qty.minus(commission).toFixed(6));
          // changes goodSell to have estipulated profit
          this.goodSell = Number(new BigNumber(symbolPrice).times(this.profit).toFixed(2));
          this.state = JudiState.IntentionToSell;
        }
        break;
      case JudiState.IntentionToSell:
        orderResult = (await this.handleSell(symbolPrice)) as OrderResult;
        this.state = JudiState.IntentionToSell;
        this.emitOperatesMyMoneyProcessing(symbolPrice);
        if (OrderStatus[orderResult.status] === OrderStatus.FILLED) {
          this.state = JudiState.IntentionToBuy;
        }
        break;
      default:
        break;
    }

    return orderResult;
  }

  private emitOperatesMyMoneyProcessing(symbolPrice: number): boolean {
    return this.emitJudiEvent(JudiEvents.Processing, {
      symbol: this.symbol,
      symbolPrice,
      profit: this.profit,
      goodBuy: this.goodBuy,
      goodSell: this.goodSell,
      sellQuantity: this.sellQty,
      date: new Date().toString(),
    });
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
