import React, { useCallback, useEffect, useRef, useState } from "react";
import { Header } from "./common";
import Styles from "./modal.styles.less";
import { UnsupportedChainIdError, useWeb3React } from "@web3-react/core";
import { AbstractConnector } from "@web3-react/abstract-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import MetamaskIcon from "../ConnectAccount/assets/metamask.png";
import classNames from "classnames";
import { SecondaryThemeButton } from "../common/buttons";
import { ErrorBlock } from "../common/labels";
import { isSafari } from "../ConnectAccount/utils";
import { SUPPORTED_WALLETS } from "../ConnectAccount/constants";
import { injected } from "../ConnectAccount/connectors";
import { Loader } from "../ConnectAccount/components/Loader";
import { AccountDetails } from "../ConnectAccount/components/AccountDetails";
import { useActiveWeb3React } from "../ConnectAccount/hooks";

const WALLET_VIEWS = {
  OPTIONS: "options",
  OPTIONS_SECONDARY: "options_secondary",
  ACCOUNT: "account",
  PENDING: "pending",
};

export function usePrevious<T>(value: T) {
  // The ref object is a generic container whose current property is mutable ...
  // ... and can hold any value, similar to an instance property on a class
  const ref = useRef<T>();

  // Store current value in ref
  useEffect(() => {
    ref.current = value;
  }, [value]); // Only re-run if value changes

  // Return previous value (happens before update in useEffect above)
  return ref.current;
}

const WalletList = ({ walletList }) => (
  <ul>
    {walletList.map((wallet) => (
      <li key={wallet.key}>
        <SecondaryThemeButton {...wallet} />
      </li>
    ))}
  </ul>
);

export interface PendingWalletViewProps {
  connector?: AbstractConnector;
  error?: boolean;
  setPendingError: (error: boolean) => void;
  tryActivation: (connector: AbstractConnector) => void;
  darkMode?: boolean;
}

const PendingWalletView = ({
  connector,
  error = false,
  setPendingError,
  tryActivation,
  darkMode,
}: PendingWalletViewProps) => {
  const isMetamask = window["ethereum"] && window["ethereum"]["isMetaMask"];

  return (
    <div className={Styles.PendingWalletView}>
      {error ? (
        <div>
          <span>Error connecting.</span>
          <SecondaryThemeButton
            action={() => {
              setPendingError(false);
              connector && tryActivation(connector);
            }}
            text="Try again"
          />
        </div>
      ) : (
        <>
          <Loader darkMode={darkMode} />
          <span>Initializing...</span>
        </>
      )}
      {Object.keys(SUPPORTED_WALLETS).map((key) => {
        const wallet = SUPPORTED_WALLETS[key];

        if (wallet.connector === connector) {
          if (
            wallet.connector === injected &&
            ((isMetamask && wallet.name !== "MetaMask") || (!isMetamask && wallet.name === "MetaMask"))
          ) {
            return null;
          }

          return (
            <SecondaryThemeButton
              id={`connect-${key}`}
              key={key}
              text={wallet.name}
              icon={<img src={require("../ConnectAccount/assets/" + wallet.iconName).default} alt={wallet.name} />}
            />
          );
        }
        return null;
      })}
    </div>
  );
};

export interface ModalConnectWalletProps {
  darkMode: boolean;
  autoLogin: boolean;
  transactions: any;
  isLogged: boolean;
  customClassForModal: object | null;
  closeModal: Function;
  removeTransaction: Function;
  logout: Function;
  updateTxFailed?: Function;
  updateMigrated?: Function;
}

