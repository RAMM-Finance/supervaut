import { BigNumber as BN } from "bignumber.js";
import { Web3Provider } from "@ethersproject/providers";
import * as SimpleSportsDailies from "./derived-simple-sport-dailies";
import * as MmaDailies from "./derived-mma-dailies";
import * as CryptoMarkets from "./derived-crypto-markets";
import * as NflMarkets from "./derived-nfl-dailies";
import * as GroupedMarkets from "./derived-grouped-data";
import * as TrustedMarkets from "./derived-trusted-markets";
import {
  MARKET_FACTORY_TYPES,
  MARKET_STATUS,
  NULL_ADDRESS,
  NUM_TICKS_STANDARD,
  OUTCOME_YES_ID,
  SPORTS_MARKET_TYPE,
  ZERO,
} from "./constants";
import { AmmExchange, MarketInfo, MarketInfos } from "types";
import { calculatePrices } from "./calculations";
import { convertOnChainCashAmountToDisplayCashAmount, sharesOnChainToDisplay } from "./format-number";
import { MarketFactory } from "@augurproject/smart";
import * as SportFetcher from "./fetcher-sport";
import * as CryptoFetcher from "./fetcher-crypto";
import * as GroupedFetcher from "./fetcher-grouped";
import * as TrustedFetcher from "./fetcher-trusted";
import { getDefaultPrice } from "./get-default-price";

export const getResolutionRules = (marketInfo: MarketInfo): string[] => {
  switch (marketInfo.marketFactoryType) {
    case MARKET_FACTORY_TYPES.CRYPTO: {
      return CryptoMarkets.getResolutionRules(marketInfo);
    }
    case MARKET_FACTORY_TYPES.MMA:
    case MARKET_FACTORY_TYPES.MMALINK: {
      return MmaDailies.getResolutionRules(marketInfo);
    }
    case MARKET_FACTORY_TYPES.GROUPED: {
      return GroupedMarkets.getResolutionRules(marketInfo);
    }
    case MARKET_FACTORY_TYPES.TRUSTED:{
      return TrustedMarkets.getResolutionRules(marketInfo);
    }
    // case MARKET_FACTORY_TYPES.CDS:{
    //   return TrustedMarkets.getResolutionRules(marketInfo);
    // }
    default:
      // NFL, MLB, NBA, NHL
      return SimpleSportsDailies.getResolutionRules(marketInfo);
  }
};

const IgnoreMarkets = {
  "3": [SPORTS_MARKET_TYPE.SPREAD, SPORTS_MARKET_TYPE.OVER_UNDER],
};

const IgnoreOpenMarkets = {
  "4": [SPORTS_MARKET_TYPE.MONEY_LINE, SPORTS_MARKET_TYPE.SPREAD, SPORTS_MARKET_TYPE.OVER_UNDER],
};

export const isIgnoredMarket = (sportId: string, sportsMarketType: number): boolean => {
  // ignore MLB spread and over/under
  const sport = IgnoreMarkets[sportId];
  if (!sport) return false;
  return sport.includes(sportsMarketType);
};

export const isIgnoreOpendMarket = (sportId: string, sportsMarketType: number): boolean => {
  // ignore MLB spread and over/under
  const sport = IgnoreOpenMarkets[sportId];
  if (!sport) return false;
  return sport.includes(sportsMarketType);
};

export const deriveMarketInfo = (market: MarketInfo, marketData: any, marketFactoryType: string): MarketInfo => {
  switch (marketFactoryType) {
    case MARKET_FACTORY_TYPES.SPORTSLINK: {
      return SimpleSportsDailies.deriveMarketInfo(market, marketData);
    }
    case MARKET_FACTORY_TYPES.CRYPTO: {
      return CryptoMarkets.deriveMarketInfo(market, marketData);
    }
    case MARKET_FACTORY_TYPES.MMA:
    case MARKET_FACTORY_TYPES.MMALINK: {
      return MmaDailies.deriveMarketInfo(market, marketData);
    }
    case MARKET_FACTORY_TYPES.MLB:
    case MARKET_FACTORY_TYPES.NBA:
    case MARKET_FACTORY_TYPES.NFL: {
      return NflMarkets.deriveMarketInfo(market, marketData, marketFactoryType);
    }
    case MARKET_FACTORY_TYPES.GROUPED: {
      return GroupedMarkets.deriveMarketInfo(market, marketData);
    }
    case MARKET_FACTORY_TYPES.TRUSTED:{
      return TrustedMarkets.deriveMarketInfo(market, marketData);
    }
    // case MARKET_FACTORY_TYPES.CDS:{
    //         return TrustedMarkets.deriveMarketInfo(market, marketData);

    //}
    default:
      return market;
  }
};

