import { OrderResult } from './order';
import EventEmitter from 'events';

export enum ListenerEvents {
  JUDI_STOP_LISTENING = 'JUDI_STOP_LISTENING',
}
export interface ListenerOptions {
  loop: boolean;
}
export interface Listener {
  listenToMarket(orderHandler: (symbolPrice: number) => Promise<Partial<OrderResult>>, options?: ListenerOptions): void;
  readonly eventEmitter: EventEmitter;
}
