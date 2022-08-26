import React, { useEffect, useState, useMemo, useRef } from "react";
import Highcharts from "highcharts/highstock";
import NoDataToDisplay from "highcharts/modules/no-data-to-display";
import Styles from "./charts.styles.less";
import classNames from "classnames";
import type { MarketInfo } from "@augurproject/comps/build/types";
import {
  Constants,
  createBigNumber,
  Formatter,
  Icons,
  SelectionComps,
  MarketCardComps,
  DateUtils,
} from "@augurproject/comps";
import { SimplifiedStore } from "modules/stores/simplified";
const { MultiButtonSelection } = SelectionComps;
const { orderOutcomesForDisplay } = MarketCardComps;
const { formatCashPrice } = Formatter;
const { Checkbox } = Icons;
const { TransactionTypes } = Constants;
const { getDayFormat, getTimeFormat } = DateUtils;
const HIGHLIGHTED_LINE_WIDTH = 2;
const NORMAL_LINE_WIDTH = 2;
const ONE_MIN = 60;
const FIFTEEN_MIN = 900;
const ONE_HOUR = 3600;
const ONE_QUARTER_DAY = ONE_HOUR * 6;
const ONE_DAY = 24 * ONE_HOUR;
const ONE_WEEK = ONE_DAY * 7;
const ONE_MONTH = ONE_DAY * 30;
const DATE = new Date();
const END_TIME = Math.floor(DATE.getTime() / 1000);

const RANGE_OPTIONS = [
  {
    id: 0,
    label: "24hr",
    tick: FIFTEEN_MIN,
    startTime: END_TIME - ONE_DAY,
  },
  {
    id: 1,
    label: "7d",
    tick: ONE_HOUR,
    startTime: END_TIME - ONE_WEEK,
  },
  {
    id: 2,
    label: "30d",
    tick: ONE_QUARTER_DAY,
    startTime: END_TIME - ONE_MONTH,
  },
  {
    id: 3,
    label: "All time",
    tick: ONE_DAY,
    startTime: END_TIME - ONE_MONTH * 6,
  },
];

const SERIES_COLORS = ["#58586B", "#05B169", "#FF7D5E", "#73D2DE", "#218380", "#FFBC42", "#D81159", "#1F71B5"];
const SERIES_GRADIENTS = [
  [
    [0, "rgba(88, 88, 107, .15)"],
    [1, "rgba(88, 88, 107, 0)"],
  ],
  [
    [0, "rgba(5, 177, 105, .15)"],
    [1, "rgba(5, 177, 105, 0)"],
  ],
  [
    [0, "rgba(255, 125, 94, .15)"],
    [1, "rgba(255, 125, 94, 0)"],
  ],
  [
    [0, "rgba(​115, ​210, ​222, 0.15)"],
    [1, "rgba(​115, ​210, ​222, 0)"],
  ],
  [
    [0, "rgba(​33, ​131, 128, 0.15)"],
    [1, "rgba(​33, ​131, 128, 0)"],
  ],
  [
    [0, "rgba(​255, ​188, ​66, 0.15)"],
    [1, "rgba(​255, ​188, ​66, 0)"],
  ],
  [
    [0, "rgba(​216, 17, 89, 0.15)"],
    [1, "rgba(​216, 17, 89, 0)"],
  ],
  [
    [0, "rgba(​31, 113, ​181, 0.15)"],
    [1, "rgba(​31, 113, ​181, 0)"],
  ],
];

interface HighcartsChart extends Highcharts.Chart {
  renderTo?: string | Element | React.ReactNode;
}

