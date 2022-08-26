import { useEffect, useState, useRef } from "react";
import { checkIsERC20Approved, checkIsERC1155Approved, checkAllowance } from "./use-approval-callback";
import { Cash, MarketInfo, TransactionDetails, AmmExchange } from "../types";
import { PARA_CONFIG } from "./constants";
import {
  ETH,
  TX_STATUS,
  ApprovalAction,
  ApprovalState,
  MARKET_STATUS,
  TURBO_THEME_TYPES,
  THEME_OPTIONS,
} from "../utils/constants";
import { useAppStatusStore } from "./app-status";
import { useUserStore } from "./user";
import { getUserBalances, getRewardsContractAddress } from "../utils/contract-calls";
import { getDefaultProvider } from "../components/ConnectAccount/utils";
import { useDataStore } from "./data";

const isAsync = (obj) =>
  !!obj && (typeof obj === "object" || typeof obj === "function") && obj.constructor.name === "AsyncFunction";

const isPromise = (obj) =>
  !!obj && (typeof obj === "object" || typeof obj === "function") && typeof obj.then === "function";

export const middleware = (dispatch, action) => {
  if (action.payload && isAsync(action.payload)) {
    (async () => {
      const v = await action.payload();
      dispatch({ ...action, payload: v });
    })();
  } else if (action.payload && isPromise(action.payload)) {
    action.payload.then((v) => {
      dispatch({ ...action, payload: v });
    });
  } else {
    dispatch({ ...action });
  }
};

export const getSavedUserInfo = (account) => JSON.parse(window.localStorage.getItem(account)) || null;

export const getRelatedMarkets = (market: MarketInfo, markets: Array<MarketInfo>) =>
  keyedObjToKeyArray(markets)
    .filter((mrkt) => mrkt.includes(market.marketId))
    .map((mid) => markets[mid]);

export const isMarketFinal = (market: MarketInfo) => market.reportingState === MARKET_STATUS.FINALIZED;

export const getCurrentAmms = (market: MarketInfo, markets: Array<MarketInfo>) =>
  getRelatedMarkets(market, markets).map((m) => m.amm.cash.name);

export const dispatchMiddleware = (dispatch) => (action) => middleware(dispatch, action);

export const keyedObjToArray = (KeyedObject: object) => Object.entries(KeyedObject).map((i) => i[1]);

export const keyedObjToKeyArray = (KeyedObject: object) => Object.entries(KeyedObject).map((i) => i[0]);

export const arrayToKeyedObject = (ArrayOfObj: Array<{ id: string }>) => arrayToKeyedObjectByProp(ArrayOfObj, "id");

export const arrayToKeyedObjectByProp = (ArrayOfObj: any[], prop: string) =>
  ArrayOfObj.reduce((acc, obj) => {
    acc[obj[prop]] = obj;
    return acc;
  }, {});

function checkIsMobile(setIsMobile) {
  const isMobile =
    (window.getComputedStyle(document.body).getPropertyValue("--is-mobile") || "").indexOf("true") !== -1;
  setIsMobile(isMobile);
}

