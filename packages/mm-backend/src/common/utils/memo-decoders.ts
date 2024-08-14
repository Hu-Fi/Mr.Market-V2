import {
  ArbitrageMemoAction,
  MarketMakingMemoAction,
  SpotExchange,
  SpotOrderType,
  TradingType,
} from '../enums/memo.enum';
import {
  ArbitrageMemoDetails,
  MarketMakingMemoDetails,
  SpotMemoDetails,
} from '../interfaces/memo-details.interface';
import { PairsEnum } from '../enums/pairs.enum';

export const decodeSpotMemo = (decodedMemo: string): SpotMemoDetails => {
  if (!decodedMemo) {
    return null;
  }
  const parts = decodedMemo.split(':');
  const [
    tradingType,
    spotOrderType,
    exchange,
    destId,
    limitPriceOrRefId,
    refId,
  ] = parts;
  return {
    tradingType: TradingType[tradingType],
    spotOrderType: SpotOrderType[spotOrderType],
    exchangeName: SpotExchange[exchange],
    destId: destId as PairsEnum,
    limitPrice: limitPriceOrRefId,
    refId: refId,
  };
};

export const decodeArbitrageMemo = (
  decodedMemo: string,
): ArbitrageMemoDetails => {
  if (!decodedMemo) {
    return null;
  }
  const parts = decodedMemo.split(':');
  if (parts.length !== 6) {
    return null;
  }
  const [tradingType, action, exchangeAIndex, exchangeBIndex, destId, traceId] =
    parts;
  return {
    tradingType: TradingType[tradingType],
    action: ArbitrageMemoAction[action],
    exchangeAName: SpotExchange[exchangeAIndex],
    exchangeBName: SpotExchange[exchangeBIndex],
    symbol: PairsEnum[destId],
    traceId,
  };
};

export const decodeMarketMakingMemo = (
  decodedMemo: string,
): MarketMakingMemoDetails => {
  if (!decodedMemo) {
    return null;
  }
  const parts = decodedMemo.split(':');
  if (parts.length !== 5) {
    return null;
  }
  const [tradingType, action, exchangeIndex, destId, traceId] = parts;
  return {
    tradingType: TradingType[tradingType],
    action: MarketMakingMemoAction[action],
    exchangeName: SpotExchange[exchangeIndex],
    symbol: PairsEnum[destId],
    traceId,
  };
};
