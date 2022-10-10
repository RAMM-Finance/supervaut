import React, { useState, useEffect } from 'react';
import {
  Components,
  Utils,
  useDataStore,
  useUserStore,
  Constants,
  ContractCalls,
  Stores,
  useScrollToTopOnMount,
} from "@augurproject/comps";

export type Token = string;

interface SwapInputProps {
  receive?: boolean;
  value: string;
  onChange: (
    reverse: boolean,
    amount?: number,
    from?: Token,
    to?: Token
  ) => number;
  setPayAmount: React.Dispatch<React.SetStateAction<string>>;
  setReceiveAmount: React.Dispatch<React.SetStateAction<string>>;
  token: Token;
  setToken: React.Dispatch<React.SetStateAction<Token>>;
  resetTransactionInformation: () => void;
  balance: number;
  opened: boolean;
  otherToken: Token;
}

export const SwapInput = ({
 receive = false,
  value,
  onChange,
  setPayAmount,
  setReceiveAmount,
  token,
  setToken,
  resetTransactionInformation,
  balance,
  opened,
  otherToken,
}: SwapInputProps) =>{


  const [balanceETH, setBalanceETH] = useState(0);
  const [balanceUSDC, setBalanceUSDC] = useState(0);

  return(
      <div className="mb-2 flex place-content-between items-center px-0.5">
  
        <input
          inputMode="decimal"
          placeholder="0.0"
          className="absolute inset-0 h-full w-full rounded-lg outline-0 bg-transparent p-4"
          value={value}
          onChange={(event) => {
            if (/^\d*\.?\d*$/.test(event.target.value)) {
              if (event.target.value === '') {
                setPayAmount('');
                setReceiveAmount('');
                resetTransactionInformation();
              } else {
                const amount = parseFloat(event.target.value);
                if (Number.isFinite(amount)) {
                  (receive ? setReceiveAmount : setPayAmount)(
                    event.target.value.substring(0, 27)
                  );
                  (receive ? setPayAmount : setReceiveAmount)(
                    onChange(receive, amount).toString()
                  );
                }
              }
            }
          }}
        />
            </div>


    )
}