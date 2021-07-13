import EventEmitter from 'events';
import { BinanceProxy } from '../proxies';
import { AccountInfo } from '../usecases';

export enum InitialState {
  AccountBalance = 'account-info',
  Buy = 'buy',
  Sell = 'sell',
  Judi = 'judi',
}

export enum JudiState {
  Initial = 'initial',
  AccountInfoSuccess = 'account-info-success',
  AccountInfoFailed = 'AccountInfoFailed',
}

export class JudiStateMachine extends EventEmitter {
  state = JudiState.Initial;

  constructor(private readonly initialState: InitialState, private readonly binanceProxy: BinanceProxy) {
    super();
  }

  public async start(): Promise<JudiState> {
    switch (this.initialState) {
      case InitialState.AccountBalance:
        this.state = await this.getAccountBalance();
        break;
      default:
        console.log('default initial state');
        break;
    }
    return this.state;
  }

  private async getAccountBalance(): Promise<JudiState> {
    try {
      const accountInfo = new AccountInfo(this.binanceProxy);
      console.log(await accountInfo.balance());
      return JudiState.AccountInfoSuccess;
    } catch (err) {
      console.log(err);
      return JudiState.AccountInfoFailed;
    }
  }
}
