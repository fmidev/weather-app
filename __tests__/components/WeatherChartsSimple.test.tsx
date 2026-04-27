import React from 'react';
import { render } from '@testing-library/react-native';

import TemperatureChart from '../../src/components/weather/charts/TemperatureChart';
import PrecipitationChart from '../../src/components/weather/charts/PrecipitationChart';
import WindChart from '../../src/components/weather/charts/WindChart';
import HumidityChart from '../../src/components/weather/charts/HumidityChart';
import PressureChart from '../../src/components/weather/charts/PressureChart';
import VisCloudChart from '../../src/components/weather/charts/VisCloudChart';
import CloudHeightChart from '../../src/components/weather/charts/CloudHeightChart';
import DailyChart from '../../src/components/weather/charts/DailyChart';
import SnowDepthChart from '../../src/components/weather/charts/SnowDepth';
import UvChart from '../../src/components/weather/charts/UvChart';
import WeatherChart from '../../src/components/weather/charts/WeatherChart';

const mockConfigGet = jest.fn();
const mockVictoryGroup = jest.fn();
const mockVictoryLine = jest.fn();
const mockVictoryBar = jest.fn();
const mockVictoryArea = jest.fn();
const mockVictoryScatter = jest.fn();
const mockGetPrecipitationLevel = jest.fn();
const mockGetWindDirection = jest.fn();
const mockSecondaryYDomainForWeatherChart = jest.fn();
const mockDailyChartTickValues = jest.fn();
const mockUseSelector = jest.fn();

jest.mock('@config', () => ({
  Config: {
    get: (...args: any[]) => mockConfigGet(...args),
  },
}));

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    colors: {
      chartPrimaryLine: '#0055aa',
      chartSecondaryLine: '#ff6600',
      primaryText: '#111111',
      rain: {
        1: '#1111ff',
        2: '#2222ff',
        3: '#3333ff',
        4: '#4444ff',
        5: '#5555ff',
        6: '#6666ff',
        7: '#7777ff',
        8: '#8888ff',
      },
    },
  }),
}));

jest.mock('react-redux', () => ({
  useSelector: (...args: any[]) => mockUseSelector(...args),
}));

jest.mock('@store/observation/selector', () => ({
  selectDailyData: jest.fn(),
  selectPreferredDailyParameters: jest.fn(),
}));

jest.mock('@utils/helpers', () => ({
  getPrecipitationLevel: (...args: any[]) => mockGetPrecipitationLevel(...args),
  getWindDirection: (...args: any[]) => mockGetWindDirection(...args),
}));

jest.mock('@utils/chart', () => ({
  dailyChartTickValues: (...args: any[]) => mockDailyChartTickValues(...args),
  secondaryYDomainForWeatherChart: (...args: any[]) =>
    mockSecondaryYDomainForWeatherChart(...args),
}));

jest.mock('moment', () => {
  const actualMoment = jest.requireActual('moment');
  const wrappedMoment = (value?: any) => {
    const instance = actualMoment(value);
    return {
      ...instance,
      minutes: () => instance.minutes(),
      hours: () => instance.hours(),
    };
  };
  Object.assign(wrappedMoment, actualMoment);
  return wrappedMoment;
});

jest.mock('@assets/Icon', () => ({
  __esModule: true,
  default: ({ name }: any) => {
    const { Text } = require('react-native');
    return <Text testID={`icon-${name}`}>{name}</Text>;
  },
}));

jest.mock('victory-native', () => {
  const { View, Text } = require('react-native');

  return {
    VictoryGroup: (props: any) => {
      mockVictoryGroup(props);
      return <View testID="victory-group">{props.children}</View>;
    },
    VictoryLine: (props: any) => {
      mockVictoryLine(props);
      return <Text testID="victory-line">line</Text>;
    },
    VictoryBar: (props: any) => {
      mockVictoryBar(props);
      return <Text testID="victory-bar">bar</Text>;
    },
    VictoryArea: (props: any) => {
      mockVictoryArea(props);
      return <Text testID="victory-area">area</Text>;
    },
    VictoryScatter: (props: any) => {
      mockVictoryScatter(props);
      return <Text testID="victory-scatter">scatter</Text>;
    },
  };
});

