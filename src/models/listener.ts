export interface Listener {
  listenToMarket(handler: (symbolPrice: number) => Promise<boolean>): void;
}
