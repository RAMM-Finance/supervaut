/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from "../../../common";

export interface ComptrollerLensInterfaceInterface extends utils.Interface {
  functions: {
    "borrowCaps(address)": FunctionFragment;
    "claimComp(address)": FunctionFragment;
    "compAccrued(address)": FunctionFragment;
    "compBorrowSpeeds(address)": FunctionFragment;
    "compSpeeds(address)": FunctionFragment;
    "compSupplySpeeds(address)": FunctionFragment;
    "getAccountLiquidity(address)": FunctionFragment;
    "getAssetsIn(address)": FunctionFragment;
    "markets(address)": FunctionFragment;
    "oracle()": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "borrowCaps"
      | "claimComp"
      | "compAccrued"
      | "compBorrowSpeeds"
      | "compSpeeds"
      | "compSupplySpeeds"
      | "getAccountLiquidity"
      | "getAssetsIn"
      | "markets"
      | "oracle"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "borrowCaps",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "claimComp",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "compAccrued",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "compBorrowSpeeds",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "compSpeeds",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "compSupplySpeeds",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "getAccountLiquidity",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "getAssetsIn",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "markets",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(functionFragment: "oracle", values?: undefined): string;

  decodeFunctionResult(functionFragment: "borrowCaps", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "claimComp", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "compAccrued",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "compBorrowSpeeds",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "compSpeeds", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "compSupplySpeeds",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getAccountLiquidity",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getAssetsIn",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "markets", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "oracle", data: BytesLike): Result;

  events: {};
}

export interface ComptrollerLensInterface extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: ComptrollerLensInterfaceInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    borrowCaps(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    claimComp(
      arg0: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    compAccrued(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    compBorrowSpeeds(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    compSpeeds(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    compSupplySpeeds(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    getAccountLiquidity(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[BigNumber, BigNumber, BigNumber]>;

    getAssetsIn(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[string[]]>;

    markets(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[boolean, BigNumber]>;

    oracle(overrides?: CallOverrides): Promise<[string]>;
  };

  borrowCaps(
    arg0: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  claimComp(
    arg0: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  compAccrued(
    arg0: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  compBorrowSpeeds(
    arg0: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  compSpeeds(
    arg0: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  compSupplySpeeds(
    arg0: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  getAccountLiquidity(
    arg0: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<[BigNumber, BigNumber, BigNumber]>;

  getAssetsIn(
    arg0: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<string[]>;

  markets(
    arg0: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<[boolean, BigNumber]>;

  oracle(overrides?: CallOverrides): Promise<string>;

  callStatic: {
    borrowCaps(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    claimComp(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    compAccrued(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    compBorrowSpeeds(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    compSpeeds(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    compSupplySpeeds(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getAccountLiquidity(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[BigNumber, BigNumber, BigNumber]>;

    getAssetsIn(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<string[]>;

    markets(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[boolean, BigNumber]>;

    oracle(overrides?: CallOverrides): Promise<string>;
  };

  filters: {};

  estimateGas: {
    borrowCaps(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    claimComp(
      arg0: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    compAccrued(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    compBorrowSpeeds(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    compSpeeds(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    compSupplySpeeds(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getAccountLiquidity(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getAssetsIn(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    markets(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    oracle(overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
    borrowCaps(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    claimComp(
      arg0: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    compAccrued(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    compBorrowSpeeds(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    compSpeeds(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    compSupplySpeeds(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getAccountLiquidity(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getAssetsIn(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    markets(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    oracle(overrides?: CallOverrides): Promise<PopulatedTransaction>;
  };
}
