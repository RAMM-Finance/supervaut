import React, { useEffect,useReducer } from "react";
import {
  STUBBED_DATA_ACTIONS,
  PARA_CONFIG,
  NETWORK_BLOCK_REFRESH_TIME,
  MULTICALL_MARKET_IGNORE_LIST, DATA_ACTIONS, DATA_KEYS, DEFAULT_DATA_STATE 
} from "./constants";
import { useData } from "./data-hooks";
import { useUserStore, UserStore } from "./user";
import {  getTrancheInfos } from "../utils/contract-calls";
import { getAllTransactions } from "../apollo/client";
import { getDefaultProvider } from "../components/ConnectAccount/utils";
import { AppStatusStore } from "./app-status";
import { MARKET_LOAD_TYPE } from "../utils/constants";
import {dsAddress} from "../data/constants"
import { dispatchMiddleware, arrayToKeyedObjectByProp } from "./utils";
import { windowRef } from "../utils/window-ref";
import { BigNumber } from "ethers";

const { UPDATE_DATA_HEARTBEAT, UPDATE_TRANSACTIONS } = DATA_ACTIONS;
const { AMM_EXCHANGES, BLOCKNUMBER, CASHES, ERRORS, MARKETS, TRANSACTIONS } = DATA_KEYS;
export interface VaultInfos {
  [vaultId: number]: InitParams;
}


interface UserLiquidityPositions{
  priceLower: BigNumber; 
  priceUpper: BigNumber; 
  liquidity: BigNumber; 
}
interface UserLimitPositions{
  price: BigNumber; 
  amount: BigNumber; 
  claimable: boolean; 
}
export interface UserInfo{
  tVaultBal: BigNumber; 
  seniorBal: BigNumber; 
  juniorBal: BigNumber; 
  cSeniorBal: BigNumber; 
  cJuniorBal: BigNumber; 
  seniorDebt: BigNumber; 
  juniorDebt: BigNumber; 

  liqPositions: UserLiquidityPositions[];
  limitPositions: UserLimitPositions[]; 
}
interface InitParams{
  _want: string; 
  _instruments: string[]; 
  _ratios: BigNumber[];
  _junior_weight: BigNumber;
  _promisedReturn: BigNumber;
  _time_to_maturity: BigNumber; 
  vaultId: BigNumber; 
  inceptionPrice: BigNumber; 
}

interface VaultInfo extends InitParams{
  // vaultId: string; 
  curMarkPrice?: BigNumber; 
  pjs?: BigNumber; 
  psu?: BigNumber; 
  pju?: BigNumber; 


}
export const VAULTDATA_ACTIONS = {
  UPDATE_DATA_HEARTBEAT: "hb",
  UPDATE_TRANSACTIONS: "tx",
};

export interface GraphDataState {
  // ammExchanges: {
  //   [id: string]: AmmExchange;
  // };
  // blocknumber: number;
  // cashes: {
  //   [address: string]: Cash;
  // };
  // errors?: any;
  // markets: {
  //   [marketIdKey: string]: MarketInfo;
  // };
  // loading?: boolean;
  // transactions?: any;
  vaultinfos: VaultInfos; 
  blocknumber:number; 
  numVaults:string, 
}
export const DEFAULT_VAULTDATA_STATE: GraphDataState = {
  // ammExchanges: {},
  // blocknumber: null,
  // cashes: {},
  // errors: null,
  // markets: {},
  // transactions: {},
  vaultinfos: null, 
  blocknumber:null, 
  numVaults: null 
};

export function VaultDataReducer(state, action){
  const updatedState = {... state}; 
  switch (action.type){
    case VAULTDATA_ACTIONS.UPDATE_TRANSACTIONS:{
      break;
    }
    case VAULTDATA_ACTIONS.UPDATE_DATA_HEARTBEAT:{
      const { blocknumber, numVaults, vaultinfos } = action;
      updatedState["blocknumber"] = blocknumber; 
      updatedState["numVaults"] = numVaults; 
      updatedState["vaultinfos"] = vaultinfos; 
      break; 
    } 
  }
  windowRef.data = updatedState; 
  return updatedState; 
}

