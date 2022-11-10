import React, { useState, useEffect, useMemo } from "react";
import classNames from "classnames";
import Styles from "./market-liquidity-view.styles.less";
import CommonStyles from "../modal/modal.styles.less";
import ButtonStyles from "../common/buttons.styles.less";
import { useHistory, useLocation } from "react-router";
import { InfoNumbers, ApprovalButton } from "../market/trading-form";
import { BigNumber as BN } from "bignumber.js";
import {
  ContractCalls,
  useDataStore,
  useUserStore,
  Components,
  Utils,
  Constants,
  useApprovalStatus,
  createBigNumber,
  useAppStatusStore,
  useScrollToTopOnMount,
} from "@augurproject/comps";
import { AmmOutcome, MarketInfo, Cash, LiquidityBreakdown, DataState } from "@augurproject/comps/build/types";
import { useSimplifiedStore } from "../stores/simplified";
import {
  MODAL_CONFIRM_TRANSACTION,
  LIQUIDITY,
  MARKET_LIQUIDITY,
  CREATE,
  ADD,
  REMOVE,
  SHARES,
  USDC,

} from "../constants";
// import {SwapMenu} from "./swap"; 
import {MintView} from "../mint/mint"; 
const {
  ButtonComps: { SecondaryThemeButton, TinyThemeButton },
  LabelComps: { CategoryIcon, WarningBanner },
  MarketCardComps: { MarketTitleArea, orderOutcomesForDisplay, unOrderOutcomesForDisplay },
  InputComps: { AmountInput, isInvalidNumber, OutcomesGrid },
  Links: { MarketLink },
  Icons: { WarningIcon, BackIcon, MaticIcon, USDCIcon },
  SelectionComps: { BuySellToggleSwitch,BuySellSwapToggleSwitch,TrancheToggleSwitch},

} = Components;
const {
  checkConvertLiquidityProperties,
  doRemoveLiquidity,
  addLiquidityPool,
  estimateAddLiquidityPool,
  getRemoveLiquidity,
  mintCompleteSets,
  isMarketPoolWhacked,
  maxWhackedCollateralAmount,
  estimateResetPrices,
  doResetPrices,

  addTrancheLiquidity, 

} = ContractCalls;
const {

  PathUtils: { makePath, parseQuery },
  Formatter: { formatDai, formatSimpleShares, formatEther, formatCash },
  Calculations: { calcPricesFromOdds },
} = Utils;
const {
  BUY,
  SELL, 
  MARKET_ID_PARAM_NAME,
  ApprovalAction,
  ApprovalState,
  ERROR_AMOUNT,
  CONNECT_ACCOUNT,
  ENTER_AMOUNT,
  INSUFFICIENT_BALANCE,
  ZERO,
  SET_PRICES,
  MINT_SETS,
  RESET_PRICES,
  ONE,
  INVALID_PRICE,
  INVALID_PRICE_GREATER_THAN_SUBTEXT,
  INVALID_PRICE_ADD_UP_SUBTEXT,
  TX_STATUS,
} = Constants;

const defaultAddLiquidityBreakdown: LiquidityBreakdown = {
  lpTokens: "0",
  cashAmount: "0",
  minAmounts: [],
};
const MIN_PRICE = 0.02;

const TRADING_FEE_OPTIONS = [
  {
    id: 0,
    label: "0.0%",
    value: 0,
  },
  {
    id: 1,
    label: "0.5%",
    value: 0.5,
  },
  {
    id: 2,
    label: "1%",
    value: 1,
  },
  {
    id: 3,
    label: "2%",
    value: 2,
  },
];

const REMOVE_FOOTER_TEXT = `Removing liquidity may return shares; these shares may be sold for USDC if there is still liquidity in the pool. Winning shares can be redeemed for USDC after the market has finalized.`;

