export const WS = async () => {
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
