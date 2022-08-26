import React, { useState } from "react";
import Styles from "./tables.styles.less";
import { Utils, Components, useUserStore, useDataStore, Links, Constants } from "@augurproject/comps";
import { ActiveBetType } from "../stores/constants";
import { useSportsStore } from "../stores/sport";
import { useBetslipStore } from "../stores/betslip";
import { TicketBreakdown } from "../betslip/betslip";

import { approveOrCashOut } from "../utils";
import { CASHOUT_NOT_AVAILABLE, USDC } from "../constants";
import { EmptyBetslipIcon } from "../betslip/betslip";
const {
  Formatter: { formatCash },
  DateUtils: { getDateTimeFormat, getMarketEndtimeFull },
  OddsUtils: { convertToNormalizedPrice, convertToOdds },
} = Utils;
const {
  PaginationComps: { Pagination },
  ButtonComps: { TinyThemeButton },
  LabelComps: { ReportingStateLabel },
} = Components;
const { MarketLink } = Links;
const { MARKET_STATUS } = Constants;

export const EventBetsSection = ({ eventPositionData = {} }) => {
  const [page, setPage] = useState(1);
  if (!Object.keys(eventPositionData).length)
    return (
      <section className={Styles.EventBetsSectionEmpty}>
        <div>{EmptyBetslipIcon}</div>
        <h3>You don't have any bets</h3>
        <p>Once you start betting your bets will appear on this page</p>
      </section>
    );
  const EventDataEntries = Object.entries(eventPositionData).sort(
    ([aId, aEvent]: any, [bId, bEvent]: any) => bEvent?.eventStartTime - aEvent?.eventStartTime
  );
  return (
    <section className={Styles.EventBetsSection}>
      {EventDataEntries.map(([EventId, Event]) => (
        <EventBetsTable {...{ Event, key: EventId }} />
      ))}
      {EventDataEntries.length > 0 && (
        <Pagination
          page={page}
          itemCount={EventDataEntries.length}
          itemsPerPage={10}
          useFull
          maxButtons={7}
          action={(page) => {
            setPage(page);
          }}
        />
      )}
    </section>
  );
};

const EventBetsTable = ({ Event }) => {
  return (
    <article className={Styles.EventBetTable}>
      <EventTableHeading {...{ Event }} />
      <EventTableMain {...{ bets: Event.bets }} />
    </article>
  );
};

const EventTableHeading = ({ Event }) => {
  const {
    settings: { timeFormat },
  } = useSportsStore();
  const { markets } = useDataStore();
  const { reportingState } = markets?.[Event?.marketIds?.[0]];
  return (
    <header>
      {reportingState !== MARKET_STATUS.TRADING && <ReportingStateLabel {...{ reportingState }} />}
      <MarketLink id={Event?.marketIds?.[0]}>
        <h4>{Event.eventTitle}</h4>
      </MarketLink>
      <span>{getDateTimeFormat(Event.eventStartTime, timeFormat)}</span>
    </header>
  );
};

export const determineClasses = ({ canCashOut, isOpen, hasClaimed, wager, cashout, isWinningOutcome, isCashout }) => {
  const roundedCashout = formatCash(cashout || 0).formattedValue;
  const isPositive = isOpen ? Number(wager) <= Number(roundedCashout) : isCashout ? cashout > 0 : isWinningOutcome;
  return {
    [Styles.CanCashOut]: canCashOut,
    [Styles.hasClaimed]: hasClaimed || !isOpen,
    [Styles.PositiveCashout]: isPositive,
    [Styles.NegativeCashout]: !isPositive,
  };
};

const EventTableMain = ({ bets }: { [tx_hash: string]: ActiveBetType }) => {
  const {
    settings: { oddsFormat, timeFormat },
  } = useSportsStore();
  const {
    actions: { updateActive },
  } = useBetslipStore();
  const {
    loginAccount,
    actions: { addTransaction },
  } = useUserStore();
  const { markets } = useDataStore();
  const doApproveOrCashOut = async (loginAccount, bet, market) => {
    const txDetails = await approveOrCashOut(loginAccount, bet, market);
    if (txDetails?.hash) {
      addTransaction(txDetails);
      updateActive({ ...bet, hash: txDetails.hash }, true);
    }
  };

  return (
    <main className={Styles.EventTableMain}>
      <ul>
        <li>Outcome</li>
        <li>Wager</li>
        <li>Odds</li>
        <li>To Win</li>
        <li>Bet Date</li>
        <li></li>
      </ul>
      {Object.entries(bets).map(([tx_hash, bet]) => {
        const {
          marketId,
          cashoutAmount,
          cashoutAmountAbs,
          price,
          subHeading,
          name,
          hasClaimed,
          wager,
          toWin,
          isApproved,
          canCashOut,
          isPending,
          timestamp,
          isOpen,
          isWinningOutcome,
          isCashout
        } = bet;
        const market = markets[marketId];
        const cashout = formatCash(cashoutAmountAbs || cashoutAmount, USDC);
        let subtext = "";
        let buttonName = "";
        if (isOpen) {
          if (!canCashOut) {
            buttonName = CASHOUT_NOT_AVAILABLE
          } else if (isApproved) {
            buttonName = isPending ? `PENDING ${cashout.full}` : `CASHOUT ${cashout.full}`;
          } else {
            buttonName = `APPROVE CASHOUT ${cashout.full}`;
          }
        } else {
          // label won or lost
          if (isCashout) {
            subtext = `CASHED OUT: ${cashout.full}`;
          } else {
            subtext = isWinningOutcome ? `WON: ${cashout.full}` : `LOSS: ${cashout.full}`
          }
        }
        return (
          <ul key={tx_hash}>
            <li>
              <span>{name}</span>
              <span>{subHeading}</span>
            </li>
            <li>{wager === "0.00" ? "-" : formatCash(wager.replaceAll(',', ''), USDC).full}</li>
            <li>{convertToOdds(convertToNormalizedPrice({ price: price || 0 }), oddsFormat).full}</li>
            <li>{toWin && toWin !== "0" ? formatCash(toWin.replaceAll(',', ''), USDC).full : "-"}</li>
            <li>{getMarketEndtimeFull(timestamp, timeFormat)}</li>
            <li>
              <TinyThemeButton
                customClass={determineClasses({ ...bet, cashout: cashoutAmount })}
                action={() => doApproveOrCashOut(loginAccount, bet, market)}
                disabled={isPending || !canCashOut}
                reverseContent={!canCashOut && hasClaimed}
                subText={subtext}
                text={buttonName}
              />
            </li>
            <TicketBreakdown {...{ bet, timeFormat }} />
          </ul>
        );
      })}
    </main>
  );
};
