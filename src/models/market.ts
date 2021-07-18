export interface MarketHandler {
  tickerPrice(symbol?: string): Promise<Ticker>;
  allTickersPrice(): Promise<Ticker[]>;
}

export interface Ticker {
  symbol: string;
  price: string;
}
