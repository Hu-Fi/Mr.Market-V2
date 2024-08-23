import {
  createStrategyKey,
  isArbitrageOpportunityBuyOnA,
  isArbitrageOpportunityBuyOnB,
  calculateVWAPForAmount,
  getFee,
  calculateProfitLoss,
  isExchangeSupported,
} from './trading-strategy.utils';

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
});
