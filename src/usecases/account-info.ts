import { BinanceProxy, BalanceInfo } from '../proxies';

export class AccountInfo {
  constructor(private readonly proxy: BinanceProxy) {}

  async currencyAmount(currency: string): Promise<number> {
    const { balances } = await this.proxy.accountInfo();
    const { free } = balances.find((b) => b.asset === currency);
    return Number(free);
  }

  async balance(): Promise<BalanceInfo[]> {
    const { balances } = await this.proxy.accountInfo();
    return balances.filter((b) => Number(b.free) > 0);
  }
}