export const MarketLiquidityView = () => {
  const {
    settings: { timeFormat },
  } = useSimplifiedStore();
  const {
    actions: { closeModal },
  } = useAppStatusStore();
  const { balances } = useUserStore();
  const location = useLocation();
  const history = useHistory();

  const { [MARKET_ID_PARAM_NAME]: marketId, [MARKET_LIQUIDITY]: actionType = ADD } = parseQuery(location.search);
  const { markets,amm } = useDataStore();
  const market = markets?.[marketId];
  const [selectedAction, setSelectedAction] = useState(actionType);
  useScrollToTopOnMount();
  const isRemove = selectedAction === REMOVE;
  const isResetPrices = selectedAction === RESET_PRICES;
  const maxWhackedCollateral = market && maxWhackedCollateralAmount(market?.amm);
  const [showMoreDetails, setShowMoreDetails] = useState(false);
  console.log('marketidhere', marketId); 
  const shareBalance =
    balances &&
    balances.lpTokens &&
    balances.lpTokens[market?.amm?.marketId] &&
    balances.lpTokens[market?.amm?.marketId].balance;
  const [amount, setAmount] = useState(
    isRemove ? shareBalance : isResetPrices ? maxWhackedCollateral?.collateralUsd : ""
  );
  if (!market) {
    return <div className={classNames(Styles.MarketLiquidityView)}>Market Not Found.</div>;
  }
  const { categories } = market;
  const BackToLPPageAction = () => {
    history.push({
      pathname: makePath(LIQUIDITY),
    });
    closeModal();
  };
  // TODO actions:
  //mint tvault and split, swap back and redeem to tvault, add/remove liq, 
  // show profits, 
  return (
    <div className={classNames(Styles.MarketLiquidityView)}>

      <BackBar {...{ market, selectedAction, setSelectedAction, BackToLPPageAction, setAmount, maxWhackedCollateral }} />
      <MarketLink id={marketId} dontGoToMarket={true}>
        {/*<CategoryIcon {...{ categories }} /> */}
        <div
          className={classNames(Styles.Details, {
            [Styles.isClosed]: !showMoreDetails,
          })}
        >
          <h4>Market Details</h4>
            <p>{"DETAILS"}</p>
          
          {(
            <button onClick={() => setShowMoreDetails(!showMoreDetails)}>
              {showMoreDetails ? "Read Less" : "Read More"}
            </button> 
          )}
          <p>{"DESCRITPTIONS"}</p>



      <ul className={Styles.StatsRow}>
<li>
            <span>Underlying</span>
            <span>{formatDai(100000000/4.2/1000000  || "0.00").full}</span>
            <span>{formatDai(100000000/5/1000000 || "0.00").full}</span>
           {/* <span>{marketHasNoLiquidity ? "-" : formatDai(storedCollateral/1000000 || "0.00").full}</span> */}
          </li>
          <li>
            <span>Vault(s) </span>
            <span>{formatDai(0.818 || "0.00").full}</span>

            {/*<span>{marketHasNoLiquidity ? "-" : formatLiquidity(amm?.liquidityUSD/10 || "0.00").full}</span> */}
          </li>
          <li>
            <span>Junior Weight</span>
            <span>{"Resolved"}</span>
          </li>

          <li>
            <span>Promised Return</span>
            <span>{formatDai(100000000/1000000 || "0.00").full}</span>
            {/*<span>{marketHasNoLiquidity ? "-" : formatLiquidity(amm?.liquidityUSD || "0.00").full}</span>*/}
          </li>
        {/*inception price,inception time, current value prices, current mark prices*/}

        </ul>


     

        </div>   
       
       {/* <SwapMenu/> */}
        <MarketTitleArea {...{ ...market, timeFormat }} />
      </MarketLink>
          <h4>Add/Remove Liquidity</h4>


      <LiquidityForm {...{ market, selectedAction, setSelectedAction, BackToLPPageAction, amount, setAmount }} />
      {selectedAction !== MINT_SETS && selectedAction !== RESET_PRICES && <LiquidityWarningFooter />}
          <h4>Trade</h4>

     {/* <TradeForm {...{ market, selectedAction, setSelectedAction, BackToLPPageAction, amount, setAmount }} />
      {selectedAction !== MINT_SETS && selectedAction !== RESET_PRICES && <LiquidityWarningFooter />} */}

    </div>

  );
};

const BackBar = ({ BackToLPPageAction, selectedAction, setSelectedAction, setAmount, market, maxWhackedCollateral }) => {
  const isMint = selectedAction === MINT_SETS;
  const isReset = selectedAction === RESET_PRICES;
  const isWhacked = isMarketPoolWhacked(market.amm);
  return (
    <div className={Styles.BackBar}>
      <button onClick={BackToLPPageAction}>{BackIcon} Back To Pools</button>
      {(isWhacked || (isReset && !isWhacked)) && (
        <TinyThemeButton
          action={() => {
            setSelectedAction(isReset ? ADD : RESET_PRICES);
            if (isReset) {
              setAmount("");
            } else {
              setAmount(maxWhackedCollateral.collateralUsd);
            }
          }}
          text={isReset ? "Add/Remove" : "Reset Prices"}
          small
        />
      )}
      <TinyThemeButton
        action={() => {
          setSelectedAction(isMint ? ADD : MINT_SETS);
          !isMint && setAmount("");
        }}
        text={isMint ? "Add/Remove Liquidity" : "Mint Complete Sets"}
        small
      />
    </div>
  );
};

const LiquidityWarningFooter = () => (
  <article className={Styles.LiquidityWarningFooter}>
    <span>
      {WarningIcon} Remove liquidity before the winning outcome is known. Failure to do so can result in a total loss of
      funds.
    </span>
  </article>
);

interface LiquidityFormProps {
  market: MarketInfo;
  selectedAction: string;
  setSelectedAction: Function;
  BackToLPPageAction: () => void;
  amount: string;
  setAmount: (string) => void;
}

const orderMinAmountsForDisplay = (
  items: { amount: string; outcomeId: number; hide: boolean }[] = []
): { amount: string; outcomeId: number; hide: boolean }[] =>
  items.length > 0 && items[0].outcomeId === 0 ? items.slice(1).concat(items.slice(0, 1)) : items;

const getCreateBreakdown = (breakdown, market, balances, isRemove = false) => {
  const fullBreakdown = [
    ...orderMinAmountsForDisplay(breakdown.minAmounts)
      .filter((m) => !m.hide)
      .map((m) => ({
        label: `${market.outcomes[m.outcomeId]?.name} Shares`,
        value: `${formatSimpleShares(m.amount).formatted}`,
        svg: null,
      })),
    {
      label: isRemove ? "USDC" : "LP tokens",
      value: `${
        breakdown?.amount
          ? isRemove
            ? formatCash(breakdown.amount, USDC).full
            : formatSimpleShares(breakdown.amount).formatted
          : "-"
      }`,
      svg: isRemove ? USDCIcon : null,
    },
  ];
  const userRewards = balances?.pendingRewards?.[market.marketId];
  const pendingRewards = userRewards ? userRewards.balance : "0";
  const bonusRewards =
    userRewards && new Date().getTime() / 1000 >= userRewards.endBonusTimestamp ? userRewards.pendingBonusRewards : "0";
  const totalRewards = new BN(pendingRewards).plus(new BN(bonusRewards));
  if (totalRewards.gt(ZERO)) {
    fullBreakdown.push({
      label: `LP Rewards`,
      value: `${formatEther(totalRewards).formatted}`,
      svg: MaticIcon,
    });
  }
  return fullBreakdown;
};

const getMintBreakdown = (outcomes, amount) => {
  return outcomes.map((outcome) => ({
    label: `${outcome.name} Shares`,
    value: `${formatSimpleShares(amount).rounded}`,
    svg: null,
  }));
};