const calculateRangeSelection = (rangeSelection, market) => {
  const marketStart = market.creationTimestamp;
  let { startTime, tick } = RANGE_OPTIONS[rangeSelection];
  if (rangeSelection === 3) {
    // allTime:
    const timespan = END_TIME - marketStart;
    const numHoursRd = Math.round(timespan / ONE_HOUR);
    tick = ONE_MIN;
    if (numHoursRd <= 12) {
      tick = ONE_MIN * 5;
    } else if (numHoursRd <= 24) {
      tick = ONE_MIN * 10;
    } else if (numHoursRd <= 48) {
      tick = FIFTEEN_MIN;
    } else if (numHoursRd <= 24 * 7) {
      tick = ONE_HOUR;
    } else if (numHoursRd <= 24 * 30) {
      tick = ONE_QUARTER_DAY;
    } else {
      tick = ONE_DAY;
    }
    startTime = marketStart - tick;
  }
  const totalTicks = (END_TIME - startTime) / tick;
  return { totalTicks, startTime, tick };
};

const determineLastPrice = (sortedOutcomeTrades, startTime) => {
  let lastPrice = 0;
  const index = sortedOutcomeTrades.sort((a, b) => b.timestamp - a.timestamp).findIndex((t) => startTime > t.timestamp);
  const sortTS = sortedOutcomeTrades[index]?.timestamp;
  if (!isNaN(sortTS)) {
    lastPrice = sortedOutcomeTrades[index].price;
  }
  return createBigNumber(lastPrice).toFixed(4);
};

const processPriceTimeData = (transactions = [], formattedOutcomes, market, rangeSelection) => ({
  priceTimeArray: formattedOutcomes.map((outcome) => {
    const { startTime, tick, totalTicks } = calculateRangeSelection(rangeSelection, market);
    const newArray: any[] = [];
    const trades = (transactions || []).filter(
      (t) => t.tx_type === TransactionTypes.ENTER || t.tx_type === TransactionTypes.EXIT
    );
    const sortedOutcomeTrades = trades
      .filter((t) => Number(t.outcome) === Number(outcome?.id))
      .sort((a, b) => a?.timestamp - b?.timestamp);
    let newLastPrice = determineLastPrice(sortedOutcomeTrades, startTime);
    for (let i = 0; i < totalTicks; i++) {
      const curTick = startTime + tick * i;
      const nextTick = curTick + tick;
      const matchingTrades = sortedOutcomeTrades.filter((trade) => {
        const tradeTime = trade.timestamp;
        return tradeTime > curTick && nextTick > tradeTime;
      });
      let priceToUse = newLastPrice;
      let amountToUse = 0;
      if (matchingTrades.length > 0) {
        const FinalTradeOfPeriod = matchingTrades[matchingTrades.length - 1];
        priceToUse = FinalTradeOfPeriod.price;
        amountToUse = FinalTradeOfPeriod.amount;
      }
      const nextPrice = createBigNumber(priceToUse).toFixed(4);
      newArray.push({
        price: nextPrice,
        amount: amountToUse,
        timestamp: curTick,
      });
      newLastPrice = nextPrice;
    }
    return newArray;
  }),
});

export const PriceHistoryChart = ({
  transactions,
  formattedOutcomes,
  market,
  selectedOutcomes,
  rangeSelection,
  cash,
}) => {
  const container = useRef(null);
  const { maxPriceBigNumber: maxPrice, minPriceBigNumber: minPrice } = market;
  const { priceTimeArray } = processPriceTimeData(transactions, formattedOutcomes, market, rangeSelection);
  const options = useMemo(() => {
    return getOptions({
      maxPrice,
      minPrice,
      cash,
    });
  }, [maxPrice, minPrice]);

  useMemo(() => {
    const chartContainer = container.current;
    if (chartContainer) {
      const chart: HighcartsChart = Highcharts.charts.find(
        (chart: HighcartsChart) => chart?.renderTo === chartContainer
      );
      const formattedOutcomes = getFormattedOutcomes({ market });
      const series =
        priceTimeArray.length === 0 ? [] : handleSeries(priceTimeArray, selectedOutcomes, formattedOutcomes);
      if (!chart || chart?.renderTo !== chartContainer) {
        Highcharts.stockChart(chartContainer, { ...options, series });
      } else {
        series?.forEach((seriesObj, index) => {
          if (chart.series[index]) {
            chart.series[index].update(seriesObj, true);
          } else {
            chart.addSeries(seriesObj, true);
          }
        });
        chart.redraw();
      }
    }
    // eslint-disable-next-line
  }, [selectedOutcomes, options, priceTimeArray]);

  useEffect(() => {
    // set no data chart and cleanup chart on dismount
    const chartContainer = container.current;
    NoDataToDisplay(Highcharts);
    return () => {
      Highcharts.charts.find((chart: HighcartsChart) => chart?.renderTo === chartContainer)?.destroy();
    };
  }, []);

  return (
    <section
      className={Styles.PriceHistoryChart}
      ref={container}
    />
  );
};

