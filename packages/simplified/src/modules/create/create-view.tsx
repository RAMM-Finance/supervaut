import { ContractCalls, useUserStore } from "@augurproject/comps";
import { SearchInput, TextInput, AmountInput} from "@augurproject/comps/build/components/common/inputs"; 
import { PrimaryThemeButton, SecondaryThemeButton, TinyThemeButton } from "@augurproject/comps/build/components/common/buttons";
import { SquareDropdown } from "@augurproject/comps/build/components/common/selection";
import { calcWeights } from "@augurproject/comps/build/utils/calculations";
import React, { useState, useCallback } from "react"
import Styles from "./create-view.styles.less"
import BigNumber, { BigNumber as BN } from "bignumber.js";
import inputStyles from "../common/inputs.styles.less";
import marketStyles from "../markets/markets-view.styles.less";
import liquidityStyles from "../liquidity/liquidity-view.styles.less";

const {createSuperVault} = ContractCalls

interface initParams {
    _want: string,
    _instruments: string[],
    _ratios: string[],
    _junior_weight: string,
    _promisedReturn: string,
    _time_to_maturity: string,
    vaultId: string
}

const VaultInput = ({ amount, setAmount}) =>{
    interface VaultItem {
        instrument: string,
        ratio: string
    }

    const [ instruments, setInstruments ] = useState<VaultItem[]>([])
    const [ instrument, setInstrument] = useState("")
    const [ ratio, setRatio ] = useState("")

    const vaultItems = instruments.map((item,i)=>{
        return(
            <li key = {item.instrument}>
            <label> Address: {item.instrument} </label>
            <label> Ratio: {item.ratio} </label> 
               <TinyThemeButton action={() => { setInstruments((prev)=>{
                    prev.splice(i,1);
                    return prev
                })}} text="x"/>            
            </li>
            )
    }); 

    return(
    <div>
     <div className={inputStyles.AmountInput}>
        <label>Add New Vault</label>
              <div> Weight</div>

        <div className={inputStyles.AmountInputField}>
          <span></span>
          <input 
            type="text"
            placeholder="0x..."
            value={ amount }
            onChange={(e) => {
              if (/^\d*\.?\d*$/.test(e.target.value)) {
                setAmount(e.target.value);
              }
            }}
          />

         {/* <button className={buttonStyles.BaseNormalButtonTiny}><span>Max</span></button>*/}
      
            <svg width="29" height="28" viewBox="0 0 29 28" fill="none">
              <g><circle cx="14.5" cy="14" r="14" fill="#3A76C3"></circle><g><path d="M12.0363 23.2963C12.0363 23.6323 11.8123 23.7443 11.4763 23.7443C7.33232 22.4003 4.42032 18.5923 4.42032 14.1123C4.42032 9.63231 7.33232 5.82431 11.4763 4.48031C11.8123 4.36831 12.0363 4.59231 12.0363 4.92831V5.71231C12.0363 5.93631 11.9243 6.16031 11.7003 6.27231C8.45232 7.50431 6.21232 10.5283 6.21232 14.1123C6.21232 17.6963 8.56432 20.8323 11.7003 21.9523C11.9243 22.0643 12.0363 22.2883 12.0363 22.5123V23.2963Z" fill="white"></path><path d="M15.3965 20.4963C15.3965 20.7203 15.1725 20.9443 14.9485 20.9443H14.0525C13.8285 20.9443 13.6045 20.7203 13.6045 20.4963V19.1523C11.8125 18.9283 10.9165 17.9203 10.5805 16.4643C10.5805 16.2403 10.6925 16.0163 10.9165 16.0163H11.9245C12.1485 16.0163 12.2605 16.1283 12.3725 16.3523C12.5965 17.1363 13.0445 17.8083 14.5005 17.8083C15.6205 17.8083 16.4045 17.2483 16.4045 16.3523C16.4045 15.4563 15.9565 15.1203 14.3885 14.8963C12.0365 14.5603 10.9165 13.8883 10.9165 11.9843C10.9165 10.5283 12.0365 9.40833 13.6045 9.18433V7.84033C13.6045 7.61633 13.8285 7.39233 14.0525 7.39233H14.9485C15.1725 7.39233 15.3965 7.61633 15.3965 7.84033V9.18433C16.7405 9.40833 17.6365 10.1923 17.8605 11.4243C17.8605 11.6483 17.7485 11.8723 17.5245 11.8723H16.6285C16.4045 11.8723 16.2925 11.7603 16.1805 11.5363C15.9565 10.7523 15.3965 10.4163 14.3885 10.4163C13.2685 10.4163 12.7085 10.9763 12.7085 11.7603C12.7085 12.5443 13.0445 12.9923 14.7245 13.2163C17.0765 13.5523 18.1965 14.2243 18.1965 16.1283C18.1965 17.5843 17.0765 18.8163 15.3965 19.1523V20.4963Z" fill="white"></path><path d="M17.5239 23.7442C17.1879 23.8562 16.9639 23.6322 16.9639 23.2962V22.5122C16.9639 22.2882 17.0759 22.0642 17.2999 21.9522C20.5479 20.7202 22.7879 17.6962 22.7879 14.1122C22.7879 10.5282 20.4359 7.39222 17.2999 6.27222C17.0759 6.16022 16.9639 5.93622 16.9639 5.71222V4.92822C16.9639 4.59222 17.1879 4.48022 17.5239 4.48022C21.5559 5.82422 24.5799 9.63222 24.5799 14.1122C24.5799 18.5922 21.6679 22.4002 17.5239 23.7442Z" fill="white"></path></g></g><defs><clipPath id="clip0"><rect width="28" height="28" fill="white" transform="translate(0.5)"></rect></clipPath><clipPath id="clip1"><rect width="22.4" height="22.4" fill="white" transform="translate(3.29999 2.80005)"></rect></clipPath></defs>
            </svg>
          <span style={{color: 'black', "padding-left": "0.25rem", "padding-right": "0.5rem"}}>USDC</span>


        </div>
            <div> Weight</div>

        <div className={inputStyles.AmountInputField}>
              <span></span>
              <input 
                type="text"
                placeholder="0x..."
                value={ amount }
                onChange={(e) => {
                  if (/^\d*\.?\d*$/.test(e.target.value)) {
                    setAmount(e.target.value);
                  }
                }}
              />

             {/* <button className={buttonStyles.BaseNormalButtonTiny}><span>Max</span></button>*/}
          
               {/* <svg width="29" height="28" viewBox="0 0 29 28" fill="none">
                  <g><circle cx="14.5" cy="14" r="14" fill="#3A76C3"></circle><g><path d="M12.0363 23.2963C12.0363 23.6323 11.8123 23.7443 11.4763 23.7443C7.33232 22.4003 4.42032 18.5923 4.42032 14.1123C4.42032 9.63231 7.33232 5.82431 11.4763 4.48031C11.8123 4.36831 12.0363 4.59231 12.0363 4.92831V5.71231C12.0363 5.93631 11.9243 6.16031 11.7003 6.27231C8.45232 7.50431 6.21232 10.5283 6.21232 14.1123C6.21232 17.6963 8.56432 20.8323 11.7003 21.9523C11.9243 22.0643 12.0363 22.2883 12.0363 22.5123V23.2963Z" fill="white"></path><path d="M15.3965 20.4963C15.3965 20.7203 15.1725 20.9443 14.9485 20.9443H14.0525C13.8285 20.9443 13.6045 20.7203 13.6045 20.4963V19.1523C11.8125 18.9283 10.9165 17.9203 10.5805 16.4643C10.5805 16.2403 10.6925 16.0163 10.9165 16.0163H11.9245C12.1485 16.0163 12.2605 16.1283 12.3725 16.3523C12.5965 17.1363 13.0445 17.8083 14.5005 17.8083C15.6205 17.8083 16.4045 17.2483 16.4045 16.3523C16.4045 15.4563 15.9565 15.1203 14.3885 14.8963C12.0365 14.5603 10.9165 13.8883 10.9165 11.9843C10.9165 10.5283 12.0365 9.40833 13.6045 9.18433V7.84033C13.6045 7.61633 13.8285 7.39233 14.0525 7.39233H14.9485C15.1725 7.39233 15.3965 7.61633 15.3965 7.84033V9.18433C16.7405 9.40833 17.6365 10.1923 17.8605 11.4243C17.8605 11.6483 17.7485 11.8723 17.5245 11.8723H16.6285C16.4045 11.8723 16.2925 11.7603 16.1805 11.5363C15.9565 10.7523 15.3965 10.4163 14.3885 10.4163C13.2685 10.4163 12.7085 10.9763 12.7085 11.7603C12.7085 12.5443 13.0445 12.9923 14.7245 13.2163C17.0765 13.5523 18.1965 14.2243 18.1965 16.1283C18.1965 17.5843 17.0765 18.8163 15.3965 19.1523V20.4963Z" fill="white"></path><path d="M17.5239 23.7442C17.1879 23.8562 16.9639 23.6322 16.9639 23.2962V22.5122C16.9639 22.2882 17.0759 22.0642 17.2999 21.9522C20.5479 20.7202 22.7879 17.6962 22.7879 14.1122C22.7879 10.5282 20.4359 7.39222 17.2999 6.27222C17.0759 6.16022 16.9639 5.93622 16.9639 5.71222V4.92822C16.9639 4.59222 17.1879 4.48022 17.5239 4.48022C21.5559 5.82422 24.5799 9.63222 24.5799 14.1122C24.5799 18.5922 21.6679 22.4002 17.5239 23.7442Z" fill="white"></path></g></g><defs><clipPath id="clip0"><rect width="28" height="28" fill="white" transform="translate(0.5)"></rect></clipPath><clipPath id="clip1"><rect width="22.4" height="22.4" fill="white" transform="translate(3.29999 2.80005)"></rect></clipPath></defs>
                </svg> */}
              <span style={{color: 'black', "padding-left": "0.25rem", "padding-right": "0.5rem"}}>USDC</span>
        </div>

         <span> <PrimaryThemeButton action={()=> setInstruments(prev => {
                const item = {instrument, ratio}
                setInstrument("")
                setRatio("")
                prev.push(item)
                return prev;
            })}  text={"Add"}/>  </span>
    </div>
            { vaultItems }

         {/* <h3>Vaults</h3> */}
       {/*     <br />
            <h4>Add New Vault</h4>
            <div>
                <label>address</label>
                <input
                    type="text"
                    onChange={(e)=> {
                        setInstrument(e.target.value)
                    }}
                />
            </div>
            <div>
                <label>ratio</label>
                <input
                    type="text"
                    onChange={(e)=> {
                        setRatio(e.target.value)
                    }}
                />
             </div> */}

   

    </div>
    )          
}

