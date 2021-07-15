import { BinanceProxy } from '../../src/proxies/binance';
import { AccountInfo } from '../../src/usecases/account-info';
import { accountInfoResponse } from './account-info.fixture';

describe('AccountInfo - Usecase', () => {
  it('should list account balance properly', async () => {
    const fakeProxy = new BinanceProxy('test', 'test', 'test');
    jest.spyOn(fakeProxy, 'accountInfo').mockReturnValue(Promise.resolve(accountInfoResponse));
    const accountInfo = new AccountInfo(fakeProxy);

    const balance = await accountInfo.balance();

    expect(balance.length).toBeGreaterThan(0);
    expect(balance.find((coin) => coin.symbol === 'BTC')).toBeTruthy();
    expect(balance.find((coin) => coin.symbol === 'LTC')).toBeTruthy();

    balance.forEach((coin) => {
      expect(coin.free > 0).toBeTruthy();
    });

    expect(balance.find((coin) => coin.symbol === 'BTCUSDT')).toBeUndefined();
  });
});
