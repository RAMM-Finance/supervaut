import { BUY, SELL, USDC, TransactionTypes } from "../utils/constants";
import { getDayFormat, getDayTimestamp } from "../utils/date-utils";
import { MarketInfo, ActivityData, AmmTransaction, Cash } from "../types";
import {
  convertOnChainCashAmountToDisplayCashAmount,
  formatCash,
  formatCashPrice,
  formatSimpleShares,
  formatLpTokens,
  isSameAddress,
  sharesOnChainToDisplay,
  lpTokenPercentageAmount,
  lpTokensOnChainToDisplay,
} from "../utils/format-number";
import { createBigNumber } from "../utils/create-big-number";

export const shapeUserActvity = (
  account: string,
  markets: { [id: string]: MarketInfo },
  transactions: any,
  cashes: Array<Cash>
): ActivityData[] => {
  let userTransactions = [];
  const usdc = Object.entries(cashes).find((cash) => cash[1].name === USDC)[1];
  for (const marketTransactions in transactions) {
    const marketTrades =
      transactions[marketTransactions].trades?.filter((trade) => isSameAddress(trade.user, account)) || [];
    const adds = (
      transactions[marketTransactions].addLiquidity?.filter((transaction) =>
        isSameAddress(transaction.sender.id, account)
      ) || []
    ).map((tx) => {
      tx.tx_type = TransactionTypes.ADD_LIQUIDITY;
      return tx;
    });
    const removes = (
      transactions[marketTransactions].removeLiquidity?.filter((transaction) =>
        isSameAddress(transaction.sender.id, account)
      ) || []
    ).map((tx) => {
      tx.tx_type = TransactionTypes.REMOVE_LIQUIDITY;
      return tx;
    });
    userTransactions = userTransactions.concat(marketTrades).concat(adds).concat(removes);
  }
  const processedFees = (transactions?.claimedFees || []).map((tx) => {
    tx.tx_type = `Claimed Fees`;
    return tx;
  });
  const processedProceeds = (transactions?.claimedProceeds || []).map((tx) => {
    tx.tx_type = `Claimed Proceeds`;
    return tx;
  });
  const processMints = (transactions?.sharesMinted || []).map((tx) => {
    tx.tx_type = TransactionTypes.MINT_SHARES;
    tx.marketId = { id: `${tx.marketFactory}-${tx.marketIndex}` };
    return tx;
  });
  userTransactions = userTransactions.concat(processedFees).concat(processedProceeds).concat(processMints);
  return formatUserTransactionActvity(account, markets, userTransactions, usdc);
};

const getActivityType = (
  tx: AmmTransaction,
  cash: Cash,
  market: MarketInfo
): {
  type: string;
  subheader: string;
  value: string;
} => {
  let type = null;
  let subheader = null;
  let value = null;
  switch (tx.tx_type) {
    case "Claimed Proceeds": {
      type = "Claimed Proceeds";
      const payout = convertOnChainCashAmountToDisplayCashAmount(tx?.payout, cash.decimals);
      subheader = ``;
      value = `${formatCash(String(payout.abs()), cash.name).full}`;
      break;
    }
    case TransactionTypes.ADD_LIQUIDITY: {
      type = "Add Liquidity";
      const poolPct = lpTokenPercentageAmount(
        lpTokensOnChainToDisplay(tx?.lpTokens).abs(),
        lpTokensOnChainToDisplay(tx?.totalSupply || "1")
      );
      const collateral = convertOnChainCashAmountToDisplayCashAmount(tx?.collateral, cash.decimals);
      const lpTokens = formatLpTokens(poolPct, {
        decimals: 2,
        decimalsRounded: 0,
        denomination: (v) => `${v}%`,
        roundDown: false,
        bigUnitPostfix: false,
      }).full;
      value = `${formatCash(String(collateral.abs()), cash.name).full}`;
      subheader = `Contributed ${lpTokens} of the pool`;
      break;
    }
    case TransactionTypes.REMOVE_LIQUIDITY: {
      type = "Remove Liquidity";
      const collateral = convertOnChainCashAmountToDisplayCashAmount(tx?.collateral, cash.decimals);
      const bnPoolAbs = createBigNumber(tx.lpTokens).abs();
      const poolPct = lpTokenPercentageAmount(
        lpTokensOnChainToDisplay(bnPoolAbs),
        lpTokensOnChainToDisplay(bnPoolAbs.plus(tx?.totalSupply || "0"))
      );
      const lpTokens = formatLpTokens(poolPct, {
        decimals: 2,
        decimalsRounded: 0,
        denomination: (v) => `${v}%`,
        roundDown: false,
        bigUnitPostfix: false,
      }).full;
      value = `${formatCash(String(collateral.abs()), cash.name).full}`;
      subheader = `Withdrew ${lpTokens} of the pool`;
      break;
    }
    case TransactionTypes.MINT_SHARES: {
      type = "Mint Complete Sets";
      const collateral = convertOnChainCashAmountToDisplayCashAmount(tx?.collateral, cash.decimals);
      value = `${formatCash(String(tx?.collateral), cash.name).full}`;
      subheader = `Mint ${tx?.collateral} Complete Sets`;
      break;
    }
    default: {
      const shares = sharesOnChainToDisplay(createBigNumber(tx?.shares)).abs();
      const collateral = convertOnChainCashAmountToDisplayCashAmount(tx?.collateral, cash.decimals);
      const isBuy = collateral.lt(0);
      const shareType = market?.outcomes?.find((o) => o.id === createBigNumber(tx?.outcome).toNumber())?.name;
      const formattedPrice = formatCashPrice(tx.price, cash.name);
      subheader = `${formatSimpleShares(String(shares)).full} Shares of ${shareType} @ ${formattedPrice.full}`;
      // when design wants to add usd value
      value = `${formatCash(String(collateral.abs()), cash.name).full}`;
      type = isBuy ? BUY : SELL;
      break;
    }
  }
  return {
    type,
    value,
    subheader,
  };
};

