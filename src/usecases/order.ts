import { BinanceProxy } from '../proxies';

export class Order {
  constructor(private readonly proxy: BinanceProxy) {}

  async test(symbol: string, quantity: number): Promise<any> {
    const result = await this.proxy.newOrderTest({
      side: 'BUY',
      type: 'MARKET',
      quantity,
      symbol,
    });
    return result;
  }

  async buy(symbol: string, quantity: number): Promise<any> {
    const result = await this.proxy.newOrder({
      side: 'BUY',
      type: 'MARKET',
      quantity,
      symbol,
    });
    return result;
  }

  async sell(symbol: string, quantity: number): Promise<any> {
    const result = await this.proxy.newOrder({
      side: 'SELL',
      type: 'MARKET',
      quantity,
      symbol,
    });
    return result;
  }
}
