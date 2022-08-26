import { BigNumber as BN } from "bignumber.js";
import { MarketInfo } from "types";
import { NO_CONTEST_OUTCOME_ID, SPORTS_MARKET_TYPE } from "./constants";
import { getSportTypeCategories, getSportTypeSportId } from "./team-helpers";
import * as SimpleSportsDailies from "./derived-simple-sport-dailies";

const NAMING_TEAM = {
  HOME_TEAM: "HOME_TEAM",
  AWAY_TEAM: "AWAY_TEAM",
  FAV_TEAM: "FAV_TEAM",
  UNDERDOG_TEAM: "UNDERDOG_TEAM",
};
const NAMING_LINE = {
  SPREAD_LINE: "SPREAD_LINE",
  OVER_UNDER_LINE: "OVER_UNDER_LINE",
};
const NO_CONTEST = "No Contest";
const NO_CONTEST_TIE = "Tie/No Contest";
const AWAY_TEAM_OUTCOME = 1;
const EIGHT_HOURS_IN_SECONDS = 8 * 60 * 60;

export const deriveMarketInfo = (market: MarketInfo, marketData: any, marketFactoryType: string) => {
  const { eventId: coEventId, estimatedStartTime, marketType, value0, line } = marketData;

  // translate market data
  // NEW API, DON'T USE TEAM IDS AS LOOK UPS.
  const eventId = String(coEventId._hex || coEventId);
  const startTimestamp = new BN(String(estimatedStartTime)).toNumber(); // estiamted event start time
  const endTimestamp = startTimestamp + EIGHT_HOURS_IN_SECONDS;
  const categories = getSportTypeCategories(marketFactoryType);
  let spreadLine = new BN(String(value0 || line)).div(10).decimalPlaces(0, 1).toNumber();
  if (marketType === undefined) console.error("market type not defined");
  const sportsMarketType = new BN(String(marketType || 0)).toNumber(); // spread, todo: use constant when new sports market factory is ready.
  if (sportsMarketType === SPORTS_MARKET_TYPE.MONEY_LINE) spreadLine = null;

  // will need get get team names
  const homeTeam = marketData["home"]?.name || marketData["homeTeamName"];
  const awayTeam = marketData["away"]?.name || marketData["awayTeamName"];
  const sportId = getSportTypeSportId(marketFactoryType);

  const { shareTokens } = market;
  const outcomes = decodeOutcomes(market, shareTokens, homeTeam, awayTeam, sportsMarketType, spreadLine);
  const { title, description } = getMarketTitle(sportId, homeTeam, awayTeam, sportsMarketType, spreadLine);

  return {
    ...market,
    title,
    description,
    categories,
    outcomes,
    eventId,
    startTimestamp,
    sportId,
    sportsMarketType,
    spreadLine,
    endTimestamp,
  };
};

const getOutcomeName = (
  outcomeId: number,
  homeTeam: string,
  awayTeam: string,
  sportsMarketType: number,
  line: number
) => {
  const marketOutcome = getMarketOutcome(sportsMarketType, outcomeId);
  // create outcome name using market type and line
  if (outcomeId === NO_CONTEST_OUTCOME_ID) return marketOutcome;

  if (sportsMarketType === SPORTS_MARKET_TYPE.MONEY_LINE) {
    return populateHomeAway(marketOutcome, homeTeam, awayTeam);
  }

  if (sportsMarketType === SPORTS_MARKET_TYPE.SPREAD) {
    // spread
    // line for home team outcome
    let displayLine = Number(line) > 0 ? `+${line}` : `${line}`;
    if (outcomeId === AWAY_TEAM_OUTCOME) {
      const invertedLine = Number(line) * -1;
      displayLine = Number(line) < 0 ? `+${invertedLine}` : `${invertedLine}`;
    }

    const outcome = populateHomeAway(marketOutcome, homeTeam, awayTeam).replace(NAMING_LINE.SPREAD_LINE, displayLine);
    return outcome;
  }

  if (sportsMarketType === SPORTS_MARKET_TYPE.OVER_UNDER) {
    // over/under
    return marketOutcome.replace(NAMING_LINE.OVER_UNDER_LINE, String(line));
  }

  return `Outcome ${outcomeId}`;
};