export const SelectOutcomeButton = ({
  outcome: { id, outcomeIdx, label, lastPrice },
  toggleSelected,
  isSelected,
  cash,
  disabled = false,
}: typeof React.Component) => {
  const OutcomePrice =
    isNaN(Number(lastPrice)) || Number(lastPrice) <= 0
      ? `-`
      : formatCashPrice(createBigNumber(lastPrice), cash?.name).full;
  return (
    <button
      className={classNames(Styles.SelectOutcomeButton, {
        [Styles[`isSelected_${id}`]]: isSelected,
      })}
      onClick={() => toggleSelected(outcomeIdx)}
      disabled={disabled}
    >
      <span>{Checkbox}</span>
      {label}
      <b>{OutcomePrice}</b>
    </button>
  );
};

export const SimpleChartSection = ({ market, cash, transactions }) => {
  const formattedOutcomes = getFormattedOutcomes({ market });
  const [selectedOutcomes, setSelectedOutcomes] = useState(formattedOutcomes.map(({ outcomeIdx }) => true));
  const [rangeSelection, setRangeSelection] = useState(3);
  const [showMore, setShowMore] = useState(false);

  const toggleOutcome = (id) => {
    const updates: boolean[] = [].concat(selectedOutcomes);
    updates[id] = !updates[id];
    setSelectedOutcomes(updates);
  };
  const marketHasNoLiquidity = !market.amm?.id && !market.hasWinner;
  const hasInvalid = formattedOutcomes.find((outcome) => outcome.isInvalid);
  return (
    <section className={Styles.SimpleChartSection}>
      <MultiButtonSelection
        options={RANGE_OPTIONS}
        selection={rangeSelection}
        setSelection={(id) => setRangeSelection(id)}
      />
      {marketHasNoLiquidity ? (
        <section className={Styles.IlliquidMarketChart}>No Price History To Show</section>
      ) : (
        <PriceHistoryChart
          {...{
            market,
            transactions,
            formattedOutcomes,
            selectedOutcomes,
            rangeSelection,
            cash,
          }}
        />
      )}
      <div>
        {formattedOutcomes.map((outcome, index) =>
          !showMore && index >= 6 ? null : (
            <SelectOutcomeButton
              key={`${outcome.id}_${outcome.name}`}
              cash={cash}
              outcome={hasInvalid ? outcome : { ...outcome, id: outcome.id + 1 }}
              toggleSelected={toggleOutcome}
              isSelected={selectedOutcomes[outcome.outcomeIdx]}
            />
          )
        )}
      </div>
      {formattedOutcomes.length > 6 && (
        <button onClick={() => setShowMore(!showMore)}>{`View ${showMore ? "Less" : "More"}`}</button>
      )}
    </section>
  );
};

export default SimpleChartSection;

