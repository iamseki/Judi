import { AccountInfoResponse, NewOrderResponse } from '../../src/models/binance';
import { BinanceProxy } from '../../src/proxies/binance';

const accountInfoResponse: AccountInfoResponse = {
  accountType: 'fake',
  buyerCommission: 2,
  canDeposit: true,
  canTrade: true,
  canWithdraw: true,
  makerCommission: 1,
  permissions: [],
  sellerCommission: 1,
  takerCommission: 1,
  updateTime: 1,
  balances: [
    {
      asset: 'BTC',
      free: '4723846.89208129',
      locked: '0.00000000',
    },
    {
      asset: 'LTC',
      free: '4763368.68006011',
      locked: '0.00000000',
    },
  ],
};

const buyOrderResponse: NewOrderResponse = {
  clientOrderId: '1234',
  price: '0',
  executedQty: '0.0009140',
  origQty: '0.0009140',
  cummulativeQuoteQty: '29.0652',
  orderId: 1,
  orderListId: 2,
  type: 'MARKET',
  transactTime: 1626388750934,
  symbol: 'BTCUSDT',
  side: 'BUY',
  status: 'FILLED',
  timeInForce: 'GTC',
  fills: [
    {
      price: '31800.00',
      qty: '0.00091400',
      // qty * price * fee , fee = 0,001
      commission: '0.00000091',
      commissionAsset: 'BTC',
      tradeId: 7129774,
    },
  ],
};

const sellOrderResponse: NewOrderResponse = {
  clientOrderId: '1234',
  price: '0',
  executedQty: '0.0009140',
  origQty: '0.0009140',
  cummulativeQuoteQty: '29.0652',
  orderId: 1,
  orderListId: 2,
  type: 'MARKET',
  transactTime: 1626388750934,
  symbol: 'BTCUSDT',
  side: 'SELL',
  status: 'FILLED',
  timeInForce: 'GTC',
  fills: [
    {
      price: '31800.00',
      qty: '0.0009140',
      // qty * fee , fee = 0,001
      commission: '0.0290652',
      commissionAsset: 'USDT',
      tradeId: 7129777,
    },
  ],
};

const fakeBinanceProxy = new BinanceProxy('test', 'test', 'test');

jest.spyOn(fakeBinanceProxy, 'accountInfo').mockReturnValue(Promise.resolve(accountInfoResponse));
jest
  .spyOn(fakeBinanceProxy, 'newOrder')
  .mockImplementation((data) =>
    data.side === 'BUY' ? Promise.resolve(buyOrderResponse) : Promise.resolve(sellOrderResponse),
  );

export { fakeBinanceProxy };