export const fetcherMarketsPerConfig = async (
  config: MarketFactory,
  provider: Web3Provider,
  account: string
): Promise<{ markets: MarketInfos | null; blocknumber: number }> => {
  const blocknumber = await provider.getBlockNumber();
  let markets = null;
  switch (config?.type) {
   // case MARKET_FACTORY_TYPES.NFL:
   // case MARKET_FACTORY_TYPES.MMA:
   // case MARKET_FACTORY_TYPES.MLB:
    case MARKET_FACTORY_TYPES.NBA: {
      //markets = await SportFetcher.fetchContractData(config, provider, account);
     markets=  null;
      break;
    }
    case MARKET_FACTORY_TYPES.CRYPTO: {
      markets = await CryptoFetcher.fetchContractData(config, provider, account);
      console.log('cryptomarkets?', markets)

      break;
    }
    case MARKET_FACTORY_TYPES.GROUPED: {
      markets = await GroupedFetcher.fetchContractData(config, provider, account);
      break;
    }
    case MARKET_FACTORY_TYPES.TRUSTED: {
      markets = await TrustedFetcher.fetchContractData(config, provider, account)
    //  console.log('Trusted lol', markets, config.type)
      break; 

    } 
    // case MARKET_FACTORY_TYPES.CDS: {
    //   markets = await TrustedFetcher.fetchContractData(config, provider, account)
    //   console.log('CDS', markets, config.type)
    //   break; 

    // }
    default: {
      console.log("Config type not found", config.type);
      markets = null
      break;
    }
  }
  return { markets, blocknumber };
};

export const decodeMarket = (marketData: any, marketFactoryType: string) => {
  const {
    shareTokens,
    endTime,
    winner,
    creator,
    settlementFee: onChainFee,
    creationTimestamp,
    initialOdds,
  } = marketData;
  const winningOutcomeId = shareTokens.indexOf(winner);
  const hasWinner = winner !== NULL_ADDRESS && winner !== null;
  const reportingState = !hasWinner ? MARKET_STATUS.TRADING : MARKET_STATUS.FINALIZED;

  const creatorFee = new BN(String(onChainFee))
    .div(new BN(10).pow(new BN(18)))
    .times(100)
    .toFixed();

  return {
    endTimestamp: endTime ? new BN(String(endTime)).toNumber() : null,
    creationTimestamp: new BN(String(creationTimestamp)).toNumber(),
    numTicks: NUM_TICKS_STANDARD,
    winner: winningOutcomeId === -1 ? null : winningOutcomeId,
    hasWinner,
    reportingState,
    creatorFeeRaw: String(onChainFee),
    settlementFee: creatorFee,
    shareTokens,
    creator,
    marketFactoryType,
    initialOdds: initialOdds ? initialOdds.map((i) => String(i)) : undefined,
  };
};

export const decodeBaseMarketFetcher = (marketData: any) => {
  const { settlementFee: onChainFee, settlementFee, shareFactor, sportId, collateral } = marketData;
  const { addr, symbol, decimals } = collateral;

  const cash = {
    address: addr,
    name: symbol,
    symbol,
    decimals,
    usdPrice: 1,
    displayDecimals: 2,
  };
  const creatorFee = new BN(String(settlementFee))
    .div(new BN(10).pow(new BN(18)))
    .times(100)
    .toFixed();

  return {
    numTicks: NUM_TICKS_STANDARD,
    creatorFeeRaw: String(onChainFee),
    settlementFee: creatorFee,
    sportId: String(sportId),
    shareFactor: String(new BN(String(shareFactor))),
    cash,
  };
};

