import WebSocket from 'ws';
import { Listener } from '../models/listener';

export class BinanceListener implements Listener {
  constructor(private readonly socketUrl: string) {}

  listenToMarket(handler: (symbolPrice: number) => Promise<boolean>): void {
    const ws = new WebSocket(this.socketUrl);

    ws.on('message', async (data) => {
      const incomingData = JSON.parse(data.toString());
      if (incomingData.k && incomingData.k.x) {
        const symbolPrice = Number(incomingData.k.c);
        const isDone = await handler(symbolPrice);
        if (isDone) {
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
