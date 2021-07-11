import { BinanceProxy } from '../proxies';

export class AccountInfo {
  constructor(private readonly proxy: BinanceProxy) {}

  async currencyAmount(currency: string): Promise<number> {
    const { balances } = await this.proxy.accountInfo();
    const { free } = balances.find((b) => b.asset === currency);
    return Number(free);
  }

  async retrieve(): Promise<any> {
    return this.proxy.accountInfo();
  }
}
