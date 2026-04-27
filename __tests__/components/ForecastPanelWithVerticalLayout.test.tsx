import React from 'react';
import moment from 'moment-timezone';
import { fireEvent, render } from '@testing-library/react-native';

import ForecastPanelWithVerticalLayout from '../../src/components/weather/ForecastPanelWithVerticalLayout';

const mockConfigGet = jest.fn();
const mockFormatAccessibleDateTime = jest.fn();
const mockPanelHeader = jest.fn();
const mockTrackMatomoEvent = jest.fn();
const mockRBSheetOpen = jest.fn();
const mockRBSheetClose = jest.fn();
const mockVertical10DaysForecast = jest.fn();
const mockChartList = jest.fn();

jest.mock('react-redux', () => ({
  connect: () => (Component: any) => Component,
}));

jest.mock('@store/forecast/selectors', () => ({
  selectLoading: jest.fn(),
  selectForecastByDay: jest.fn(),
  selectHeaderLevelForecast: jest.fn(),
  selectForecastLastUpdatedMoment: jest.fn(),
  selectForecast: jest.fn(),
  selectDisplayFormat: jest.fn(),
  selectForecastAge: jest.fn(),
}));

jest.mock('@store/location/selector', () => ({
  selectTimeZone: jest.fn(),
}));

jest.mock('@store/settings/selectors', () => ({
  selectClockType: jest.fn(),
}));

jest.mock('@store/forecast/actions', () => ({
  updateDisplayFormat: jest.fn((value: string) => ({
    type: 'UPDATE_DISPLAY_FORMAT',
    payload: value,
  })),
}));

jest.mock('@config', () => ({
  Config: {
    get: (...args: any[]) => mockConfigGet(...args),
  },
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({
    left: 9,
    right: 11,
    top: 0,
    bottom: 0,
  }),
}));

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    colors: {
      background: '#ffffff',
      chartSecondaryLine: '#2255aa',
      hourListText: '#444444',
      inputButtonBackground: '#ffffff',
      primaryText: '#111111',
      secondaryBorder: '#dddddd',
      shadow: '#000000',
      timeStepBackground: '#eeeeee',
    },
  }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) =>
      options?.forecastLength ? `${key}:${options.forecastLength}` : key,
    i18n: { language: 'en' },
  }),
}));

jest.mock('@utils/helpers', () => ({
  formatAccessibleDateTime: (...args: any[]) =>
    mockFormatAccessibleDateTime(...args),
}));

jest.mock('@utils/matomo', () => ({
  trackMatomoEvent: (...args: any[]) => mockTrackMatomoEvent(...args),
}));

jest.mock('@components/common/AppText', () => ({
  __esModule: true,
  default: ({ children, ...props }: any) => {
    const { Text } = require('react-native');
    return <Text {...props}>{children}</Text>;
  },
}));

jest.mock('@components/common/ScalableIcon', () => ({
  __esModule: true,
  default: ({ name }: any) => {
    const { Text } = require('react-native');
    return <Text testID={`icon-${name}`}>{name}</Text>;
  },
}));

jest.mock('@components/common/AccessibleTouchableOpacity', () => ({
  __esModule: true,
  default: ({ children, onPress, ...props }: any) => {
    const { Pressable } = require('react-native');
    return (
      <Pressable onPress={onPress} {...props}>
        {children}
      </Pressable>
    );
  },
}));

jest.mock('react-native-raw-bottom-sheet', () => {
  const ReactActual = require('react');
  return {
    __esModule: true,
    default: ReactActual.forwardRef(({ children }: any, ref: any) => {
      ReactActual.useImperativeHandle(ref, () => ({
        open: mockRBSheetOpen,
        close: mockRBSheetClose,
      }));
      const { View } = require('react-native');
      return <View testID="rb-sheet">{children}</View>;
    }),
  };
});

jest.mock('../../src/components/weather/common/PanelHeader', () => ({
  __esModule: true,
  default: (props: any) => {
    mockPanelHeader(props);
    const { Text } = require('react-native');
    return <Text testID="panel-header">{props.title}</Text>;
  },
}));

jest.mock('../../src/components/weather/forecast/Vertical10DaysForecast', () => ({
  __esModule: true,
  default: (props: any) => {
    mockVertical10DaysForecast(props);
    const { Text } = require('react-native');
    return <Text testID="vertical-forecast">{props.dayData.length}</Text>;
  },
}));

jest.mock('../../src/components/weather/forecast/ChartList', () => ({
  __esModule: true,
  default: (props: any) => {
    mockChartList(props);
    const { Text } = require('react-native');
    return <Text testID="chart-list">{props.currentDayOffset}</Text>;
  },
}));