const getResetBreakdown = (breakdown, market) => {
  const fullBreakdown = [
    ...orderMinAmountsForDisplay(breakdown.minAmounts)
      .filter((m) => !m.hide)
      .map((m) => ({
        label: `${market.outcomes[m.outcomeId]?.name} Shares`,
        value: `${formatSimpleShares(m.amount).formatted}`,
        svg: null,
      }))
  ];
  return fullBreakdown;
};

const getResetedPricesBreakdown = (outcomes) => {
  return outcomes.map((outcome) => ({
    label: `${outcome.name}`,
    value: `${formatCash(outcome.defaultPrice).full}`,
    svg: null,
  }));
};

const LiquidityForm = ({
  market,
  selectedAction,
  setSelectedAction,
  BackToLPPageAction,
  amount,
  setAmount,
}: LiquidityFormProps) => {
  const {
    account,
    balances,
    loginAccount,
    actions: { addTransaction },
  } = useUserStore();
  const {
    actions: { setModal },
  } = useAppStatusStore();
  const { blocknumber, cashes }: DataState = useDataStore();
  const isRemove = selectedAction === REMOVE;
  const isMint = selectedAction === MINT_SETS;
  const isResetPrices = selectedAction === RESET_PRICES;
  const { amm, isGrouped, rewards } = market;
  const mustSetPrices = Boolean(!amm?.id);
  const hasInitialOdds = market?.initialOdds && market?.initialOdds?.length && mustSetPrices;
  const initialOutcomes = hasInitialOdds
    ? calcPricesFromOdds(market?.initialOdds, amm?.ammOutcomes)
    : amm?.ammOutcomes || [];

  const [outcomes, setOutcomes] = useState<AmmOutcome[]>(orderOutcomesForDisplay(initialOutcomes));

  const [chosenCash, updateCash] = useState<string>(USDC);
  const [breakdown, setBreakdown] = useState(defaultAddLiquidityBreakdown);
  const [estimatedLpAmount, setEstimatedLpAmount] = useState<string>("0");
  const tradingFeeSelection = TRADING_FEE_OPTIONS[2].id;
 // const cash: Cash = cashes ? Object.values(cashes).find((c) => c.name === USDC) : Object.values(cashes)[0];
    const cash: Cash = Object.values(cashes)[0];

  const userTokenBalance = cash?.name ? balances[cash?.name]?.balance : "0";
  const shareBalance =
    balances && balances.lpTokens && balances.lpTokens[amm?.marketId] && balances.lpTokens[amm?.marketId].balance;
  const liquidityUSD =
    (balances && balances.lpTokens && balances.lpTokens[amm?.marketId] && balances.lpTokens[amm?.marketId].usdValue) ||
    "0";
  const userMaxAmount = isRemove ? shareBalance : userTokenBalance;
  const approvedToTransfer = ApprovalState.APPROVED;
  const isApprovedToTransfer = approvedToTransfer === ApprovalState.APPROVED;
  const approvalActionType = isRemove
    ? ApprovalAction.REMOVE_LIQUIDITY
    : isMint
    ? ApprovalAction.MINT_SETS
    : isResetPrices
    ? ApprovalAction.RESET_PRICES
    : ApprovalAction.ADD_LIQUIDITY;
  const approvedMain = useApprovalStatus({
    cash,
    amm,
    refresh: blocknumber,
    actionType: approvalActionType,
  });
  const isApprovedMain = approvedMain === ApprovalState.APPROVED;
  //const isApproved = isRemove ? isApprovedMain && isApprovedToTransfer : isApprovedMain;
  const isApproved = true; 
  const totalPrice = outcomes.reduce((p, outcome) => (outcome.price === "" ? parseFloat(outcome.price) + p : p), 0);

  const onChainFee = useMemo(() => {
    const feeOption = TRADING_FEE_OPTIONS.find((t) => t.id === tradingFeeSelection);
    const feePercent = selectedAction === CREATE ? feeOption.value : amm?.feeInPercent;

    return String(new BN(feePercent).times(new BN(10)));
  }, [tradingFeeSelection, amm?.feeRaw]);

  const { buttonError, inputFormError, lessThanMinPrice, hasAmountErrors } = useErrorValidation({
    isRemove,
    outcomes,
    amount,
    actionType: selectedAction,
    isGrouped,
    userMaxAmount,
    account,
  });

  useEffect(() => {
    let isMounted = true;
    const priceErrorsWithEmptyString = isRemove
      ? []
      : outcomes.filter((outcome) => parseFloat(outcome.price) >= 1 || outcome.price === "");

    if (priceErrorsWithEmptyString.length > 0 || hasAmountErrors) {
      return isMounted && setBreakdown(defaultAddLiquidityBreakdown);
    }

    const valid = isRemove
      ? true
      : checkConvertLiquidityProperties(account, market.marketId, amount, onChainFee, outcomes, cash);
    if (!valid) {
      return isMounted && setBreakdown(defaultAddLiquidityBreakdown);
    }

    async function getResults() {
      let results: LiquidityBreakdown;
      if (isRemove) {
        results = await getRemoveLiquidity(amm, loginAccount?.library, amount, account, cash, market?.hasWinner);
      } else if (isResetPrices) {

        results = await estimateResetPrices(loginAccount?.library, account, amm);
      } else {

        results = await estimateAddLiquidityPool(account, loginAccount?.library, amm, cash, amount);
      }

      if (!results) {
        return isMounted && setBreakdown(defaultAddLiquidityBreakdown);
      }
      isMounted && setBreakdown(results);
      isMounted && setEstimatedLpAmount(results.lpTokens);
    }

    if (isApproved && !buttonError) getResults();

    return () => {
      isMounted = false;
    };
  }, [
    account,
    amount,
    tradingFeeSelection,
    cash,
    isApproved,
    buttonError,
    totalPrice,
    isRemove,
    selectedAction,
    isResetPrices,
  ]);

  const actionButtonText = !amount ? "Enter Amount" : "Review";
  const setPrices = (price, index) => {
    const newOutcomes = outcomes;
    newOutcomes[index].price = price;
    setOutcomes([...newOutcomes]);
  };

  const addTitle = isRemove
    ? "Increase Liqiudity"
    : isMint
    ? "Mint Complete Sets"
    : isResetPrices
    ? "Reset Prices"
    : "Add Liquidity";
  const now = Math.floor(new Date().getTime() / 1000);
  const pendingRewards = balances.pendingRewards?.[amm?.marketId];
  const hasPendingBonus =
    (pendingRewards &&
      now > pendingRewards.endEarlyBonusTimestamp &&
      now <= pendingRewards.endBonusTimestamp &&
      pendingRewards.pendingBonusRewards !== "0") ||
    !rewards.created;
  const earlyBonus = now < rewards.earlyDepositEndTimestamp || !rewards.earlyDepositEndTimestamp;
  const infoNumbers = isMint
    ? getMintBreakdown(outcomes, amount)
    : isResetPrices
    ? getResetBreakdown(breakdown, market)
    : getCreateBreakdown(breakdown, market, balances, isRemove);

  const notMintOrReset = !isMint && !isResetPrices;
  const resetPricesInfoNumbers = getResetedPricesBreakdown(outcomes);
  return (
    <section
      className={classNames(Styles.LiquidityForm, {
        [Styles.isRemove]: isRemove,
        [Styles.isMint]: isMint,
        [Styles.isResetPrices]: isResetPrices,
      })}
    >
      <header>
        <button
          className={classNames({ [Styles.selected]: !isRemove })}
          onClick={() => {
            setAmount(amount === userMaxAmount ? "" : amount);
            setSelectedAction(Boolean(amm?.id) ? ADD : CREATE);
          }}
        >
          {addTitle}
        </button>
        { (
          <button
            className={classNames({ [Styles.selected]: isRemove })}
            onClick={() => {
              setAmount(shareBalance);
              setSelectedAction(REMOVE);
            }}
          >
            Remove Liquidity
          </button>
        )}
   
        {!shareBalance && notMintOrReset && earlyBonus && <span>Eligible for bonus rewards</span>}
      </header>
      <main>
        <AmountInput
          heading="Deposit Amount"
          ammCash={cash}
          updateInitialAmount={(amount) => setAmount(amount)}
          initialAmount={amount}
          maxValue={userMaxAmount}
          chosenCash={isRemove ? SHARES : chosenCash}
          updateCash={updateCash}
          updateAmountError={() => null}
          error={hasAmountErrors}
        />

        <div className={Styles.PricesAndOutcomes}>
          <span className={Styles.PriceInstructions}>
           {/* <span>{mustSetPrices ? "Set the Price" : "Current Prices"}</span> */}
            <span>{"Current Tranche Token Prices"}</span>
            {/*mustSetPrices && <span>(between 0.02 - 1.0). Total price of all outcomes must add up to 1.</span> */}


            {/*<span>You will receive </span> */}
          </span>
          <OutcomesGrid
            outcomes={outcomes}
            selectedOutcome={null}
            setSelectedOutcome={() => null}
            orderType={BUY}
            nonSelectable
            editable={mustSetPrices && !hasInitialOdds}
            setEditableValue={(price, index) => setPrices(price, index)}
            ammCash={cash}
            dontFilterInvalid
            hasLiquidity={!mustSetPrices || hasInitialOdds}
            marketFactoryType={market?.marketFactoryType}
            isGrouped={market?.isGrouped}
          />
        </div>
        <section className={Styles.BreakdownAndAction}>
          {isResetPrices && (
            <>
              <div className={Styles.Breakdown}>
                <span>New Prices</span>
                <InfoNumbers infoNumbers={resetPricesInfoNumbers} />
              </div>
              <div className={Styles.Breakdown}>
                <span>USDC Needed to reset the prices</span>
                <InfoNumbers
                  infoNumbers={[
                    {
                      label: "amount",
                      value: `${formatCash(amount, USDC).full}`,
                      svg: USDCIcon,
                    },
                  ]}
                />
              </div>
            </>
          )}
          <div className={Styles.Breakdown}>
            {isRemove && hasPendingBonus && (
              <WarningBanner
                className={CommonStyles.ErrorBorder}
                title="Increasing or removing your liquidity on a market before the bonus time is complete will result in the loss of your bonus rewards."
                subtitle={
                  "In order to receive the bonus, your liquidity needs to remain unchanged until the bonus period is over."
                }
              />
            )}
            <span>{isRemove ? "Remove All Liquidity" : "You'll Receive"}</span>
            <InfoNumbers infoNumbers={infoNumbers} />
          </div>
          <div className={Styles.ActionButtons}>
            {!isApproved && (
              <ApprovalButton
                amm={amm}
                cash={cash}
                actionType={approvalActionType}
                customClass={ButtonStyles.ReviewTransactionButton}
                ds = {true}
              />
            )}
            <SecondaryThemeButton
              action={() =>
                setModal({
                  type: MODAL_CONFIRM_TRANSACTION,
                  title: isRemove
                    ? "Remove Liquidity"
                    : isMint
                    ? "Mint Complete Sets"
                    : isResetPrices
                    ? "Reset Prices"
                    : "Add Liquidity",
                  transactionButtonText: isRemove ? "Remove" : isMint ? "Mint" : isResetPrices ? "Reset Prices" : "Add",
                  transactionAction: ({ onTrigger = null, onCancel = null }) => {
                    onTrigger && onTrigger();
                    confirmLiqAction({
                      addTransaction,
                      breakdown,
                      setBreakdown,
                      account,
                      loginAccount,
                      market,
                      amount,
                      onChainFee,
                      outcomes,
                      cash,
                      amm,
                      isRemove,
                      estimatedLpAmount,
                      afterSigningAction: BackToLPPageAction,
                      onCancel,
                      isMint,
                      isResetPrices,
                    });
                  },
                  targetDescription: {
                    market,
                    label: isMint ? "Market" : "Pool",
                  },
                  footer: isRemove
                    ? {
                        text: REMOVE_FOOTER_TEXT,
                      }
                    : null,
                  breakdowns: isRemove
                    ? [
                        {
                          heading: "What you are removing:",
                          infoNumbers: [
                            {
                              label: "Pooled USDC",
                              value: `${formatCash(liquidityUSD, USDC).full}`,
                              svg: USDCIcon,
                            },
                          ],
                        },
                        {
                          heading: "What you'll recieve",
                          infoNumbers,
                        },
                      ]
                    : isMint
                    ? [
                        {
                          heading: "What you are depositing",
                          infoNumbers: [
                            {
                              label: "amount",
                              value: `${formatCash(amount, USDC).full}`,
                              svg: USDCIcon,
                            },
                          ],
                        },
                        {
                          heading: "What you'll recieve",
                          infoNumbers,
                        },
                      ]
                    : isResetPrices
                    ? [
                        {
                          heading: "New Prices",
                          infoNumbers: resetPricesInfoNumbers,
                        },
                        {
                          heading: "USDC Needed to reset the prices",
                          infoNumbers: [
                            {
                              label: "amount",
                              value: `${formatCash(amount, USDC).full}`,
                              svg: USDCIcon,
                            },
                          ],
                        },
                        {
                          heading: "What you'll recieve",
                          infoNumbers,
                        },
                      ]
                    : [
                        {
                          heading: "What you are depositing",
                          infoNumbers: [
                            {
                              label: "amount",
                              value: `${formatCash(amount, USDC).full}`,
                              svg: USDCIcon,
                            },
                          ],
                        },
                        {
                          heading: "What you'll recieve",
                          infoNumbers,
                        },
                        {
                          heading: "Pool Details",
                          infoNumbers: [
                            {
                              label: "Trading Fee",
                              value: `${amm?.feeInPercent}%`,
                            },
                          ],
                        },
                      ],
                })
              }
              disabled={!isApproved || inputFormError !== ""}
              error={buttonError}
              text={inputFormError === "" ? (buttonError ? buttonError : actionButtonText) : inputFormError}
              subText={
                buttonError === INVALID_PRICE
                  ? lessThanMinPrice
                    ? INVALID_PRICE_GREATER_THAN_SUBTEXT
                    : INVALID_PRICE_ADD_UP_SUBTEXT
                  : null
              }
              customClass={ButtonStyles.ReviewTransactionButton}
            />
          </div>
        </section>
      </main>
    </section>
  );
};
const TradeForm = ({
  market,
  selectedAction,
  setSelectedAction,
  BackToLPPageAction,
  amount,
  setAmount,
}: LiquidityFormProps) => {
  const {
    account,
    balances,
    loginAccount,
    actions: { addTransaction },
  } = useUserStore();
  const {
    actions: { setModal },
  } = useAppStatusStore();
  const { blocknumber, cashes }: DataState = useDataStore();
  const isRemove = selectedAction === REMOVE;
  const isMint = selectedAction === MINT_SETS;
  const isResetPrices = selectedAction === RESET_PRICES;
  const { amm, isGrouped, rewards } = market;
  const mustSetPrices = Boolean(!amm?.id);
  const hasInitialOdds = market?.initialOdds && market?.initialOdds?.length && mustSetPrices;
  const initialOutcomes = hasInitialOdds
    ? calcPricesFromOdds(market?.initialOdds, amm?.ammOutcomes)
    : amm?.ammOutcomes || [];

  const [outcomes, setOutcomes] = useState<AmmOutcome[]>(orderOutcomesForDisplay(initialOutcomes));

  const [chosenCash, updateCash] = useState<string>(USDC);
  const [breakdown, setBreakdown] = useState(defaultAddLiquidityBreakdown);
  const [estimatedLpAmount, setEstimatedLpAmount] = useState<string>("0");
  const [orderType, setOrderType] = useState(false); 
  const tradingFeeSelection = TRADING_FEE_OPTIONS[2].id;
 // const cash: Cash = cashes ? Object.values(cashes).find((c) => c.name === USDC) : Object.values(cashes)[0];
    const cash: Cash = Object.values(cashes)[0];

  const userTokenBalance = cash?.name ? balances[cash?.name]?.balance : "0";
  const shareBalance =
    balances && balances.lpTokens && balances.lpTokens[amm?.marketId] && balances.lpTokens[amm?.marketId].balance;
  const liquidityUSD =
    (balances && balances.lpTokens && balances.lpTokens[amm?.marketId] && balances.lpTokens[amm?.marketId].usdValue) ||
    "0";
  const userMaxAmount = isRemove ? shareBalance : userTokenBalance;
  const approvedToTransfer = ApprovalState.APPROVED;
  const isApprovedToTransfer = approvedToTransfer === ApprovalState.APPROVED;
  const approvalActionType = isRemove
    ? ApprovalAction.REMOVE_LIQUIDITY
    : isMint
    ? ApprovalAction.MINT_SETS
    : isResetPrices
    ? ApprovalAction.RESET_PRICES
    : ApprovalAction.ADD_LIQUIDITY;
  const approvedMain = useApprovalStatus({
    cash,
    amm,
    refresh: blocknumber,
    actionType: approvalActionType,
  });
  const isApprovedMain = approvedMain === ApprovalState.APPROVED;
  const isApproved = true; 
  //const isApproved = isRemove ? isApprovedMain && isApprovedToTransfer : isApprovedMain;
  const totalPrice = outcomes.reduce((p, outcome) => (outcome.price === "" ? parseFloat(outcome.price) + p : p), 0);

  const onChainFee = useMemo(() => {
    const feeOption = TRADING_FEE_OPTIONS.find((t) => t.id === tradingFeeSelection);
    const feePercent = selectedAction === CREATE ? feeOption.value : amm?.feeInPercent;

    return String(new BN(feePercent).times(new BN(10)));
  }, [tradingFeeSelection, amm?.feeRaw]);

  const { buttonError, inputFormError, lessThanMinPrice, hasAmountErrors } = useErrorValidation({
    isRemove,
    outcomes,
    amount,
    actionType: selectedAction,
    isGrouped,
    userMaxAmount,
    account,
  });

  useEffect(() => {
    let isMounted = true;
    const priceErrorsWithEmptyString = isRemove
      ? []
      : outcomes.filter((outcome) => parseFloat(outcome.price) >= 1 || outcome.price === "");

    if (priceErrorsWithEmptyString.length > 0 || hasAmountErrors) {
      return isMounted && setBreakdown(defaultAddLiquidityBreakdown);
    }

    const valid = isRemove
      ? true
      : checkConvertLiquidityProperties(account, market.marketId, amount, onChainFee, outcomes, cash);
    if (!valid) {
      return isMounted && setBreakdown(defaultAddLiquidityBreakdown);
    }

    async function getResults() {
      let results: LiquidityBreakdown;
      if (isRemove) {
        results = await getRemoveLiquidity(amm, loginAccount?.library, amount, account, cash, market?.hasWinner);
      } else if (isResetPrices) {

        results = await estimateResetPrices(loginAccount?.library, account, amm);
      } else {

        results = await estimateAddLiquidityPool(account, loginAccount?.library, amm, cash, amount);
      }

      if (!results) {
        return isMounted && setBreakdown(defaultAddLiquidityBreakdown);
      }
      isMounted && setBreakdown(results);
      isMounted && setEstimatedLpAmount(results.lpTokens);
    }

    if (isApproved && !buttonError) getResults();

    return () => {
      isMounted = false;
    };
  }, [
    account,
    amount,
    tradingFeeSelection,
    cash,
    isApproved,
    buttonError,
    totalPrice,
    isRemove,
    selectedAction,
    isResetPrices,
  ]);

  const actionButtonText = !amount ? "Enter Amount" : "Review";
  const setPrices = (price, index) => {
    const newOutcomes = outcomes;
    newOutcomes[index].price = price;
    setOutcomes([...newOutcomes]);
  };

  const addTitle = isRemove
    ? "Increase Liqiudity"
    : isMint
    ? "Mint Complete Sets"
    : isResetPrices
    ? "Reset Prices"
    : "Add Liquidity";
  const now = Math.floor(new Date().getTime() / 1000);
  const pendingRewards = balances.pendingRewards?.[amm?.marketId];
  const hasPendingBonus =
    (pendingRewards &&
      now > pendingRewards.endEarlyBonusTimestamp &&
      now <= pendingRewards.endBonusTimestamp &&
      pendingRewards.pendingBonusRewards !== "0") ||
    !rewards.created;
  const earlyBonus = now < rewards.earlyDepositEndTimestamp || !rewards.earlyDepositEndTimestamp;
  const infoNumbers = isMint
    ? getMintBreakdown(outcomes, amount)
    : isResetPrices
    ? getResetBreakdown(breakdown, market)
    : getCreateBreakdown(breakdown, market, balances, isRemove);

  const notMintOrReset = !isMint && !isResetPrices;
  const resetPricesInfoNumbers = getResetedPricesBreakdown(outcomes);
  const isBuy = orderType === BUY;

  const isNotSwap = (selectedAction == ADD || selectedAction == ADD); 
  return (
    <section
      className={classNames(Styles.LiquidityForm, {
        [Styles.isRemove]: isRemove,
        [Styles.isMint]: isMint,
        [Styles.isResetPrices]: isResetPrices,
      })}
    >
      <header>
        <button
          className={classNames({ [Styles.selected]: !isRemove })}
          onClick={() => {
            setAmount(amount === userMaxAmount ? "" : amount);
            setSelectedAction(Boolean(amm?.id) ? ADD : CREATE);
          }}
        >
          Senior 
        </button>
        { (
          <button
            className={classNames({ [Styles.selected]: !isRemove })}
            onClick={() => {
              setAmount(shareBalance);
              setSelectedAction(ADD);
            }}
          >
            Junior  
          </button>

        )}
     { <button
            className={classNames({ [Styles.selected]: !isRemove })}
            onClick={() => {
              setAmount(shareBalance);
              setSelectedAction(ADD);
            }}
          >
            Swap  
          </button> }
      </header>
      <main>
      { !isNotSwap ? (
        <BuySellToggleSwitch
          toggle={isBuy}
          setToggle={() => {
            if (isBuy) {
              setOrderType(SELL);
            } else {
              setOrderType(BUY);
            }
           // setBreakdown(null);
            setAmount("");
          }}
        />) : (
        <TrancheToggleSwitch
          toggle={isBuy}
          setToggle={() => {
            if (isBuy) {
              setOrderType(SELL);
            } else {
              setOrderType(BUY);
            }
           // setBreakdown(null);
            setAmount("");
          }}
        />) }


        <AmountInput
          heading="Deposit Amount"
          ammCash={cash}
          updateInitialAmount={(amount) => setAmount(amount)}
          initialAmount={amount}
          maxValue={userMaxAmount}
          chosenCash={isRemove ? SHARES : chosenCash}
          updateCash={updateCash}
          updateAmountError={() => null}
          error={hasAmountErrors}
        />

      


        <section className={Styles.BreakdownAndAction}>
          {isResetPrices && (
            <>
              <div className={Styles.Breakdown}>
                <span>New Prices</span>
                <InfoNumbers infoNumbers={resetPricesInfoNumbers} />
              </div>
              <div className={Styles.Breakdown}>
                <span>USDC Needed to reset the prices</span>
                <InfoNumbers
                  infoNumbers={[
                    {
                      label: "amount",
                      value: `${formatCash(amount, USDC).full}`,
                      svg: USDCIcon,
                    },
                  ]}
                />
              </div>
            </>
          )}
          <div className={Styles.Breakdown}>
            {isRemove && hasPendingBonus && (
              <WarningBanner
                className={CommonStyles.ErrorBorder}
                title="Increasing or removing your liquidity on a market before the bonus time is complete will result in the loss of your bonus rewards."
                subtitle={
                  "In order to receive the bonus, your liquidity needs to remain unchanged until the bonus period is over."
                }
              />
            )}
            <span>{isRemove ? "Remove All Liquidity" : "You'll Receive"}</span>
            <InfoNumbers infoNumbers={infoNumbers} />
          </div>
          <div className={Styles.ActionButtons}>
            {!isApproved && (
              <ApprovalButton
                amm={amm}
                cash={cash}
                actionType={approvalActionType}
                customClass={ButtonStyles.ReviewTransactionButton}
                ds = {true}
              />
            )}
            <SecondaryThemeButton
              action={() =>
                setModal({
                  type: MODAL_CONFIRM_TRANSACTION,
                  title: isRemove
                    ? "Remove Liquidity"
                    : isMint
                    ? "Mint Complete Sets"
                    : isResetPrices
                    ? "Reset Prices"
                    : "Add Liquidity",
                  transactionButtonText: isRemove ? "Remove" : isMint ? "Mint" : isResetPrices ? "Reset Prices" : "Add",
                  transactionAction: ({ onTrigger = null, onCancel = null }) => {
                    onTrigger && onTrigger();
                    confirmAction({
                      addTransaction,
                      breakdown,
                      setBreakdown,
                      account,
                      loginAccount,
                      market,
                      amount,
                      onChainFee,
                      outcomes,
                      cash,
                      amm,
                      isRemove,
                      estimatedLpAmount,
                      afterSigningAction: BackToLPPageAction,
                      onCancel,
                      isMint,
                      isResetPrices,
                    });
                  },
                  targetDescription: {
                    market,
                    label: isMint ? "Market" : "Pool",
                  },
                  footer: isRemove
                    ? {
                        text: REMOVE_FOOTER_TEXT,
                      }
                    : null,
                  breakdowns: isRemove
                    ? [
                        {
                          heading: "What you are removing:",
                          infoNumbers: [
                            {
                              label: "Pooled USDC",
                              value: `${formatCash(liquidityUSD, USDC).full}`,
                              svg: USDCIcon,
                            },
                          ],
                        },
                        {
                          heading: "What you'll recieve",
                          infoNumbers,
                        },
                      ]
                    : isMint
                    ? [
                        {
                          heading: "What you are depositing",
                          infoNumbers: [
                            {
                              label: "amount",
                              value: `${formatCash(amount, USDC).full}`,
                              svg: USDCIcon,
                            },
                          ],
                        },
                        {
                          heading: "What you'll recieve",
                          infoNumbers,
                        },
                      ]
                    : isResetPrices
                    ? [
                        {
                          heading: "New Prices",
                          infoNumbers: resetPricesInfoNumbers,
                        },
                        {
                          heading: "USDC Needed to reset the prices",
                          infoNumbers: [
                            {
                              label: "amount",
                              value: `${formatCash(amount, USDC).full}`,
                              svg: USDCIcon,
                            },
                          ],
                        },
                        {
                          heading: "What you'll recieve",
                          infoNumbers,
                        },
                      ]
                    : [
                        {
                          heading: "What you are depositing",
                          infoNumbers: [
                            {
                              label: "amount",
                              value: `${formatCash(amount, USDC).full}`,
                              svg: USDCIcon,
                            },
                          ],
                        },
                        {
                          heading: "What you'll recieve",
                          infoNumbers,
                        },
                        {
                          heading: "Pool Details",
                          infoNumbers: [
                            {
                              label: "Trading Fee",
                              value: `${amm?.feeInPercent}%`,
                            },
                          ],
                        },
                      ],
                })
              }
              disabled={!isApproved || inputFormError !== ""}
              error={buttonError}
              text={inputFormError === "" ? (buttonError ? buttonError : actionButtonText) : inputFormError}
              subText={
                buttonError === INVALID_PRICE
                  ? lessThanMinPrice
                    ? INVALID_PRICE_GREATER_THAN_SUBTEXT
                    : INVALID_PRICE_ADD_UP_SUBTEXT
                  : null
              }
              customClass={ButtonStyles.ReviewTransactionButton}
            />
          </div>
        </section>
      </main>
    </section>
  );
};

