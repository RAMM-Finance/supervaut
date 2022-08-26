import { createBigNumber } from "@augurproject/comps";

// # Market Types
// should not be used, will be refactored out.
export const YES_NO = "YesNo";
export const CATEGORICAL = "Categorical";
export const SCALAR = "Scalar";

// MAIN VIEWS
export const MARKET = "market";
export const MARKETS = "markets";
export const PORTFOLIO = "portfolio";
export const LIQUIDITY = "liquidity";
export const MARKET_LIQUIDITY = "market-liquidity";
export const MINT = "mint"
export const MINT_DS = "mint-ds";
export const REDEEM = "redeem";
export const BORROW = "borrow";
export const PROPOSAL = "proposal";
export const LOAN = "loan";
export const USER_PROFILE = "user-profile";
export const PROFILE = "profile";
export const CREDITLINE = "creditline"

// Directions
export const BUY = "buy";
export const SELL = "sell";

export const ADD_LIQUIDITY = "add liquidity";

export const ETHER = createBigNumber(10).pow(18);
export const TEN = createBigNumber(10, 10);
export const ZERO = createBigNumber(0);
export const ONE = createBigNumber(1);
export const HUNDRED = createBigNumber(100);
export const THOUSAND = createBigNumber(1000);
export const MILLION = THOUSAND.times(THOUSAND);
export const BILLION = MILLION.times(THOUSAND);
export const TRILLION = BILLION.times(THOUSAND);

// # Asset Types
export const ETH = "ETH";
export const REP = "REP";
export const DAI = "DAI";
export const USDT = "USDT";
export const USDC = "USDC";
export const SHARES = "SHARES";
export const ALL_CURRENCIES = "All Currencies";

const colateral_address = "0x5799bFe361BEea69f808328FF4884DF92f1f66f0"
export const CURRENCY_ADDRESSES = {
  DAI: colateral_address,
  USDC: colateral_address,
  FRAX: colateral_address
}

// Portfolio table views
export const POSITIONS = "positions";
export const TABLES = "TABLES";
export const ACTIVITY = "ACTIVITY";

// top categories
export const MEDICAL = "medical";
export const POLITICS = "politics";
export const FINANCE = "finance";
export const CRYPTO = "crypto";
export const ENTERTAINMENT = "entertainment";
export const ECONOMICS = "economics";
export const SPORTS = "sports";
export const OTHER = "other";
export const ALL_MARKETS = "all markets";

// sub categories
export const COVID = "covid-19";
export const REPUSD = "REP USD";

// side bar types
export const NAVIGATION = "NAVIGATION";
export const FILTERS = "FILTERS";

//  transaction types
export const ALL = "all";
export const ADD = "add";
export const REMOVE = "remove";

export const OPEN = "Open";
export const IN_SETTLEMENT = "In settlement";
export const RESOLVED = "Resolved";

export const ENTER_AMOUNT = "Enter Amount";

export const SETTINGS_SLIPPAGE = "1";
// graph market status
export const MARKET_STATUS = {
  TRADING: "TRADING",
  REPORTING: "REPORTING",
  DISPUTING: "DISPUTING",
  FINALIZED: "FINALIZED",
  SETTLED: "SETTLED",
};

export const categoryItems = [
  {
    label: ALL_MARKETS,
    value: ALL_MARKETS,
    disabled: false,
  },
  {
    label: CRYPTO,
    value: CRYPTO,
    disabled: false,
  },
  {
    label: ECONOMICS,
    value: ECONOMICS,
    disabled: true,
  },
  {
    label: ENTERTAINMENT,
    value: ENTERTAINMENT,
    disabled: true,
  },
  {
    label: MEDICAL,
    value: MEDICAL,
    disabled: true,
  },
  {
    label: POLITICS,
    value: POLITICS,
    disabled: true,
  },
  {
    label: SPORTS,
    value: SPORTS,
    disabled: false,
  },
  {
    label: OTHER,
    value: OTHER,
    disabled: true,
  },
];

export const TOTAL_VOLUME = "Total Volume";
export const TWENTY_FOUR_HOUR_VOLUME = "24hr volume";
export const STARTS_SOON = "starts soon";

export const sortByItems = [
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
  {
    label: STARTS_SOON,
    value: STARTS_SOON,
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
}

export const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";

// Modals
export const MODAL_ADD_LIQUIDITY = "MODAL_ADD_LIQUIDITY";
export const MODAL_CONNECT_TO_POLYGON = "MODAL_CONNECT_TO_POLYGON";
export const MODAL_CONFIRM_TRANSACTION = "MODAL_CONFIRM_TRANSACTION";

export const MARKET_TYPE_OPTIONS = [
  {
    label: "Daily + Long Term",
    value: "daily+long",
    disabled: false,
  },
  {
    label: "Daily Only",
    value: "daily",
    disabled: false,
  },
  {
    label: "Long Term Only",
    value: "long",
    disabled: false,
  },
];

export const POOL_SORT_TYPES = {
  EXPIRES: "EXPIRES",
  TVL: "TVL",
  APR: "APR",
  LIQUIDITY: "LIQUIDITY",
  REWARDS: "REWARDS",
};

export const POOL_SORT_TYPE_TEXT = {
  EXPIRES: "Expires",
  TVL: "TVL",
  APR: "APR",
  LIQUIDITY: "My Liquidity",
  REWARDS: "My Rewards",
};

export const DEFAULT_MARKET_VIEW_SETTINGS = {
  primaryCategory: ALL_MARKETS,
  reportingState: OPEN,
  sortBy: LIQUIDITY,
  currency: ALL_CURRENCIES,
  subCategories: [],
};

export const DEFAULT_POOLS_VIEW_SETTINGS = {
  primaryCategory: ALL_MARKETS,
  subCategories: [],
  onlyUserLiquidity: false,
  marketTypeFilter: MARKET_TYPE_OPTIONS[0].value,
  sortBy: {
    type: POOL_SORT_TYPES.EXPIRES,
    direction: -1,
  },
};

export const CREATE = "create";

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

export const WMATIC_TOKEN_ADDRESS = "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270";
