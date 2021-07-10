import axios, { Method } from 'axios';
import querystring from 'querystring';
import crypto from 'crypto';
import { AccountInfoResponse, DepthResponse, NewOrderRequest, NewOrderResponse } from './dtos/binance';

export class BinanceProxy {
  constructor(private readonly apiKey: string, private readonly apiSecret: string, private readonly apiUrl: string) {}

  async serverTime(): Promise<{ serverTime: number }> {
    return this.publicCall('/v3/time');
  }

  async depth(symbol = 'BTCBRL', limit = 5): Promise<DepthResponse> {
    return this.publicCall<DepthResponse>('/v3/depth', { symbol, limit });
  }

  async newOrder(data: NewOrderRequest): Promise<NewOrderResponse> {
    if (data.type === 'LIMIT') data.timeInForce = 'GTC'; // Good till cancel unexpired
    return this.privateCall<NewOrderResponse>('/v3/order', data, 'POST');
  }

  async accountInfo(): Promise<AccountInfoResponse> {
    return this.privateCall('/v3/account');
  }

  private async privateCall<T>(path: string, data = {}, method = 'GET'): Promise<T> {
    const timestamp = Date.now();
    const signature = crypto
      .createHmac('sha256', this.apiSecret)
      .update(`${querystring.stringify({ ...data, timestamp })}`)
      .digest('hex');

    const requestData = { ...data, timestamp, signature };
    const qs = `?${querystring.stringify(requestData)}`;

    try {
      const result = await axios({
        method: method as Method,
        url: `${this.apiUrl}${path}${qs}`,
        headers: { 'X-MBX-APIKEY': this.apiKey },
      });
      return result.data;
    } catch (err) {
      console.log(err);
    }
  }
  private async publicCall<T>(path: string, data = {}, method = 'GET'): Promise<T> {
    try {
      const qs = data ? `?${querystring.stringify(data)}` : '';
      const result = await axios({
        method: method as Method,
        url: `${this.apiUrl}${path}${qs}`,
      });
      return result.data;
    } catch (err) {
      console.log(err);
    }
  }
}