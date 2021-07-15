import { Balance, AccountInfoHandler } from '../models/account-info';
import { BinanceProxy } from '../proxies/binance';

export class AccountInfo implements AccountInfoHandler {
  constructor(private readonly proxy: BinanceProxy) {}

  async currencyAmount(currency: string): Promise<number> {
    const { balances } = await this.proxy.accountInfo();
    const { free } = balances.find((b) => b.asset === currency);
    return Number(free);
  }

  async balance(): Promise<Balance[]> {
    const { balances } = await this.proxy.accountInfo();
    return balances.map<Balance>((b) => ({ symbol: b.asset, free: Number(b.free) })).filter((b) => b.free > 0);
  }

  async sellQuantityAvailable(asset: string, percent: number): Promise<number> {
    const balance = await this.balance();
    const coin = balance.find((coin) => coin.symbol === asset);
    return Number((Number(coin.free) * percent).toFixed(6));
  }
}