export default MarketLiquidityView;

const confirmLiqAction = async ({
  addTransaction,
  breakdown,
  setBreakdown,
  account,
  loginAccount,
  market,
  amount,
  onChainFee,
  outcomes,
  cash,
  amm,
  isRemove,
  estimatedLpAmount,
  afterSigningAction = () => {},
  onCancel = null,
  isMint,
  isResetPrices,
}) => {

    await  addTrancheLiquidity(account, loginAccount.library,
    amount, String(market.turboId))
      .then( (response) => {
       // const { hash } = response;
        // addTransaction({
        //   hash,
        //   chainId: loginAccount.chainId,
        //   from: account,
        //   seen: false,
        //   status: TX_STATUS.PENDING,
        //   addedTime: new Date().getTime(),
        //   message: `Add Liquidity`,
        //   marketDescription: `${market?.title} ${market?.description}`,
        // });
        afterSigningAction();
      })


   
  }
//};

const confirmAction = async ({
  addTransaction,
  breakdown,
  setBreakdown,
  account,
  loginAccount,
  market,
  amount,
  onChainFee,
  outcomes,
  cash,
  amm,
  isRemove,
  estimatedLpAmount,
  afterSigningAction = () => {},
  onCancel = null,
  isMint,
  isResetPrices,
}) => {
  const valid = checkConvertLiquidityProperties(account, market.marketId, amount, onChainFee, outcomes, cash);
  if (!valid) {
    setBreakdown(defaultAddLiquidityBreakdown);
  }
  if (isRemove) {
    doRemoveLiquidity(amm, loginAccount?.library, amount, breakdown.minAmountsRaw, account, cash, market?.hasWinner)
      .then((response) => {
        const { hash } = response;
        addTransaction({
          hash,
          chainId: loginAccount.chainId,
          seen: false,
          status: TX_STATUS.PENDING,
          from: account,
          addedTime: new Date().getTime(),
          message: `Remove Liquidity`,
          marketDescription: `${market?.title} ${market?.description}`,
        });
        afterSigningAction();
      })
      .catch((error) => {
        onCancel && onCancel();
        console.log("Error when trying to remove AMM liquidity: ", error?.message);
        addTransaction({
          hash: "remove-liquidity-failed",
          chainId: loginAccount.chainId,
          seen: false,
          status: TX_STATUS.FAILURE,
          from: account,
          addedTime: new Date().getTime(),
          message: `Remove Liquidity`,
          marketDescription: `${market?.title} ${market?.description}`,
        });
      });
  } else if (isMint) {
    await mintCompleteSets(amm, loginAccount?.library, amount, account)
      .then((response) => {
        const { hash } = response;
        addTransaction({
          hash,
          chainId: loginAccount.chainId,
          from: account,
          seen: false,
          status: TX_STATUS.PENDING,
          addedTime: new Date().getTime(),
          message: `Mint Complete Sets`,
          marketDescription: `${market?.title} ${market?.description}`,
        });
        afterSigningAction();
      })
      .catch((error) => {
        onCancel && onCancel();
        console.log("Error when trying to Mint Complete Sets: ", error?.message);
        addTransaction({
          hash: `mint-sets-failed${Date.now()}`,
          chainId: loginAccount.chainId,
          from: account,
          seen: false,
          status: TX_STATUS.FAILURE,
          addedTime: new Date().getTime(),
          message: `Mint Complete Sets`,
          marketDescription: `${market?.title} ${market?.description}`,
        });
      });
  } else if (isResetPrices) {
    await doResetPrices(loginAccount.library, account, amm)
      .then((response) => {
        const { hash } = response;
        addTransaction({
          hash,
          chainId: loginAccount.chainId,
          from: account,
          seen: false,
          status: TX_STATUS.PENDING,
          addedTime: new Date().getTime(),
          message: `Reset Prices`,
          marketDescription: `${market?.title} ${market?.description}`,
        });
        afterSigningAction();
      })
      .catch((error) => {
        onCancel && onCancel();
        console.log("Error when trying to Reset Prices: ", error?.message);
        addTransaction({
          hash: `reset-prices-failed-${Date.now()}`,
          chainId: loginAccount.chainId,
          from: account,
          seen: false,
          status: TX_STATUS.FAILURE,
          addedTime: new Date().getTime(),
          message: `Reset Prices`,
          marketDescription: `${market?.title} ${market?.description}`,
        });
      });
  } else {
    await addLiquidityPool(
      account,
      loginAccount?.library,
      amm,
      cash,
      amount,
      estimatedLpAmount,
      unOrderOutcomesForDisplay(outcomes)
    )
      .then((response) => {
        const { hash } = response;
        addTransaction({
          hash,
          chainId: loginAccount.chainId,
          from: account,
          seen: false,
          status: TX_STATUS.PENDING,
          addedTime: new Date().getTime(),
          message: `Add Liquidity`,
          marketDescription: `${market?.title} ${market?.description}`,
        });
        afterSigningAction();
      })
      .catch((error) => {
        onCancel && onCancel();
        console.log("Error when trying to add AMM liquidity: ", error?.message);
        addTransaction({
          hash: `add-liquidity-failed${Date.now()}`,
          chainId: loginAccount.chainId,
          from: account,
          seen: false,
          status: TX_STATUS.FAILURE,
          addedTime: new Date().getTime(),
          message: `Add Liquidity`,
          marketDescription: `${market?.title} ${market?.description}`,
        });
      });
  }
};

