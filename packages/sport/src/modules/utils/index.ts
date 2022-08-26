import { BigNumber as BN } from "bignumber.js";
import { AmmExchange, Cash, LoginAccount, TransactionDetails } from "@augurproject/comps/build/types";
import { ContractCalls, createBigNumber } from "@augurproject/comps";
import { TradingDirection } from "@augurproject/comps/build/utils/constants";
import { doTrade } from "@augurproject/comps/build/utils/contract-calls";
import { claimWinnings } from "@augurproject/comps/build/utils/contract-calls";
import { ActiveBetType } from "modules/stores/constants";
import { MarketInfo } from "@augurproject/comps/build/types";
import { approveERC20Contract, checkAllowance } from "@augurproject/comps/build/stores/use-approval-callback";
import { ApprovalState, TX_STATUS } from "modules/constants";
const { estimateBuyTrade, estimateSellTrade } = ContractCalls;

export interface SizedPrice {
  size: string;
  price: string;
  initialPrice: string;
}

export interface BuyAmount {
  price: string;
  maxProfit: string;
}
// id = outcome ID
export const getSizedPrice = (amm: AmmExchange, id: number, liquidityPortion: number | string = 0.1): SizedPrice => {
  if (!amm?.hasLiquidity) return null;

  const outcome = amm.ammOutcomes.find((o) => o.id === id);
  if (!outcome) return null;
  const size = new BN(outcome.balance || "0")
    .times(new BN(outcome.price || "0"))
    .times(new BN(liquidityPortion))
    .toFixed();
  const est = estimateBuyTrade(amm, size, Number(id), amm?.cash);
  return { size, price: est?.averagePrice, initialPrice: est?.averagePrice };
};

export const getBuyAmount = (amm: AmmExchange, id: number, amount: string): BuyAmount | null => {
  if (!amm?.hasLiquidity) return null;
  if (!amount || createBigNumber(amount).eq(0)) return null;

  const outcome = amm.ammOutcomes.find((o) => o.id === id);
  if (!outcome) return null;
  const est = estimateBuyTrade(amm, amount, Number(id), amm?.cash);
  if (!est) return null;
  return {
    price: est?.averagePrice,
    maxProfit: est?.maxProfit,
  };
};

export const estimatedCashOut = (amm: AmmExchange, size: string, outcomeId: number): string => {
  if (!amm?.hasLiquidity || !size || outcomeId === undefined) return null;
  const est = estimateSellTrade(amm, size, outcomeId, { outcomeSharesRaw: [] });
  // can sell all position or none
  return est.maxSellAmount !== "0" ? null : String(est.outputValue);
};

const makeCashOut = async (
  loginAccount: LoginAccount,
  bet: ActiveBetType,
  market: MarketInfo
): Promise<TransactionDetails> => {
  if (!market || !market?.amm?.hasLiquidity || !bet) return null;
  const { amm } = market;
  const { cash } = amm;
  const shareAmount = bet.size;
  const defaultSlippage = "1";
  const est = estimateSellTrade(amm, shareAmount, bet.outcomeId, { outcomeSharesRaw: [] });
  // can sell all position or none
  if (est.maxSellAmount !== "0") return null;
  const response = await doTrade(
    TradingDirection.EXIT,
    loginAccount?.library,
    amm,
    est.outputValue,
    shareAmount,
    bet.outcomeId,
    loginAccount?.account,
    cash,
    defaultSlippage,
    est?.outcomeShareTokensIn
  );
  return {
    hash: response?.hash,
    chainId: String(loginAccount.chainId),
    seen: false,
    from: loginAccount?.account,
    addedTime: new Date().getTime(),
    status: TX_STATUS.PENDING,
    message: "Cashout Bet",
    marketDescription: `${amm?.market?.title} ${amm?.market?.description}`,
  };
};

