import { OrderDetail } from '../interfaces/trading-strategy.interfaces';
import {
  AmountChangeType,
  PriceSourceType,
} from '../enums/strategy-type.enums';
import { Decimal } from 'decimal.js';

export const isArbitrageOpportunityBuyOnA = (
  vwapA: Decimal,
  vwapB: Decimal,
  minProfitability: number | Decimal,
) => {
  return vwapB
    .minus(vwapA)
    .dividedBy(vwapA)
    .greaterThanOrEqualTo(new Decimal(minProfitability));
};

export const isArbitrageOpportunityBuyOnB = (
  vwapA: Decimal,
  vwapB: Decimal,
  minProfitability: number | Decimal,
) => {
  return vwapA
    .minus(vwapB)
    .dividedBy(vwapB)
    .greaterThanOrEqualTo(new Decimal(minProfitability));
};

export const calculateVWAPForAmount = (
  orderBook: any,
  amountToTrade: Decimal,
  direction: 'buy' | 'sell',
): Decimal => {
  const orderList = direction === 'buy' ? orderBook.asks : orderBook.bids;
  let volumeAccumulated: Decimal = new Decimal(0);
  let volumePriceProductSum: Decimal = new Decimal(0);

  for (const [price, volume] of orderList) {
    const remainingAmount = amountToTrade.minus(volumeAccumulated);
    const volumeToUse = Decimal.min(new Decimal(volume), remainingAmount);

    volumePriceProductSum = volumePriceProductSum.plus(
      volumeToUse.times(new Decimal(price)),
    );

    volumeAccumulated = volumeAccumulated.plus(volumeToUse);

    if (volumeAccumulated.greaterThanOrEqualTo(amountToTrade)) break;
  }

  return volumeAccumulated.greaterThan(0)
    ? volumePriceProductSum.dividedBy(volumeAccumulated)
    : new Decimal(0);
};

export const getFee = (order: any) => {
  return order.fee ? order.fee.cost : 0;
};

export const calculateProfitLoss = (
  buyPrice: number | Decimal,
  sellPrice: number | Decimal,
  amount: number | Decimal,
  buyFee: number | Decimal,
  sellFee: number | Decimal,
) => {
  const decimalBuyPrice = new Decimal(buyPrice);
  const decimalSellPrice = new Decimal(sellPrice);
  const decimalAmount = new Decimal(amount);
  const decimalBuyFee = new Decimal(buyFee);
  const decimalSellFee = new Decimal(sellFee);

  const revenue = decimalSellPrice.times(decimalAmount).minus(decimalSellFee);
  const cost = decimalBuyPrice.times(decimalAmount).plus(decimalBuyFee);
  return revenue.minus(cost);
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
 *      - `MID_PRICE`: Returns the midpoint between the best bid and the best ask.
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
  initialOrderAmount: Decimal,
  layer: number,
  amountChangeType: AmountChangeType,
  amountChangePerLayer: number,
): Decimal {
  if (layer <= 1) return initialOrderAmount;

  if (amountChangeType === AmountChangeType.FIXED) {
    return new Decimal(initialOrderAmount).plus(
      new Decimal(layer - 1).times(new Decimal(amountChangePerLayer)),
    );
  }

  return new Decimal(initialOrderAmount).times(
    new Decimal(1)
      .plus(new Decimal(amountChangePerLayer).dividedBy(100))
      .pow(layer - 1),
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
  initialOrderAmount: Decimal,
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

export function buildPair(sideA: string, sideB: string): string {
  return `${sideA}/${sideB}`;
}
