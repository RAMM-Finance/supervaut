import { createBigNumber, BigNumber } from "./create-big-number";
import {
  CryptoIcon,
  EntertainmentIcon,
  FinanceIcon,
  MedicalIcon,
  PoliticsIcon,
  SportsIcon,
} from "../components/common/category-icons";
import { EthIcon, UsdIcon } from "../components/common/icons";

export const POLYGON_NETWORK = 137;
export const POLYGON_PRICE_FEED_MATIC = "0xAB594600376Ec9fD91F8e885dADF0CE036862dE0";
export const WMATIC_TOKEN_ADDRESS = "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270";
export const REWARDS_AMOUNT_CUTOFF = 3000;

// # Market Types
// should not be used, will be refactored out.
export const YES_NO = "YesNo";
export const CATEGORICAL = "Categorical";
export const SCALAR = "Scalar";

// MAIN VIEWS
export const MARKET: string = "market";
export const MARKETS: string = "markets";
export const PORTFOLIO: string = "portfolio";

export const YES_NO_OUTCOMES_NAMES = ["Invalid", "No", "Yes"];
// QUERY_PARAMS
export const MARKET_ID_PARAM_NAME: string = "id";
export const AFFILIATE_NAME: string = "r";
export const THEME_NAME: string = "t";

export const OUTCOME_YES_NAME: string = "Yes";
export const OUTCOME_NO_NAME: string = "No";
export const OUTCOME_INVALID_NAME: string = "Invalid";
export const OUTCOME_NO_ID = 0;
export const OUTCOME_YES_ID = 1;
export const GROUP_INVALID_MARKET = 1;

// Directions
export const BUY: string = "buy";
export const SELL: string = "sell";

export const ADD_LIQUIDITY: string = "add liquidity";
export const DUST_POSITION_AMOUNT: BigNumber = createBigNumber("0.0001");
export const DUST_POSITION_AMOUNT_ON_CHAIN: BigNumber = DUST_POSITION_AMOUNT.times(createBigNumber(10).pow(18));
export const DUST_LIQUIDITY_AMOUNT: BigNumber = createBigNumber("1");
export const APY_CUTOFF_AMOUNT: BigNumber = createBigNumber("999.99");

export const ETHER: BigNumber = createBigNumber(10).pow(18);
export const GWEI_CONVERSION: number = 1000000000;
export const TEN: BigNumber = createBigNumber(10, 10);
export const NEGATIVE_ONE: BigNumber = createBigNumber(-1);
export const ZERO: BigNumber = createBigNumber(0);
export const ONE: BigNumber = createBigNumber(1);
export const FIFTY: BigNumber = createBigNumber(50);
export const HUNDRED: BigNumber = createBigNumber(100);
export const THOUSAND: BigNumber = createBigNumber(1000);
export const MILLION: BigNumber = THOUSAND.times(THOUSAND);
export const BILLION: BigNumber = MILLION.times(THOUSAND);
export const TRILLION: BigNumber = BILLION.times(THOUSAND);
export const DAYS_IN_YEAR: BigNumber = createBigNumber(365);
export const SEC_IN_DAY: BigNumber = createBigNumber(86400);
export const PORTION_OF_INVALID_POOL_SELL: BigNumber = createBigNumber(0.5);
export const PORTION_OF_CASH_INVALID_POOL: BigNumber = createBigNumber(0.1);

export const ODDS_TYPE = {
  AMERICAN: "AMERICAN",
  DECIMAL: "DECIMAL",
  FRACTIONAL: "FRACTIONAL",
  PERCENT: "PERCENT",
};

// # Asset Types
export const ETH: string = "ETH";
export const REP: string = "REP";
export const DAI: string = "DAI";
export const USDT: string = "USDT";
export const USDC: string = "USDC";
export const SHARES: string = "SHARES";
export const ALL_CURRENCIES: string = "All Currencies";

export const CASH_LABEL_FORMATS = {
  ETH: { symbol: "Ξ", prepend: true, displayDecimals: 4, icon: EthIcon },
  USDC: { symbol: "$", prepend: true, displayDecimals: 2, icon: UsdIcon },
  SHARES: { symbol: "", prepend: true, displayDecimals: 4, icon: null },
};

// Portfolio table views
export const POSITIONS: string = "positions";
export const LIQUIDITY: string = "liquidity";
export const TABLES: string = "TABLES";
export const ACTIVITY: string = "ACTIVITY";

// top categories
export const MEDICAL: string = "medical";
export const POLITICS: string = "politics";
export const FINANCE: string = "finance";
export const CRYPTO: string = "crypto";
export const ENTERTAINMENT: string = "entertainment";
export const ECONOMICS: string = "economics";
export const SPORTS: string = "sports";
export const OTHER: string = "other";
export const ALL_MARKETS: string = "all markets";

