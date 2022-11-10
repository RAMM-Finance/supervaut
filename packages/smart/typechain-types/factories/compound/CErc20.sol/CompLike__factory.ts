/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  CompLike,
  CompLikeInterface,
} from "../../../compound/CErc20.sol/CompLike";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "delegatee",
        type: "address",
      },
    ],
    name: "delegate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export class CompLike__factory {
  static readonly abi = _abi;
  static createInterface(): CompLikeInterface {
    return new utils.Interface(_abi) as CompLikeInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): CompLike {
    return new Contract(address, _abi, signerOrProvider) as CompLike;
  }
}