const CreationAmountInput = ({type, amount, setAmount})=>{
    const titles = ["Underlying Address", "Senior Weight"]
    const placeholders = ["paste address of underlying token", "Senior weight, in 0 to 1"]
    return ( 

     <div className={inputStyles.AmountInput}>
        <label>{titles[type]}</label>

        <div className={inputStyles.AmountInputField}>
          <span></span>
          <input 
            type="text"
            placeholder={placeholders[type]}
            value={ amount }
            onChange={(e) => {
              if (/^\d*\.?\d*$/.test(e.target.value)) {
                setAmount(e.target.value);
              }
            }}
          />

         {/* <button className={buttonStyles.BaseNormalButtonTiny}><span>Max</span></button>*/}
      
            <svg width="29" height="28" viewBox="0 0 29 28" fill="none">
              <g><circle cx="14.5" cy="14" r="14" fill="#3A76C3"></circle><g><path d="M12.0363 23.2963C12.0363 23.6323 11.8123 23.7443 11.4763 23.7443C7.33232 22.4003 4.42032 18.5923 4.42032 14.1123C4.42032 9.63231 7.33232 5.82431 11.4763 4.48031C11.8123 4.36831 12.0363 4.59231 12.0363 4.92831V5.71231C12.0363 5.93631 11.9243 6.16031 11.7003 6.27231C8.45232 7.50431 6.21232 10.5283 6.21232 14.1123C6.21232 17.6963 8.56432 20.8323 11.7003 21.9523C11.9243 22.0643 12.0363 22.2883 12.0363 22.5123V23.2963Z" fill="white"></path><path d="M15.3965 20.4963C15.3965 20.7203 15.1725 20.9443 14.9485 20.9443H14.0525C13.8285 20.9443 13.6045 20.7203 13.6045 20.4963V19.1523C11.8125 18.9283 10.9165 17.9203 10.5805 16.4643C10.5805 16.2403 10.6925 16.0163 10.9165 16.0163H11.9245C12.1485 16.0163 12.2605 16.1283 12.3725 16.3523C12.5965 17.1363 13.0445 17.8083 14.5005 17.8083C15.6205 17.8083 16.4045 17.2483 16.4045 16.3523C16.4045 15.4563 15.9565 15.1203 14.3885 14.8963C12.0365 14.5603 10.9165 13.8883 10.9165 11.9843C10.9165 10.5283 12.0365 9.40833 13.6045 9.18433V7.84033C13.6045 7.61633 13.8285 7.39233 14.0525 7.39233H14.9485C15.1725 7.39233 15.3965 7.61633 15.3965 7.84033V9.18433C16.7405 9.40833 17.6365 10.1923 17.8605 11.4243C17.8605 11.6483 17.7485 11.8723 17.5245 11.8723H16.6285C16.4045 11.8723 16.2925 11.7603 16.1805 11.5363C15.9565 10.7523 15.3965 10.4163 14.3885 10.4163C13.2685 10.4163 12.7085 10.9763 12.7085 11.7603C12.7085 12.5443 13.0445 12.9923 14.7245 13.2163C17.0765 13.5523 18.1965 14.2243 18.1965 16.1283C18.1965 17.5843 17.0765 18.8163 15.3965 19.1523V20.4963Z" fill="white"></path><path d="M17.5239 23.7442C17.1879 23.8562 16.9639 23.6322 16.9639 23.2962V22.5122C16.9639 22.2882 17.0759 22.0642 17.2999 21.9522C20.5479 20.7202 22.7879 17.6962 22.7879 14.1122C22.7879 10.5282 20.4359 7.39222 17.2999 6.27222C17.0759 6.16022 16.9639 5.93622 16.9639 5.71222V4.92822C16.9639 4.59222 17.1879 4.48022 17.5239 4.48022C21.5559 5.82422 24.5799 9.63222 24.5799 14.1122C24.5799 18.5922 21.6679 22.4002 17.5239 23.7442Z" fill="white"></path></g></g><defs><clipPath id="clip0"><rect width="28" height="28" fill="white" transform="translate(0.5)"></rect></clipPath><clipPath id="clip1"><rect width="22.4" height="22.4" fill="white" transform="translate(3.29999 2.80005)"></rect></clipPath></defs>
            </svg>
          <span style={{color: 'black', "padding-left": "0.25rem", "padding-right": "0.5rem"}}>USDC</span>
        </div>
        {/*<label>Vault Address</label>

        <div className={inputStyles.AmountInputField}>
          <span></span>
          <input 
            type="text"
            placeholder="0x..."
            value={ amount }
            onChange={(e) => {
              if (/^\d*\.?\d*$/.test(e.target.value)) {
                setAmount(e.target.value);
              }
            }}
          /> 
 
      
            <svg width="29" height="28" viewBox="0 0 29 28" fill="none">
              <g><circle cx="14.5" cy="14" r="14" fill="#3A76C3"></circle><g><path d="M12.0363 23.2963C12.0363 23.6323 11.8123 23.7443 11.4763 23.7443C7.33232 22.4003 4.42032 18.5923 4.42032 14.1123C4.42032 9.63231 7.33232 5.82431 11.4763 4.48031C11.8123 4.36831 12.0363 4.59231 12.0363 4.92831V5.71231C12.0363 5.93631 11.9243 6.16031 11.7003 6.27231C8.45232 7.50431 6.21232 10.5283 6.21232 14.1123C6.21232 17.6963 8.56432 20.8323 11.7003 21.9523C11.9243 22.0643 12.0363 22.2883 12.0363 22.5123V23.2963Z" fill="white"></path><path d="M15.3965 20.4963C15.3965 20.7203 15.1725 20.9443 14.9485 20.9443H14.0525C13.8285 20.9443 13.6045 20.7203 13.6045 20.4963V19.1523C11.8125 18.9283 10.9165 17.9203 10.5805 16.4643C10.5805 16.2403 10.6925 16.0163 10.9165 16.0163H11.9245C12.1485 16.0163 12.2605 16.1283 12.3725 16.3523C12.5965 17.1363 13.0445 17.8083 14.5005 17.8083C15.6205 17.8083 16.4045 17.2483 16.4045 16.3523C16.4045 15.4563 15.9565 15.1203 14.3885 14.8963C12.0365 14.5603 10.9165 13.8883 10.9165 11.9843C10.9165 10.5283 12.0365 9.40833 13.6045 9.18433V7.84033C13.6045 7.61633 13.8285 7.39233 14.0525 7.39233H14.9485C15.1725 7.39233 15.3965 7.61633 15.3965 7.84033V9.18433C16.7405 9.40833 17.6365 10.1923 17.8605 11.4243C17.8605 11.6483 17.7485 11.8723 17.5245 11.8723H16.6285C16.4045 11.8723 16.2925 11.7603 16.1805 11.5363C15.9565 10.7523 15.3965 10.4163 14.3885 10.4163C13.2685 10.4163 12.7085 10.9763 12.7085 11.7603C12.7085 12.5443 13.0445 12.9923 14.7245 13.2163C17.0765 13.5523 18.1965 14.2243 18.1965 16.1283C18.1965 17.5843 17.0765 18.8163 15.3965 19.1523V20.4963Z" fill="white"></path><path d="M17.5239 23.7442C17.1879 23.8562 16.9639 23.6322 16.9639 23.2962V22.5122C16.9639 22.2882 17.0759 22.0642 17.2999 21.9522C20.5479 20.7202 22.7879 17.6962 22.7879 14.1122C22.7879 10.5282 20.4359 7.39222 17.2999 6.27222C17.0759 6.16022 16.9639 5.93622 16.9639 5.71222V4.92822C16.9639 4.59222 17.1879 4.48022 17.5239 4.48022C21.5559 5.82422 24.5799 9.63222 24.5799 14.1122C24.5799 18.5922 21.6679 22.4002 17.5239 23.7442Z" fill="white"></path></g></g><defs><clipPath id="clip0"><rect width="28" height="28" fill="white" transform="translate(0.5)"></rect></clipPath><clipPath id="clip1"><rect width="22.4" height="22.4" fill="white" transform="translate(3.29999 2.80005)"></rect></clipPath></defs>
            </svg>
          <span style={{color: 'black', "padding-left": "0.25rem", "padding-right": "0.5rem"}}>USDC</span>
        </div> */}
    </div>

)       
}
const DurationInput = ({onChange, label, value}) => {
    return (
    <>
    <label>{ label }</label>
    <input
        type="text"
        placeholder="0"
        value={ value }
        onChange={ onChange }
    />
    <br />
    </>
    );
}