export const formatUserTransactionActvity = (
  account: string,
  markets: { [id: string]: MarketInfo },
  transactions: Array<AmmTransaction>,
  cash: Cash
): ActivityData[] => {
  if (!account) return [];
  if (!transactions || transactions.length === 0) return [];
  const formattedTransactions = transactions
    .reduce((p, transaction) => {
      const cashName = cash?.name;
      let datedUserTx = null;
      switch (transaction.tx_type) {
        case "Claimed Proceeds": {
          const market = markets[`${transaction?.marketId?.id}`];
          const typeDetails = getActivityType(transaction, cash, market);
          datedUserTx = {
            id: transaction.id,
            currency: cashName,
            description: market?.description,
            title: market?.title || "market not found",
            marketId: transaction?.marketId?.id,
            ...typeDetails,
            date: getDayFormat(transaction.timestamp),
            sortableMonthDay: getDayTimestamp(transaction.timestamp),
            txHash: transaction.transactionHash,
            timestamp: Number(transaction.timestamp),
          };
          break;
        }
        case "Claimed Fees": {
          console.log("fees", transaction);
          break;
        }
        default: {
          const market = markets[`${transaction?.marketId?.id}`.toLowerCase()];
          const typeDetails = getActivityType(transaction, cash, market);
          if (!market) {
            break;
          }
          datedUserTx = {
            id: transaction.id,
            currency: cashName,
            marketId: market.marketId,
            description: market?.description,
            title: market?.title,
            ...typeDetails,
            date: getDayFormat(transaction.timestamp),
            sortableMonthDay: getDayTimestamp(transaction.timestamp),
            txHash: transaction.transactionHash,
            timestamp: Number(transaction.timestamp),
          };
          break;
        }
      }
      return [...p, datedUserTx];
    }, [])
    .sort((a, b) => (a?.timestamp < b?.timestamp ? 1 : -1));
  // form array of grouped by date activities
  return [...formattedTransactions]
    .reduce((p, t) => {
      const item = p.find((x) => x?.date === t?.date);
      if (item) {
        item.activity.push(t);
        return p;
      }
      if (t === null) return [...p];
      return [
        ...p,
        {
          date: t.date,
          sortableMonthDay: t.sortableMonthDay,
          activity: [t],
        },
      ];
    }, [])
    .sort((a, b) => (a.sortableMonthDay < b.sortableMonthDay ? 1 : -1));
};

