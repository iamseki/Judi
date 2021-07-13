import { BinanceProxy } from './proxies';
import { AccountInfo, Order } from './usecases';
import WebSocket from 'ws';
import prompts from 'prompts';
import { InitialState, JudiStateMachine } from './mmi/judi';

console.log(`NODE_ENV:${process.env.NODE_ENV}`);

const apiKey = process.env.NODE_ENV === 'DEV' ? process.env.DEV_API_KEY : process.env.PROD_API_KEY;
const apiSecret = process.env.NODE_ENV === 'DEV' ? process.env.DEV_SECRET_KEY : process.env.PROD_SECRET_KEY;
const apiUrl = process.env.NODE_ENV === 'DEV' ? `${process.env.DEV_API_URL}` : `${process.env.PROD_API_URL}`;

const binanceProxy = new BinanceProxy(apiKey, apiSecret, apiUrl);
const accountInfo = new AccountInfo(binanceProxy);
const order = new Order(binanceProxy);

const symbol = process.env.SYMBOL;
const currency = process.env.CURRENCY;

let quantity = 0.2;
let currencyAmount;

let buy = false;
let sell = false;
/**
setInterval(() => {
  console.log(`variables status: buy = ${buy} sell = ${sell}`);
  if (buy && sell) {
    const status = {
      date: new Date().toString(),
      buy,
      sell,
    };
    fs.writeFileSync('status.json', JSON.stringify(status));

    process.exit();
  }
}, 4500);
 */

const Judi = async (BTCPrice: number) => {
  if (BTCPrice <= 33500 && !buy) {
    buy = true;
    currencyAmount = (await accountInfo.currencyAmount(currency)) * 0.95;
    quantity = Number((currencyAmount / BTCPrice).toFixed(6));
    if (currencyAmount == 0) return;
    console.log(`
    trying to buy ${quantity} BTC
    ${currency} in wallet ${currencyAmount} 
    `);
    const orderResult = await order.buy(symbol, quantity);
    console.log(`buy order status: ${orderResult.status}`);
    console.log(await accountInfo.balance());
  } else if (BTCPrice >= 35000 && buy) {
    if (!sell) {
      const orderResult = await order.sell(symbol, quantity);
      sell = true;
      console.log(orderResult);
    }
  }
};

const WS = async () => {
  const websocketUrl =
    process.env.NODE_ENV === 'DEV' ? `${process.env.DEV_WEBSOCKET_URL}` : `${process.env.PROD_WEBSOCKET_URL}`;

  const ws = new WebSocket(`${websocketUrl}/${symbol.toLowerCase()}@kline_1m`);

  //const ws = new WebSocket(`${websocketUrl}/btcusdt@depth`);

  ws.on('message', (data) => {
    const incomingData = JSON.parse(data.toString());
    if (incomingData.k.x) {
      const btcPrice = Number(incomingData.k.c);
      console.log(`btcPrice: ${btcPrice}`);
      Judi(btcPrice);
    }
  });
};

//Promise.all([WS(),Judi()]);

//Judi();
//WS();

(async () => {
  const response = await prompts({
    type: 'select',
    name: 'state',
    message: 'Pick a initial state for Judi',
    choices: [
      { title: 'Account Ballance', description: 'Prints your account balance', value: InitialState.AccountBalance },
      { title: 'Buy', description: 'Buy flow of Judi machine state', value: InitialState.Buy },
      { title: 'Sell', description: 'Sell flow of Judi machine state', value: InitialState.Sell },
      { title: 'Operates my money', description: 'Judi default flow to operates your money', value: InitialState.Judi },
    ],
    initial: 3,
  });

  const judi = new JudiStateMachine(response.state, binanceProxy);
  const judiState = await judi.start();
})();
