export interface DepthResponse {
  lastUpdatedId: number;
  bids: string[][];
  asks: string[][];
}

export interface NewOrderRequest {
  symbol: string;
  quantity: number;
  price?: number;
  timeInForce?: string;
  side: string;
  type: string;
}

export interface NewOrderResponse {
  symbol: string;
  orderId: number;
  orderListId: number;
  clientOrderId: string;
  transactTime: number;
  price: string;
  origQty: string;
  executedQty: string;
  cummulativeQuoteQty: string;
  status: string;
  timeInForce: string;
  side: string;
  type: string;
}

export interface AccountInfoResponse {
  makerCommission: number;
  takerCommission: number;
  buyerCommission: number;
  sellerCommission: number;
  updateTime: number;
  canTrade: boolean;
  canWithdraw: boolean;
  canDeposit: boolean;
  accountType: string;
  permissions: string[];
  balances: BalanceInfo[];
}

export interface BalanceInfo {
  asset: string;
  free: string;
  locked: string;
}
