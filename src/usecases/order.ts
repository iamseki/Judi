import { NewOrderResponse } from '../models/binance';
import { OrderResult, Side, Status, Type } from '../models/order';
import { BinanceProxy } from '../proxies/binance';

export class Order {
  constructor(private readonly proxy: BinanceProxy) {}

  async test(symbol: string, quantity: number): Promise<OrderResult> {
    const result = await this.proxy.newOrderTest({
      side: 'BUY',
      type: 'MARKET',
      quantity,
      symbol,
    });
    return this.mappingOrderResultFromBinance(result);
  }

  async buy(symbol: string, quantity: number): Promise<OrderResult> {
    const result = await this.proxy.newOrder({
      side: 'BUY',
      type: 'MARKET',
      quantity,
      symbol,
    });
    return this.mappingOrderResultFromBinance(result);
  }

  async sell(symbol: string, quantity: number): Promise<OrderResult> {
    const result = await this.proxy.newOrder({
      side: 'SELL',
      type: 'MARKET',
      quantity,
      symbol,
    });
    return this.mappingOrderResultFromBinance(result);
  }

  private mappingOrderResultFromBinance(result: NewOrderResponse): OrderResult {
    return {
      orderId: result.orderId,
      timestamp: result.transactTime,
      symbol: result.symbol,
      executedQuantity: result.executedQty,
      currency: result.cummulativeQuoteQty,
      requestedQuantity: result.origQty,
      status: Status[result.status],
      side: Side[result.side],
      type: Type[result.type],
      fills: result.fills.map((f) => ({
        price: f.price,
        symbol: f.commissionAsset,
        exchangeComission: f.commission,
        quantity: f.qty,
      })),
    };
  }
}