jest.mock('../../src/components/weather/sheets/ParamsBottomSheet', () => ({
  __esModule: true,
  default: ({ onClose }: any) => {
    const { Pressable, Text } = require('react-native');
    return (
      <Pressable testID="params-sheet" onPress={onClose}>
        <Text>params</Text>
      </Pressable>
    );
  },
}));

jest.mock('../../src/components/weather/sheets/WeatherInfoBottomSheet', () => ({
  __esModule: true,
  default: ({ onClose }: any) => {
    const { Pressable, Text } = require('react-native');
    return (
      <Pressable testID="weather-info-sheet" onPress={onClose}>
        <Text>info</Text>
      </Pressable>
    );
  },
}));

const baseProps = {
  clockType: 24 as any,
  loading: false,
  forecastByDay: {
    '1.1.': [{ epochtime: 1 }, { epochtime: 2 }],
  },
  data: [{ epochtime: 1 }, { epochtime: 2 }, { epochtime: 3 }],
  forecastLastUpdatedMoment: moment('2035-01-01T12:00:00Z'),
  forecastAge: 120000,
  headerLevelForecast: [{ timeStamp: 1 }],
  timezone: 'Europe/Helsinki',
  displayFormat: 'table',
  updateDisplayFormat: jest.fn(),
  currentHour: 12,
};

describe('ForecastPanelWithVerticalLayout', () => {
  beforeEach(() => {
    mockConfigGet.mockReset();
    mockFormatAccessibleDateTime.mockReset();
    mockPanelHeader.mockClear();
    mockTrackMatomoEvent.mockClear();
    mockRBSheetOpen.mockClear();
    mockRBSheetClose.mockClear();
    mockVertical10DaysForecast.mockClear();
    mockChartList.mockClear();
    baseProps.updateDisplayFormat.mockClear();

    mockConfigGet.mockImplementation((key: string) => {
      if (key === 'weather') {
        return {
          forecast: {
            ageWarning: 1,
            forecastLengthTitle: 7,
          },
        };
      }
      return {};
    });
    mockFormatAccessibleDateTime.mockReturnValue('accessible updated time');
  });

  it('renders vertical table layout with safe area padding and accessible header data', () => {
    const view = render(<ForecastPanelWithVerticalLayout {...baseProps} />);

    expect(view.getByTestId('panel-header')).toBeTruthy();
    expect(view.getByTestId('vertical-forecast')).toBeTruthy();
    expect(view.queryByTestId('chart-list')).toBeNull();
    expect(mockPanelHeader).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'panelHeader:7',
        accessibleTitle: 'accessiblePanelHeader:7',
        accessibleLastUpdated: 'accessible updated time',
        thin: true,
      })
    );
    expect(mockVertical10DaysForecast).toHaveBeenLastCalledWith(
      expect.objectContaining({
        dayData: baseProps.headerLevelForecast,
      })
    );

    const root = view.toJSON() as any;
    const mergedStyle = Object.assign(
      {},
      ...(Array.isArray(root.props.style) ? root.props.style : [root.props.style])
    );
    expect(mergedStyle.paddingLeft).toBe(9);
    expect(mergedStyle.paddingRight).toBe(11);
  });

  it('switches formats and opens bottom sheets', () => {
    const view = render(<ForecastPanelWithVerticalLayout {...baseProps} />);

    fireEvent.press(view.getByTestId('forecast_chart_button'));
    expect(mockTrackMatomoEvent).toHaveBeenCalledWith(
      'User action',
      'Weather',
      'Show forecast in CHART format'
    );
    expect(baseProps.updateDisplayFormat).toHaveBeenCalledWith('chart');

    fireEvent.press(view.getByTestId('forecast_table_button'));
    expect(baseProps.updateDisplayFormat).toHaveBeenCalledWith('table');

    fireEvent.press(view.getByTestId('params_button'));
    fireEvent.press(view.getByTestId('info_button'));
    expect(mockRBSheetOpen).toHaveBeenCalledTimes(2);

    fireEvent.press(view.getByTestId('weather-info-sheet'));
    expect(mockRBSheetClose).toHaveBeenCalledTimes(1);
  });

  it('renders chart view and loading state when configured', () => {
    const view = render(
      <ForecastPanelWithVerticalLayout
        {...baseProps}
        loading
        displayFormat="chart"
      />
    );

    expect(view.getByA11yLabel('weather:loading')).toBeTruthy();
    expect(view.getByTestId('chart-list')).toBeTruthy();
    expect(view.queryByTestId('vertical-forecast')).toBeNull();
    expect(mockChartList).toHaveBeenLastCalledWith(
      expect.objectContaining({
        data: baseProps.data,
        currentDayOffset: 2,
      })
    );
  });
});
