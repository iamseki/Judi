import { BinanceProxy } from './proxies';
import WebSocket from 'ws';

console.log(`NODE_ENV:${process.env.NODE_ENV}`);

const symbol = process.env.SYMBOL;

const Judi = async (BTCPrice: number) => {
  if (BTCPrice <= 32000) {
  }
  return;
  const apiKey = process.env.NODE_ENV === 'DEV' ? process.env.DEV_API_KEY : process.env.PROD_API_KEY;
  const apiSecret = process.env.NODE_ENV === 'DEV' ? process.env.DEV_SECRET_KEY : process.env.PROD_SECRET_KEY;
  const apiUrl = process.env.NODE_ENV === 'DEV' ? `${process.env.DEV_API_URL}` : `${process.env.PROD_API_URL}`;

  const binanceProxy = new BinanceProxy(apiKey, apiSecret, apiUrl);

  const result = await binanceProxy.depth(symbol);

  // -----

  const info = await binanceProxy.exchangeInfo();
  const symbolInfo = info.symbols.find((i) => i.symbol === symbol);
  const minQty = symbolInfo.filters.find((f) => f.filterType === 'LOT_SIZE').minQty;
  const minNotional = symbolInfo.filters.find((f) => f.filterType === 'LOT_SIZE').minQty;
  console.log(`symbol:${symbol} -- minQty allowed:${minQty}`);

  // --------
  console.log('account info:');
  console.log(await binanceProxy.accountInfo());
  // --------

  console.log(await binanceProxy.depth(symbol));

  const orderResult = await binanceProxy.newOrderTest({
    quantity: minQty,
    side: 'BUY',
    symbol,
    type: 'MARKET',
  });

  console.log(orderResult);

  // --------
  console.log('account info:');
  console.log(await binanceProxy.accountInfo());
  // --------
};

const WS = async () => {
  const websocketUrl =
    process.env.NODE_ENV === 'DEV' ? `${process.env.DEV_WEBSOCKET_URL}` : `${process.env.PROD_WEBSOCKET_URL}`;

  const ws = new WebSocket(`${websocketUrl}/${symbol.toLowerCase()}@kline_1m`);

  //const ws = new WebSocket(`${websocketUrl}/btcusdt@depth`);

  ws.on('message', (data) => {
    const incomingData = JSON.parse(data.toString());
    if (incomingData.k.x) {
      Judi(Number(incomingData.k.c));
    }
  });
};

//Promise.all([WS(),Judi()]);

//Judi();
WS();

const btcValue = 33404.59;
const usdtWallet = 10000;

const canBuy = Number((usdtWallet / btcValue).toFixed(8));