// sub categories
export const COVID: string = "covid-19";
export const ELECTORAL_COLLEGE: string = "electoral college";
export const FEDERAL_FUNDS: string = "federal funds";
export const REPUSD: string = "REP USD";
export const PRESIDENTIAL_ELECTION: string = "electoral college";

export const POPULAR_CATEGORIES_ICONS = {
  [MEDICAL]: MedicalIcon,
  [POLITICS]: PoliticsIcon,
  [CRYPTO]: CryptoIcon,
  [FINANCE]: FinanceIcon,
  [SPORTS]: SportsIcon,
  [ENTERTAINMENT]: EntertainmentIcon,
};

// side bar types
export const NAVIGATION: string = "NAVIGATION";
export const FILTERS: string = "FILTERS";
export const BETSLIP: string = "BETSLIP";

export const SIDEBAR_TYPES = {
  [NAVIGATION]: NAVIGATION,
  [FILTERS]: FILTERS,
  [BETSLIP]: BETSLIP,
};

//  transaction types
export const ALL: string = "all";
export const SWAP: string = "swap";
export const TRADES: string = "trades";
export const ADD: string = "add";
export const REMOVE: string = "remove";

export const NO_CONTEST_OUTCOME_ID: number = 0;
export const NO_OUTCOME_ID: number = 1;
export const YES_OUTCOME_ID: number = 2;
export const NUM_TICKS_STANDARD = "1000";

export const OPEN: string = "Open";
export const IN_SETTLEMENT: string = "In settlement";
export const RESOLVED: string = "Resolved";

export const INSUFFICIENT_LIQUIDITY: string = "Insufficent Liquidity";
export const INSUFFICIENT_BALANCE: string = "Insufficent Balance";
export const OVER_SLIPPAGE: string = "Over Slippage Tolerance";
export const ENTER_AMOUNT: string = "Enter Amount";
export const ERROR_AMOUNT: string = "Amount is not valid";
export const CONNECT_ACCOUNT: string = "Connect Account";
export const SET_PRICES: string = "Set Prices";
export const INVALID_PRICE: string = "Invalid Price";
export const INVALID_PRICE_ADD_UP_SUBTEXT: string = "Prices must add up to $1";
export const INVALID_PRICE_GREATER_THAN_SUBTEXT: string = "Price must be at least $0.02";
export const RESOLVED_MARKET = "Resolved Market";

export const SETTINGS_SLIPPAGE: string = "2";
export const TWELVE_HOUR_TIME: string = "12hr";
export const TWENTY_FOUR_HOUR_TIME: string = "24hr";
export const TEN_MINUTES: number = 10 * 60;
export const MAX_LAG_BLOCKS: number = 120;

// graph market status
export const MARKET_STATUS = {
  TRADING: "TRADING",
  REPORTING: "REPORTING",
  DISPUTING: "DISPUTING",
  FINALIZED: "FINALIZED",
  SETTLED: "SETTLED",
};

export const TIME_TYPE = {
  TWELVE_HOUR_TIME: "12hr",
  TWENTY_FOUR_HOUR_TIME: "24hr",
};

export const COMING_SOON = "Coming Soon";

export const categoryItems = [
  {
    label: ALL_MARKETS,
    value: ALL_MARKETS,
  },
  {
    label: CRYPTO,
    value: CRYPTO,
  },
  {
    label: ECONOMICS,
    value: ECONOMICS,
  },
  {
    label: ENTERTAINMENT,
    value: ENTERTAINMENT,
  },
  {
    label: MEDICAL,
    value: MEDICAL,
  },
  {
    label: POLITICS,
    value: POLITICS,
  },
  {
    label: SPORTS,
    value: SPORTS,
  },
  {
    label: OTHER,
    value: OTHER,
  },
];

export const TOTAL_VOLUME: string = "Total Volume";
export const TWENTY_FOUR_HOUR_VOLUME: string = "24hr volume";
export const STARTS_SOON: string = "starts soon";

export const sortByItems = [
  {
    label: STARTS_SOON,
    value: STARTS_SOON,
  },
  {
    label: TOTAL_VOLUME,
    value: TOTAL_VOLUME,
  },
  {
    label: TWENTY_FOUR_HOUR_VOLUME,
    value: TWENTY_FOUR_HOUR_VOLUME,
  },
  {
    label: LIQUIDITY,
    value: LIQUIDITY,
  },
];

