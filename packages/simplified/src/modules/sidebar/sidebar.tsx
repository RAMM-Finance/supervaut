import React, { useState } from "react";
import Styles from "./sidebar.styles.less";
import classNames from "classnames";
import { Link } from "react-router-dom";
import { useLocation } from "react-router";
import { SettingsButton } from "../common/top-nav";
import { Constants, PathUtils, Components, useAppStatusStore } from "@augurproject/comps";
import { categoryItems, DEFAULT_MARKET_VIEW_SETTINGS } from "../constants";
import { useSimplifiedStore } from "../stores/simplified";
import {REDEEM} from "../constants"
const { MARKETS, PORTFOLIO, LIQUIDITY, SIDEBAR_TYPES, marketStatusItems, sortByItems } = Constants;
const {
  LinkLogo,
  SelectionComps: { RadioBarGroup },
  Icons: { CloseIcon },
  ButtonComps: { PrimaryThemeButton, SecondaryThemeButton },
} = Components;
const { makePath, parsePath } = PathUtils;

interface SideBarHeaderProps {
  header?: string;
  showLogo?: boolean;
}
const SideBarHeader = ({ header, showLogo }: SideBarHeaderProps) => {
  const {
    actions: { setSidebar },
  } = useSimplifiedStore();
  return (
    <div className={Styles.Header}>
      {showLogo && <LinkLogo />}
      <span>{header}</span>
      <span onClick={() => setSidebar(null)}>{CloseIcon}</span>
    </div>
  );
};

const FilterSideBar = () => {
  const {
    marketsViewSettings,
    actions: { updateMarketsViewSettings, setSidebar },
  } = useSimplifiedStore();
  const [localSettings, setLocalSettings] = useState(marketsViewSettings);
  const filtersAreReset = JSON.stringify(localSettings) === JSON.stringify(DEFAULT_MARKET_VIEW_SETTINGS);

  return (
    <>
      <SideBarHeader header={"filters"} />
      <div className={Styles.Body}>
        <RadioBarGroup
          update={(value) => {
            setLocalSettings({ ...localSettings, primaryCategory: value, subCategories: [] });
          }}
          title="categories"
          selected={localSettings.primaryCategory}
          items={categoryItems}
        />
        <RadioBarGroup
          update={(value) => {
            setLocalSettings({ ...localSettings, sortBy: value });
          }}
          title="sort by"
          selected={localSettings.sortBy}
          items={sortByItems}
        />
        <RadioBarGroup
          title="market status"
          update={(value) => {
            setLocalSettings({ ...localSettings, reportingState: value });
          }}
          selected={localSettings.reportingState}
          items={marketStatusItems}
        />
        {/* <RadioBarGroup
          title="currency"
          update={(value) => {
            setLocalSettings({ ...localSettings, currency: value });
          }}
          selected={localSettings.currency}
          items={currencyItems}
        /> */}
      </div>
      <div className={Styles.Footer}>
        <SecondaryThemeButton
          text="reset all"
          action={() => {
            setLocalSettings(DEFAULT_MARKET_VIEW_SETTINGS);
          }}
          disabled={filtersAreReset}
        />
        <PrimaryThemeButton
          text="apply filters"
          action={() => {
            updateMarketsViewSettings({
              primaryCategory: localSettings.primaryCategory,
              subCategories: localSettings.subCategories,
              sortBy: localSettings.sortBy,
              reportingState: localSettings.reportingState,
              currency: localSettings.currency,
            });
            setSidebar(null);
          }}
        />
      </div>
    </>
  );
};

const NavigationSideBar = () => {
  const {
    actions: { setSidebar },
  } = useSimplifiedStore();
  const { isLogged } = useAppStatusStore();
  const location = useLocation();
  const path = parsePath(location.pathname)[0];
  return (
    <>
      <SideBarHeader showLogo />
      <div className={Styles.Body}>
        <ol>
          <li className={classNames({ [Styles.Active]: path === MARKETS })}>
            <Link onClick={() => setSidebar(null)} to={makePath(MARKETS)}>
              Markets
            </Link>
          </li>
          {isLogged && (
            <li className={classNames({ [Styles.Active]: path === PORTFOLIO })}>
              <Link onClick={() => setSidebar(null)} to={makePath(PORTFOLIO)}>
                Portfolio
              </Link>
            </li>
          )}
          <li className={classNames({ [Styles.Active]: path === LIQUIDITY })}>
            <Link onClick={() => setSidebar(null)} to={makePath(LIQUIDITY)}>
              Pools
            </Link>
          </li>
         <li className={classNames({ [Styles.Active]: path === REDEEM })}>
            <Link onClick={() => setSidebar(null)} to={makePath(REDEEM)}>
              Redeem
            </Link>
          </li>
        </ol>
      </div>
      <div className={Styles.NavigationFooter}>
        <SettingsButton />
      </div>
    </>
  );
};

export const Sidebar = () => {
  const { sidebarType } = useSimplifiedStore();
  return (
    <div className={Styles.Sidebar}>
      {sidebarType === SIDEBAR_TYPES.FILTERS && <FilterSideBar />}
      {sidebarType === SIDEBAR_TYPES.NAVIGATION && <NavigationSideBar />}
    </div>
  );
};
