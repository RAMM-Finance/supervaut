import { DEFAULT_MARKET_VIEW_SETTINGS, DEFAULT_POOLS_VIEW_SETTINGS, SETTINGS_SLIPPAGE } from "../constants";
import { Constants } from "@augurproject/comps";

export const TOKEN_ADDRESSES = [
  "SAMPLE_ADDRESS_HERE"
];

export const STUBBED_SIMPLIFIED_ACTIONS = {
  setSidebar: (sidebarType) => {},
  setShowTradingForm: (showTradingForm) => {},
  updateMarketsViewSettings: (settings) => {},
  updateSettings: (settings, account = null) => {},
  updatePoolsViewSettings: (settings) => {},
};

export const DEFAULT_SIMPLIFIED_STATE = {
  sidebarType: null,
  showTradingForm: false,
  marketsViewSettings: DEFAULT_MARKET_VIEW_SETTINGS,
  poolsViewSettings: DEFAULT_POOLS_VIEW_SETTINGS,
  settings: {
    slippage: SETTINGS_SLIPPAGE,
    showLiquidMarkets: false,
    showResolvedPositions: false,
    timeFormat: Constants.TWELVE_HOUR_TIME,
    theme: Constants.THEME_OPTIONS.LIGHT,
    isWalletRpc: false,
  },
};

export const SIMPLIFIED_STATE_KEYS = {
  SIDEBAR_TYPE: "sidebarType",
  MARKETS_VIEW_SETTINGS: "marketsViewSettings",
  POOLS_VIEW_SETTINGS: "poolsViewSettings",
  SETTINGS: "settings",
  SHOW_TRADING_FORM: "showTradingForm",
  TIME_FORMAT: "timeFormat",
};

export const SIMPLIFIED_ACTIONS = {
  SET_SIDEBAR: "SET_SIDEBAR",
  SET_SHOW_TRADING_FORM: "SET_SHOW_TRADING_FORM",
  UPDATE_MARKETS_VIEW_SETTINGS: "UPDATE_MARKETS_VIEW_SETTINGS",
  UPDATE_POOLS_VIEW_SETTINGS: "DEFAULT_POOLS_VIEW_SETTINGS",
  UPDATE_SETTINGS: "UPDATE_SETTINGS",
};