describe('weather chart leaf components', () => {
  const chartDomain = { x: [1, 2], y: [0, 10] } as any;

  beforeEach(() => {
    mockConfigGet.mockReset();
    mockVictoryGroup.mockClear();
    mockVictoryLine.mockClear();
    mockVictoryBar.mockClear();
    mockVictoryArea.mockClear();
    mockVictoryScatter.mockClear();
    mockGetPrecipitationLevel.mockReset();
    mockGetWindDirection.mockReset();
    mockSecondaryYDomainForWeatherChart.mockReset();
    mockDailyChartTickValues.mockReset();
    mockUseSelector.mockReset();

    mockConfigGet.mockImplementation((key: string) => {
      if (key === 'settings') {
        return {
          units: {
            precipitation: 'mm',
          },
        };
      }
      return {};
    });
    mockGetPrecipitationLevel.mockReturnValue(3);
    mockGetWindDirection.mockReturnValue(225);
    mockSecondaryYDomainForWeatherChart.mockReturnValue({ y: [0, 5] });
    mockDailyChartTickValues.mockReturnValue([10, 20, 30]);
    mockUseSelector.mockReturnValue([]);
  });

  it('renders temperature family lines', () => {
    render(
      <TemperatureChart
        chartValues={{
          temperature: [{ x: 1, y: 1 }],
          feelsLike: [{ x: 1, y: 0 }],
          dewPoint: [{ x: 1, y: -1 }],
        } as any}
        chartDomain={chartDomain}
        chartWidth={320}
      />
    );

    expect(mockVictoryLine).toHaveBeenCalledTimes(3);
  });

  it('renders precipitation bars and pop line with unit fallback', () => {
    render(
      <PrecipitationChart
        chartValues={{
          precipitation1h: [{ x: 1, y: 2 }],
          pop: [{ x: 1, y: 50 }],
        } as any}
        chartDomain={chartDomain}
        chartWidth={320}
      />
    );

    expect(mockVictoryBar).toHaveBeenCalledTimes(1);
    expect(mockVictoryLine).toHaveBeenCalledTimes(1);
    const fill = mockVictoryBar.mock.calls[0][0].style.data.fill;
    expect(fill({ datum: { y: 2 } })).toBe('#3333ff');
    expect(mockGetPrecipitationLevel).toHaveBeenCalledWith(2, 'mm');
  });

  it('renders wind area, speed and gust lines and prepares wind label component', () => {
    render(
      <WindChart
        chartValues={{
          windSpeedMS: [{ x: 0, y: 5 }, { x: 3600000, y: 6 }],
          windGust: [{ x: 0, y: 8 }, { x: 3600000, y: 9 }],
          windDirection: [{ x: 0, y: 90 }, { x: 3600000, y: 180 }],
        } as any}
        chartDomain={chartDomain}
        chartWidth={200}
      />
    );

    expect(mockVictoryArea).toHaveBeenCalledTimes(1);
    expect(mockVictoryLine).toHaveBeenCalledTimes(2);
    expect(mockVictoryLine.mock.calls[0][0].labelComponent).toBeTruthy();
  });

  it('uses relative humidity fallback when humidity is missing', () => {
    render(
      <HumidityChart
        chartValues={{
          relativeHumidity: [{ x: 1, y: 80 }],
        } as any}
        chartDomain={chartDomain}
        chartWidth={320}
      />
    );

    expect(mockVictoryLine.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        data: [{ x: 1, y: 80 }],
      })
    );
  });

  it('renders pressure and uv single-line charts', () => {
    render(
      <>
        <PressureChart
          chartValues={{ pressure: [{ x: 1, y: 1000 }] } as any}
          chartDomain={chartDomain}
          chartWidth={320}
        />
        <UvChart
          chartValues={{ uvCumulated: [{ x: 1, y: 4 }] } as any}
          chartDomain={chartDomain}
          chartWidth={320}
        />
      </>
    );

    expect(mockVictoryLine).toHaveBeenCalledTimes(2);
  });

  it('renders visibility and total cloud cover chart parts', () => {
    render(
      <VisCloudChart
        chartValues={{
          totalCloudCover: [{ x: 1, y: 6 }],
          visibility: [{ x: 1, y: 30000 }],
        } as any}
        chartDomain={chartDomain}
        chartWidth={320}
      />
    );

    expect(mockVictoryBar).toHaveBeenCalledTimes(1);
    expect(mockVictoryLine).toHaveBeenCalledTimes(1);
  });

  it('renders cloud height line', () => {
    render(
      <CloudHeightChart
        chartValues={{ cloudHeight: [{ x: 1, y: 1200 }] } as any}
        chartDomain={chartDomain}
        chartWidth={320}
      />
    );

    expect(mockVictoryLine).toHaveBeenCalledTimes(1);
  });

  it('renders daily chart bars and scatter from valid values only', () => {
    render(
      <DailyChart
        chartValues={{
          rrday: [{ x: 1, y: 2 }, { x: 2, y: -1 }],
          maximumTemperature: [{ x: 1, y: 4 }],
          minimumTemperature: [{ x: 1, y: -2 }],
          minimumGroundTemperature06: [{ x: 1, y: -5 }],
        } as any}
        chartDomain={chartDomain}
        chartWidth={320}
      />
    );

    expect(mockVictoryBar).toHaveBeenCalledTimes(2);
    expect(mockVictoryScatter).toHaveBeenCalledTimes(1);
    expect(mockVictoryBar.mock.calls[0][0].data).toEqual([{ x: 1, y: 2 }]);
  });

  it('renders snow depth from daily observations when preferred parameter is daily snow depth', () => {
    mockUseSelector
      .mockReturnValueOnce(['snowDepth'])
      .mockReturnValueOnce([
        { epochtime: 10, snowDepth06: 12 },
        { epochtime: 11, snowDepth06: null },
      ]);

    render(
      <SnowDepthChart
        chartValues={{ snowDepth: [] } as any}
        chartDomain={chartDomain}
        chartWidth={320}
      />
    );

    expect(mockDailyChartTickValues).toHaveBeenCalledWith(30);
    expect(mockVictoryBar.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        barWidth: 10,
        data: [{ x: 10000, y: 12 }],
      })
    );
  });

  it('renders weather combo chart with precipitation and temperature lines', () => {
    render(
      <WeatherChart
        chartValues={{
          precipitation1h: [{ x: 1, y: 2 }],
          temperature: [{ x: 1, y: 1 }],
          feelsLike: [{ x: 1, y: 0 }],
          dewPoint: [{ x: 1, y: -1 }],
        } as any}
        chartDomain={chartDomain}
        chartWidth={320}
      />
    );

    expect(mockSecondaryYDomainForWeatherChart).toHaveBeenCalled();
    expect(mockVictoryBar).toHaveBeenCalledTimes(1);
    expect(mockVictoryLine).toHaveBeenCalledTimes(3);
  });
});
