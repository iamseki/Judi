export interface AccountInfoHandler {
  currencyAmount(currency: string): Promise<number>;
  balance(): Promise<Balance[]>;
  sellQuantityAvailable(asset: string, percent: number): Promise<number>;
}

export interface Balance {
  symbol: string;
  free: number;
}
