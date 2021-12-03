// *
// * Colors
// *
const yellow200 = '#FFF59D';
const deepOrange600 = '#F4511E';
const lime300 = '#DCE775';
const lightGreen500 = '#8BC34A';
const teal700 = '#00796B';
const cyan900 = '#006064';
const colors = [
  deepOrange600,
  yellow200,
  lime300,
  lightGreen500,
  teal700,
  cyan900,
];
const blueGrey50 = '#ECEFF1';
const blueGrey300 = '#90A4AE';
const blueGrey700 = '#455A64';
const grey900 = '#212121';
const border = '#E6E6E6';
// *
// * Typography
// *
const sansSerif = "'Helvetica Neue', 'Helvetica', sans-serif";
const letterSpacing = 'normal';
const fontSize = 14;
// *
// * Layout
// *
const padding = 8;
const baseProps = {
  width: 300,
  height: 350,
  padding: { top: 50, bottom: 50, left: 5, right: 10 },
};
// *
// * Labels
// *
const baseLabelStyles = {
  fontFamily: sansSerif,
  fontSize,
  letterSpacing,
  padding,
  fill: blueGrey700,
  stroke: 'transparent',
  strokeWidth: 0,
};

const centeredLabelStyles = { textAnchor: 'middle', ...baseLabelStyles };
// *
// * Strokes
// *
// const strokeDasharray = '10, 5';
const strokeLinecap = 'round';
const strokeLinejoin = 'round';

export default {
  area: {
    style: {
      data: {
        fill: grey900,
        opacity: 0.7,
      },
      labels: baseLabelStyles,
    },
    ...baseProps,
  },
  axis: {
    style: {
      axis: {
        fill: 'transparent',
        stroke: border,
        strokeWidth: 1,
        strokeLinecap,
        strokeLinejoin,
      },
      axisLabel: { ...centeredLabelStyles, padding, stroke: 'transparent' },
      grid: {
        fill: 'none',
        stroke: border,
        pointerEvents: 'painted',
      },
      ticks: {
        fill: 'transparent',
        // size: 5,
        stroke: blueGrey300,
        strokeWidth: 1,
        strokeLinecap,
        strokeLinejoin,
      },
      tickLabels: { ...baseLabelStyles, fill: blueGrey700 },
    },
    ...baseProps,
  },
  polarDependentAxis: {
    style: {
      ticks: {
        fill: 'transparent',
        size: 1,
        stroke: 'transparent',
      },
    },
  },
  bar: {
    style: {
      data: {
        fill: blueGrey700,
        padding,
        strokeWidth: 0,
      },
      labels: baseLabelStyles,
    },
    ...baseProps,
  },
  // boxplot: {
  //   style: {
  //     max: { padding, stroke: blueGrey700, strokeWidth: 1 },
  //     maxLabels: { ...baseLabelStyles, padding: 3 },
  //     median: { padding, stroke: blueGrey700, strokeWidth: 1 },
  //     medianLabels: { ...baseLabelStyles, padding: 3 },
  //     min: { padding, stroke: blueGrey700, strokeWidth: 1 },
  //     minLabels: { ...baseLabelStyles, padding: 3 },
  //     q1: { padding, fill: blueGrey700 },
  //     q1Labels: { ...baseLabelStyles, padding: 3 },
  //     q3: { padding, fill: blueGrey700 },
  //     q3Labels: { ...baseLabelStyles, padding: 3 },
  //   },
  //   boxWidth: 20,
  //   ...baseProps,
  // },
  // candlestick: {
  //   style: {
  //     data: {
  //       stroke: blueGrey700,
  //     },
  //     labels: { ...baseLabelStyles, padding: 5 },
  //   },
  //   candleColors: {
  //     positive: '#ffffff',
  //     negative: blueGrey700,
  //   },
  //   ...baseProps,
  // },
  chart: baseProps,
  // errorbar: {
  //   borderWidth: 8,
  //   style: {
  //     data: {
  //       fill: 'transparent',
  //       opacity: 1,
  //       stroke: blueGrey700,
  //       strokeWidth: 2,
  //     },
  //     labels: baseLabelStyles,
  //   },
  //   ...baseProps,
  // },
  group: {
    padding: baseProps.padding,
  },
  // histogram: {
  //   style: {
  //     data: {
  //       fill: blueGrey700,
  //       stroke: grey900,
  //       strokeWidth: 2,
  //     },
  //     labels: baseLabelStyles,
  //   },
  //   ...baseProps,
  // },
  // legend: {
  //   colorScale: colors,
  //   gutter: 10,
  //   orientation: 'vertical',
  //   titleOrientation: 'top',
  //   style: {
  //     data: {
  //       type: 'circle',
  //     },
  //     labels: baseLabelStyles,
  //     title: { ...baseLabelStyles, padding: 5 },
  //   },
  // },
  line: {
    style: {
      data: {
        fill: 'transparent',
        opacity: 1,
        stroke: blueGrey700,
        strokeWidth: 2,
      },
      labels: baseLabelStyles,
    },
    ...baseProps,
  },
  pie: {
    colorScale: colors,
    style: {
      data: {
        padding,
        stroke: blueGrey50,
        strokeWidth: 1,
      },
      labels: { ...baseLabelStyles, padding: 20 },
    },
    ...baseProps,
  },
  scatter: {
    style: {
      data: {
        fill: blueGrey700,
        opacity: 1,
        stroke: 'transparent',
        strokeWidth: 0,
      },
      labels: baseLabelStyles,
    },
    ...baseProps,
  },
  stack: {
    colorScale: colors,
    ...baseProps,
  },
  tooltip: {
    style: { ...baseLabelStyles, padding: 0, pointerEvents: 'none' },
    flyoutStyle: {
      stroke: grey900,
      strokeWidth: 1,
      fill: '#f0f0f0',
      pointerEvents: 'none',
    },
    flyoutPadding: 5,
    cornerRadius: 5,
    pointerLength: 10,
  },
  voronoi: {
    style: {
      data: {
        fill: 'transparent',
        stroke: 'transparent',
        strokeWidth: 0,
      },
      labels: { ...baseLabelStyles, padding: 5, pointerEvents: 'none' },
      flyout: {
        stroke: grey900,
        strokeWidth: 1,
        fill: '#f0f0f0',
        pointerEvents: 'none',
      },
    },
    ...baseProps,
  },
};
