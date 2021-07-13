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
  HandleSell = 'handle-sell',
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
