import { ContractCalls, useUserStore } from "@augurproject/comps";
import { SecondaryThemeButton, TinyThemeButton } from "@augurproject/comps/build/components/common/buttons";
import { SquareDropdown } from "@augurproject/comps/build/components/common/selection";
import { calcWeights } from "@augurproject/comps/build/utils/calculations";
import React, { useState, useCallback } from "react"
import Styles from "./create-view.styles.less"
import BigNumber, { BigNumber as BN } from "bignumber.js";

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
            <section className={Styles.CreateVaultView}>
                <h2>
                    Create Super Vault
                </h2>
                <div>
                    <h3>Vault Duration</h3>
                    <br />
                    <DurationInput label="years" value={duration.years} onChange={(e)=> {
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
                    }}/>
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
                <SecondaryThemeButton action={create}  text={"Create"}/>
            </section>
        </>
    )
};

export default CreateVaultView