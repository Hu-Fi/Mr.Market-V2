import { OrderDetail } from '../interfaces/trading-strategy.interfaces';
import {
  AmountChangeType,
  PriceSourceType,
} from '../enums/strategy-type.enums';

export const createStrategyKey = (key) => {
  return `${key.user_id}-${key.client_id}-${key.type}`;
};

export const isArbitrageOpportunityBuyOnA = (
  vwapA,
  vwapB,
  minProfitability,
) => {
  return (vwapB - vwapA) / vwapA >= minProfitability;
};

export const isArbitrageOpportunityBuyOnB = (
  vwapA,
  vwapB,
  minProfitability,
) => {
  return (vwapA - vwapB) / vwapB >= minProfitability;
};

export const calculateVWAPForAmount = (
  orderBook: any,
  amountToTrade: number,
  direction: 'buy' | 'sell',
) => {
  const orderList = direction === 'buy' ? orderBook.asks : orderBook.bids;
  let volumeAccumulated = 0;
  let volumePriceProductSum = 0;

  for (const [price, volume] of orderList) {
    const remainingAmount = amountToTrade - volumeAccumulated;
    const volumeToUse = Math.min(volume, remainingAmount);

    volumePriceProductSum += volumeToUse * price;
    volumeAccumulated += volumeToUse;

    if (volumeAccumulated >= amountToTrade) break;
  }

  return volumeAccumulated > 0 ? volumePriceProductSum / volumeAccumulated : 0;
};

export const getFee = (order: any) => {
  return order.fee ? order.fee.cost : 0;
};

export const calculateProfitLoss = (
  buyPrice: number,
  sellPrice: number,
  amount: number,
  buyFee: number,
  sellFee: number,
) => {
  const revenue = sellPrice * amount - sellFee;
  const cost = buyPrice * amount + buyFee;
  return revenue - cost;
};

export const isExchangeSupported = (
  exchangeName: string,
  supported: string[],
) => {
  return supported.includes(exchangeName);
};

export const isPairSupported = (pair: string, supportedPairs: string[]) => {
  return supportedPairs.includes(pair);
};

type PriceSourceFunction = (orderBook: any, ticker: any) => number;

const priceSourceFunctions: Record<PriceSourceType, PriceSourceFunction> = {
  [PriceSourceType.MID_PRICE]: (orderBook) =>
    (orderBook.bids[0][0] + orderBook.asks[0][0]) / 2,
  [PriceSourceType.BEST_ASK]: (orderBook) => orderBook.asks[0][0],
  [PriceSourceType.BEST_BID]: (orderBook) => orderBook.bids[0][0],
  [PriceSourceType.LAST_PRICE]: (_, ticker) => ticker.last,
};

/**
 * This util defines a mechanism for fetching a price from an exchange, based on different price sources.
 *
 * 1. `PriceSourceFunction`: A type alias for a function that takes an `orderBook` and a `ticker`,
 *    and returns a number (the price).
 *
 * 2. `priceSourceFunctions`: An object that maps `PriceSourceType` (such as MID_PRICE, BEST_ASK, BEST_BID, and LAST_PRICE)
 *    to specific functions. Each function calculates a price based on either the order book or the ticker:
 *      - `MID_PRICE`: Returns the midpoint between the best bid and best ask.
 *      - `BEST_ASK`: Returns the lowest ask price.
 *      - `BEST_BID`: Returns the highest bid price.
 *      - `LAST_PRICE`: Returns the last traded price from the ticker.
 *
 * 3. `getPriceSource`: An asynchronous function that:
 *      - Fetches the order book for a given trading pair from the exchange.
 *      - Fetches the ticker only if the `PriceSourceType` is `LAST_PRICE`.
 *      - Uses the appropriate function from `priceSourceFunctions` to calculate and return the price based on the `priceSourceType`.
 *      - Throws an error if an invalid `PriceSourceType` is provided.
 */
export const getPriceSource = async (
  exchange: any,
  pair: string,
  priceSourceType: PriceSourceType,
) => {
  const orderBook = await exchange.fetchOrderBook(pair);
  const ticker =
    priceSourceType === PriceSourceType.LAST_PRICE
      ? await exchange.fetchTicker(pair)
      : null;

  const priceSourceFunction = priceSourceFunctions[priceSourceType];
  if (!priceSourceFunction) {
    throw new Error(`Invalid price source type: ${priceSourceType}`);
  }

  return priceSourceFunction(orderBook, ticker);
};

export function adjustOrderAmount(
  initialOrderAmount: number,
  layer: number,
  amountChangeType: AmountChangeType,
  amountChangePerLayer: number,
): number {
  if (layer <= 1) return initialOrderAmount;

  if (amountChangeType === AmountChangeType.FIXED) {
    return initialOrderAmount + (layer - 1) * amountChangePerLayer;
  }

  return (
    initialOrderAmount * Math.pow(1 + amountChangePerLayer / 100, layer - 1)
  );
}

export function calculatePrices(
  priceSource: number,
  bidSpread: number,
  askSpread: number,
  layer: number,
): { buyPrice: number; sellPrice: number } {
  const buyPrice = priceSource * (1 - bidSpread * layer);
  const sellPrice = priceSource * (1 + askSpread * layer);
  return { buyPrice, sellPrice };
}

export function shouldPlaceOrder(
  priceSource: number,
  ceilingPrice?: number,
  floorPrice?: number,
): { shouldBuy: boolean; shouldSell: boolean } {
  const shouldBuy = !ceilingPrice || priceSource <= ceilingPrice;
  const shouldSell = !floorPrice || priceSource >= floorPrice;
  return { shouldBuy, shouldSell };
}

export function calculateOrderDetails(
  initialOrderAmount: number,
  numberOfLayers: number,
  amountChangeType: AmountChangeType,
  amountChangePerLayer: number,
  bidSpread: number,
  askSpread: number,
  priceSource: number,
  ceilingPrice?: number,
  floorPrice?: number,
): OrderDetail[] {
  const orderDetails: OrderDetail[] = [];

  for (let layer = 1; layer <= numberOfLayers; layer++) {
    const currentOrderAmount = adjustOrderAmount(
      initialOrderAmount,
      layer,
      amountChangeType,
      amountChangePerLayer,
    );

    const { buyPrice, sellPrice } = calculatePrices(
      priceSource,
      bidSpread,
      askSpread,
      layer,
    );

    const { shouldBuy, shouldSell } = shouldPlaceOrder(
      priceSource,
      ceilingPrice,
      floorPrice,
    );

    if (shouldBuy || shouldSell) {
      orderDetails.push({
        layer,
        currentOrderAmount,
        buyPrice,
        sellPrice,
        shouldBuy,
        shouldSell,
      });
    }
  }

  return orderDetails;
}
