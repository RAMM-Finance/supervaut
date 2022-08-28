import abi from "./TrustedMarketFactoryV3.json"

export const TrustedMarketFactoryV3ABI = abi.abi; 
export const TrustedMarketFactoryV3Address = "0xD6D42E84C4127E71eD55eEecdfcBCF24e1c059E4"; 
//export const marketFactoryAddress = "0x453693835A40289553b155F354f7a45819c7753D";
// export const marketFactoryAddress = TrustedMarketFactoryV3Address;
export const settlementAddress = "0xFD84b7AC1E646580db8c77f1f05F47977fAda692";
//export const dsAddress = "0xc90AfD78f79068184d79beA3b615cAB32D0DC45D";
export const dsAddress = "0xb21ae1581F747C7913B9d8e3026A949f0cB0221b"
export const lendingPooladdress = "0xC2fcC51189466E37C2127e1A7dac86A14083164f"
export const usdc =  "0x5799bFe361BEea69f808328FF4884DF92f1f66f0";
export const collateral_address = "0x5799bFe361BEea69f808328FF4884DF92f1f66f0";
export const ammFactoryAddress = "0x7fc5F526A8be47f9D6460b26D59532C35bd54931";
export const indexCDSAddress = "0x2c0abcBfB23ffa8994bf603a766a037228ca6C27";
export const deployer_pk = "5505f9ddf81b3aa83661c849fe8d56ea7a02dd3ede636f47296d85a7fc4e3bd6";
export const zeke_test_account = "0x2C7Cb3cB22Ba9B322af60747017acb06deB10933";
export const chefAddress = "0x42a0549a4063378cb96cac64ffb434da1e2817bd";

export const PRICE_PRECISION = 6;

// SUPER VAULT BROS
export const trancheFactoryAddress = "0x0C3DFeE94E2Db42ce550EE86845c8C1E4495f4EC";
export const trancheMasterAddress = "0x6F4A9507b18637396D49A99b67e5979a8eb04A98";
export const testVault1Address = "0xdc2Cc9719FE2Da9d5B16475595C77DF049CD7b1F"; 
export const testVault2Address = "0xA9729DC13825b3d4400353B6BF1F9e6F5338cb25"; 

// export const splitterFactoryAddress = "0x6ca985c180287fC6312e268221c64866BB49B9b3"; 
// export const trancheAMMFactoryAddress = "0xe8Bbb18D0cd6EB4a2BBd1CdF583A23DE3F533Fc4"; 


// DEBITA 2.0
//Jeong tests:
// export const controller_address = "0x7d90D8190195E1435a4db20cFdF0764B75DDF649";
// export const Vault_address = "0x8c05D03eff257e7d0E5711F4Ab4cd2277cB9B119";
// export const MM_address = "0xfc5410f1985C59f7924868FFd8f95B86EfE9eB9D";
// export const Controller_address = "0x7d90D8190195E1435a4db20cFdF0764B75DDF649";
// export const RepNFT_address = "0x745c04eEAb4C90E242130460919dFe8ED0845725";
// export const sample_instument_address = "0x518662466dfcad248968808F07f5066176bda060"; 
// export const marketFactoryAddress = "0x21Bf714953425a08a94F62913e93f49259b4cf0d"

export const controller_address = "0x4391d7acba8303740918308b119AAb956d7e6473";
export const Vault_address = "0x3C95067507C0346e40439E46dD9FFce3eF4F264E";
export const MM_address = "0x5A6a4CC20047088A2ec5bd4E1F9D09eCD6dd1CC3";
export const RepNFT_address = "0x25917226cC1f16F055e20D36e0146905903b7F2F";
export const sample_instument_address = "0x3667a4FFAbd519960d8E3e4C1d781E3A9Af40e2F"; 
export const marketFactoryAddress = "0x0559B2a21d6479b9a03ea835D83895f5aEE47C5f";


// deploying "Controller" (tx: 0xc175a94dd1233115dd98b37d409301f78027af2bda6c830fdfd954e3f56dda2b)...: deployed at 0x4391d7acba8303740918308b119AAb956d7e6473 with 6578772 gas
// deploying "ReputationNFT" (tx: 0xc954749054c7ed97f3cadc35b290b5f81dd9f29d24a2f3d009b0edee7b721afa)...: deployed at 0x25917226cC1f16F055e20D36e0146905903b7F2F with 1168626 gas
// deploying "MarketManager" (tx: 0x262541b8ee7e23b95c43f9445a4821dcc45cf80e421e1778dec4428b21243881)...: deployed at 0x5A6a4CC20047088A2ec5bd4E1F9D09eCD6dd1CC3 with 3753012 gas
// deploying "Vault" (tx: 0xb88aaeee453eab0f0094e62b5189e4f2cf52b8ad74e929daab4f39f5fe40f049)...: deployed at 0x3C95067507C0346e40439E46dD9FFce3eF4F264E with 3103729 gas
// deploying "CreditLine" (tx: 0xf4d43efa4c9f4128351aa2fcbe64a520da5dedf8dc4498f762565fa32d304b3e)...: deployed at 0x3667a4FFAbd519960d8E3e4C1d781E3A9Af40e2F with 838924 gas
// deploying "TrustedMarketFactoryV3" (tx: 0x6814eacdc84f4ad1c187b0793587af304d3e4de4192869875b79f1b1cde1e632)...: deployed at 0x0559B2a21d6479b9a03ea835D83895f5aEE47C5f with 3958784 gas

// reusing "TrustedMarketFactoryV3" at 0x1Acf78fc24925F119c003F84c2Ca0Bd6aCC45469
// reusing "TrustedFetcher" at 0xb5DE4b75513609483506d36f071E81D9e802bB49
// reusing "TrancheAMMFactory" at 0x332c842cd9ac69764Bd0bB58ab979AE941475ddB
// reusing "SplitterFactory" at 0x7fE68Dc2f40dcBab1d919D887A6e9e5CB61f73A8
// reusing "TrancheFactory" at 0x0C3DFeE94E2Db42ce550EE86845c8C1E4495f4EC
// reusing "TrancheMaster" at 0x6F4A9507b18637396D49A99b67e5979a8eb04A98
// deploying "testVault1" (tx: 0x18050b405b192524f5ac6e2dc6dfe16df7ac34c7f4d0364ae814bf737b82f060)...: deployed at 0xdc2Cc9719FE2Da9d5B16475595C77DF049CD7b1F with 2534113 gas
// deploying "testVault2" (tx: 0x1363f04fa653869ad39cc161b00089c238b53628d30dbc1c192761cce92fd2d9)...: deployed at 0xA9729DC13825b3d4400353B6BF1F9e6F5338cb25 with 2534113 gas