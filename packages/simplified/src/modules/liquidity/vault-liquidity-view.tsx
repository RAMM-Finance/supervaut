import React, { useState, useEffect, useMemo } from "react";
import classNames from "classnames";
import Styles from "./market-liquidity-view.styles.less";
import CommonStyles from "../modal/modal.styles.less";
import ButtonStyles from "../common/buttons.styles.less";
import { useHistory, useLocation } from "react-router";
import { InfoNumbers, ApprovalButton } from "../market/trading-form";
import { BigNumber as BN } from "bignumber.js";
import {BigNumber, utils} from "ethers"

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
  NewStores, 
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
// import {MakerForm} from "maker-view"; 
import { SmallDropdown } from "@augurproject/comps/build/components/common/selection";
import { AddMetaMaskToken } from "../common/labels";

const {useVaultDataStore} = NewStores; 

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
  mintTVault, 
  redeemTVault, 
  addTrancheLiquidity, 
  doMakerTrade, 
  faucetUnderlying, 
  approveUnderlying, 
  splitTranches, addOrRemoveTrancheLiq, claimMaker, mergeTranches, getUserInfos, fetchOracleData,
  oammAddOrRemoveTrancheLiq
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

interface Positionprop {
  priceLower: string; 
  priceUpper: string; 
  liquidity: string;
  value?:string; 
  isOracleAMM: boolean; 
}
const LiqPositionRow = (
  position
: Positionprop) =>{
 return(
    <ul className={Styles.StatsRow}>
      {!position.isOracleAMM &&
      <li>
        <span>Price of J/S Lower</span>
        <span>{position.priceLower}{" p j/s"}</span> 
       {/* <span>{marketHasNoLiquidity ? "-" : formatDai(storedCollateral/1000000 || "0.00").full}</span> */}
      </li>}
      {!position.isOracleAMM && <li>
        <span>Price of J/S Upper</span>
        <span>{position.priceUpper}{" p j/s"}</span> 

        {/*<span>{marketHasNoLiquidity ? "-" : formatLiquidity(amm?.liquidityUSD/10 || "0.00").full}</span> */}
      </li>}
      <li>
        <span>Liquidity Shares</span>
        <span>{position.liquidity}</span>
      </li>
      <li>
        <span>My Shares Value(in asset)</span>
        <span>{position.value}</span>
      </li>
    </ul>
  )
}


interface LimitPositionprop {
  price: number; 
  amount: number; 
  claimable: string;
  isAsk: string; 
}

const LimitPositionRow = (
  position
: LimitPositionprop) =>{
 return(
    <ul className={Styles.StatsRow}>

         <li>
            <span>{position.isAsk=="false"? "Buy Junior(Sell Senior) Order":"Sell Junior(Buy Senior) Order" }</span>
            <span>{"Claimable: "}{position.claimable }</span>
            <span>{"Price of Junior/Senior: "}{position.price}</span>
            <span>{"Amount: "}{position.amount}</span>

            {/*<span>{marketHasNoLiquidity ? "-" : formatLiquidity(amm?.liquidityUSD/10 || "0.00").full}</span> */}
          </li>
     
    </ul>
  )
}