const MIN_LIQUIDITY_ADD_AMOUNT = "200.00";

const useErrorValidation = ({ isRemove, outcomes, amount, actionType, isGrouped, userMaxAmount, account }) => {
  let buttonError = "";
  let inputFormError = "";
  let lessThanMinPrice = false;
  const priceErrors = isRemove
    ? []
    : outcomes.filter((outcome) => {
        return parseFloat(outcome.price) >= 1 || isInvalidNumber(outcome.price);
      });
  const hasPriceErrors = priceErrors.length > 0;
  const hasAmountErrors = isInvalidNumber(amount);
  if (hasAmountErrors) {
    buttonError = ERROR_AMOUNT;
  } else if (hasPriceErrors) {
    buttonError = "Price is not valid";
  }
  if (!account) inputFormError = CONNECT_ACCOUNT;
  else if (!amount || amount === "0" || amount === "") inputFormError = ENTER_AMOUNT;
  else if (new BN(amount).gt(new BN(userMaxAmount))) inputFormError = INSUFFICIENT_BALANCE;
  else if ([CREATE, ADD].includes(actionType)) {
    let totalPrice = ZERO;
    outcomes.forEach((outcome) => {
      const price = createBigNumber(outcome.price || 0);
      if (price.eq(ZERO)) {
        inputFormError = SET_PRICES;
      } else if (Number(price.toFixed(2)) < Number(MIN_PRICE) && actionType === CREATE) {
        buttonError = INVALID_PRICE;
        lessThanMinPrice = true;
      } else {
        totalPrice = totalPrice.plus(createBigNumber(price));
      }
    });
    const total = createBigNumber(totalPrice.toFixed(2));
    if (inputFormError === "" && !total.eq(ONE) && !isGrouped && actionType === CREATE) {
      buttonError = INVALID_PRICE;
    }
    if (amount) {
      if (new BN(amount).lt(new BN(MIN_LIQUIDITY_ADD_AMOUNT)))
        buttonError = `$${MIN_LIQUIDITY_ADD_AMOUNT} Minimum deposit`;
    }
  }

  return {
    buttonError,
    inputFormError,
    lessThanMinPrice,
    hasAmountErrors,
  };
};