export const makeBet = async (
  loginAccount: LoginAccount,
  amm: AmmExchange,
  id: number,
  amount: string,
  account: string,
  cash: Cash
): Promise<TransactionDetails> => {
  const defaultSlippage = "1";
  const est = estimateBuyTrade(amm, amount, Number(id), amm?.cash);
  const minAmount = est.outputValue;
  const response = await doTrade(
    TradingDirection.ENTRY,
    loginAccount?.library,
    amm,
    minAmount,
    amount,
    id,
    account,
    cash,
    defaultSlippage,
    []
  );
  return {
    hash: response?.hash,
    chainId: String(loginAccount.chainId),
    seen: false,
    from: account,
    addedTime: new Date().getTime(),
    status: TX_STATUS.PENDING,
    message: "Bet Placed",
    marketDescription: `${amm?.market?.title} ${amm?.market?.description}`,
  };
};

export const claimMarketWinnings = async (
  loginAccount: LoginAccount,
  amm: AmmExchange
): Promise<TransactionDetails> => {
  if (amm && loginAccount && loginAccount?.account) {
    const { marketFactoryAddress, turboId } = amm?.market;
    return claimAll(loginAccount, [String(turboId)], marketFactoryAddress);
  }
  return null;
};

export const claimAll = async (
  loginAccount: LoginAccount,
  marketIndexes: string[],
  marketFactoryAddress: string
): Promise<TransactionDetails> => {
  if (loginAccount?.account) {
    const response = await claimWinnings(
      loginAccount?.account,
      loginAccount?.library,
      marketIndexes,
      marketFactoryAddress
    );
    return {
      hash: response?.hash,
      chainId: String(loginAccount.chainId),
      seen: false,
      from: loginAccount?.account,
      addedTime: new Date().getTime(),
      status: TX_STATUS.PENDING,
      message: "Claim Winnings",
      marketDescription: `Claim Winnings`,
    };
  }
  return null;
};

export const isCashOutApproved = async (
  loginAccount: LoginAccount,
  outcomeId: number,
  market: MarketInfo,
  transactions: TransactionDetails[]
): Promise<Boolean> => {
  if (!market) return false;
  const shareToken = market.shareTokens[outcomeId];
  const result = await checkAllowance(shareToken, market?.amm.ammFactoryAddress, loginAccount, transactions);
  return result === ApprovalState.APPROVED;
};

export const isBuyApproved = async (
  loginAccount: LoginAccount,
  market: MarketInfo,
  transactions: TransactionDetails[]
): Promise<Boolean> => {
  if (!market) return false;
  const cash = market?.amm?.cash?.address;
  const result = await checkAllowance(cash, market?.amm?.ammFactoryAddress, loginAccount, transactions);
  return result === ApprovalState.APPROVED;
};

export const approveBuy = async (
  loginAccount: LoginAccount,
  cash: string,
  ammFactoryAddress: string
): Promise<TransactionDetails | null> => {
  if (!cash || !ammFactoryAddress) return null;
  return await approveERC20Contract(cash, "Place Bet", ammFactoryAddress, loginAccount);
};

export const approveBuyReset = async (
  loginAccount: LoginAccount,
  cash: string,
  ammFactoryAddress: string
): Promise<TransactionDetails | null> => {
  if (!cash || !ammFactoryAddress) return null;
  return await approveERC20Contract(cash, "Place Bet", ammFactoryAddress, loginAccount, "0");
};

const approveCashOut = async (
  loginAccount: LoginAccount,
  bet: ActiveBetType,
  market: MarketInfo
): Promise<TransactionDetails> => {
  const { outcomeId } = bet;
  const { amm } = market;
  const shareToken = market.shareTokens[outcomeId];
  return await approveERC20Contract(shareToken, "Cashout", amm.ammFactoryAddress, loginAccount);
};

export const approveOrCashOut = async (
  loginAccount: LoginAccount,
  bet: ActiveBetType,
  market: MarketInfo
): Promise<TransactionDetails> => {
  return (await bet.isApproved) ? makeCashOut(loginAccount, bet, market) : approveCashOut(loginAccount, bet, market);
};
