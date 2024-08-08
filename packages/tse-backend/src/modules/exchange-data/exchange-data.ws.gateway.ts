import { v4 as uuidv4 } from 'uuid';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CustomLogger } from '../logger/logger.service';
import { ExchangeDataSubscriptionManager } from './subscription-manager.ws.service';
import { MarketDataType } from '../../common/enums/exchange-data.enums';
import { CompositeKeyContext } from '../../common/utils/composite-key/composite-key-context';

@WebSocketGateway()
export class ExchangeDataWsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private readonly logger = new CustomLogger(ExchangeDataWsGateway.name);

  private clientSubscriptions = new Map<string, Set<string>>();
  private clients = new Map<string, Socket>();

  constructor(private subscriptionManager: ExchangeDataSubscriptionManager) {}

  handleConnection(client: Socket): void {
    const clientId = uuidv4();
    this.clients.set(clientId, client);
    client.emit('connected', 'Connected Successfully');

    client.on('disconnect', () => this.handleDisconnect(clientId));
    this.logger.debug(`Client connected: ${clientId}`);
  }

  @SubscribeMessage('subscribeOrderBook')
  async handleSubscribeOrderBook(
    @MessageBody() data: { exchange: string; symbol: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.debug(
      `Subscribing to ${MarketDataType.ORDERBOOK} ${data.exchange} ${data.symbol}`,
    );
    const clientId = this.getClientId(client);
    if (!clientId) {
      this.logger.error(`Client ID not found for the connected socket`);
      return;
    }
    try {
      const context = new CompositeKeyContext(MarketDataType.ORDERBOOK);
      const compositeKey = context.createCompositeKey(
        data.exchange,
        data.symbol,
      );
      this.addSubscription(clientId, compositeKey);
      await this.subscriptionManager.handleSubscription(
        MarketDataType.ORDERBOOK,
        data.exchange,
        data.symbol,
        undefined,
        undefined,
        (orderBookData) => {
          this.broadcastToSubscribedClients(compositeKey, {
            exchange: data.exchange,
            symbol: data.symbol,
            bids: orderBookData.bids.map(([price, amount]) => ({
              price,
              amount,
            })),
            asks: orderBookData.asks
              .map(([price, amount]) => ({ price, amount }))
              .reverse(),
          });
        },
        undefined,
        undefined,
      );
    } catch (error) {
      client.emit('error', error.message);
    }
  }

  @SubscribeMessage('subscribeOHLCV')
  async handleSubscribeOHLCV(
    @MessageBody()
    data: {
      exchange: string;
      symbol: string;
      timeFrame: string | undefined;
      since: number | undefined;
      limit: number | undefined;
    },
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.debug(
      `Subscribing to ${MarketDataType.OHLCV} ${data.exchange} ${data.symbol}`,
    );
    const clientId = this.getClientId(client);
    if (!clientId) {
      this.logger.error(`Client ID not found for the connected socket`);
      return;
    }
    try {
      const context = new CompositeKeyContext(MarketDataType.OHLCV);
      const compositeKey = context.createCompositeKey(
        data.exchange,
        data.symbol,
        undefined,
        data.timeFrame,
      );
      this.addSubscription(clientId, compositeKey);
      await this.subscriptionManager.handleSubscription(
        MarketDataType.OHLCV,
        data.exchange,
        data.symbol,
        undefined,
        data.timeFrame,
        (ohlcvData) => {
          this.broadcastToSubscribedClients(compositeKey, {
            exchange: data.exchange,
            symbol: data.symbol,
            ohlcv: ohlcvData.map(
              ([timestamp, open, high, low, close, volume]) => ({
                timestamp,
                open,
                high,
                low,
                close,
                volume,
              }),
            ),
            timeframe: data.timeFrame,
            since: data.since,
            limit: data.limit,
          });
        },
        data.since,
        data.limit,
      );
    } catch (error) {
      client.emit('error', error.message);
    }
  }

  @SubscribeMessage('subscribeTicker')
  async handleSubscribeTicker(
    @MessageBody() data: { exchange: string; symbol: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.debug(
      `Subscribing to ${MarketDataType.TICKER} ${data.exchange} ${data.symbol}`,
    );
    const clientId = this.getClientId(client);
    if (!clientId) {
      this.logger.error(`Client ID not found for the connected socket`);
      return;
    }
    try {
      const context = new CompositeKeyContext(MarketDataType.TICKER);
      const compositeKey = context.createCompositeKey(
        data.exchange,
        data.symbol,
      );
      this.addSubscription(clientId, compositeKey);
      await this.subscriptionManager.handleSubscription(
        MarketDataType.TICKER,
        data.exchange,
        data.symbol,
        undefined,
        undefined,
        (tickerData) => {
          this.broadcastToSubscribedClients(compositeKey, {
            exchange: data.exchange,
            symbol: data.symbol,
            price: tickerData.last,
            change: tickerData.percentage,
            info: {
              high: tickerData.high,
              low: tickerData.low,
              volume: tickerData.baseVolume,
              open: tickerData.open,
              close: tickerData.close,
              timestamp: tickerData.timestamp,
            },
          });
        },
        undefined,
        undefined,
      );
    } catch (error) {
      client.emit('error', error.message);
    }
  }

  @SubscribeMessage('subscribeTickers')
  async handleSubscribeTickers(
    @MessageBody() data: { exchange: string; symbols: string[] },
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.debug(
      `Subscribing to ${MarketDataType.TICKERS} ${data.exchange} ${data.symbols.join(', ')}`,
    );
    const clientId = this.getClientId(client);
    if (!clientId) {
      this.logger.error(`Client ID not found for the connected socket`);
      return;
    }
    try {
      const context = new CompositeKeyContext(MarketDataType.TICKERS);
      const compositeKey = context.createCompositeKey(
        data.exchange,
        undefined,
        data.symbols,
      );
      this.addSubscription(clientId, compositeKey);
      await this.subscriptionManager.handleSubscription(
        MarketDataType.TICKERS,
        data.exchange,
        undefined,
        data.symbols,
        undefined,
        (tickersData) => {
          this.broadcastToSubscribedClients(compositeKey, {
            exchange: data.exchange,
            symbols: data.symbols,
            data: tickersData,
          });
        },
        undefined,
        undefined,
      );
    } catch (error) {
      client.emit('error', error.message);
    }
  }

  private addSubscription(clientId: string, compositeKey: string) {
    if (!this.clientSubscriptions.has(clientId)) {
      this.clientSubscriptions.set(clientId, new Set());
    }
    this.clientSubscriptions.get(clientId).add(compositeKey);
  }

  private broadcastToSubscribedClients(compositeKey: string, data: object) {
    const [type] = compositeKey.split(':');
    this.clientSubscriptions.forEach((subscriptions, clientId) => {
      if (subscriptions.has(compositeKey)) {
        const subscribedClient = this.getClientById(clientId);
        if (subscribedClient) {
          subscribedClient.emit(`${type}Data`, { data });
        }
      }
    });
  }

  handleDisconnect(clientId: string) {
    this.clientSubscriptions.delete(clientId);
    this.clients.delete(clientId);
    this.logger.debug(`Client disconnected: ${clientId}`);
  }

  @SubscribeMessage('unsubscribeData')
  handleUnsubscribeData(
    @MessageBody()
    data: {
      type: MarketDataType;
      exchange: string;
      symbol: string | undefined;
      symbols: string[] | undefined;
      timeFrame: string | undefined;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const { type, exchange, symbol, symbols, timeFrame } = data;
    const context = new CompositeKeyContext(type);
    const compositeKey = context.createCompositeKey(
      exchange,
      symbol,
      symbols,
      timeFrame,
    );
    const clientId = this.getClientId(client);
    if (!clientId) {
      this.logger.error(`Client ID not found for the connected socket`);
      return;
    }
    this.clientSubscriptions.get(clientId)?.delete(compositeKey);
    this.logger.debug(`Unsubscribed: ${compositeKey}`);

    if (!this.isSymbolSubscribedByAnyClient(compositeKey)) {
      this.subscriptionManager.unsubscribe(compositeKey);
      this.logger.debug(`No more subscriptions for ${compositeKey}`);
    }
  }

  private isSymbolSubscribedByAnyClient(compositeKey: string): boolean {
    for (const subscriptions of this.clientSubscriptions.values()) {
      if (subscriptions.has(compositeKey)) {
        return true;
      }
    }
    return false;
  }

  private getClientId(client: Socket): string | null {
    for (const [id, socketClient] of this.clients.entries()) {
      if (client === socketClient) {
        return id;
      }
    }
    return null;
  }

  private getClientById(clientId: string): Socket | undefined {
    return this.clients.get(clientId);
  }
}
