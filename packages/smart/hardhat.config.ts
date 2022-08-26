import "@nomiclabs/hardhat-waffle";
import "hardhat-deploy";
import "hardhat-contract-sizer";
import "hardhat-abi-exporter";
import "hardhat-docgen";
import "@tenderly/hardhat-tenderly";
import "hardhat-gas-reporter";
import "hardhat-typechain";


import "./tasks";
import { mapOverObject } from "./src/";
import { HardhatUserConfig, NetworkUserConfig } from "hardhat/types";

const ETHERSCAN_API_KEY = process.env["ETHERSCAN_API_KEY"] || "CH7M2ATCZABP2GIHEF3FREWWQPDFQBSH8G";

export const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";
export const NO_OWNER = "0x0000000000000000000000000000000000000001";

export const config: HardhatUserConfig = {
  paths: {
    artifacts: "./dist/artifacts",
  },
  gasReporter: {
    enabled: !!process.env.REPORT_GAS,
  },
  solidity: {
    compilers: [
      {
        version: "0.8.4",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
          }
      },
      {
        version: "0.7.6",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.6.12",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.6.0",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.5.15",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  namedAccounts: {
    deployer: {
      default: 0, // here this will by default take the first account as deployer
    },
    timelock: {
      default: 1,
      maticMainnet: NO_OWNER,
    },
    interep: {
      default: 1 // testing only. => deploy from separate account.
    },
    protocol: {
      default: 0,
      maticMainnet: NULL_ADDRESS,
    },
    linkNode: {
      default: 0,
      maticMainnet: "0x6FBD37365bac1fC61EAb2b35ba4024B32b136be6",
    },
    // This exists for tests.
    plebeian: {
      default: 1,
      maticMainnet: NULL_ADDRESS,
    },
  },
  networks: {
    localhost: {
      live: false,
      saveDeployments: true,
      tags: ["local"],
      gas: 20_000_000, // hardcoded because ganache ignores the per-tx gasLimit override
      chainId:137, 
            allowUnlimitedContractSize: true,


    },
    hardhat: {
      live: false,
      saveDeployments: true,
      chainId:137,

      tags: ["test", "local"],
      blockGasLimit: 20_000_000, // polygon limit
      gas: 20_000_000, // hardcoded because ganache ignores the per-tx gasLimit override
            allowUnlimitedContractSize: true

    },
    kovan: {
      url: "https://kovan.infura.io/v3/595111ad66e2410784d484708624f7b1",
      gas: 9000000, // to fit createPool calls, which fails to estimate gas correctly
    },
    arbitrumKovan4: {
      url: "https://kovan4.arbitrum.io/rpc",
      chainId: 212984383488152,
      gas: 200000000, // arbitrum has as higher gas limit and cost for contract deploys from contracts
      gasPrice: 1,
    },
    maticMumbai: {
      live: true,
      url: "https://rpc-mumbai.maticvigil.com/v1/d955b11199dbfd5871c21bdc750c994edfa52abd",
      chainId: 80001,
      confirmations: 2,
      accounts: ['5505f9ddf81b3aa83661c849fe8d56ea7a02dd3ede636f47296d85a7fc4e3bd6',
      'f7c11910f42a6cab4436bffea7dca20fed310bd794b7c37a930cc013ae6392d2'],
   gas: 1000000000,
      gasPrice: 10000000000,
            allowUnlimitedContractSize: true

    },
    maticMainnet: {
      live: true,
      url: "https://rpc-mainnet.maticvigil.com/",
      chainId: 137,
      gas: 10000000, // to fit createPool calls, which fails to estimate gas correctly
      gasPrice: 20000000000,
    },
  },
  docgen: {
    path: "./docs",
    clear: true,
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
};

const PRIVATE_KEY = process.env["PRIVATE_KEY"];
if (PRIVATE_KEY && config.networks) {
  config.networks = mapOverObject(config.networks, (network: string, config?: NetworkUserConfig) => {
    if (network !== "hardhat" && config) config.accounts = [PRIVATE_KEY];
    return [network, config];
  });
}

export default config;