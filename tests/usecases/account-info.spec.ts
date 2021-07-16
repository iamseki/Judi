import { AccountInfo } from '../../src/usecases/account-info';
import { fakeBinanceProxy } from '../fixtures';

describe('AccountInfo - Usecase', () => {
  it('should list account balance correctly', async () => {
    const accountInfo = new AccountInfo(fakeBinanceProxy);

    const balance = await accountInfo.balance();

    expect(balance.length).toBeGreaterThan(0);
    expect(balance.find((coin) => coin.symbol === 'BTC')).toBeTruthy();
    expect(balance.find((coin) => coin.symbol === 'LTC')).toBeTruthy();

    balance.forEach((coin) => {
      expect(coin.free > 0).toBeTruthy();
    });

    expect(balance.find((coin) => coin.symbol === 'BTCUSDT')).toBeUndefined();
  });

  it('should read currency amount value properly', async () => {
    const accountInfo = new AccountInfo(fakeBinanceProxy);

    expect(await accountInfo.currencyAmount('BTC')).toBeGreaterThan(0);
    expect(await accountInfo.currencyAmount('USDT')).toBe(0);
  });

  it('should read sellQuantity available properly', async () => {
    const accountInfo = new AccountInfo(fakeBinanceProxy);
    const sellQuantityAvailable = await accountInfo.sellQuantityAvailable('BTC', 1);

    expect(sellQuantityAvailable).toBeGreaterThan(0);
    // 0.123456 must be rounded to six decimal places, so the minimun length must be 8
    expect(sellQuantityAvailable.toString().length).toBeGreaterThanOrEqual(8);
  });
});
