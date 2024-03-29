import { Ticker } from '../models/market';
import { BinanceProxy } from '../proxies/binance';

export class Market {
  constructor(private readonly proxy: BinanceProxy) {}

  async depth(symbol: string): Promise<any> {
    return this.proxy.depth(symbol);
  }

  async exchangeInfo(): Promise<any> {
    return this.proxy.exchangeInfo();
  }

  async tickerPrice(symbol?: string): Promise<Ticker> {
    return this.proxy.tickerCurrentPrice(symbol);
  }

  async allTickersPrice(): Promise<Ticker[]> {
    return this.proxy.allTickersCurrentPrice();
  }

  async symbolExchangeInfo(symbol: string): Promise<any> {
    const info = await this.proxy.exchangeInfo();
    const symbolInfo = info.symbols.find((i) => i.symbol === symbol);
    const minQty = symbolInfo.filters.find((f) => f.filterType === 'LOT_SIZE').minQty;
    const minNotional = symbolInfo.filters.find((f) => f.filterType === 'MIN_NOTIONAL').minNotional;
    return {
      symbol: symbolInfo.symbol,
      minQty,
      minNotional,
    };
  }
}