export const VaultLiquidityView = () => {
  const {
    settings: { timeFormat },
  } = useSimplifiedStore();
  const {
    actions: { closeModal },
  } = useAppStatusStore();
  const {  account,
    loginAccount,balances } = useUserStore();
  const location = useLocation();
  const history = useHistory();

  const { [MARKET_ID_PARAM_NAME]: marketId, [MARKET_LIQUIDITY]: actionType = ADD } = parseQuery(location.search);
  const { markets,amm } = useDataStore();
  const market = markets?.["0x1acf78fc24925f119c003f84c2ca0bd6acc45469-1"];

  const [selectedAction, setSelectedAction] = useState(actionType);
  const [selectedActionMint, setSelectedActionMint] = useState(actionType); 
  const [selectedActionMaker, setSelectedActionMaker] = useState(actionType); 

  // const [numTx, setNumTx] = useState(0); 
  const [isAmm, setIsAmm] = useState(true); 

  useScrollToTopOnMount();
  const isRemove = selectedAction === REMOVE;
  const isMint = selectedAction === "mint"; 
  const isRedeem = selectedAction === "redeem"; 

  const isResetPrices = selectedAction === RESET_PRICES;
  const maxWhackedCollateral = market && maxWhackedCollateralAmount(market?.amm);
  const [showMoreDetails, setShowMoreDetails] = useState(false);

  const [userInfos, setUserInfos ] = useState(); 
  const [exchangeRate, setExchangeRate] = useState(); 



  const shareBalance =
    balances &&
    balances.lpTokens &&
    balances.lpTokens[market?.amm?.marketId] &&
    balances.lpTokens[market?.amm?.marketId].balance;
  const [amount, setAmount] = useState(
    isRemove ? shareBalance : isResetPrices ? maxWhackedCollateral?.collateralUsd : ""
  );
  const [mintAmount, setmintAmount] = useState(""); 
  const [makerAmount, setmakerAmount] = useState(""); 

  const {numVaults, vaultinfos} = useVaultDataStore(); 
  const vaultinfo = vaultinfos?.[marketId]
  const {_want, _instruments, _ratios, _junior_weight, _promisedReturn, _time_to_maturity, inceptionPrice, 
  pjs, psu, pju, pvu, curMarkPrice,tVaultAd, seniorAd, juniorAd, blocknumber, _creator, _names, 
  _descriptions, isOracleAMM, oammAddress, ammValue, ammJuniorBal, ammSeniorBal} = vaultinfo || {};
   
  useEffect(async ()=>{
  let infos; 
  try{
    infos = await getUserInfos( 
    loginAccount.library, account, marketId); 
    setUserInfos(infos); 
  } catch(err){
    console.log(err); 
  }

  }, [blocknumber])

  if (!vaultinfo || !userInfos) {
    return <div className={classNames(Styles.MarketLiquidityView)}>Vault Not Found.</div>;
  }
  const{cJuniorBal, cSeniorBal, juniorBal, juniorDebt, 
    limitPositions, liqPositions, seniorBal, seniorDebt, tVaultBal, 
    UserLiquidityValue, UserLiquidityAmount, UserTrancheValue} = userInfos || {}; 




  const { categories } = market;
  const BackToLPPageAction = () => {
    history.push({
      pathname: makePath(LIQUIDITY),
    });
    closeModal();
  };
  function roundDown(number, decimals) {
      decimals = decimals || 0;
      return ( Math.floor( number * Math.pow(10, decimals) ) / Math.pow(10, decimals) );
  }

  const notMint = false; 
  const ismint = true; 

  const oracleAMM = isOracleAMM; 
  
  const positions = liqPositions.length==0?[{"priceLower":"0", "priceUpper":"0", 
  "liquidity": roundDown(UserLiquidityAmount.toString()/1e18,2), "value": roundDown(UserLiquidityValue.toString()/1e18,2)}, ]
    : liqPositions

  const limitPosition =limitPositions.length==0? [{"price": "0", "amount": "0", "claimable": "false", "isAsk": "false"}, ]
    : limitPositions; 


  return (
    <div className={classNames(Styles.MarketLiquidityView)}>

      {/*<BackBar {...{ market, selectedAction, setSelectedAction, BackToLPPageAction, setAmount, maxWhackedCollateral }} /> */}
 
      <MarketLink id={marketId} dontGoToMarket={true}>
        {/*<CategoryIcon {...{ categories }} /> */}
        <div
          className={classNames(Styles.Details, {
            [Styles.isClosed]: !showMoreDetails,
          })}
        >
          <h4>Market Details</h4>
            <p>{"DETAILS"}</p>
            <span>{"Underlying: "+ _names[0]}</span>
            <span>{"Asset: "+ _names[1]}</span>

            <span>{_descriptions}</span>
 
          
          {(
            <button onClick={() => setShowMoreDetails(!showMoreDetails)}>
              {showMoreDetails ? "Read Less" : "Read More"}
            </button> 
          )}
          <p>{_want}</p>


      <ul className={Styles.StatsRow}>

<li>
            <span>Mark Price of J/S</span>
            <span> {roundDown(curMarkPrice.toString()/1e18, 2)}</span>
           {/* <span>{marketHasNoLiquidity ? "-" : formatDai(storedCollateral/1000000 || "0.00").full}</span> */}
          </li>
          <li>
            <span>Value Price of J/S </span>
            <span>{pjs/1e18}</span>

          </li>
          <li>
            <span>Value Price of S/U </span>
            <span>{psu/1e18}</span>
          </li>

          <li>
            <span>Value Price of J/U </span>
            <span>{pju/1e18}</span>
          </li>

        </ul>
      <ul className={Styles.StatsRow}>
<li>
            <span>Price of Asset/Underlying</span>
            <span>{roundDown(pvu.toString()/1e18, 4)}</span>
          </li>
          <li>
            <span>Junior Leverage </span>
            <span>{roundDown(1/(_junior_weight/1e18), 2)}</span>

          </li>
          <li>
            <span>Junior/Senior Weight</span>
            <span>{_junior_weight.toString()/1e18}{"/"}{1-_junior_weight.toString()/1e18}</span>
          </li>

          <li>
            <span>Senior Promised Return</span>
           {/* <span>{(_promisedReturn-1e18)/1e16}{"% APR"}</span> */}
            <span>{6.97}{"% APR"}</span>

          </li>

        </ul>

      <ul className={Styles.StatsRow}>
<li>
            <span>Inception Price(in asset)</span>
            <span>{inceptionPrice.toString()/1e18}</span>
           {/* <span>{marketHasNoLiquidity ? "-" : formatDai(storedCollateral/1000000 || "0.00").full}</span> */}
          </li>
          <li>
            <span>Inception Timestamp </span>
            <span>{_time_to_maturity.toString()}</span>

            {/*<span>{marketHasNoLiquidity ? "-" : formatLiquidity(amm?.liquidityUSD/10 || "0.00").full}</span> */}
          </li>
          <li>
            <span>Liquidity Provision APR</span>
            <span>{"-"}</span>
          </li>

          <li>
            <span>Amm junior/senior reserves</span>
            <span>{roundDown((ammJuniorBal.toString()/1e18), 2)}{"/"}{roundDown((ammSeniorBal.toString()/1e18), 2)}</span>
            {/*<span>{marketHasNoLiquidity ? "-" : formatLiquidity(amm?.liquidityUSD || "0.00").full}</span>*/}
          </li>
        {/*inception price,inception time, current value prices, current mark prices*/}

        </ul> 
     

        </div>   
                   <AddMetaMaskToken address ={_want} name={"tVault"}/>
            <AddMetaMaskToken address ={_want} name={"Senior"}/>
            <AddMetaMaskToken address ={_want} name={"Junior"}/>
        {oracleAMM   && <AddMetaMaskToken address ={_want} name={"AMM LP shares"}/>}

       {/* <SwapMenu/> */}
        {/*<MarketTitleArea {...{ ...market, timeFormat }} />*/}

      </MarketLink>
      <h4> Mint Split Redeem Merge</h4>

        <LiquidityForm {...{vaultinfo, market, selectedAction, setSelectedAction, 
          BackToLPPageAction, amount, setAmount, mintAmount, setmintAmount, ismint,
          selectedActionMint, setSelectedActionMint,oracleAMM}} />

        <h5>My Vault {"&"} Tranche Positions</h5>

      <ul className={Styles.StatsRow}>
          <li>

            <span>My tVault Qty</span>
            <span> {roundDown(tVaultBal.toString()/1e18,2)}</span>
            {/*<span>{marketHasNoLiquidity ? "-" : formatLiquidity(amm?.liquidityUSD || "0.00").full}</span>*/}
          </li>
          <li><span>My Senior/Junior Qty</span>
            <span>{roundDown(seniorBal.toString()/1e18, 2)}{"/"}{roundDown(juniorBal.toString()/1e18,2)}</span> 
            </li>
          <li><span>My Senior/Junior Value</span>
            <span>{roundDown(seniorBal.mul(psu).toString()/1e18/1e18, 2)}{"/"}
            {roundDown(juniorBal.mul(pju).toString()/1e18/1e18,2)}</span> 

            </li>
            <li> <span>My Senior/Junior Debt</span>
            <span>{seniorDebt.toString()/1e18}{"/"}{juniorDebt.toString()/1e18}</span> 
          </li>


        </ul>

          <h4>Add/Remove Liquidity</h4>
          <div className={Styles.BackBar}>
       <TinyThemeButton
          action={() => {
            setIsAmm(isAmm ? false : true);
            setAmount("");
            
          }}
          text={isAmm ? "Supply to Lendingpool" : "Supply to Amm"}
          small
        />

        </div>
      <LiquidityForm {...{ vaultinfo, market, selectedAction, setSelectedAction, 
        BackToLPPageAction, amount, setAmount,notMint, oracleAMM }} />
      {selectedAction !== MINT_SETS && selectedAction !== RESET_PRICES && <LiquidityWarningFooter />}
      <h5>My Liquidity Positions</h5>
        {positions.map((position)=> (
          <LiqPositionRow priceLower={position.priceLower} priceUpper={position.priceUpper} 
          liquidity={position.liquidity} value = {position.value} isOracleAMM = {oracleAMM}/>
          )) }
          
      {!oracleAMM && <h4>Create Bids/Asks</h4>}
      {!oracleAMM && <MakerForm vaultinfo = {vaultinfo} market={market} selectedAction={selectedActionMaker}
      setSelectedAction={setSelectedActionMaker} BackToLPPageAction={BackToLPPageAction}
      amount = {makerAmount} setAmount={setmakerAmount}
      /> }
      {!oracleAMM && <h5>Limit Order Positions</h5>}
      {!oracleAMM && limitPosition.map((position)=>(
      <LimitPositionRow price={position.price.toString()/1e18} amount={position.amount.toString()/1e18} 
      claimable= {position.claimable?"true": "false"} isAsk = {position.isAsk? "true": "false"}/>
        ))}










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
      {WarningIcon} Adding Liquidity will automatically split your asset, and you may receive split tranches when you redeem liquidity shares
    </span>
  </article>
);

interface LiquidityFormProps {
  vaultinfo: any; 
  market: MarketInfo;
  selectedAction: string;
  setSelectedAction: Function;
  BackToLPPageAction: () => void;
  amount: string;
  setAmount: (string) => void;
  ismint?: boolean; 
  mintAmount?: string;
  setmintAmount?: (string) => void;
  selectedActionMint?: string; 
   setSelectedActionMint?: Function; 
   oracleAMM?: boolean; 
}

const orderMinAmountsForDisplay = (
  items: { amount: string; outcomeId: number; hide: boolean }[] = []
): { amount: string; outcomeId: number; hide: boolean }[] =>
  items.length > 0 && items[0].outcomeId === 0 ? items.slice(1).concat(items.slice(0, 1)) : items;

const getCreateBreakdown = (breakdown, market, balances, isRemove = false, isMint = false) => {
  const fullBreakdown = [
    ...orderMinAmountsForDisplay(breakdown.minAmounts)
      .filter((m) => !m.hide)
      .map((m) => ({
        label: `${market.outcomes[m.outcomeId]?.name} Shares`,
        value: `${formatSimpleShares(m.amount).formatted}`,
        svg: null,
      })),
    {
      label: isRemove ? "Estimated Underlying Qty" : isMint? "Estimated tVault Qty": "LP tokens",
      value: `${
        breakdown?.amount
          ? isRemove
            ? formatCash(breakdown.amount, USDC).full
            : formatSimpleShares(breakdown.amount).formatted
          : "-"
      }`,
     // svg: isRemove ? USDCIcon : null,
      svg: null
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
//maker buy, maker sell, maker reduce buy, maker reduce sell, maker claim buy, maker claim sell
const LiquidityForm = ({
  vaultinfo,
  market, 
  selectedAction,
  setSelectedAction,
  BackToLPPageAction,
  amount,
  setAmount,
  ismint,
  mintAmount, 
  setmintAmount, 
  selectedActionMint, 
  setSelectedActionMint, 
  oracleAMM
}: LiquidityFormProps) => {
  if(ismint){
    amount = mintAmount; 
    setAmount = setmintAmount; 
    selectedAction = selectedActionMint
    setSelectedAction = setSelectedActionMint 
  }
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
  const isMint = selectedAction === "mint";
  const isRedeem = selectedAction === "redeem"; 
  const isResetPrices = selectedAction === RESET_PRICES;

  const { amm, isGrouped, rewards } = market;
  const mustSetPrices = Boolean(!amm?.id);
  const hasInitialOdds = market?.initialOdds && market?.initialOdds?.length && mustSetPrices;
  const initialOutcomes = []

  const [outcomes, setOutcomes] = useState<AmmOutcome[]>(orderOutcomesForDisplay(initialOutcomes));

  const [chosenCash, updateCash] = useState<string>(USDC);
  const [breakdown, setBreakdown] = useState(defaultAddLiquidityBreakdown);
  const [estimatedLpAmount, setEstimatedLpAmount] = useState<string>("0");
  const [priceLower, setPriceLower] = useState(""); 
  const [priceUpper, setPriceUpper] = useState(""); 

  const tradingFeeSelection = TRADING_FEE_OPTIONS[2].id;
 // const cash: Cash = cashes ? Object.values(cashes).find((c) => c.name === USDC) : Object.values(cashes)[0];
    const cash: Cash = Object.values(cashes)[0];

  const userTokenBalance = cash?.name ? balances[cash?.name]?.balance : "0";
  const shareBalance = "0"
   // balances && balances.lpTokens && balances.lpTokens[amm?.marketId] && balances.lpTokens[amm?.marketId].balance;
  const liquidityUSD = "0"
   // (balances && balances.lpTokens && balances.lpTokens[amm?.marketId] && balances.lpTokens[amm?.marketId].usdValue) ||
   // "0";
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
  // const approvedMain = useApprovalStatus({
  //   cash,
  //   amm,
  //   refresh: blocknumber,
  //   actionType: approvalActionType,
  // });
  const isApprovedMain = true//approvedMain === ApprovalState.APPROVED;
  //const isApproved = isRemove ? isApprovedMain && isApprovedToTransfer : isApprovedMain;
  const isApproved = true; 
  const totalPrice = outcomes.reduce((p, outcome) => (outcome.price === "" ? parseFloat(outcome.price) + p : p), 0);

  const onChainFee = useMemo(() => {
    const feeOption = TRADING_FEE_OPTIONS.find((t) => t.id === tradingFeeSelection);
    const feePercent = 0//selectedAction === CREATE ? feeOption.value : amm?.feeInPercent;

    return String(new BN(feePercent).times(new BN(10)));
  }, [tradingFeeSelection]);

  const { buttonError, inputFormError, lessThanMinPrice, hasAmountErrors } = useErrorValidation({
    isRemove,
    outcomes,
    amount,
    actionType: selectedAction,
    isGrouped,
    userMaxAmount,
    account,
  });
  const {vaultId} = vaultinfo; 
 

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
  var infoNumbers = isMint
    ? getMintBreakdown(outcomes, amount)
    : isResetPrices
    ? getResetBreakdown(breakdown, market)
    : getCreateBreakdown(breakdown, market, balances, isRemove);
  infoNumbers = !ismint ? infoNumbers: getCreateBreakdown(breakdown, market, balances, isRemove, true); 

  const notMintOrReset = !isMint && !isResetPrices;
  const resetPricesInfoNumbers = getResetedPricesBreakdown(outcomes);
  return (
    <section
      className={classNames(Styles.LiquidityForm, {
        [Styles.isRemove]: false,
        [Styles.isMint]: isMint,
        [Styles.isResetPrices]: isResetPrices,
      })}
    >
      <header>
        <button
          className={classNames({ [Styles.selected]: !isRemove && !isMint && !isRedeem })}
          onClick={() => {
            setAmount(amount === userMaxAmount ? "" : amount);
            setSelectedAction(Boolean(amm?.id) ? ADD : CREATE);
          }}
        >
          {!ismint?"Add Liquidity": "Mint tVault"}
        </button>
        { (
          <button
            className={classNames({ [Styles.selected]: isRemove&& !isMint && !isRedeem })}
            onClick={() => {
              setAmount(shareBalance);
              setSelectedAction(REMOVE);
            }}
          >         

           {!ismint?"Remove Liquidity": "Redeem tVault"}

          </button>
        )}
        {ismint&& (
          <button
            className={classNames({ [Styles.selected]: !isRemove&& isMint && !isRedeem  })}
            onClick={() => {
              setAmount(shareBalance);
              setSelectedAction("mint");
            }}
          >
            Split/Merge
          </button>
        )}

        {!shareBalance && notMintOrReset && earlyBonus && <span>Eligible for bonus rewards</span>}
      </header>
      <main>
        {/*<SecondaryThemeButton text={"Limit Order?"} /> */}
        {/*<SecondaryThemeButton text={"faucet"} action={()=>doFaucet(account, loginAccount, vaultId)}/>*/}
        {/*<SecondaryThemeButton text={"Split tVault"} action={()=>doSplit(account, loginAccount, vaultId, 0)}/>*/}
        {/*<SecondaryThemeButton text={"faucet"} action={()=>doFaucet(account, loginAccount, vaultId)}/>*/}

        {(!oracleAMM && !isMint && !ismint)&& <AmountInput
          heading="Price Lower"
          ammCash={cash}
          updateInitialAmount={(priceLower) => setPriceLower(priceLower)}
          initialAmount={priceLower}
          maxValue={userMaxAmount}
          chosenCash={chosenCash}
          updateCash={updateCash}
          updateAmountError={() => null}
          error={hasAmountErrors}
        />  }      
        {(!oracleAMM && !isMint && !ismint)&& <AmountInput
          heading="Price Upper"
          ammCash={cash}
          updateInitialAmount={(priceUpper) => setPriceUpper(priceUpper)}
          initialAmount={priceUpper}
          maxValue={userMaxAmount}
          chosenCash={chosenCash}
          updateCash={updateCash}
          updateAmountError={() => null}
          error={hasAmountErrors}
        /> }
        <AmountInput
          heading="Amount"
          ammCash={cash}
          updateInitialAmount={(amount) => setAmount(amount)}
          initialAmount={amount}
          maxValue={userMaxAmount}
          chosenCash={chosenCash}
          updateCash={updateCash}
          updateAmountError={() => null}
          error={hasAmountErrors}
        />
        <div className={Styles.PricesAndOutcomes}>
          <span className={Styles.PriceInstructions}>
           {/* <span>{mustSetPrices ? "Set the Price" : "Current Prices"}</span> */}
            {(oracleAMM && !isMint && !ismint)&&  <span>{"Current Liquidity Provision Info"}</span>}
            {(oracleAMM && !isMint && !ismint)&&  <span>{"LP Share Exchange Rate(from asset): "}{}</span>}
            {(oracleAMM && !isMint && !ismint)&& <span>{"Liquidity Reserve Ratio "}</span>}
            {/*(oracleAMM && !isMint && !ismint)&& <span>{"Current Liquidity Share Exchange Rate"}</span>*/}

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
                <InfoNumbers infoNumbers={resetPricesInfoNumbers}  />
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
            {/*isRemove && hasPendingBonus && (
              <WarningBanner
                className={CommonStyles.ErrorBorder}
                title="Increasing or removing your liquidity on a market before the bonus time is complete will result in the loss of your bonus rewards."
                subtitle={
                  "In order to receive the bonus, your liquidity needs to remain unchanged until the bonus period is over."
                }
              />
            )*/}
            {/*<span>{isRemove ? "Remove All Liquidity" : "You'll Receive"}</span> */}
            {!ismint && <InfoNumbers infoNumbers={infoNumbers} />}
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

            {ismint && !isRemove && !isMint && <SecondaryThemeButton text={"mint"} 
            action={() => doMint(amount, vaultId, account, loginAccount)}/>}
            {ismint && isRemove && <SecondaryThemeButton text={"redeem"} 
            action={() => doRedeem(amount, vaultId, account, loginAccount)}/>}
            {ismint && isMint&& <SecondaryThemeButton text={"Split"} 
            action={() => doSplit(account, loginAccount, vaultId, amount)}/>}
            {/*ismint && isMint&& <SecondaryThemeButton text={"approve"} 
            action={() => doApprove(amount, vaultId, account, loginAccount)}/> */}
          

          {ismint && isMint&& <SecondaryThemeButton text={"Merge"} 
            action={() => doMerge(account, loginAccount, vaultId, amount)}/>}
            {!isMint&& !ismint &&<SecondaryThemeButton
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
                  transactionButtonText: isRemove ? "Remove" : "Add",
                  transactionAction: ({ onTrigger = null, onCancel = null }) => {
                    if (oracleAMM){
                        console.log("confirm?")
                        onTrigger && onTrigger();

                        confirmOAMMLiqAction({
                        account, loginAccount, vaultId, 
                                            amount, isRemove }
                        )
                    }
                    else{

                      onTrigger && onTrigger();
                      confirmLiqAction({
                          
                        account, loginAccount, vaultId, 
                        amount, priceLower, priceUpper, 
                        isRemove , 
    
                        afterSigningAction: BackToLPPageAction,
               
                      });
                    }

                  },
                  // targetDescription: {
                  //   market,
                  //   label: isMint ? "Market" : "Pool",
                  // },
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
                              label: "Liquidity Shares ",
                            //  value: `${formatCash(liquidityUSD, USDC).full}`,
                              value: `${formatCash(amount, USDC).full}`
                              //svg: USDCIcon,
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
                              // value: am
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
              //disabled={!isApproved || inputFormError !== ""}
             // error={buttonError}
              //text={inputFormError === "" ? (buttonError ? buttonError : actionButtonText) : inputFormError}
              text={actionButtonText}
              // subText={
              //   buttonError === INVALID_PRICE
              //     ? lessThanMinPrice
              //       ? INVALID_PRICE_GREATER_THAN_SUBTEXT
              //       : INVALID_PRICE_ADD_UP_SUBTEXT
              //     : null
              // }
              customClass={ButtonStyles.ReviewTransactionButton}
            />}
          </div>
        </section>
      </main>
    </section>

  );
};


export default VaultLiquidityView;
const doMint = async(
  amount,vaultId, account,loginAccount )=>{
  console.log("amount", amount); 
await mintTVault(account, loginAccount.library, vaultId, amount); 
}
const doRedeem = async(
  amount,vaultId ,account, loginAccount )=>{
await redeemTVault(account, loginAccount.library, vaultId, amount); 
}
const doMaker = async(
  account, loginAccount, vaultId, amount, buySenior, price )=>{
  console.log(vaultId, amount, buySenior, price); 
  await doMakerTrade(
    account, loginAccount.library, vaultId, amount, 
    buySenior, price);

}
const doClaim = async(
  amount,vaultId ,account, loginAccount, buyTradeForBase, price, 
  ) =>{
  await claimMaker(
    account, loginAccount.library, vaultId, price, buyTradeForBase ); 

}
const doFaucet = async(
  account, loginAccount, vaultId
  )=> {
  await faucetUnderlying(account, loginAccount.library, vaultId); 

}
const doApprove = async(
  amount,vaultId, account,loginAccount ) =>{
    await approveUnderlying(account, loginAccount.library, vaultId, amount)
}
const doSplit = async(
  account, loginAccount, vaultId, amount 
  )=>{
 
  await splitTranches(account, loginAccount.library, vaultId, amount); 
 
}
const doMerge = async(
  account, loginAccount, vaultId, amount 
  )=>{
  await mergeTranches(account, loginAccount.library, vaultId, amount); 

}
const confirmOAMMLiqAction = async({
  account, loginAccount, vaultId, amount, isRemove, 
  afterSigningAction = () => {}
})=> {
  await oammAddOrRemoveTrancheLiq(
    account, loginAccount.library, vaultId, amount, isRemove).then((response)=>{
      afterSigningAction(); 
     });; 

}
const confirmLiqAction = async ({
  account, loginAccount, vaultId, amount, priceLower, priceUpper, isRemove, 
  afterSigningAction = () => {}

}) => {
  
  await addOrRemoveTrancheLiq(
    account, loginAccount.library,vaultId,
     amount, priceLower, priceUpper, isRemove ).then((response)=>{
      afterSigningAction(); 
     }); 
    
    // await  addTrancheLiquidity(account, loginAccount.library,
    // amount, String(market.turboId))
    //   .then( (response) => {
    //    // const { hash } = response;
    //     // addTransaction({
    //     //   hash,
    //     //   chainId: loginAccount.chainId,
    //     //   from: account,
    //     //   seen: false,
    //     //   status: TX_STATUS.PENDING,
    //     //   addedTime: new Date().getTime(),
    //     //   message: `Add Liquidity`,
    //     //   marketDescription: `${market?.title} ${market?.description}`,
    //     // });
    //     afterSigningAction();
    //   })


   
  }
//};


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



const MakerForm = ({
  vaultinfo,
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
  const isMint = selectedAction === "mint";
  const isRedeem = selectedAction === "redeem"; 
  const isResetPrices = selectedAction === RESET_PRICES;

  const { amm, isGrouped, rewards } = market;
  const mustSetPrices = Boolean(!amm?.id);
  const hasInitialOdds = market?.initialOdds && market?.initialOdds?.length && mustSetPrices;
  const initialOutcomes = []

  const [outcomes, setOutcomes] = useState<AmmOutcome[]>(orderOutcomesForDisplay(initialOutcomes));
  const [asset, setAsset] = useState(0); 
    const [price, setPrice] = useState(0); 

  const [chosenCash, updateCash] = useState<string>("underlying");
  const [breakdown, setBreakdown] = useState(defaultAddLiquidityBreakdown);
  const [estimatedLpAmount, setEstimatedLpAmount] = useState<string>("0");
  const tradingFeeSelection = TRADING_FEE_OPTIONS[2].id;
 // const cash: Cash = cashes ? Object.values(cashes).find((c) => c.name === USDC) : Object.values(cashes)[0];
    const cash: Cash = Object.values(cashes)[0];

  const userTokenBalance = cash?.name ? balances[cash?.name]?.balance : "0";
  const shareBalance = "0"
   // balances && balances.lpTokens && balances.lpTokens[amm?.marketId] && balances.lpTokens[amm?.marketId].balance;
  const liquidityUSD = "0"
   // (balances && balances.lpTokens && balances.lpTokens[amm?.marketId] && balances.lpTokens[amm?.marketId].usdValue) ||
   // "0";
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
  // const approvedMain = useApprovalStatus({
  //   cash,
  //   amm,
  //   refresh: blocknumber,
  //   actionType: approvalActionType,
  // });
  const isApprovedMain = true//approvedMain === ApprovalState.APPROVED;
  //const isApproved = isRemove ? isApprovedMain && isApprovedToTransfer : isApprovedMain;
  const isApproved = true; 
  const totalPrice = outcomes.reduce((p, outcome) => (outcome.price === "" ? parseFloat(outcome.price) + p : p), 0);

  const onChainFee = useMemo(() => {
    const feeOption = TRADING_FEE_OPTIONS.find((t) => t.id === tradingFeeSelection);
    const feePercent = 0//selectedAction === CREATE ? feeOption.value : amm?.feeInPercent;

    return String(new BN(feePercent).times(new BN(10)));
  }, [tradingFeeSelection]);

  const { buttonError, inputFormError, lessThanMinPrice, hasAmountErrors } = useErrorValidation({
    isRemove,
    outcomes,
    amount,
    actionType: selectedAction,
    isGrouped,
    userMaxAmount,
    account,
  });
  const {vaultId} = vaultinfo; 

  const selectionDropDownProps = {
      defaultValue: "Sell Senior->Buy Junior(Bids)", 
      onChange: (val) => setAsset(val),
      options: [
          {
              label: "Sell Senior->Buy Junior(Bids)",
              value: "0"
          },
          {
              label: "Sell Junior->Buy Senior(Asks)",
              value: "1"
          },
      ]
  }
 

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
        [Styles.isRemove]: false,
        [Styles.isMint]: isMint,
        [Styles.isResetPrices]: isResetPrices,
      })}
    >
      <header>
        <button
          className={classNames({ [Styles.selected]: !isRemove && !isMint && !isRedeem })}
          onClick={() => {
            setAmount(amount === userMaxAmount ? "" : amount);
            setSelectedAction(Boolean(amm?.id) ? ADD : CREATE);
          }}
        >
          Create Order
        </button>
        { (
          <button
            className={classNames({ [Styles.selected]: isRemove&& !isMint && !isRedeem })}
            onClick={() => {
              setAmount(shareBalance);
              setSelectedAction(REMOVE);
            }}
          >
            Remove Order
          </button>
        )}
        { (
          <button
            className={classNames({ [Styles.selected]: !isRemove&& isMint && !isRedeem  })}
            onClick={() => {
              setAmount(shareBalance);
              setSelectedAction("mint");
            }}
          >
            Claim
          </button>
        )}

        {!shareBalance && notMintOrReset && earlyBonus && <span>Eligible for bonus rewards</span>}
      </header>
      <main>


        <AmountInput
          heading="Amount"
          ammCash={cash}
          updateInitialAmount={(amount) => setAmount(amount)}
          initialAmount={amount}
          maxValue={userMaxAmount}
          chosenCash={chosenCash}
          updateCash={updateCash}
          updateAmountError={() => null}
          error={hasAmountErrors}
        />
          <AmountInput
          heading="Price"
          ammCash={cash}
          updateInitialAmount={(price) => setPrice(price)}
          initialAmount={price}
          maxValue={userMaxAmount}
          chosenCash={chosenCash}
          updateCash={updateCash}
          updateAmountError={() => null}
          error={hasAmountErrors}
        />        
  
        {!isMint&& 
          <SecondaryThemeButton text={"Place Order"} 
        action={()=> doMaker(account, loginAccount, vaultId, amount, asset, price)}/>}
        <div className={Styles.PricesAndOutcomes}>
          <span className={Styles.PriceInstructions}>
           {/* <span>{mustSetPrices ? "Set the Price" : "Current Prices"}</span> */}
           {/* <span>{"Current Tranche Token Prices"}</span>
            <span>(between 0.02 - 1.0). Total price of all outcomes must add up to 1.</span> */}
    <SmallDropdown {...selectionDropDownProps}/>

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
            {/*isRemove && hasPendingBonus && (
              <WarningBanner
                className={CommonStyles.ErrorBorder}
                title="Increasing or removing your liquidity on a market before the bonus time is complete will result in the loss of your bonus rewards."
                subtitle={
                  "In order to receive the bonus, your liquidity needs to remain unchanged until the bonus period is over."
                }
              />
            )*/}
            {/*<span>{isRemove ? "Remove All Liquidity" : "You'll Receive"}</span> */}
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
            {isMint&& <SecondaryThemeButton text={"Claim Filled Senior"} 
            action={()=> doClaim(amount, vaultId, account, loginAccount, true, 0)}/>}
            
            {isMint&& <SecondaryThemeButton text={"Claim Filled Junior"} 
            action={()=> doClaim(amount, vaultId, account, loginAccount, false, 0)}/>}
            {/*!isMint&& <SecondaryThemeButton
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
            />*/}
          </div>
        </section>
      </main>
    </section>
  );
};


//};