export const getCombinedMarketTransactionsFormatted = (transactions, market: MarketInfo, cashes: Cash[]) => {
  const usdc = Object.entries(cashes).find((cash) => cash[1].name === USDC)[1];
  const trades = prepareTrades(transactions, market, usdc);
  const adds = prepareAddLiqudity(transactions, market, usdc);
  const removes = prepareRemoveLiquidity(transactions, market, usdc);
  const sortedByTime = []
    .concat(trades)
    .concat(adds)
    .concat(removes)
    .sort((a, b) => (a?.timestamp < b?.timestamp ? 1 : -1));
  return sortedByTime;
};

const prepareTrades = (transactions, market: MarketInfo, cash: Cash) => {
  const { marketId, outcomes } = market;
  const trades = transactions[marketId.toLowerCase()]?.trades;
  return (trades || []).map((trade) => {
    const collateral = convertOnChainCashAmountToDisplayCashAmount(trade?.collateral, cash.decimals);
    const isBuy = collateral.lt(0);
    const shares = sharesOnChainToDisplay(createBigNumber(trade?.shares)).abs();
    const processed = sharedProcessed(trade, market, cash);
    const outcomeName = outcomes?.find((o) => o.id === createBigNumber(trade?.outcome).toNumber())?.name;
    processed.tx_type = isBuy ? TransactionTypes.ENTER : TransactionTypes.EXIT;
    processed.displayShares = formatSimpleShares(String(shares)).full;
    processed.displayCollateral = formatCash(String(collateral.abs()), cash.name);
    processed.displayPrice = formatCashPrice(trade.price, cash.name);
    processed.sender = trade.user;
    processed.subheader = `${isBuy ? "Buy" : "Sell"} ${outcomeName}`;
    return processed;
  });
};

const prepareAddLiqudity = (transactions, market: MarketInfo, cash: Cash) => {
  const { marketId } = market;
  const adds = transactions[marketId.toLowerCase()]?.addLiquidity;
  return (adds || []).map((add) => {
    const collateral = convertOnChainCashAmountToDisplayCashAmount(add?.collateral, cash.decimals);
    const poolPct = lpTokenPercentageAmount(
      lpTokensOnChainToDisplay(add?.lpTokens).abs(),
      lpTokensOnChainToDisplay(add?.totalSupply || "0")
    );
    const lpTokens = formatLpTokens(poolPct, {
      decimals: 2,
      decimalsRounded: 0,
      denomination: (v) => `${v}%`,
      roundDown: false,
      bigUnitPostfix: false,
    }).full;
    const processed = sharedProcessed(add, market, cash);
    processed.tx_type = TransactionTypes.ADD_LIQUIDITY;
    processed.sender = add.sender.id;
    processed.displayShares = lpTokens;
    processed.displayCollateral = formatCash(String(collateral.abs()), cash.name);
    processed.subheader = `Liquidity Added`;
    return processed;
  });
};

const prepareRemoveLiquidity = (transactions, market: MarketInfo, cash: Cash) => {
  const { marketId } = market;
  const removes = transactions[marketId.toLowerCase()]?.removeLiquidity;
  return (removes || []).map((remove) => {
    const collateral = convertOnChainCashAmountToDisplayCashAmount(remove?.collateral, cash.decimals);
    const bnPoolAbs = createBigNumber(remove.lpTokens).abs();
    const poolPct = lpTokenPercentageAmount(
      lpTokensOnChainToDisplay(bnPoolAbs),
      lpTokensOnChainToDisplay(bnPoolAbs.plus(remove?.totalSupply || "0"))
    );
    const lpTokens = formatLpTokens(poolPct, {
      decimals: 2,
      decimalsRounded: 0,
      denomination: (v) => `${v}%`,
      roundDown: false,
      bigUnitPostfix: false,
    }).full;
    const processed = sharedProcessed(remove, market, cash);
    processed.tx_type = TransactionTypes.REMOVE_LIQUIDITY;
    processed.sender = remove.sender.id;
    processed.displayShares = lpTokens;
    processed.displayCollateral = formatCash(String(collateral.abs()), cash.name);
    processed.subheader = `Liquidity Removed`;
    return processed;
  });
};

const sharedProcessed = (tx, market, cash) => {
  const { title, description, marketId } = market;
  const processed = { ...tx };
  processed.txHash = tx.transactionHash;
  processed.currency = cash.name;
  processed.timestamp = Number(tx.timestamp);
  processed.marketId = marketId;
  processed.description = description;
  processed.title = title;
  return processed;
};
