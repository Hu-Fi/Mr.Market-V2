import { Test, TestingModule } from '@nestjs/testing';
import { Server, Socket } from 'socket.io';
import { ExchangeDataWsGateway } from '../exchange-data.ws.gateway';
import { ExchangeDataSubscriptionManager } from '../subscription-manager.ws.service';
import { CustomLogger } from '../../logger/logger.service';
import { MarketDataType } from '../../../common/enums/exchange-data.enums';
import { v4 as uuidv4 } from 'uuid';
import { CompositeKeyContext } from '../../../common/utils/composite-key/composite-key-context';

jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

describe('ExchangeDataWsGateway', () => {
  let gateway: ExchangeDataWsGateway;
  let subscriptionManager: ExchangeDataSubscriptionManager;
  let server: Server;

  const mockSubscriptionManager = {
    handleSubscription: jest.fn(),
    unsubscribe: jest.fn(),
  };

  const mockLogger = {
    debug: jest.fn(),
    error: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExchangeDataWsGateway,
        {
          provide: ExchangeDataSubscriptionManager,
          useValue: mockSubscriptionManager,
        },
        { provide: CustomLogger, useValue: mockLogger },
      ],
    }).compile();

    gateway = module.get<ExchangeDataWsGateway>(ExchangeDataWsGateway);
    subscriptionManager = module.get<ExchangeDataSubscriptionManager>(
      ExchangeDataSubscriptionManager,
    );
    server = new Server();
    gateway.server = server;
  });

  describe('handleConnection', () => {
    it('should handle client connection', () => {
      const client = { emit: jest.fn(), on: jest.fn() } as unknown as Socket;
      const clientId = 'some-uuid';
      (uuidv4 as jest.Mock).mockReturnValue(clientId);

      gateway.handleConnection(client);

      expect(client.emit).toHaveBeenCalledWith(
        'connected',
        'Connected Successfully',
      );
      expect(gateway['clients'].size).toBe(1);
      expect(gateway['clients'].get(clientId)).toBe(client);
    });
  });

  describe('handleDisconnect', () => {
    it('should handle client disconnect', () => {
      const clientId = 'some-uuid';
      gateway['clients'].set(clientId, {} as Socket);
      gateway['clientSubscriptions'].set(clientId, new Set(['subscription1']));

      gateway.handleDisconnect(clientId);

      expect(gateway['clients'].has(clientId)).toBe(false);
      expect(gateway['clientSubscriptions'].has(clientId)).toBe(false);
    });
  });

  describe('handleSubscribeOrderBook', () => {
    it('should handle order book subscription', async () => {
      const client = { emit: jest.fn() } as unknown as Socket;
      const clientId = 'some-uuid';
      const data = { exchange: 'binance', symbol: 'BTC/USDT' };
      jest.spyOn(gateway as any, 'getClientId').mockReturnValue(clientId);
      jest
        .spyOn(gateway as any, 'addSubscription')
        .mockImplementation(() => {});

      await gateway.handleSubscribeOrderBook(data, client);

      expect(subscriptionManager.handleSubscription).toHaveBeenCalledWith(
        MarketDataType.ORDERBOOK,
        data.exchange,
        data.symbol,
        undefined,
        undefined,
        expect.any(Function),
        undefined,
        undefined,
      );
    });
  });

  describe('handleUnsubscribeData', () => {
    it('should handle unsubscription', () => {
      const client = { emit: jest.fn() } as unknown as Socket;
      const clientId = 'some-uuid';
      const data = {
        type: MarketDataType.ORDERBOOK,
        exchange: 'binance',
        symbol: 'BTC/USDT',
        symbols: undefined,
        timeFrame: undefined,
      };
      const context = new CompositeKeyContext(data.type);
      const compositeKey = context.createCompositeKey(
        data.exchange,
        data.symbol,
        data.symbols,
        data.timeFrame,
      );
      jest.spyOn(gateway as any, 'getClientId').mockReturnValue(clientId);
      gateway['clientSubscriptions'].set(clientId, new Set([compositeKey]));

      gateway.handleUnsubscribeData(data, client);

      expect(
        gateway['clientSubscriptions'].get(clientId).has(compositeKey),
      ).toBe(false);
      expect(subscriptionManager.unsubscribe).toHaveBeenCalledWith(
        compositeKey,
      );
    });
  });
});
