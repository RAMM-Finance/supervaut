 /* eslint-disable */ 
import React, { useEffect, useState, useContext, useCallback } from "react";
import Styles from "../markets/markets-view.styles.less";
import { AppViewStats } from "../common/labels";
import classNames from "classnames";
import { useSimplifiedStore } from "../stores/simplified";
import { categoryItems, DEFAULT_MARKET_VIEW_SETTINGS } from "../constants";
import { TopBanner } from "../common/top-banner";
import {
  useAppStatusStore,
  useDataStore,
  useScrollToTopOnMount,
  SEO,
  Constants,
  Components,
  getCategoryIconLabel,
  ContractCalls,
  useUserStore,

} from "@augurproject/comps";
import { SmallDropdown } from "@augurproject/comps/build/components/common/selection";

import { MARKETS_LIST_HEAD_TAGS } from "../seo-config";
import { VaultPrice } from "../common/labels";


import { MintContext } from './mintcontext'; 

import buttonStyles from "../common/buttons.styles.less";
import inputStyles from "../common/inputs.styles.less";
import formStyles from "../market/trading-form.styles.less";
import { FailedX } from "@augurproject/comps/build/components/common/icons";
import { ValueLabel } from "@augurproject/comps/build/components/common/labels";
// import { RiSettings3Fill } from 'react-icons/ri'


const {
  SelectionComps: { SquareDropdown , ToggleSwitch},
  ButtonComps: { PrimaryThemeButton, TinyThemeButton, SecondaryThemeButton },
  Icons: { FilterIcon, SearchIcon },
  MarketCardComps: { LoadingMarketCard, MarketCard },
  PaginationComps: { sliceByPage, useQueryPagination, Pagination },
  InputComps: { SearchInput, AmountInput },
  LabelComps: { NetworkMismatchBanner },
} = Components;
const {
  SIDEBAR_TYPES,
  ALL_CURRENCIES,
  ALL_MARKETS,
  // currencyItems,
  marketStatusItems,
  OPEN,
  OTHER,
  POPULAR_CATEGORIES_ICONS,
  sortByItems,
  TOTAL_VOLUME,
  STARTS_SOON,
  RESOLVED,
  IN_SETTLEMENT,
  LIQUIDITY,
  MARKET_STATUS,
  TWENTY_FOUR_HOUR_VOLUME,
  SPORTS,
} = Constants;
const { mintVaultDS, getVaultTokenBalance, fetchSuperVault,
splitTranches, mergeTranches, swapFromTranche, swapFromInstrument, leverageSwap} = ContractCalls; 

const PAGE_LIMIT = 21;
const MIN_LIQUIDITY_AMOUNT = 1;
const styleMint = {
    wrapper: `w-screen flex items-center justify-center px-24`,
    content: `bg-[#191B1F] w-[40rem] rounded-2xl p-4`,
    formHeader: `px-2 flex items-center justify-between font-semibold text-xl pb-10`,
    transferPropContainer: `bg-[#20242A] my-3 rounded-2xl p-6 text-3xl  border border-[#20242A] hover:border-[#41444F]  flex justify-between`,
    transferPropInput: `bg-transparent placeholder:text-[#B2B9D2] outline-none mb-6 w-full text-2xl`,
    currencySelector: `flex w-1/4`,
    currencySelectorContent: `w-full h-min flex justify-between items-center bg-[#2D2F36] hover:bg-[#41444F] rounded-2xl text-xl font-medium cursor-pointer p-2 mt-[-0.2rem]`,
    currencySelectorIcon: `flex items-center`,
    currencySelectorTicker: `mx-2`,
    currencySelectorArrow: `text-lg`,
    confirmButton: `bg-[#2172E5] my-2 rounded-2xl py-6 px-8 text-xl font-semibold flex items-center justify-center cursor-pointer border border-[#2172E5] hover:border-[#234169]`,
  }


