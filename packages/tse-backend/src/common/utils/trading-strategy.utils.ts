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