// helper functions:
const handleSeries = (priceTimeArray, selectedOutcomes, formattedOutcomes, mostRecentTradetime = 0) => {
  const series: any[] = [];
  const hasInvalid = formattedOutcomes.find((outcome) => outcome.isInvalid);
  priceTimeArray.forEach((priceTimeData, index) => {
    const length = priceTimeData.length;
    const isSelected = selectedOutcomes[index];
    if (length > 0 && priceTimeData[length - 1].timestamp > mostRecentTradetime) {
      mostRecentTradetime = priceTimeData[length - 1].timestamp;
    }
    const data = priceTimeData.map((pts) => [pts.timestamp, createBigNumber(pts.price).toNumber()]);
    const outcome = formattedOutcomes[index];
    const baseSeriesOptions = {
      name: outcome.label,
      type: "areaspline",
      linecap: "round",
      lineWidth: isSelected ? HIGHLIGHTED_LINE_WIDTH : NORMAL_LINE_WIDTH,
      animation: false,
      states: {
        hover: {
          lineWidth: isSelected ? HIGHLIGHTED_LINE_WIDTH : NORMAL_LINE_WIDTH,
        },
      },
      color: SERIES_COLORS[hasInvalid ? outcome.id : outcome.id + 1],
      fillColor: {
        linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
        stops: SERIES_GRADIENTS[hasInvalid ? outcome.id : outcome.id + 1],
      },
      marker: {
        enabled: false,
        symbol: "circle",
        states: {
          hover: {
            enabled: true,
            symbol: "circle",
            radius: 4,
          },
        },
      },
      data,
      visible: isSelected,
    };

    series.push({ ...baseSeriesOptions });
  });
  series.forEach((seriesObject) => {
    const seriesData = seriesObject.data;
    // make sure we have a trade to fill chart
    if (seriesData.length > 0 && seriesData[seriesData.length - 1][0] !== mostRecentTradetime) {
      const mostRecentTrade = seriesData[seriesData.length - 1];
      seriesObject.data.push([mostRecentTradetime, mostRecentTrade[1]]);
    }
    seriesObject.data.sort((a, b) => a[0] - b[0]);
  });
  return series;
};

const getOptions = ({ maxPrice = createBigNumber(1), minPrice = createBigNumber(0), cash }) => ({
  lang: {
    noData: "No Chart Data",
  },
  title: {
    text: "",
  },
  chart: {
    alignTicks: false,
    backgroundColor: "transparent",
    type: "areaspline",
    styledMode: false,
    animation: true,
    reflow: true,
    spacing: [8, 0, 8, 0],
    panning: { enabled: false },
    zoomType: undefined,
    pinchType: undefined,
    panKey: undefined,
    zoomKey: undefined,
  },
  credits: {
    enabled: false,
  },
  plotOptions: {
    areaspline: {
      threshold: null,
      animation: true,
    },
  },
  scrollbar: { enabled: false },
  navigator: { enabled: false },
  xAxis: {
    ordinal: false,
    tickLength: 0,
    gridLineWidth: 0,
    gridLineColor: null,
    lineWidth: 0,
    labels: false,
  },
  yAxis: {
    showEmpty: true,
    opposite: false,
    max: maxPrice.toFixed(2),
    min: minPrice.toFixed(2),
    gridLineWidth: 0,
    gridLineColor: null,
    labels: false,
  },
  tooltip: {
    enabled: true,
    shape: "square",
    shared: true,
    split: false,
    useHTML: true,
    formatter() {
      const {
        settings: { timeFormat },
      } = SimplifiedStore.get();
      const that = this as any;
      const date = `${getDayFormat(that.x)}, ${getTimeFormat(that.x, timeFormat)}`;
      let out = `<h5>${date}</h5><ul>`;
      that.points.forEach((point) => {
        out += `<li><span style="color:${point.color}">&#9679;</span><b>${point.series.name}</b><span>${
          formatCashPrice(createBigNumber(point.y), cash?.name).full
        }</span></li>`;
      });
      out += "</ul>";
      return out;
    },
  },
  time: {
    useUTC: false,
  },
  rangeSelector: {
    enabled: false,
  },
});

export const getFormattedOutcomes = ({ market: { amm } }: { market: MarketInfo }) =>
  orderOutcomesForDisplay(amm.ammOutcomes, amm?.market?.marketFactoryType).map((outcome, outcomeIdx) => ({
    ...outcome,
    outcomeIdx,
    label: (outcome?.name).toLowerCase(),
    lastPrice: !amm.hasLiquidity ? "-" : outcome.price,
  }));