export const decodeMarketDetailsFetcher = (marketData: any, factoryDetails: any, config: MarketFactory,
  prices: string ="0") => {
  const {
    shareTokens,
    endTime,
    winner,
    creator,
    creationTimestamp,
    initialOdds,
    eventStatus,
    factory,
    marketType,
    marketId: marketIndex,
    pool,
    resolutionTime,
  } = marketData;
  const winningOutcomeId = shareTokens.indexOf(winner);
  const hasWinner = winner !== NULL_ADDRESS && winner !== null;
  const reportingState = !hasWinner ? MARKET_STATUS.TRADING : MARKET_STATUS.FINALIZED;

  const turboId = new BN(String(marketIndex)).toNumber();
  const market = {
    endTimestamp: endTime || resolutionTime ? new BN(String(endTime || resolutionTime)).toNumber() : null,
    creationTimestamp: new BN(String(creationTimestamp)).toNumber(),
    numTicks: NUM_TICKS_STANDARD,
    winner: winningOutcomeId === -1 ? null : winningOutcomeId,
    hasWinner,
    reportingState,
    shareTokens,
    creator,
    marketFactoryAddress: factory,
    eventStatus,
    marketType,
    initialOdds: initialOdds ? initialOdds.map((i) => String(i)) : undefined,
    marketId: `${factory}-${turboId}`.toLowerCase(),
    turboId,
    marketIndex: turboId, // use this instead of turboId
    marketFactoryType: config.type,
    ...factoryDetails,
    rewards: formatRewards(marketData?.rewards),
  };
  const marketInfo = deriveMarketInfo(market, marketData, config.type);
 // console.log('marketinfo, config.type', marketInfo,marketData, config.type)
  var print = false
  if (config.type==MARKET_FACTORY_TYPES.TRUSTED){
    print = true
  }
  marketInfo.amm = decodePool(marketInfo, pool, factoryDetails, config, print, prices);
  return marketInfo;
};

const formatRewards = (marketData) => {
  return {
    beginTimestamp: new BN(String(marketData?.beginTimestamp || "0")).toNumber(),
    created: marketData?.created,
    earlyDepositEndTimestamp: new BN(String(marketData?.earlyDepositEndTimestamp || "0")).toNumber(),
    endTimestamp: new BN(String(marketData?.endTimestamp || "0")).toNumber(),
    totalRewardsAccrued: String(sharesOnChainToDisplay(new BN(String(marketData?.totalRewardsAccrued || "0")))),
    rawTotalRewardsAccrued: String(marketData?.totalRewardsAccrued),
  };
};
export const decodeGroupedMarketDetailsFetcher = (marketData: any, factoryDetails: any, config: MarketFactory) => {
  const {
    endTime,
    winner,
    creator,
    creationTimestamp,
    eventStatus,
    factory,
    marketType,
    marketId,
    eventId,
    marketIndex,
    category,
  } = marketData;
  const winningOutcomeId = -1; // TODO: find Yes winning outcome and get outcomeName to display
  const hasWinner = winner !== NULL_ADDRESS && winner !== null;
  const reportingState = !hasWinner ? MARKET_STATUS.TRADING : MARKET_STATUS.FINALIZED;

  const turboId = new BN(String(marketIndex)).toNumber();
  const market = {
    endTimestamp: endTime ? new BN(String(endTime)).toNumber() : null,
    creationTimestamp: new BN(String(creationTimestamp)).toNumber(),
    numTicks: NUM_TICKS_STANDARD,
    winner: winningOutcomeId === -1 ? null : winningOutcomeId,
    hasWinner,
    reportingState,
    creator,
    marketFactoryAddress: factory,
    eventStatus,
    marketType,
    initialOdds: undefined,
    marketId: marketId.toLowerCase(),
    turboId,
    marketIndex: turboId, // use this instead of turboId
    ...factoryDetails,
    isGrouped: true,
    eventId,
    subMarkets: marketData.subMarkets,
    outcomes: [{}, {}], // placeholder
    category,
  };

  const pools = marketData.subMarkets.map((s) => decodePool(market, s.pool, factoryDetails, config));
  market.pools = pools;
  const marketInfo = deriveMarketInfo(market, marketData, config.type);
  marketInfo.amm = {
    ...pools[0],
    pools,
    ammOutcomes: marketInfo.outcomes.map((o, i) => ({
      ...o,
      price: pools[i].ammOutcomes[OUTCOME_YES_ID].price,
      marketId: o.marketId,
    })),
  };

  return marketInfo;
};