const CreateVaultView = () => {
    const { account, loginAccount } = useUserStore()

    interface VaultItem {
        instrument: string,
        ratio: string
    }

    const [ asset, setAsset ] = useState("")
    const [ instruments, setInstruments ] = useState<VaultItem[]>([])
    const [ juniorWeight, setJuniorWeight ] = useState("")
    const [ vaultId, setVaultId ] = useState("")
    const [ promisedReturn, setPromisedReturn ] = useState("")
    const [ instrument, setInstrument] = useState("")
    const [ ratio, setRatio ] = useState("")
    const [amount_, setAmount_] = useState("0"); 
    const [ duration, setDuration ] = useState({
        years: "0",
        weeks: "0",
        days: "0",
        minutes: "0",
    });

    console.log("instruments: ", instruments);

    const reset = () => {
        setInstrument("")
        setRatio("")
        setAsset("")
        setInstruments([])
        setVaultId("")
        setDuration({
            years: "0",
            weeks: "0",
            days: "0",
            minutes: "0",
        })    
    }
    const dropDownProps = {
        onChange: (val) => setAsset(val),
        options: [
            {
                label: "USDC",
                value: "USDC ADDRESS HERE"
            },
            {
                label: "DAI",
                value: "DAI ADDRESS HERE"
            }
        ]
    }

    const vaultItems = instruments.map((item, i) => {
        
        return (
            <li key={item.instrument}>
                <label>Address: {item.instrument}</label>
                <label>Ratio: {item.ratio}</label>
                <TinyThemeButton action={() => { setInstruments((prev)=>{
                    prev.splice(i,1);
                    return prev
                })}} text="x"/>
            </li>
        )
    });


    const create = useCallback(async () => {
        console.log("here")
        console.log(account)
        console.log(loginAccount.library)
        if (account && loginAccount) {
            console.log("calling createSuperVault")
            let addrs = instruments.map(i => i.instrument)
            let ratios = instruments.map(i => i.ratio)
            let total_duration = new BN(365*24*60*60*Number(duration.years) + 7*24*60*60*Number(duration.weeks) + 24*60*60*Number(duration.days) + 60*Number(duration.minutes)).toString();
            console.log("asset: ", asset)
            console.log("instruments: ", addrs)
            console.log("ratios: ", ratios)
            console.log("juniorWeight: ", juniorWeight)
            console.log("promisedReturn: ", promisedReturn)
            // let tx = await createSuperVault(account, loginAccount.library, {
            //     _want: asset,
            //     _instruments: addrs,
            //     _ratios: ratios,
            //     _junior_weight: juniorWeight,
            //     _promisedReturn: promisedReturn,
            //     _time_to_maturity: total_duration,
            //     vaultId: vaultId
            // });
            // await tx.wait(5);   
            reset()        
        }
    })

    return (
        <>
            <section className={marketStyles.mintView}>
                <h2>
                    Create Super Vault
                </h2>
                <div>

                    {/*<h3>Vault Duration</h3> */}
                    <br />
            <h1>Step 1: Choose Underlying</h1>
                    <CreationAmountInput type = {0} amount = {amount_} setAmount = {setAmount_}/>
            <h1>Step 2: Include Vaults to pool and split</h1>

                    <VaultInput  amount = {amount_} setAmount = {setAmount_}/>
            <h1>Step 3: Choose SuperVault Parameters</h1>

                    <CreationAmountInput type = {1} amount = {amount_} setAmount = {setAmount_}/>
                    <CreationAmountInput type = {1} amount = {amount_} setAmount = {setAmount_}/>

                   {/* <DurationInput label="years" value={duration.years} onChange={(e)=> {
                        if (/^\d*$/.test(e.target.value)) {
                        setDuration((prev) => { return {...prev, years: e.target.value}})
                        }
                    }}/>
                    <DurationInput label="weeks" value={duration.weeks} onChange={(e)=> {
                        if (/^\d*$/.test(e.target.value)) {
                        setDuration((prev) => { return {...prev, weeks: e.target.value}})
                        }
                    }}/>
                    <DurationInput label="days" value={duration.days} onChange={(e)=> {
                        if (/^\d*$/.test(e.target.value)) {
                        setDuration((prev) => { return {...prev, days: e.target.value}})
                        }
                    }}/>
                    <DurationInput label="minutes" value={duration.minutes} onChange={(e)=> {
                        if (/^\d*$/.test(e.target.value)) {
                        setDuration((prev) => { return {...prev, minutes: e.target.value}})
                        }
                    }}/> */ }
                </div>
                <div>
                    <h3>Underlying Asset</h3>
                    <SquareDropdown {...dropDownProps} />
                </div>
                <div>
                    <h3>Junior Weight (between 0 and 100%)</h3>
                    <input
                        type="text"
                        onChange={(e)=>{
                            if (/^\d*\.?\d*$/.test(e.target.value)) {
                                setJuniorWeight(e.target.value)
                            }
                        }}
                        value={ juniorWeight }
                    />
                </div>
                <div>
                    <h3>Expected Returns</h3>
                    <input
                        type="text"
                        onChange={(e)=>{
                            if (/^\d*\.?\d*$/.test(e.target.value)) {
                                setPromisedReturn(e.target.value)
                            }
                        }}
                        value={ promisedReturn }
                    />
                    
                </div>
                <div>
                    <h3>Vaults</h3>
                    { vaultItems }
                    <br />
                    <h4>Add New Vault</h4>
                    <div>
                        <label>address</label>
                        <input
                            type="text"
                            onChange={(e)=> {
                                setInstrument(e.target.value)
                            }}
                        />
                    </div>
                    <div>
                        <label>ratio</label>
                        <input
                            type="text"
                            onChange={(e)=> {
                                setRatio(e.target.value)
                            }}
                        />
                    </div>
                    <SecondaryThemeButton action={()=> setInstruments(prev => {
                        const item = {instrument, ratio}
                        setInstrument("")
                        setRatio("")
                        prev.push(item)
                        return prev;
                    })}  text={"Add"}/>
                </div>
                <div>
                    <h3>Vault Id: </h3>
                    <input 
                        type="text" 
                        value={vaultId}
                        onChange={(e) => {
                            if (/\d*/.test(e.target.value)) {
                                setVaultId(e.target.value)
                            }
                        }}
                    />
                </div>
                <PrimaryThemeButton action={create}  text={"Create"}/>
            </section>
        </>
    )
};

export default CreateVaultView