// CUSTOM HOOKS
export function useHandleResize() {
  const {
    actions: { setIsMobile },
  } = useAppStatusStore();
  useEffect(() => {
    const handleResize = () => checkIsMobile(setIsMobile);
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
}

export function useCanExitCashPosition(cash: Cash, ammFactory: string, refresh: any = null) {
  const { account, loginAccount } = useUserStore();
  const approvedAccount = useRef(null);
  const [canExitPosition, setCanExitPosition] = useState(false);
  useEffect(() => {
    const checkApproval = async ({ name, shareToken }: Cash) => {
      if (!name || !shareToken || !account) return setCanExitPosition(false);
      const isApproved = await checkIsERC1155Approved(shareToken, ammFactory, account, loginAccount?.library);
      setCanExitPosition(isApproved);
      if (isApproved || canExitPosition) {
        approvedAccount.current = account;
      }
    };

    if (!canExitPosition && account !== approvedAccount.current) {
      checkApproval(cash);
    }
  }, [refresh, cash.shareToken, account, loginAccount]);

  return canExitPosition;
}

export function useCanEnterCashPosition({ name, address }: Cash, ammFactory: string, refresh: any = null) {
  const { account, loginAccount } = useUserStore();
  const approvedAccount = useRef(null);
  const [canEnterPosition, setCanEnterPosition] = useState(name === ETH);

  useEffect(() => {
    const checkApproval = async (address: string) => {
      if (!address || !account) return setCanEnterPosition(false);
      const isApproved = await checkIsERC20Approved(address, ammFactory, account, loginAccount?.library);
      setCanEnterPosition(isApproved);
      if (isApproved || canEnterPosition) {
        approvedAccount.current = account;
      }
    };

    if (!canEnterPosition && account !== approvedAccount.current) {
      checkApproval(address);
    }
  }, [address, account, refresh, loginAccount]);

  return canEnterPosition;
}

export function useUserBalances({ ammExchanges, blocknumber, cashes, markets, transactions, isWalletRpc }) {
  const {
    loginAccount,
    actions: { updateUserBalances },
  } = useUserStore();
  useEffect(() => {
    const fetchUserBalances = async (library, account, ammExchanges, cashes, markets, transactions) => {
      const provider = isWalletRpc ? library : getDefaultProvider() || library;
      const currentBlockNumber = library ? await library.getBlockNumber() : 0;
      return getUserBalances(provider, account, ammExchanges, cashes, markets, transactions, currentBlockNumber);
    };

    if (loginAccount?.library && loginAccount?.account) {
      fetchUserBalances(loginAccount.library, loginAccount.account, ammExchanges, cashes, markets, transactions)
        .then((userBalances) => updateUserBalances(userBalances))
        .catch((e) => console.error("error fetching user balances, will try again"));
    }
  }, [loginAccount?.account, loginAccount?.library, blocknumber]);
}

export function useFinalizeUserTransactions(refresh: any = null) {
  const {
    account,
    loginAccount,
    transactions,
    actions: { finalizeTransaction },
  } = useUserStore();
  useEffect(() => {
    transactions
      .filter((t) => t.status === TX_STATUS.PENDING)
      .filter((t) => t.hash)
      .forEach((t: TransactionDetails) => {
        loginAccount.library
          .getTransactionReceipt(t.hash)
          .then((receipt) => {
            if (receipt) {
              finalizeTransaction(t.hash, receipt);
            }
          })
          .catch((e) => {
            // for debugging to see if error occurs when MM drops tx
            console.log("transaction error", e);
          });
      });
  }, [loginAccount, refresh, transactions, account]);
}

export function useScrollToTopOnMount(...optionsTriggers) {
  useEffect(() => {
    // initial render only.
    document.getElementById("mainContent")?.scrollTo(0, 0);
    window.scrollTo(0, 1);
  }, [...optionsTriggers]);
}

const { ADD_LIQUIDITY, REMOVE_LIQUIDITY, ENTER_POSITION, EXIT_POSITION, MINT_SETS, RESET_PRICES } = ApprovalAction;
export const { UNKNOWN, PENDING, APPROVED } = ApprovalState;
export function useApprovalStatus({
  amm,
  cash,
  refresh = 0,
  actionType,
  outcomeShareToken = null,
}: {
  amm?: AmmExchange | null | undefined;
  cash: Cash;
  refresh: number | string;
  actionType: ApprovalAction;
  outcomeShareToken?: string | null;
}) {
  const { account, loginAccount, transactions } = useUserStore();
  const [isApproved, setIsApproved] = useState(UNKNOWN);
  const forceCheck = useRef(false);
  const ammFactory = amm.ammFactoryAddress;
  const rewardContractAddress = getRewardsContractAddress(amm.marketFactoryAddress);
  const { name: marketCashType, address: tokenAddress, shareToken } = cash;
  const ammId = amm?.id;
  const isETH = marketCashType === ETH;

  useEffect(() => {
    let isMounted = true;
    // if we switch make sure to check if we are approved.
    if (isApproved === APPROVED && isMounted) forceCheck.current = true;
    return () => {
      isMounted = false;
    };
  }, [marketCashType, tokenAddress, shareToken, ammId, actionType, account, outcomeShareToken]);

  useEffect(() => {
    let isMounted = true;
    const checkIfApproved = async () => {
      let approvalCheck = UNKNOWN;
      let address = null;
      let spender = ammFactory;
      let checkApprovalFunction = checkAllowance;
      switch (actionType) {
        case EXIT_POSITION: {
          address = outcomeShareToken;
          break;
        }
        case REMOVE_LIQUIDITY: {
          address = rewardContractAddress ? null : amm?.id;
          if (rewardContractAddress) {
            setIsApproved(APPROVED);
          }
          break;
        }
        case ENTER_POSITION: {
          address = isETH ? null : tokenAddress;
          checkApprovalFunction = isETH ? async () => APPROVED : checkAllowance;
          break;
        }
        case ADD_LIQUIDITY: {
          spender = rewardContractAddress || ammFactory;
          address = tokenAddress;
          break;
        }
        case MINT_SETS: {
          address = amm?.cash?.address;
          spender = amm?.marketFactoryAddress;
          checkApprovalFunction = checkAllowance;
          break;
        }
        case RESET_PRICES: {
          const { evenTheOdds } = PARA_CONFIG;
          address = amm?.cash?.address;
          spender = evenTheOdds;
          checkApprovalFunction = checkAllowance;
          break;
        }
        default: {
          break;
        }
      }

      if (address && spender && loginAccount && transactions) {
        // prevent this from calling if we don't have values for everything
        // effect is approvalCheck remains `UNKOWN` and will check again
        console.log('addresssesds', address, spender)
        approvalCheck = await checkApprovalFunction(address, spender, loginAccount, transactions);
      }

      (forceCheck.current || approvalCheck !== isApproved) && isMounted && setIsApproved(approvalCheck);
      if (forceCheck.current) forceCheck.current = false;
    };

    if ((forceCheck.current || isApproved !== APPROVED) && account) {
      checkIfApproved();
    }
    return () => {
      isMounted = false;
    };
  }, [
    account,
    isApproved,
    actionType,
    ammId,
    PARA_CONFIG,
    marketCashType,
    tokenAddress,
    shareToken,
    outcomeShareToken,
    transactions,
    refresh,
  ]);

  return isApproved;
}

export const setHTMLTheme = (theme) => document.documentElement.setAttribute("THEME", theme);

export const getHTMLTheme = () => document.documentElement.getAttribute("THEME");

export interface ThemeType {
  DARK: string;
  LIGHT: string | null;
}

export interface SettingsThemeStateType {
  settings: {
    theme: string | null;
  };
}

export const useHandleTheming = (state: SettingsThemeStateType, themeTypes: ThemeType = TURBO_THEME_TYPES) => {
  const {
    settings: { theme },
  } = state;
  const { blocknumber } = useDataStore();

  useEffect(() => {
    const htmlTheme = getHTMLTheme();

    switch (theme) {
      case THEME_OPTIONS.AUTO: {
        const date = new Date();
        const curHour = date.getHours();
        const expectedTheme = curHour >= 7 && curHour < 19 ? themeTypes.LIGHT : themeTypes.DARK;
        if (htmlTheme !== expectedTheme) {
          setHTMLTheme(expectedTheme);
        }
        break;
      }
      case THEME_OPTIONS.DARK: {
        if (htmlTheme !== themeTypes.DARK) {
          setHTMLTheme(themeTypes.DARK);
        }
        break;
      }
      default:
        if (htmlTheme !== themeTypes.LIGHT) {
          setHTMLTheme(themeTypes.LIGHT);
        }
        break;
    }
  }, [blocknumber, theme]);
};
