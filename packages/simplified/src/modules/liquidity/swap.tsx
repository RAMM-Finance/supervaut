import React, { useState, useEffect, useContext } from 'react';
import { useHistory } from "react-router";
import classNames from "classnames";
import Styles from "./liquidity-view.styles.less";
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
import { AppViewStats, AvailableLiquidityRewards, MaticAddMetaMaskToken } from "../common/labels";
import {
  categoryItems,
  MARKET_LIQUIDITY,
  ZERO,
  MARKET_TYPE_OPTIONS,
  POOL_SORT_TYPES,
  POOL_SORT_TYPE_TEXT,
} from "../constants";
import { BonusReward } from "../common/tables";
import { useSimplifiedStore } from "../stores/simplified";
import { MarketInfo } from "@augurproject/comps/build/types";
import BigNumber from "bignumber.js";

import {SwapInput, Token} from "./input"; 
const emptyTransactionInformation = new Map([
  ['Receive', 0],
  ['Rate', 0],
  ['Swap Fee', 0],
  ['Optimization Fee', 0],
  ['Minimum Received', 0],
]);
function getRate(token: Token) {
  switch (token) {
    case 'eth':
      return 1;
    case 'bat':
      return 5;
    default:
      return 10;
  }
}
function convert(
  amount: number,
  from: Token,
  to: Token,
  reverse: boolean = false
) {
  let rate = getRate(to) / getRate(from);
  if (reverse) {
    rate = 1 / rate;
  }
  const output = amount * rate;
  let receive = output;
  if (reverse) {
    [receive, amount] = [amount, output];
  }
  return new Map([
    ['Receive', Number(output.toFixed(4))],
    ['Rate', rate],
    ['Swap Fee', amount * 0.003],
    ['Optimization Fee', amount * 0.0005],
    ['Minimum Received', receive * 0.995],
  ]);
}
export const SwapMenu = () =>{

  const {
    settings: { timeFormat },
  } = useSimplifiedStore();
  const {
    actions: { closeModal },
  } = useAppStatusStore();
  const { balances } = useUserStore();
  // const location = useLocation();
  // const history = useHistory();
  const [receiveToken, setReceiveToken_] = useState('Select A Token');
  const [balancePay, setBalancePay] = useState(0);
  const [modalOpened, setModalOpened] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [receiveAmount, setReceiveAmount] = useState('');
  const [payToken, setPayToken_] = useState("tokenSymbols[0]");
  const [transactionInformation, setTransactionInformation] = useState<
    Map<string, number>
  >(emptyTransactionInformation);
  function setReceiveToken(value: React.SetStateAction<Token>) {
    setReceiveToken_(value);
  }

  function setPayToken(value: React.SetStateAction<Token>) {
    setPayToken_(value);
  }
  function resetTransactionInformation() {
    setTransactionInformation(emptyTransactionInformation);
  }
  function handleChange(
    reverse: boolean,
    amount: number = parseFloat(payAmount),
    from: Token = payToken,
    to: Token = receiveToken
  ) {
    const transactionInformation = convert(amount, from, to, reverse);
    setTransactionInformation(transactionInformation);

    //useCurrencyBalance(account, tokens[tokenSymbols.indexOf(from)].address, provider).then( (result) => { setBalancePay(result)} );
    //useCurrencyBalance(account, tokens[tokenSymbols.indexOf(to)].address, provider).then( (result) => { setBalanceReceive(result)} );

    setModalOpened(true);

    return transactionInformation.get('Receive')!!;
  }

  return(
    <div className="text-text-light dark:text-text-dark ">
      <div className="relative z-10 mx-auto mt-16 text-left h-auto w-full max-w-md rounded-3xl bg-bg-card-light p-7 pt-6 shadow-card dark:bg-bg-card-dark dark:shadow-card-dark">

      <div>Swap</div>
        <SwapInput
          {...{
            value: payAmount,
            setPayAmount,
            setReceiveAmount,
            token: payToken,
            setToken: setPayToken,
            resetTransactionInformation,
            balance: balancePay,
            opened: modalOpened,
            otherToken: receiveToken,
          }}
          onChange={handleChange}
        />
      </div>

    </div>


  	)


}