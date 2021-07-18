export enum JudiInitialState {
  AccountBalance = 'account-info',
  Buy = 'buy',
  Sell = 'sell',
  Judi = 'judi',
  OperateMyMoney = 'operate-my-money',
  SymbolPrice = 'symbol-price',
}

export enum JudiState {
  Initial = 'initial',
  AccountBalanceSuccess = 'account-balance-success',
  AccountBalanceFailed = 'account-balance-failed',
  ListeningMarket = 'listening-market',
  HandleBuy = 'handle-buy',
  HandleBuySuccess = 'handle-buy-success',
  HandleSell = 'handle-sell',
  HandleSellSuccess = 'handle-sell-success',
  ProcessingOrder = 'processing-order',
  SymbolPriceSuccess = 'symbol-price-success',
  SymbolPriceFailed = 'symbol-price-failed',
  IntentionToBuy = 'intention-to-buy',
  IntentionToSell = 'intention-to-sell',
}

export enum JudiEvents {
  Successed = 'success',
  Failed = 'failure',
  Processing = 'processing',
}

export interface JudiEvent {
  initialState: JudiInitialState;
  state: JudiState;
  data: any;
}
