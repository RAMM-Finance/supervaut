import React from "react";
import classNames from "classnames";

import { AugurTextLogo, v2AugurLogo, AugurBetaLogo, AugurBetaTextLogo } from "./icons";
import { useAppStatusStore } from "../../stores/app-status";
import { MarketsLink } from "../../utils/links/links";

import Styles from "./logo.styles.less";

export interface LogoProps {
  isMobile?: boolean;
  darkTheme?: boolean;
}

export const Logo = ({ isMobile, darkTheme }: LogoProps) => (
  <section className={classNames(Styles.v2Logo, { [Styles.Dark]: darkTheme })}>
    {isMobile ? v2AugurLogo : AugurTextLogo}
  </section>
);

export const LinkLogo = ({ alwaysFull = false }) => {
  const { isMobile } = useAppStatusStore();

  return (
    <MarketsLink id="logolink">
      <section aria-label="Augur markets list page link" className={Styles.LogoBeta}>
        {isMobile && !alwaysFull ? AugurBetaLogo : AugurBetaTextLogo}
      </section>
    </MarketsLink>
  );
};

export default Logo;
