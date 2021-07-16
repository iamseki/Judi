import { fakeBinanceProxy } from '../fixtures/binance-proxy';
import { Order } from '../../src/usecases';
import { Side, Status, Type } from '../../src/models/order';

/*
 ** the symbol and quantity its hard coded in fake proxy response so keep that in mind
 ** the value of bitcoin is hardcoded being = $31800 aswell
 */
describe('order - Use Case', () => {
  it('should execute a buy order', async () => {
    const order = new Order(fakeBinanceProxy);
    const result = await order.buy('BTCUSDT', 0.000914);

    expect(result.status).toBe(Status.FILLED);
    expect(result.side).toBe(Side.BUY);
    expect(result.executedQuantity).toBe('0.0009140');
    expect(result.currency).toBe('29.0652');
    expect(result.fills[0].exchangeComission).toBe('0.00000091');
    expect(result.fills[0].symbol).toBe('BTC');
  });

  it('should execute a sell order', async () => {
    const order = new Order(fakeBinanceProxy);
    const result = await order.sell('BTCUSDT', 0.000914);

    expect(result.status).toBe(Status.FILLED);
    expect(result.side).toBe(Side.SELL);
    expect(result.executedQuantity).toBe('0.0009140');
    expect(result.currency).toBe('29.0652');
    expect(result.fills[0].exchangeComission).toBe('0.0290652');
    expect(result.fills[0].symbol).toBe('USDT');
  });

  it('should execute a test order', async () => {
    const order = new Order(fakeBinanceProxy);
    const result = await order.test('BTCUSDT', 0.000914);

    // test order has always side = buy
    expect(result.side).toBe(Side.BUY);
    expect(result.type).toBe(Type.MARKET);
    expect(result.currency).toBe('29.0652');
    expect(result.fills[0].exchangeComission).toBe('0.00000091');
    expect(result.fills[0].symbol).toBe('BTC');
  });
});
