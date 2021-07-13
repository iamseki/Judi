import WebSocket from 'ws';
import EventEmitter from 'events';
import { BalanceInfo, BinanceProxy } from '../proxies';
import { AccountInfo } from '../usecases';
import { JudiState, JudiInitialState, JudiEvents, JudiEvent } from '../models';

export class JudiStateMachine extends EventEmitter {
  private readonly symbol = process.env.SYMBOL;
  private readonly currency = process.env.CURRENCY;
  private readonly profit = process.env.PROFIT;
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
          this.listenMarket(this.handleBuy);
          this.emitJudiEvent(JudiEvents.Processing);
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

    if (symbolPrice > this.goodBuy) return false;

    const currencyAmount = (await this.getCurrencyAvailableAmount()) * 0.95;

    if (currencyAmount == 0) {
      this.emitJudiEvent(JudiEvents.Failed, { currencyAmount });
      return true;
    }

    const orderResult = await order.buy(symbol, quantity);
    console.log(`buy order status: ${orderResult.status}`);
    console.log(await accountInfo.balance());
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

    //const ws = new WebSocket(`${websocketUrl}/btcusdt@depth`);

    ws.on('message', (data) => {
      const incomingData = JSON.parse(data.toString());
      if (incomingData.k.x) {
        const btcPrice = Number(incomingData.k.c);
        console.log(`btcPrice: ${btcPrice}`);
        const isDone = handler(btcPrice);
        if (isDone) ws.close();
      }
    });
  }
}
