import { AccountInfoResponse } from '../../src/models/binance';

export const accountInfoResponse: AccountInfoResponse = {
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
