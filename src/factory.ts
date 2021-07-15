import { BinanceListener } from './listeners/binance';
import { Listener } from './models/listener';
import { BinanceProxy } from './proxies/binance';

export class Factory {
  public static Proxy(): BinanceProxy {
    const apiKey = process.env.NODE_ENV === 'DEV' ? process.env.DEV_API_KEY : process.env.PROD_API_KEY;
    const apiSecret = process.env.NODE_ENV === 'DEV' ? process.env.DEV_SECRET_KEY : process.env.PROD_SECRET_KEY;
    const apiUrl = process.env.NODE_ENV === 'DEV' ? `${process.env.DEV_API_URL}` : `${process.env.PROD_API_URL}`;

    return new BinanceProxy(apiKey, apiSecret, apiUrl);
  }

  public static MarketListener(): Listener {
    const websocketUrl =
      process.env.NODE_ENV === 'DEV' ? `${process.env.DEV_WEBSOCKET_URL}` : `${process.env.PROD_WEBSOCKET_URL}`;
    const symbol = process.env.SYMBOL;
    const listenerUrl = `${websocketUrl}/${symbol.toLowerCase()}@kline_1m`;

    return new BinanceListener(listenerUrl);
  }
}
