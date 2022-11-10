/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type { BaseContract, BigNumber, Signer, utils } from "ethers";
import type { EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from "../../../common";

export interface GovernorBravoEventsInterface extends utils.Interface {
  functions: {};

  events: {
    "NewAdmin(address,address)": EventFragment;
    "NewImplementation(address,address)": EventFragment;
    "NewPendingAdmin(address,address)": EventFragment;
    "ProposalCanceled(uint256)": EventFragment;
    "ProposalCreated(uint256,address,address[],uint256[],string[],bytes[],uint256,uint256,string)": EventFragment;
    "ProposalExecuted(uint256)": EventFragment;
    "ProposalQueued(uint256,uint256)": EventFragment;
    "ProposalThresholdSet(uint256,uint256)": EventFragment;
    "VoteCast(address,uint256,uint8,uint256,string)": EventFragment;
    "VotingDelaySet(uint256,uint256)": EventFragment;
    "VotingPeriodSet(uint256,uint256)": EventFragment;
    "WhitelistAccountExpirationSet(address,uint256)": EventFragment;
    "WhitelistGuardianSet(address,address)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "NewAdmin"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "NewImplementation"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "NewPendingAdmin"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "ProposalCanceled"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "ProposalCreated"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "ProposalExecuted"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "ProposalQueued"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "ProposalThresholdSet"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "VoteCast"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "VotingDelaySet"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "VotingPeriodSet"): EventFragment;
  getEvent(
    nameOrSignatureOrTopic: "WhitelistAccountExpirationSet"
  ): EventFragment;
  getEvent(nameOrSignatureOrTopic: "WhitelistGuardianSet"): EventFragment;
}

export interface NewAdminEventObject {
  oldAdmin: string;
  newAdmin: string;
}
export type NewAdminEvent = TypedEvent<[string, string], NewAdminEventObject>;

export type NewAdminEventFilter = TypedEventFilter<NewAdminEvent>;

export interface NewImplementationEventObject {
  oldImplementation: string;
  newImplementation: string;
}
export type NewImplementationEvent = TypedEvent<
  [string, string],
  NewImplementationEventObject
>;

export type NewImplementationEventFilter =
  TypedEventFilter<NewImplementationEvent>;

export interface NewPendingAdminEventObject {
  oldPendingAdmin: string;
  newPendingAdmin: string;
}
export type NewPendingAdminEvent = TypedEvent<
  [string, string],
  NewPendingAdminEventObject
>;

export type NewPendingAdminEventFilter = TypedEventFilter<NewPendingAdminEvent>;

export interface ProposalCanceledEventObject {
  id: BigNumber;
}
export type ProposalCanceledEvent = TypedEvent<
  [BigNumber],
  ProposalCanceledEventObject
>;

export type ProposalCanceledEventFilter =
  TypedEventFilter<ProposalCanceledEvent>;

export interface ProposalCreatedEventObject {
  id: BigNumber;
  proposer: string;
  targets: string[];
  values: BigNumber[];
  signatures: string[];
  calldatas: string[];
  startBlock: BigNumber;
  endBlock: BigNumber;
  description: string;
}
export type ProposalCreatedEvent = TypedEvent<
  [
    BigNumber,
    string,
    string[],
    BigNumber[],
    string[],
    string[],
    BigNumber,
    BigNumber,
    string
  ],
  ProposalCreatedEventObject
>;

export type ProposalCreatedEventFilter = TypedEventFilter<ProposalCreatedEvent>;

export interface ProposalExecutedEventObject {
  id: BigNumber;
}
export type ProposalExecutedEvent = TypedEvent<
  [BigNumber],
  ProposalExecutedEventObject
>;

export type ProposalExecutedEventFilter =
  TypedEventFilter<ProposalExecutedEvent>;

export interface ProposalQueuedEventObject {
  id: BigNumber;
  eta: BigNumber;
}
export type ProposalQueuedEvent = TypedEvent<
  [BigNumber, BigNumber],
  ProposalQueuedEventObject
>;

export type ProposalQueuedEventFilter = TypedEventFilter<ProposalQueuedEvent>;

export interface ProposalThresholdSetEventObject {
  oldProposalThreshold: BigNumber;
  newProposalThreshold: BigNumber;
}
export type ProposalThresholdSetEvent = TypedEvent<
  [BigNumber, BigNumber],
  ProposalThresholdSetEventObject
>;

export type ProposalThresholdSetEventFilter =
  TypedEventFilter<ProposalThresholdSetEvent>;

export interface VoteCastEventObject {
  voter: string;
  proposalId: BigNumber;
  support: number;
  votes: BigNumber;
  reason: string;
}
export type VoteCastEvent = TypedEvent<
  [string, BigNumber, number, BigNumber, string],
  VoteCastEventObject
>;

export type VoteCastEventFilter = TypedEventFilter<VoteCastEvent>;

export interface VotingDelaySetEventObject {
  oldVotingDelay: BigNumber;
  newVotingDelay: BigNumber;
}
export type VotingDelaySetEvent = TypedEvent<
  [BigNumber, BigNumber],
  VotingDelaySetEventObject
>;

export type VotingDelaySetEventFilter = TypedEventFilter<VotingDelaySetEvent>;

export interface VotingPeriodSetEventObject {
  oldVotingPeriod: BigNumber;
  newVotingPeriod: BigNumber;
}
export type VotingPeriodSetEvent = TypedEvent<
  [BigNumber, BigNumber],
  VotingPeriodSetEventObject
>;

export type VotingPeriodSetEventFilter = TypedEventFilter<VotingPeriodSetEvent>;

export interface WhitelistAccountExpirationSetEventObject {
  account: string;
  expiration: BigNumber;
}
export type WhitelistAccountExpirationSetEvent = TypedEvent<
  [string, BigNumber],
  WhitelistAccountExpirationSetEventObject
>;

export type WhitelistAccountExpirationSetEventFilter =
  TypedEventFilter<WhitelistAccountExpirationSetEvent>;

export interface WhitelistGuardianSetEventObject {
  oldGuardian: string;
  newGuardian: string;
}
export type WhitelistGuardianSetEvent = TypedEvent<
  [string, string],
  WhitelistGuardianSetEventObject
>;

export type WhitelistGuardianSetEventFilter =
  TypedEventFilter<WhitelistGuardianSetEvent>;

export interface GovernorBravoEvents extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: GovernorBravoEventsInterface;

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

  functions: {};

  callStatic: {};

  filters: {
    "NewAdmin(address,address)"(
      oldAdmin?: null,
      newAdmin?: null
    ): NewAdminEventFilter;
    NewAdmin(oldAdmin?: null, newAdmin?: null): NewAdminEventFilter;

    "NewImplementation(address,address)"(
      oldImplementation?: null,
      newImplementation?: null
    ): NewImplementationEventFilter;
    NewImplementation(
      oldImplementation?: null,
      newImplementation?: null
    ): NewImplementationEventFilter;

    "NewPendingAdmin(address,address)"(
      oldPendingAdmin?: null,
      newPendingAdmin?: null
    ): NewPendingAdminEventFilter;
    NewPendingAdmin(
      oldPendingAdmin?: null,
      newPendingAdmin?: null
    ): NewPendingAdminEventFilter;

    "ProposalCanceled(uint256)"(id?: null): ProposalCanceledEventFilter;
    ProposalCanceled(id?: null): ProposalCanceledEventFilter;

    "ProposalCreated(uint256,address,address[],uint256[],string[],bytes[],uint256,uint256,string)"(
      id?: null,
      proposer?: null,
      targets?: null,
      values?: null,
      signatures?: null,
      calldatas?: null,
      startBlock?: null,
      endBlock?: null,
      description?: null
    ): ProposalCreatedEventFilter;
    ProposalCreated(
      id?: null,
      proposer?: null,
      targets?: null,
      values?: null,
      signatures?: null,
      calldatas?: null,
      startBlock?: null,
      endBlock?: null,
      description?: null
    ): ProposalCreatedEventFilter;

    "ProposalExecuted(uint256)"(id?: null): ProposalExecutedEventFilter;
    ProposalExecuted(id?: null): ProposalExecutedEventFilter;

    "ProposalQueued(uint256,uint256)"(
      id?: null,
      eta?: null
    ): ProposalQueuedEventFilter;
    ProposalQueued(id?: null, eta?: null): ProposalQueuedEventFilter;

    "ProposalThresholdSet(uint256,uint256)"(
      oldProposalThreshold?: null,
      newProposalThreshold?: null
    ): ProposalThresholdSetEventFilter;
    ProposalThresholdSet(
      oldProposalThreshold?: null,
      newProposalThreshold?: null
    ): ProposalThresholdSetEventFilter;

    "VoteCast(address,uint256,uint8,uint256,string)"(
      voter?: PromiseOrValue<string> | null,
      proposalId?: null,
      support?: null,
      votes?: null,
      reason?: null
    ): VoteCastEventFilter;
    VoteCast(
      voter?: PromiseOrValue<string> | null,
      proposalId?: null,
      support?: null,
      votes?: null,
      reason?: null
    ): VoteCastEventFilter;

    "VotingDelaySet(uint256,uint256)"(
      oldVotingDelay?: null,
      newVotingDelay?: null
    ): VotingDelaySetEventFilter;
    VotingDelaySet(
      oldVotingDelay?: null,
      newVotingDelay?: null
    ): VotingDelaySetEventFilter;

    "VotingPeriodSet(uint256,uint256)"(
      oldVotingPeriod?: null,
      newVotingPeriod?: null
    ): VotingPeriodSetEventFilter;
    VotingPeriodSet(
      oldVotingPeriod?: null,
      newVotingPeriod?: null
    ): VotingPeriodSetEventFilter;

    "WhitelistAccountExpirationSet(address,uint256)"(
      account?: null,
      expiration?: null
    ): WhitelistAccountExpirationSetEventFilter;
    WhitelistAccountExpirationSet(
      account?: null,
      expiration?: null
    ): WhitelistAccountExpirationSetEventFilter;

    "WhitelistGuardianSet(address,address)"(
      oldGuardian?: null,
      newGuardian?: null
    ): WhitelistGuardianSetEventFilter;
    WhitelistGuardianSet(
      oldGuardian?: null,
      newGuardian?: null
    ): WhitelistGuardianSetEventFilter;
  };

  estimateGas: {};

  populateTransaction: {};
}
