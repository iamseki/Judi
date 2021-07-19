export interface OrderHandler {
  test(symbol: string, quantity: number): Promise<OrderResult>;
  buy(symbol: string, quantity: number): Promise<OrderResult>;
  sell(symbol: string, quantity: number): Promise<OrderResult>;
}

export interface OrderResult {
  symbol: string;
  orderId: number;
  timestamp: number;
  status: OrderStatus;
  type: OrderType;
  side: OrderSide;
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

export enum OrderSide {
  SELL = 'SELL',
  BUY = 'BUY',
}

export enum OrderStatus {
  FILLED = 'FILLED',
  EXPIRED = 'EXPIRED',
  VOID = 'VOID',
  NOT_ENOUGH_MONEY = 'NOT_ENOUGH_MONEY',
}

export enum OrderType {
  MARKET = 'MARKET',
}