const decodePool = (market: MarketInfo, pool: any, factoryDetails: any, config: MarketFactory, 
  printmarket:boolean = false, bondPrices: string = "0"): AmmExchange => {
  const shortprice_ =  1 - Number(bondPrices); 
  const shortprice = Number(shortprice_).toFixed(3); 
  const outcomePrice = [String(Number(bondPrices).toFixed(3)), String(shortprice)]; 
  const outcomePrices = calculatePrices(market, pool.ratios || pool.tokenRatios, pool.weights);
  const fee = new BN(String(pool.swapFee || "0")).toFixed();
  const balancesRaw = pool.balances || [];
  const weights = pool.weights ? pool.weights.map((w) => String(w)) : [];
  const id = pool.addr;
  const created = pool.addr !== NULL_ADDRESS;
  // if (printmarket){
  //     console.log('ammoutcomes', market)
  // }
  const ammOutcomes = market.outcomes.map((o, i) => ({
    //price: created ? String(outcomePrices[i]) : "",
    price: String(outcomePrice[i]), 
    ratioRaw: created ? getArrayValue(pool.ratios || pool.tokenRatios, i) : "",
    ratio: created ? toDisplayRatio(getArrayValue(pool.ratios || pool.tokenRatios, i)) : "",
    balanceRaw: created ? getArrayValue(pool.balances, i) : "",
    balance: created ? String(sharesOnChainToDisplay(getArrayValue(pool.balances, i))) : "",
    defaultPrice: String(getDefaultPrice(o.id, weights)),
    ...o,
  }));

  const feeDecimal = fee ? new BN(String(fee)).div(new BN(10).pow(18)) : ZERO;
  return {
    id: created ? id : null,
    ammOutcomes,
    market,
    feeDecimal: String(feeDecimal),
    feeInPercent: fee ? feeDecimal.times(100).toFixed() : "0",
    feeRaw: fee,
    balancesRaw: balancesRaw ? balancesRaw.map((b) => String(b)) : [],
    shareFactor: new BN(String(factoryDetails.shareFactor)).toFixed(),
    weights,
    liquidityUSD: getTotalLiquidity(outcomePrices, balancesRaw),
    turboId: market.turboId,
    marketId: market.marketId,
    cash: factoryDetails.cash,
    ammFactoryAddress: config.ammFactory,
    marketFactoryAddress: config.address,
    hasLiquidity: created,
    totalSupply: String(new BN(String(pool?.totalSupply))) || "0",
  };
};

const getArrayValue = (ratios: string[] = [], outcomeId: number) => {
  if (ratios.length === 0) return "0";
  if (!ratios[outcomeId]) return "0";
  return String(ratios[outcomeId]);
};

const toDisplayRatio = (onChainRatio: string = "0"): string => {
  // todo: need to use cash to get decimals
  return convertOnChainCashAmountToDisplayCashAmount(onChainRatio, 18).toFixed();
};

const getTotalLiquidity = (prices: string[], balances: string[]): number => {
  if (prices.length === 0) return 0;
  const outcomeLiquidity = prices.map((p, i) =>
    new BN(p).times(new BN(toDisplayLiquidity(String(balances ? balances[i] : "0")))).toFixed()
  );
  return Number(outcomeLiquidity.reduce((p, r) => p.plus(new BN(r)), ZERO).toFixed(4));
};

const toDisplayLiquidity = (onChainBalance: string = "0"): string => {
  return convertOnChainCashAmountToDisplayCashAmount(onChainBalance).toFixed();
};
