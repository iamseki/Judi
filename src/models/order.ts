export interface OrderHandler {
  test(symbol: string, quantity: number): Promise<any>;
  buy(symbol: string, quantity: number): Promise<any>;
  sell(symbol: string, quantity: number): Promise<any>;
}

export interface OrderResult {
  symbol: string;
  orderId: number;
  timestamp: number;
  status: string;
  type: string;
  side: Side;
  currency: string;
  fills: FilledOrder[];
  executedQuantity: string;
  requestedQuantity: string;
}

export interface FilledOrder {
  symbol: string;
  price: string;
  quantity: string;
  exchangeComission: string;
}

export enum Side {
  SELL = 'sell',
  BUY = 'buy',
}

export enum Status {
  FILLED = 'filled',
  EXPIRED = 'expired',
}

export enum Type {
  MARKET = 'market',
}