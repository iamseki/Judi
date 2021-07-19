import WebSocket from 'ws';
import { Listener, ListenerOptions } from '../models/listener';
import { OrderResult, OrderStatus } from '../models/order';

export class BinanceListener implements Listener {
  private incomingClosedPriceTimestamp: number;

  constructor(private readonly socketUrl: string) {}

  listenToMarket(
    orderHandler: (symbolPrice: number) => Promise<Partial<OrderResult>>,
    options?: ListenerOptions,
  ): void {
    const ws = new WebSocket(this.socketUrl);

    ws.on('message', async (data) => {
      const incomingData = JSON.parse(data.toString());
      //incomingData.E // event timestamp
      if (incomingData.k && incomingData.k.x && incomingData.E !== this.incomingClosedPriceTimestamp) {
        this.incomingClosedPriceTimestamp = incomingData.E;
        const symbolPrice = Number(incomingData.k.c);
        const orderResult = await orderHandler(symbolPrice);
        if (OrderStatus[orderResult.status] === OrderStatus.FILLED && !options?.loop) {
          ws.terminate();
        }
      }
    });

    ws.on('error', (data) => {
      console.log('error socket message');
      console.log(JSON.stringify(data, null, 2));
    });

    ws.on('close', (data) => {
      console.log('close socket message');
      console.log(JSON.stringify(data, null, 2));
    });

    ws.on('ping', () => {
      ws.pong();
    });
  }
}
