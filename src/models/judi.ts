export enum JudiInitialState {
  AccountBalance = 'account-info',
  Buy = 'buy',
  Sell = 'sell',
  Judi = 'judi',
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
