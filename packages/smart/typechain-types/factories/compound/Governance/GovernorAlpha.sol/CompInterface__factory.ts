/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  CompInterface,
  CompInterfaceInterface,
} from "../../../../compound/Governance/GovernorAlpha.sol/CompInterface";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "blockNumber",
        type: "uint256",
      },
    ],
    name: "getPriorVotes",
    outputs: [
      {
        internalType: "uint96",
        name: "",
        type: "uint96",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

export class CompInterface__factory {
  static readonly abi = _abi;
  static createInterface(): CompInterfaceInterface {
    return new utils.Interface(_abi) as CompInterfaceInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): CompInterface {
    return new Contract(address, _abi, signerOrProvider) as CompInterface;
  }
}
