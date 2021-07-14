import WebSocket from 'ws';
import EventEmitter from 'events';
import { BalanceInfo, BinanceProxy } from '../proxies';
import { AccountInfo, Order } from '../usecases';
import { JudiState, JudiInitialState, JudiEvents, JudiEvent } from '../models';

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

  constructor(private readonly initialState: JudiInitialState, private readonly binanceProxy: BinanceProxy) {
    super();
  }

  public async start(): Promise<void> {
    try {
      switch (this.initialState) {
        case JudiInitialState.AccountBalance:
          const balance = await this.getAccountBalance();
          this.state = JudiState.AccountBalanceSuccess;
          this.emitJudiEvent(JudiEvents.Successed, { balance });
          break;
        case JudiInitialState.Buy:
          this.state = JudiState.ListeningMarket;
          this.listenMarket(this.handleBuy.bind(this));
          this.emitJudiEvent(JudiEvents.Processing);
          break;
        case JudiInitialState.Sell:
          this.state = JudiState.ListeningMarket;
          this.listenMarket(this.handleSell.bind(this));
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

    const currencyAmount = (await this.getCurrencyAvailableAmount()) * this.spent;

    if (currencyAmount == 0) {
      this.emitJudiEvent(JudiEvents.Failed, { currencyAmount });
      return true;
    }

    const quantity = Number((currencyAmount / symbolPrice).toFixed(6));

    const order = new Order(this.binanceProxy);
    const orderResult = await order.buy(this.symbol, quantity);

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
    const quantity = await this.getSellQuantity(0.5);

    const order = new Order(this.binanceProxy);
    const orderResult = await order.sell(this.symbol, quantity);

    this.state = JudiState.HandleSellSuccess;

    this.emitJudiEvent(JudiEvents.Successed, { orderResult, quantity });
    return true;
  }

  private async getSellQuantity(percent: number): Promise<number> {
    if (this.sellQty !== 0) return this.sellQty;
    const balance = await this.getAccountBalance();
    const asset = balance.find((coin) => coin.asset === this.asset);
    return Number((Number(asset.free) * percent).toFixed(6));
  }

  private async getCurrencyAvailableAmount(): Promise<number> {
    const accountInfo = new AccountInfo(this.binanceProxy);
    return accountInfo.currencyAmount(this.currency);
  }

  private async getAccountBalance(): Promise<BalanceInfo[]> {
    const accountInfo = new AccountInfo(this.binanceProxy);
    return accountInfo.balance();
  }

  private emitJudiEvent(name: JudiEvents, data = {}): boolean {
    const e: JudiEvent = {
      state: this.state,
      initialState: this.initialState,
      data,
    };
    return this.emit(name, e);
  }

  private listenMarket(handler: (symbolPrice: number) => Promise<boolean>) {
    const websocketUrl =
      process.env.NODE_ENV === 'DEV' ? `${process.env.DEV_WEBSOCKET_URL}` : `${process.env.PROD_WEBSOCKET_URL}`;

    const ws = new WebSocket(`${websocketUrl}/${this.symbol.toLowerCase()}@kline_1m`);

    ws.on('message', async (data) => {
      const incomingData = JSON.parse(data.toString());
      if (incomingData.k && incomingData.k.x) {
        const symbolPrice = Number(incomingData.k.c);
        const isDone = await handler(symbolPrice);
        if (isDone) {
          ws.terminate();
        }
      }
    });

    ws.on('error', (data) => {
      console.log('error socket message');
      console.log(JSON.stringify(data, null, 2));
    });

    ws.on('close', (data) => {
      console.log('close socket message');
      console.log(JSON.stringify(data, null, 2));
    });

    ws.on('ping', () => {
      ws.pong();
    });
  }
}
