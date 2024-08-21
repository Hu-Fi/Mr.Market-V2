import {
  createStrategyKey,
  isArbitrageOpportunityBuyOnA,
  isArbitrageOpportunityBuyOnB,
  calculateVWAPForAmount,
  getFee,
  calculateProfitLoss,
  isExchangeSupported, getPriceSource, calculateOrderDetails, shouldPlaceOrder, calculatePrices, adjustOrderAmount,
} from './trading-strategy.utils';
import { AmountChangeType, PriceSourceType } from '../enums/strategy-type.enums';

describe('Trading Strategy Utilities', () => {
  describe('createStrategyKey', () => {
    it('should create a strategy key based on user_id, client_id, and type', () => {
      const key = {
        user_id: 'user1',
        client_id: 'client1',
        type: 'ARBITRAGE',
      };

      const result = createStrategyKey(key);
      expect(result).toBe('user1-client1-ARBITRAGE');
    });
  });

  describe('isArbitrageOpportunityBuyOnA', () => {
    it('should return true if there is a profitable arbitrage opportunity to buy on A', () => {
      const result = isArbitrageOpportunityBuyOnA(100, 110, 0.05);
      expect(result).toBe(true);
    });

    it('should return false if there is no profitable arbitrage opportunity to buy on A', () => {
      const result = isArbitrageOpportunityBuyOnA(100, 105, 0.1);
      expect(result).toBe(false);
    });
  });

  describe('isArbitrageOpportunityBuyOnB', () => {
    it('should return true if there is a profitable arbitrage opportunity to buy on B', () => {
      const result = isArbitrageOpportunityBuyOnB(110, 100, 0.05);
      expect(result).toBe(true);
    });

    it('should return false if there is no profitable arbitrage opportunity to buy on B', () => {
      const result = isArbitrageOpportunityBuyOnB(105, 100, 0.1);
      expect(result).toBe(false);
    });
  });

  describe('calculateVWAPForAmount', () => {
    it('should calculate the correct VWAP for buy direction', () => {
      const orderBook = {
        asks: [
          [100, 5],
          [101, 5],
        ],
        bids: [],
      };
      const amountToTrade = 8;
      const result = calculateVWAPForAmount(orderBook, amountToTrade, 'buy');
      expect(result).toBeCloseTo(100.375);
    });

    it('should calculate the correct VWAP for sell direction', () => {
      const orderBook = {
        asks: [],
        bids: [
          [99, 5],
          [98, 5],
        ],
      };
      const amountToTrade = 7;
      const result = calculateVWAPForAmount(orderBook, amountToTrade, 'sell');
      expect(result).toBeCloseTo(98.7142);
    });

    it('should return 0 if there is no available volume', () => {
      const orderBook = {
        asks: [],
        bids: [],
      };
      const amountToTrade = 5;
      const result = calculateVWAPForAmount(orderBook, amountToTrade, 'buy');
      expect(result).toBe(0);
    });
  });

  describe('getFee', () => {
    it('should return the fee cost if fee is defined', () => {
      const order = {
        fee: { cost: 1.5 },
      };
      const result = getFee(order);
      expect(result).toBe(1.5);
    });

    it('should return 0 if fee is not defined', () => {
      const order = {};
      const result = getFee(order);
      expect(result).toBe(0);
    });
  });

  describe('calculateProfitLoss', () => {
    it('should calculate profit correctly', () => {
      const result = calculateProfitLoss(100, 110, 10, 1, 1);
      expect(result).toBe(98);
    });

    it('should calculate loss correctly', () => {
      const result = calculateProfitLoss(110, 100, 10, 1, 1);
      expect(result).toBe(-102);
    });
  });

  describe('isExchangeSupported', () => {
    it('should return true if the exchange is supported', () => {
      const result = isExchangeSupported('ExchangeA', [
        'ExchangeA',
        'ExchangeB',
      ]);
      expect(result).toBe(true);
    });

    it('should return false if the exchange is not supported', () => {
      const result = isExchangeSupported('ExchangeC', [
        'ExchangeA',
        'ExchangeB',
      ]);
      expect(result).toBe(false);
    });
  });

  describe('getPriceSource', () => {
    it('should return the mid price from the order book', async () => {
      const exchange = {
        fetchOrderBook: jest.fn().mockResolvedValue({
          bids: [[100, 10]],
          asks: [[110, 10]],
        }),
        fetchTicker: jest.fn(),
      };

      const result = await getPriceSource(exchange, 'BTC/USDT', PriceSourceType.MID_PRICE);
      expect(result).toBe(105);
    });

    it('should return the best ask price from the order book', async () => {
      const exchange = {
        fetchOrderBook: jest.fn().mockResolvedValue({
          bids: [[100, 10]],
          asks: [[110, 10]],
        }),
        fetchTicker: jest.fn(),
      };

      const result = await getPriceSource(exchange, 'BTC/USDT', PriceSourceType.BEST_ASK);
      expect(result).toBe(110);
    });

    it('should return the best bid price from the order book', async () => {
      const exchange = {
        fetchOrderBook: jest.fn().mockResolvedValue({
          bids: [[100, 10]],
          asks: [[110, 10]],
        }),
        fetchTicker: jest.fn(),
      };

      const result = await getPriceSource(exchange, 'BTC/USDT', PriceSourceType.BEST_BID);
      expect(result).toBe(100);
    });

    it('should return the last price from the ticker', async () => {
      const exchange = {
        fetchOrderBook: jest.fn(),
        fetchTicker: jest.fn().mockResolvedValue({
          last: 120,
        }),
      };

      const result = await getPriceSource(exchange, 'BTC/USDT', PriceSourceType.LAST_PRICE);
      expect(result).toBe(120);
    });

    it('should throw an error for an invalid price source type', async () => {
      const exchange = {
        fetchOrderBook: jest.fn(),
        fetchTicker: jest.fn(),
      };

      await expect(getPriceSource(exchange, 'BTC/USDT', 'INVALID_TYPE' as PriceSourceType))
        .rejects
        .toThrow('Invalid price source type: INVALID_TYPE');
    });
  });

  describe('adjustOrderAmount', () => {
    it('should adjust the order amount using a fixed increment', () => {
      const result = adjustOrderAmount(100, 3, AmountChangeType.FIXED, 10);
      expect(result).toBe(120);
    });

    it('should adjust the order amount using a percentage increment', () => {
      const result = adjustOrderAmount(100, 3, AmountChangeType.PERCENTAGE, 10);
      expect(result).toBeCloseTo(121);
    });

    it('should return the initial amount if layer is 1', () => {
      const result = adjustOrderAmount(100, 1, AmountChangeType.FIXED, 10);
      expect(result).toBe(100);
    });
  });

  describe('calculatePrices', () => {
    it('should calculate correct buy and sell prices for a given layer', () => {
      const result = calculatePrices(100, 0.01, 0.02, 1);
      expect(result.buyPrice).toBe(99);
      expect(result.sellPrice).toBe(102);
    });

    it('should adjust prices according to the layer', () => {
      const result = calculatePrices(100, 0.01, 0.02, 2);
      expect(result.buyPrice).toBe(98);
      expect(result.sellPrice).toBe(104);
    });
  });

  describe('shouldPlaceOrder', () => {
    it('should return true for both buy and sell when within ceiling and floor prices', () => {
      const result = shouldPlaceOrder(100, 110, 90);
      expect(result.shouldBuy).toBe(true);
      expect(result.shouldSell).toBe(true);
    });

    it('should return false for buy if above ceiling price', () => {
      const result = shouldPlaceOrder(120, 110, 90);
      expect(result.shouldBuy).toBe(false);
      expect(result.shouldSell).toBe(true);
    });

    it('should return false for sell if below floor price', () => {
      const result = shouldPlaceOrder(80, 110, 90);
      expect(result.shouldBuy).toBe(true);
      expect(result.shouldSell).toBe(false);
    });
  });

  describe('calculateOrderDetails', () => {
    it('should return the correct order details for a single layer', () => {
      const result = calculateOrderDetails(100, 1, AmountChangeType.FIXED, 10, 0.01, 0.02, 100);
      expect(result).toEqual([
        {
          layer: 1,
          currentOrderAmount: 100,
          buyPrice: 99,
          sellPrice: 102,
          shouldBuy: true,
          shouldSell: true,
        },
      ]);
    });

    it('should calculate correct details for multiple layers', () => {
      const result = calculateOrderDetails(100, 2, AmountChangeType.FIXED, 10, 0.01, 0.02, 100);
      expect(result).toEqual([
        {
          layer: 1,
          currentOrderAmount: 100,
          buyPrice: 99,
          sellPrice: 102,
          shouldBuy: true,
          shouldSell: true,
        },
        {
          layer: 2,
          currentOrderAmount: 110,
          buyPrice: 98,
          sellPrice: 104,
          shouldBuy: true,
          shouldSell: true,
        },
      ]);
    });

    it('should return an empty array if no layers should place an order', () => {
      const result = calculateOrderDetails(100, 0, AmountChangeType.FIXED, 10, 0.01, 0.02, 120, 110, 90);
      expect(result).toEqual([]);
    });
  });
});
