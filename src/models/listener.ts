import { OrderResult } from './order';

export interface ListenerOptions {
  loop: boolean;
}
export interface Listener {
  listenToMarket(orderHandler: (symbolPrice: number) => Promise<Partial<OrderResult>>, options?: ListenerOptions): void;
}