// todo: move this to own file when new market factory is available
export const getMarketTitle = (
  sportId: string,
  homeTeam: string,
  awayTeam: string,
  sportsMarketType: number,
  line: number
): { title: string; description: string } => {
  const marketTitles = getSportsTitles(sportsMarketType);
  if (!marketTitles) {
    console.error(`Could not find ${sportId} sport and/or ${sportsMarketType} market type`);
  }
  let title = "";
  let description = "";
  if (sportsMarketType === 0) {
    // head to head (money line)
    title = marketTitles.title;
    description = populateHomeAway(marketTitles.description, homeTeam, awayTeam);
  }
  if (sportsMarketType === 1) {
    // spread
    let fav = awayTeam;
    let underdog = homeTeam;
    if (Number(line) < 0) {
      underdog = awayTeam;
      fav = homeTeam;
    }
    let spread = new BN(line).abs().toNumber();
    if (!Number.isInteger(spread)) {
      spread = Math.trunc(spread);
    }
    title = marketTitles.title
      .replace(NAMING_TEAM.FAV_TEAM, fav)
      .replace(NAMING_TEAM.UNDERDOG_TEAM, underdog)
      .replace(NAMING_LINE.SPREAD_LINE, String(spread));
  }

  if (sportsMarketType === 2) {
    // over/under
    title = marketTitles.title.replace(NAMING_LINE.OVER_UNDER_LINE, String(line));
    description = populateHomeAway(marketTitles.description, homeTeam, awayTeam);
  }
  return { title, description };
};

const populateHomeAway = (marketTitle: string, homeTeam: string, awayTeam: string): string => {
  return marketTitle.replace(NAMING_TEAM.AWAY_TEAM, awayTeam).replace(NAMING_TEAM.HOME_TEAM, homeTeam);
};

const getSportsTitles = (sportsMarketType: number): { title: string; description: string } => {
  if (!sportsData[sportsMarketType]) return null;
  return sportsData[sportsMarketType];
};

export const getResolutionRules = (market: MarketInfo): string[] => {
  return SimpleSportsDailies.getResolutionRules(market);
};

const getMarketOutcome = (sportsMarketType: number, outcomeId: number): string => {
  if (!sportsData[sportsMarketType]) {
    console.error(`NFL ${sportsMarketType} not found in collection`);
    return "";
  }
  const data = sportsData[sportsMarketType];
  if (!data?.outcomes) {
    console.error(`${sportsMarketType} not found in MMA outcomes data`);
    return "";
  }
  return data.outcomes[outcomeId];
};

const decodeOutcomes = (
  market: MarketInfo,
  shareTokens: string[] = [],
  homeTeam: string,
  awayTeam: string,
  sportsMarketType: number,
  line: number
) => {
  return shareTokens.map((shareToken, i) => {
    return {
      id: i,
      name: getOutcomeName(i, homeTeam, awayTeam, sportsMarketType, line), // todo: derive outcome name using market data
      symbol: shareToken,
      isInvalid: i === NO_CONTEST_OUTCOME_ID,
      isWinner: market.hasWinner && i === market.winner ? true : false,
      isFinalNumerator: false, // need to translate final numerator payout hash to outcome
      shareToken,
    };
  });
};

const sportsData = {
  [SPORTS_MARKET_TYPE.MONEY_LINE]: {
    title: `Which team will lose?`,
    description: `${NAMING_TEAM.AWAY_TEAM} vs ${NAMING_TEAM.HOME_TEAM}`,
    outcomes: [NO_CONTEST_TIE, `${NAMING_TEAM.AWAY_TEAM}`, `${NAMING_TEAM.HOME_TEAM}`],
  },
  [SPORTS_MARKET_TYPE.SPREAD]: {
    title: `Will the ${NAMING_TEAM.FAV_TEAM} defeat the ${NAMING_TEAM.UNDERDOG_TEAM} by more than ${NAMING_LINE.SPREAD_LINE}.5 points?`,
    description: ``,
    outcomes: [
      NO_CONTEST,
      `${NAMING_TEAM.AWAY_TEAM} ${NAMING_LINE.SPREAD_LINE}.5`,
      `${NAMING_TEAM.HOME_TEAM} ${NAMING_LINE.SPREAD_LINE}.5`,
    ],
  },
  [SPORTS_MARKET_TYPE.OVER_UNDER]: {
    title: `Will there be over ${NAMING_LINE.OVER_UNDER_LINE}.5 total points scored?`,
    description: `${NAMING_TEAM.AWAY_TEAM} vs ${NAMING_TEAM.HOME_TEAM}`,
    outcomes: [NO_CONTEST, `Over ${NAMING_LINE.OVER_UNDER_LINE}.5`, `Under ${NAMING_LINE.OVER_UNDER_LINE}.5`],
  },
};