const SearchButton = (props) => (
  <SecondaryThemeButton {...{ ...props, icon: SearchIcon, customClass: Styles.SearchButton }} />
);


const doSplit = async(
  amount,vaultId, account,loginAccount )=>{
await splitTranches(account, loginAccount.library, vaultId, amount); 
}

const doMerge = async(
  amount,vaultId, account,loginAccount )=>{
await mergeTranches(account, loginAccount.library, vaultId, amount); 
}

const doSwap = async(
  account, loginAccount, vaultId, amount,asset1, asset2, leverage
  )=>{
  vaultId = 3
  console.log('amount', amount); 
  if (asset1 == 0 && asset2 ==1){
    if(leverage>1){

     await  leverageSwap(account, loginAccount.library, 
      false,vaultId, leverage, amount )
     return 
    }

    await swapFromTranche(
    account,
    loginAccount.library,
    vaultId ,
    amount,
    true,
    0
    )

  }
  else if(asset1 == 1 && asset2 ==0){
    if(leverage>1){

     await  leverageSwap(account, loginAccount.library, 
      true,vaultId, leverage, amount )
     return
    }
    

    await swapFromTranche(
    account,
    loginAccount.library,
    vaultId ,
    amount,
    false,
    0
    )
  }
  else if(asset1 == 2){
    let toJunior; 
    if(asset2 == 0)
      {const toJunior= false }
    else if (asset2 == 1)
      {const toJunior = true }
    await swapFromInstrument(
    account,
    loginAccount.library,
    vaultId ,
    amount,
    toJunior,
    0
    )
  }


}
export const MintView= () => {
  
  const { account, loginAccount } = useUserStore();
  const [ amount, setAmount ] = useState("");
  const [loading, setLoading] = useState(true);
  const [oppositeDown, setOppositeDown] = useState(true); 
  const [ oppositeAmount, setOppositeAmount] = useState(""); 

  const [filteredMarkets, setFilteredMarkets] = useState([]);
  const [filter, setFilter] = useState("");
  const [page, setPage] = useQueryPagination({
    itemsPerPage: PAGE_LIMIT,
    itemCount: filteredMarkets.length,
  });
  const [ balance, setBalance ] = useState("0.0");
  const [ payAmount, setPayAmount] = useState("0.0"); 
  const [ receiveAmount, setReceiveAmount] = useState("0.0"); 
  const [ receive, setReceive] = useState(false); 
  const [asset, setAsset] = useState("0"); 
  const [asset_, setAsset_] = useState("1"); 
  const [leverage, setLeverage] = useState("");
  const handleSubmit = async (e: any) => { 
    await mintVaultDS(account, loginAccount.library, amount, true);
  }

  const vaultId = 0; 


  const selectionDropDownProps = {
      defaultValue: "Senior", 
      onChange: (val) => setAsset(val),
      options: [
          {
              label: "Senior",
              value: "0"
          },
          {
              label: "Junior",
              value: "1"
          },
          {
              label: "Vault",
              value: "2"
          },
      ]
  }
  const selectionDropDownProps_ = {
      defaultValue: "Junior", 
      onChange: (val) => setAsset_(val),
      options: [
          {
              label: "Senior",
              value: "0"
          },
          {
              label: "Junior",
              value: "1"
          },

      ]
  }
 
  const getBalance = useCallback(async () => {
    let result = await getVaultTokenBalance(account, loginAccount.library);
    //console.log("balance: ", result);
    setBalance(result);
  });

  useEffect(() => {
    if (account && loginAccount.library) {
      getBalance();
    }
  }, [account, loginAccount])

  useScrollToTopOnMount(page);

  let changedFilters = 0;
  const bal = 3; 
  return (
    <div
      className={classNames(Styles.MintView, {
      })}
    >
      <SEO {...MARKETS_LIST_HEAD_TAGS} />
      <NetworkMismatchBanner />

      <VaultPrice balance={"3"} />
      <VaultPrice balance={"3"} />



           

     <div className = {styleMint.wrapper}>  
        <div className = {formStyles.MintForm}>
          <div style={{'fontWeight':'750', 'display':'flex', 'justifyContent':'center', 'fontSize':'20px'}}>
            Swap 
          </div>

         {/* <ValueLabel large={true} label="Vault Token Balance" value={balance} /> */}
          <div style={{ 'padding-left': '1.5rem', 'padding-right': '1.5rem' }}>
  
          <div className={inputStyles.AmountInput}>
          <div className="text-sm font-bold">{receive ? 'J-S' : 'From'}</div>


            <div className={inputStyles.AmountInputField}>
              <span>$</span>
              <input 
                type="text"
                placeholder="0.0"
                value={oppositeDown? amount: oppositeAmount }
                onChange={(e) => {
                  if (/^\d*\.?\d*$/.test(e.target.value)) {
                    if(oppositeDown){
                      setAmount(e.target.value);
                      setOppositeAmount(e.target.value*2); 
                    }
                    else{
                      setOppositeAmount(e.target.value * 2); 
                    }
                  }
                }}
              />
      
              <button className={buttonStyles.BaseNormalButtonTiny}><span>Max</span></button>
                <SmallDropdown {...selectionDropDownProps}/>

                {/*<svg width="29" height="28" viewBox="0 0 29 28" fill="none">
                  <g><circle cx="14.5" cy="14" r="14" fill="#3A76C3"></circle><g><path d="M12.0363 23.2963C12.0363 23.6323 11.8123 23.7443 11.4763 23.7443C7.33232 22.4003 4.42032 18.5923 4.42032 14.1123C4.42032 9.63231 7.33232 5.82431 11.4763 4.48031C11.8123 4.36831 12.0363 4.59231 12.0363 4.92831V5.71231C12.0363 5.93631 11.9243 6.16031 11.7003 6.27231C8.45232 7.50431 6.21232 10.5283 6.21232 14.1123C6.21232 17.6963 8.56432 20.8323 11.7003 21.9523C11.9243 22.0643 12.0363 22.2883 12.0363 22.5123V23.2963Z" fill="white"></path><path d="M15.3965 20.4963C15.3965 20.7203 15.1725 20.9443 14.9485 20.9443H14.0525C13.8285 20.9443 13.6045 20.7203 13.6045 20.4963V19.1523C11.8125 18.9283 10.9165 17.9203 10.5805 16.4643C10.5805 16.2403 10.6925 16.0163 10.9165 16.0163H11.9245C12.1485 16.0163 12.2605 16.1283 12.3725 16.3523C12.5965 17.1363 13.0445 17.8083 14.5005 17.8083C15.6205 17.8083 16.4045 17.2483 16.4045 16.3523C16.4045 15.4563 15.9565 15.1203 14.3885 14.8963C12.0365 14.5603 10.9165 13.8883 10.9165 11.9843C10.9165 10.5283 12.0365 9.40833 13.6045 9.18433V7.84033C13.6045 7.61633 13.8285 7.39233 14.0525 7.39233H14.9485C15.1725 7.39233 15.3965 7.61633 15.3965 7.84033V9.18433C16.7405 9.40833 17.6365 10.1923 17.8605 11.4243C17.8605 11.6483 17.7485 11.8723 17.5245 11.8723H16.6285C16.4045 11.8723 16.2925 11.7603 16.1805 11.5363C15.9565 10.7523 15.3965 10.4163 14.3885 10.4163C13.2685 10.4163 12.7085 10.9763 12.7085 11.7603C12.7085 12.5443 13.0445 12.9923 14.7245 13.2163C17.0765 13.5523 18.1965 14.2243 18.1965 16.1283C18.1965 17.5843 17.0765 18.8163 15.3965 19.1523V20.4963Z" fill="white"></path><path d="M17.5239 23.7442C17.1879 23.8562 16.9639 23.6322 16.9639 23.2962V22.5122C16.9639 22.2882 17.0759 22.0642 17.2999 21.9522C20.5479 20.7202 22.7879 17.6962 22.7879 14.1122C22.7879 10.5282 20.4359 7.39222 17.2999 6.27222C17.0759 6.16022 16.9639 5.93622 16.9639 5.71222V4.92822C16.9639 4.59222 17.1879 4.48022 17.5239 4.48022C21.5559 5.82422 24.5799 9.63222 24.5799 14.1122C24.5799 18.5922 21.6679 22.4002 17.5239 23.7442Z" fill="white"></path></g></g><defs><clipPath id="clip0"><rect width="28" height="28" fill="white" transform="translate(0.5)"></rect></clipPath><clipPath id="clip1"><rect width="22.4" height="22.4" fill="white" transform="translate(3.29999 2.80005)"></rect></clipPath></defs>
                </svg>*/}
              {/*<span style={{color: 'black', "padding-left": "0.25rem", "padding-right": "0.5rem"}}>USDC</span> */}
            </div>
         {/* <div className="text-sm font-bold">{receive ? 'Senior Balance:'+'3' 
          : 'Junior Balance: '+'3'}</div>
        <div className="text-sm font-bold">{"Max Leverage"}</div> */}

 

          </div>
        </div>

            
             {/* <TinyThemeButton
                  text={"swap"}
                 action = {()=>{
                  setOppositeDown(!oppositeDown); 
                  //fetchSuperVault(account, loginAccount?.library)
                  setReceive(!receive)
                  // setPayAmount(amount)
                  // setReceiveAmount(amount)

                 }}
              /> */}
  {/*<TinyThemeButton
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
        />  */ }            
            
          <div style={{ 'padding-left': '1.5rem', 'padding-right': '1.5rem' }}>
          <div className={inputStyles.AmountInput}>
                    <div className="text-sm font-bold">{receive ? 'J-S' : 'To'}</div>

            <div className={inputStyles.AmountInputField}>
              <span>$</span>
              <input 
                type="text"
                placeholder="0.0"
                value={ oppositeDown?oppositeAmount:amount }
                onChange={(e) => {
                  if (/^\d*\.?\d*$/.test(e.target.value)) {
                    if(oppositeDown){
                      setOppositeAmount(e.target.value); 
                    }
                    else{
                      setAmount(e.target.value);
                    }
                  }
                }}
              />

             
                          <SmallDropdown {...selectionDropDownProps_}/>

              {/*  <svg width="29" height="28" viewBox="0 0 29 28" fill="none">
                  <g><circle cx="14.5" cy="14" r="14" fill="#3A76C3"></circle><g><path d="M12.0363 23.2963C12.0363 23.6323 11.8123 23.7443 11.4763 23.7443C7.33232 22.4003 4.42032 18.5923 4.42032 14.1123C4.42032 9.63231 7.33232 5.82431 11.4763 4.48031C11.8123 4.36831 12.0363 4.59231 12.0363 4.92831V5.71231C12.0363 5.93631 11.9243 6.16031 11.7003 6.27231C8.45232 7.50431 6.21232 10.5283 6.21232 14.1123C6.21232 17.6963 8.56432 20.8323 11.7003 21.9523C11.9243 22.0643 12.0363 22.2883 12.0363 22.5123V23.2963Z" fill="white"></path><path d="M15.3965 20.4963C15.3965 20.7203 15.1725 20.9443 14.9485 20.9443H14.0525C13.8285 20.9443 13.6045 20.7203 13.6045 20.4963V19.1523C11.8125 18.9283 10.9165 17.9203 10.5805 16.4643C10.5805 16.2403 10.6925 16.0163 10.9165 16.0163H11.9245C12.1485 16.0163 12.2605 16.1283 12.3725 16.3523C12.5965 17.1363 13.0445 17.8083 14.5005 17.8083C15.6205 17.8083 16.4045 17.2483 16.4045 16.3523C16.4045 15.4563 15.9565 15.1203 14.3885 14.8963C12.0365 14.5603 10.9165 13.8883 10.9165 11.9843C10.9165 10.5283 12.0365 9.40833 13.6045 9.18433V7.84033C13.6045 7.61633 13.8285 7.39233 14.0525 7.39233H14.9485C15.1725 7.39233 15.3965 7.61633 15.3965 7.84033V9.18433C16.7405 9.40833 17.6365 10.1923 17.8605 11.4243C17.8605 11.6483 17.7485 11.8723 17.5245 11.8723H16.6285C16.4045 11.8723 16.2925 11.7603 16.1805 11.5363C15.9565 10.7523 15.3965 10.4163 14.3885 10.4163C13.2685 10.4163 12.7085 10.9763 12.7085 11.7603C12.7085 12.5443 13.0445 12.9923 14.7245 13.2163C17.0765 13.5523 18.1965 14.2243 18.1965 16.1283C18.1965 17.5843 17.0765 18.8163 15.3965 19.1523V20.4963Z" fill="white"></path><path d="M17.5239 23.7442C17.1879 23.8562 16.9639 23.6322 16.9639 23.2962V22.5122C16.9639 22.2882 17.0759 22.0642 17.2999 21.9522C20.5479 20.7202 22.7879 17.6962 22.7879 14.1122C22.7879 10.5282 20.4359 7.39222 17.2999 6.27222C17.0759 6.16022 16.9639 5.93622 16.9639 5.71222V4.92822C16.9639 4.59222 17.1879 4.48022 17.5239 4.48022C21.5559 5.82422 24.5799 9.63222 24.5799 14.1122C24.5799 18.5922 21.6679 22.4002 17.5239 23.7442Z" fill="white"></path></g></g><defs><clipPath id="clip0"><rect width="28" height="28" fill="white" transform="translate(0.5)"></rect></clipPath><clipPath id="clip1"><rect width="22.4" height="22.4" fill="white" transform="translate(3.29999 2.80005)"></rect></clipPath></defs>
                </svg>
              <span style={{color: 'black', "padding-left": "0.25rem", "padding-right": "0.5rem"}}>USDC</span> */}
            </div>

          

          </div>
        </div>

       <div style={{ 'padding-left': '5rem', 'padding-right': '5rem'}}>
          <div className={inputStyles.AmountInput}>
                  <div className="text-sm font-bold">{"Input Leverage"}</div>

            <div className={inputStyles.AmountInputField}>
            <span></span>
              <input 
                type="text"
                placeholder="Default: 1.0"
                value={ leverage }
                onChange={(e) => {
                  if (/^\d*\.?\d*$/.test(e.target.value)) {
                    if(oppositeDown){
                      setLeverage(e.target.value); 
                    }
                    else{
                      setLeverage(e.target.value);
                    }
                  }
                }}
              />

              <button className={buttonStyles.BaseNormalButtonTiny}><span>
              {"Max Leverage"}</span></button>

            </div>

          

          </div>
        </div> 
 
        <div style={{  'padding-left': '1.5rem', 'padding-right': '1.5rem' }} >
          <button onClick={() => doSwap(account, loginAccount, vaultId, amount, asset, asset_, leverage)} 
          className={buttonStyles.SimplifiedActionButton}>
          &nbsp; &nbsp;  &nbsp; <span>Confirm</span> &nbsp; &nbsp; &nbsp; 
          </button>
        </div>
        
        </div>
    </div>
     {/* {filteredMarkets.length > 0 && (
        <Pagination
          page={page}
          useFull
          itemCount={filteredMarkets.length}
          itemsPerPage={PAGE_LIMIT}
          action={(page) => {
            setPage(page);
          }}
          updateLimit={null}
          usePageLocation account, loginAccount, vaultId, e
        />
      )} */}
    </div> 
  );
};

export default MintView;
