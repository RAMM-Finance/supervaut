/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../common";
import type {
  ComptrollerV4Storage,
  ComptrollerV4StorageInterface,
} from "../../../compound/ComptrollerStorage.sol/ComptrollerV4Storage";

const _abi = [
  {
    inputs: [],
    name: "_borrowGuardianPaused",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "_mintGuardianPaused",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "accountAssets",
    outputs: [
      {
        internalType: "contract CToken",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "admin",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "allMarkets",
    outputs: [
      {
        internalType: "contract CToken",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "borrowCapGuardian",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "borrowCaps",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "borrowGuardianPaused",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "closeFactorMantissa",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "compAccrued",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "compBorrowState",
    outputs: [
      {
        internalType: "uint224",
        name: "index",
        type: "uint224",
      },
      {
        internalType: "uint32",
        name: "block",
        type: "uint32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "compBorrowerIndex",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "compRate",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "compSpeeds",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "compSupplierIndex",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "compSupplyState",
    outputs: [
      {
        internalType: "uint224",
        name: "index",
        type: "uint224",
      },
      {
        internalType: "uint32",
        name: "block",
        type: "uint32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "comptrollerImplementation",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "liquidationIncentiveMantissa",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "markets",
    outputs: [
      {
        internalType: "bool",
        name: "isListed",
        type: "bool",
      },
      {
        internalType: "uint256",
        name: "collateralFactorMantissa",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "isComped",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "maxAssets",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "mintGuardianPaused",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "oracle",
    outputs: [
      {
        internalType: "contract PriceOracle",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "pauseGuardian",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "pendingAdmin",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "pendingComptrollerImplementation",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "seizeGuardianPaused",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "transferGuardianPaused",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b50610637806100206000396000f3fe608060405234801561001057600080fd5b50600436106101a95760003560e01c80638c57804e116100f9578063ca0af04311610097578063dcfbc0c711610071578063dcfbc0c7146104a8578063e6653f3d146104bb578063e8755446146104cf578063f851a440146104d857600080fd5b8063ca0af0431461044a578063cc7ebdc414610475578063dce154491461049557600080fd5b8063aa900754116100d3578063aa900754146103ef578063ac0b0bb7146103f8578063b21be7fd1461040c578063bb82aa5e1461043757600080fd5b80638c57804e1461035b5780638e8f294b1461039357806394b2294b146103e657600080fd5b80634ada90af116101665780636d154ea5116101405780636d154ea5146102ee578063731f0c2b146103115780637dc0d1d01461033457806387f763031461034757600080fd5b80634ada90af1461027657806352d84d1e1461027f5780636b79c38d1461029257600080fd5b80631d7b33d7146101ae57806321af4569146101e157806324a3d6221461020c578063267822471461021f5780633c94786f146102325780634a58443214610256575b600080fd5b6101ce6101bc366004610569565b600f6020526000908152604090205481565b6040519081526020015b60405180910390f35b6015546101f4906001600160a01b031681565b6040516001600160a01b0390911681526020016101d8565b600a546101f4906001600160a01b031681565b6001546101f4906001600160a01b031681565b600a5461024690600160a01b900460ff1681565b60405190151581526020016101d8565b6101ce610264366004610569565b60166020526000908152604090205481565b6101ce60065481565b6101f461028d36600461058b565b6104eb565b6102ca6102a0366004610569565b6010602052600090815260409020546001600160e01b03811690600160e01b900463ffffffff1682565b604080516001600160e01b03909316835263ffffffff9091166020830152016101d8565b6102466102fc366004610569565b600c6020526000908152604090205460ff1681565b61024661031f366004610569565b600b6020526000908152604090205460ff1681565b6004546101f4906001600160a01b031681565b600a5461024690600160b01b900460ff1681565b6102ca610369366004610569565b6011602052600090815260409020546001600160e01b03811690600160e01b900463ffffffff1682565b6103c76103a1366004610569565b60096020526000908152604090208054600182015460039092015460ff91821692911683565b60408051931515845260208401929092521515908201526060016101d8565b6101ce60075481565b6101ce600e5481565b600a5461024690600160b81b900460ff1681565b6101ce61041a3660046105a4565b601260209081526000928352604080842090915290825290205481565b6002546101f4906001600160a01b031681565b6101ce6104583660046105a4565b601360209081526000928352604080842090915290825290205481565b6101ce610483366004610569565b60146020526000908152604090205481565b6101f46104a33660046105d7565b610515565b6003546101f4906001600160a01b031681565b600a5461024690600160a81b900460ff1681565b6101ce60055481565b6000546101f4906001600160a01b031681565b600d81815481106104fb57600080fd5b6000918252602090912001546001600160a01b0316905081565b6008602052816000526040600020818154811061053157600080fd5b6000918252602090912001546001600160a01b03169150829050565b80356001600160a01b038116811461056457600080fd5b919050565b60006020828403121561057b57600080fd5b6105848261054d565b9392505050565b60006020828403121561059d57600080fd5b5035919050565b600080604083850312156105b757600080fd5b6105c08361054d565b91506105ce6020840161054d565b90509250929050565b600080604083850312156105ea57600080fd5b6105f38361054d565b94602093909301359350505056fea264697066735822122051a983abe757b9ddaa1b1d4813b3701e915c24ef0c03531da816b978eed3fc0364736f6c634300080a0033";

type ComptrollerV4StorageConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: ComptrollerV4StorageConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class ComptrollerV4Storage__factory extends ContractFactory {
  constructor(...args: ComptrollerV4StorageConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ComptrollerV4Storage> {
    return super.deploy(overrides || {}) as Promise<ComptrollerV4Storage>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): ComptrollerV4Storage {
    return super.attach(address) as ComptrollerV4Storage;
  }
  override connect(signer: Signer): ComptrollerV4Storage__factory {
    return super.connect(signer) as ComptrollerV4Storage__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): ComptrollerV4StorageInterface {
    return new utils.Interface(_abi) as ComptrollerV4StorageInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): ComptrollerV4Storage {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as ComptrollerV4Storage;
  }
}