export const useVaultData = (defaultState = DEFAULT_VAULTDATA_STATE) =>{
  const [state, pureDispatch] = useReducer(VaultDataReducer, {...defaultState}); 
  const dispatch = dispatchMiddleware(pureDispatch);
  windowRef.data = state; 

  return {
    ... state, 
    actions: {
      updateTransactions: (transactions) => dispatch({type: VAULTDATA_ACTIONS.UPDATE_TRANSACTIONS, transactions }),
      updateDataHeartbeat: ({blocknumber, numVaults, vaultinfos}) =>
         dispatch({type: VAULTDATA_ACTIONS.UPDATE_DATA_HEARTBEAT, blocknumber, numVaults, vaultinfos})
    }
  }
}

export const VaultDataContext = React.createContext({
  ... DEFAULT_VAULTDATA_STATE, 
  actions: STUBBED_DATA_ACTIONS
});

export const VaultDataStore = {
  actionSet: false, 
  get: ()=> ({ ...DEFAULT_VAULTDATA_STATE }),
  actions: STUBBED_DATA_ACTIONS, 
};

export const VaultDataProvider = ({children}: any)=>{
  const {account} = useUserStore(); 
  const state = useVaultData(); 
  const {states, actions:{updateDataHeartbeat, updateTransactions}} = state; 
  if (!VaultDataStore.actionSet){
    VaultDataStore.actions = state.actions ; 
    VaultDataStore.actionSet = true; 
  }
  const readableState = {... state}; 
  delete readableState.actions; 
  VaultDataStore.get = ()=> readableState; 
  const networkId = Number(PARA_CONFIG.networkId); 
  useEffect(()=>{
    let isMounted = true; 
    let intervalId = null; 
    const getTranches = async()=>{
      const { account: userAccount, loginAccount } = UserStore.get();
      const { isRpcDown, isWalletRpc } = AppStatusStore.get();
      const {blocknumber: dblock, numVaults: dnum, vaultinfos: dvault} = VaultDataStore.get(); 
      const provider = isWalletRpc? loginAccount?.library : getDefaultProvider() || loginAccount?.library; 

      let infos = {numVaults: dnum, blocknumber: dblock, vaultinfos: dvault}

      try{
        infos = await getTrancheInfos(provider, userAccount ); 
        return infos; 
      } catch(e){
          console.log("error getting market data", e);
      }
      return { numVaults: {},  blocknumber: null, vaultinfos: {} };

    }

    getTranches().then(({numVaults, blocknumber, vaultinfos}) =>{
      console.log('numvaultsshere', numVaults, blocknumber, vaultinfos)
      isMounted &&blocknumber&& blocknumber > VaultDataStore.get().blocknumber&& 
      updateDataHeartbeat({blocknumber, numVaults, vaultinfos});
      intervalId = setInterval(() => {
        getTranches().then(({numVaults, blocknumber, vaultinfos}) => {
      console.log('numvaultsshere', numVaults, blocknumber, vaultinfos)
          isMounted && 
          //   blocknumber &&
          //   blocknumber > VaultDataStore.get().blocknumber &&
            updateDataHeartbeat({ blocknumber, numVaults, vaultinfos }, blocknumber, null);
        });
      }, NETWORK_BLOCK_REFRESH_TIME[networkId]);

    })
    return () =>{
      isMounted = false; 
      //clearInterval(intervalId);
    }
  }, []);
  return <VaultDataContext.Provider value={state}>{children}</VaultDataContext.Provider>;
}

export const useVaultDataStore = () => React.useContext(VaultDataContext);

export const voutput = {
  VaultDataProvider, useVaultDataStore, VaultDataStore
}