const ModalConnectWallet = ({
  darkMode,
  autoLogin,
  transactions,
  isLogged,
  closeModal,
  removeTransaction,
  logout,
  updateTxFailed,
  updateMigrated,
  customClassForModal,
}: ModalConnectWalletProps) => {
  const { active, account, connector, activate, error } = useWeb3React();
  const { deactivate } = useActiveWeb3React();
  const [walletView, setWalletView] = useState(WALLET_VIEWS.ACCOUNT);
  const [pendingWallet, setPendingWallet] = useState<AbstractConnector | undefined>();
  const [pendingError, setPendingError] = useState<boolean>();
  const previousAccount = usePrevious(account);
  const [walletList, setWalletList] = useState(null);
                console.log('connector here', connector); 

  const tryActivation = useCallback(
    (connector: AbstractConnector | undefined) => {
      setPendingWallet(connector); // set wallet for pending view
      setWalletView(WALLET_VIEWS.PENDING);

      // if the connector is WalletConnect and the user has already tried to connect, manually reset the connector
      if (connector instanceof WalletConnectConnector && connector.walletConnectProvider?.wc?.uri) {
        connector.walletConnectProvider = undefined;
      }
                console.log('chainError???')
                console.log(connector)

      setTimeout(() => {
        connector &&
          activate(connector, undefined, true)
            .then(() => {
              activate(connector);
              closeModal();
            })
            .catch((error) => {
              if (error instanceof UnsupportedChainIdError) {
                console.log('chainError???')
                console.log(error)
                activate(connector); // a little janky...can't use setError because the connector isn't set
              } else {
                setPendingError(true);
              }
            });
      });
    },
    [activate]
  );

  // close on connection, when logged out before
  useEffect(() => {
    if (autoLogin && !account) {
      const option = SUPPORTED_WALLETS["METAMASK"];
      tryActivation(option.connector);
      setWalletView(WALLET_VIEWS.ACCOUNT);
    }
  }, [autoLogin, tryActivation, account, previousAccount]);

  // close modal when a connection is successful
  const activePrevious = usePrevious(active);
  const connectorPrevious = usePrevious(connector);

  useEffect(() => {
    if ((active && !activePrevious) || (connector && connector !== connectorPrevious && !error)) {
      setWalletView(WALLET_VIEWS.ACCOUNT);
    }
  }, [setWalletView, active, error, connector, activePrevious, connectorPrevious]);

  const getWalletButtons = useCallback(() => {
    const isMetamask = (window["ethereum"] && window["ethereum"]["isMetaMask"]) || false;
    const isWeb3 = window["web3"] || window["ethereum"];
    const walletButtons = Object.keys(SUPPORTED_WALLETS)
      .filter((wallet) => !(wallet === "PORTIS" && isSafari()))
      .map((key) => {
        const wallet = SUPPORTED_WALLETS[key];
        const commonWalletButtonProps = {
          action: () => wallet.connector !== connector && !wallet.href && tryActivation(wallet.connector),
          href: wallet.href,
          icon: <img src={require("../ConnectAccount/assets/" + wallet.iconName).default} alt={wallet.name} />,
          id: `connect-${key}`,
          key,
          selected: isLogged && wallet?.connector === connector,
          text: wallet.name,
        };

        if (key === "WALLET_CONNECT") {
          return {
            ...commonWalletButtonProps,
            text: "WalletConnect",
          };
        } else if (key === "WALLET_LINK") {
          return {
            ...commonWalletButtonProps,
            text: "Coinbase Wallet",
          };
        } else if (isWeb3) {
          return {
            ...commonWalletButtonProps,
            text: isMetamask ? commonWalletButtonProps.text : "Injected Web3 provider",
          };
        }
        return {
          ...commonWalletButtonProps,
          text: "Install Metamask",
          href: "https://metamask.io/",
          icon: <img src={MetamaskIcon} alt={wallet.name} />,
        };
      })
      .filter((element) => !!element);
    return walletButtons;
  }, [connector, tryActivation]);

  useEffect(() => {
    setWalletList(getWalletButtons());
  }, [getWalletButtons]);

  const disconnectWalletConenct = () => {
    if ((connector as any)?.walletConnectProvider && error) {
      (connector as any)?.walletConnectProvider?.disconnect();
      logout();
    }
  };

  return (
    <section className={classNames(customClassForModal)}>
      <Header
        closeModal={() => {
          disconnectWalletConenct();
          closeModal();
        }}
        title={
          walletView !== WALLET_VIEWS.ACCOUNT ? (
            <span
              className={Styles.HeaderLink}
              onClick={() => {
                disconnectWalletConenct();
                setPendingError(false);
                setWalletView(WALLET_VIEWS.ACCOUNT);
              }}
            >
              Back
            </span>
          ) : account && walletView === WALLET_VIEWS.ACCOUNT ? (
            "Account"
          ) : (
            "Connect a wallet"
          )
        }
      />
      <main>
        <div
          className={classNames(Styles.ModalConnectWallet, {
            [Styles.Account]: account && walletView === WALLET_VIEWS.ACCOUNT,
          })}
        >
          {error ? (
            <ErrorBlock
              text={
                error instanceof UnsupportedChainIdError
                  ? `You're connected to an unsupported network.`
                  : "Error connecting. Try refreshing the page."
              }
            />
          ) : account && walletView === WALLET_VIEWS.ACCOUNT ? (
            <AccountDetails
              openOptions={() => setWalletView(WALLET_VIEWS.OPTIONS)}
              darkMode={darkMode}
              transactions={transactions}
              removeTransaction={removeTransaction}
              logout={() => {
                deactivate();
                closeModal();
                logout();
                updateTxFailed && updateTxFailed(false);
                updateMigrated && updateMigrated(false);
              }}
            />
          ) : walletView === WALLET_VIEWS.PENDING ? (
            <PendingWalletView
              connector={pendingWallet}
              error={pendingError}
              setPendingError={setPendingError}
              tryActivation={tryActivation}
            />
          ) : (
            <>
              {walletList && <WalletList walletList={walletList} />}
              <div className={Styles.LearnMore}>
                New to Ethereum?{" "}
                <a href="https://ethereum.org/wallets/" target="_blank" rel="noopener noreferrer">
                  Learn more about wallets
                </a>
              </div>
            </>
          )}
        </div>
      </main>
    </section>
  );
};

export default ModalConnectWallet;