export const marketStatusItems = [
  {
    label: OPEN,
    value: OPEN,
  },
  // {
  //   label: IN_SETTLEMENT,
  //   value: IN_SETTLEMENT,
  // },
  {
    label: RESOLVED,
    value: RESOLVED,
  },
];

export const currencyItems = [
  {
    label: ALL_CURRENCIES,
    value: ALL_CURRENCIES,
  },
  {
    label: ETH,
    value: ETH,
  },
  {
    label: USDC,
    value: USDC,
  },
];

export const TX_STATUS = {
  CONFIRMED: "CONFIRMED",
  PENDING: "PENDING",
  FAILURE: "FAILURE",
};

// approvals
export enum ApprovalState {
  UNKNOWN,
  NOT_APPROVED,
  PENDING,
  APPROVED,
}

export enum ApprovalAction {
  ENTER_POSITION,
  EXIT_POSITION,
  ADD_LIQUIDITY,
  REMOVE_LIQUIDITY,
  MINT_SETS,
  RESET_PRICES,
}

export const NULL_ADDRESS: string = "0x0000000000000000000000000000000000000000";

// Modals
export const MODAL_ADD_LIQUIDITY: string = "MODAL_ADD_LIQUIDITY";
export const MODAL_CONNECT_WALLET: string = "MODAL_CONNECT_WALLET";
export const MODAL_CONNECT_TO_POLYGON: string = "MODAL_CONNECT_TO_POLYGON";

export const CREATE: string = "create";
export const MINT_SETS: string = "mintSets";
export const RESET_PRICES: string = "resetPrices";

export const DefaultMarketOutcomes = [
  {
    id: 0,
    name: "Invalid",
    price: "$0.00",
    isInvalid: true,
  },
  {
    id: 1,
    name: "No",
    price: "$0.25",
  },
  {
    id: 2,
    name: "yes",
    price: "$0.75",
  },
];

export enum TransactionTypes {
  ENTER = "ENTER",
  EXIT = "EXIT",
  ADD_LIQUIDITY = "ADD_LIQUIDITY",
  REMOVE_LIQUIDITY = "REMOVE_LIQUIDITY",
  MINT_SHARES = "MINT_SHARES",
}

export enum TradingDirection {
  ENTRY = "ENTRY",
  EXIT = "EXIT",
}

export const SPORTS_MARKET_TYPE = {
  MONEY_LINE: 0,
  SPREAD: 1,
  OVER_UNDER: 2,
};

export const MARKET_FACTORY_TYPES = {
  SPORTSLINK: "SportsLink",
  CRYPTO: "Crypto",
  CRYPTO_CURRENCY: "CryptoCurrency",
  MMALINK: "MMALink",
  NFL: "NFL",
  GROUPED: "Grouped",
  MLB: "MLB",
  NBA: "NBA",
  MMA: "MMA",
  TRUSTED: "Trusted", 
  CDS:"CDS"
};

export const GRAPH_MARKETS = {
  cryptoMarkets: MARKET_FACTORY_TYPES.CRYPTO,
  mmaMarkets: MARKET_FACTORY_TYPES.MMALINK,
  teamSportsMarkets: MARKET_FACTORY_TYPES.SPORTSLINK,
  nflMarkets: MARKET_FACTORY_TYPES.NFL,
  resolved_cryptoMarkets: MARKET_FACTORY_TYPES.CRYPTO,
  resolved_mmaMarkets: MARKET_FACTORY_TYPES.MMALINK,
  resolved_teamSportsMarkets: MARKET_FACTORY_TYPES.SPORTSLINK,
  resolved_NFLMarkets: MARKET_FACTORY_TYPES.NFL,
};

export const SPORTS_MARKET_TYPE_LABELS = {
  [SPORTS_MARKET_TYPE.SPREAD]: "Spread",
  [SPORTS_MARKET_TYPE.MONEY_LINE]: "Money Line",
  [SPORTS_MARKET_TYPE.OVER_UNDER]: "Over / Under",
};

export const MMA_MARKET_TYPE = {
  MONEY_LINE: 0,
  SPREAD: 1, // TODO: no spread markets for MMA when real market factory gets created
  OVER_UNDER: 1,
};

export const MARKET_LOAD_TYPE = {
  SIMPLIFIED: "SIMPLIFIED",
  SPORT: "SPORT",
};

export const THEME_OPTIONS = {
  LIGHT: "Light",
  DARK: "Dark",
  AUTO: "Auto",
};

export const SPORTS_THEME_TYPES = {
  LIGHT: "SPORTS",
  DARK: "SPORTS_DARK",
};

// TURBO uses :root styles, so THEME = null
export const TURBO_THEME_TYPES = {
  LIGHT: null,
  DARK: "DARK",
};
