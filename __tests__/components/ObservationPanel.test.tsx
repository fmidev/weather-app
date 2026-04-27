import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import ObservationPanel from '../../src/components/weather/ObservationPanel';

const mockChart = jest.fn();
const mockConfigGet = jest.fn();
const mockLatest = jest.fn();
const mockList = jest.fn();
const mockParameterSelector = jest.fn();
const mockPanelHeader = jest.fn();
const mockRBSheetClose = jest.fn();
const mockRBSheetOpen = jest.fn();
const mockSetStationId = jest.fn();
const mockTrackMatomoEvent = jest.fn();
const mockUpdateChartParameter = jest.fn();
const mockUpdateDisplayFormat = jest.fn();

jest.mock('react-redux', () => ({
  connect: () => (Component: any) => Component,
}));

jest.mock('@store/location/selector', () => ({
  selectCurrent: jest.fn(),
}));

jest.mock('@store/observation/selector', () => ({
  selectChartDisplayParameter: jest.fn(),
  selectData: jest.fn(),
  selectDailyData: jest.fn(),
  selectDataId: jest.fn(),
  selectDisplayFormat: jest.fn(),
  selectLoading: jest.fn(),
  selectStationId: jest.fn(),
  selectStationList: jest.fn(),
  selectPreferredDailyParameters: jest.fn(),
}));

jest.mock('@store/observation/actions', () => ({
  setStationId: jest.fn((dataId: string, stationId: string) => ({
    type: 'SET_STATION',
    payload: { dataId, stationId },
  })),
  updateChartParameter: jest.fn((value: string) => ({
    type: 'UPDATE_CHART_PARAMETER',
    payload: value,
  })),
  updateDisplayFormat: jest.fn((value: string) => ({
    type: 'UPDATE_DISPLAY_FORMAT',
    payload: value,
  })),
}));

jest.mock('@store/settings/selectors', () => ({
  selectClockType: jest.fn(),
}));

jest.mock('@config', () => ({
  Config: {
    get: (...args: any[]) => mockConfigGet(...args),
  },
}));

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    colors: {
      background: '#ffffff',
      chartSecondaryLine: '#2255aa',
      hourListText: '#444444',
      inputButtonBackground: '#ffffff',
      primaryText: '#111111',
      secondaryBorder: '#cccccc',
      shadow: '#000000',
      timeStepBackground: '#eeeeee',
    },
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({
    left: 4,
    right: 6,
    top: 0,
    bottom: 0,
  }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en' },
  }),
}));

jest.mock('@utils/helpers', () => ({
  toStringWithDecimal: (value: number, separator: string) =>
    typeof value === 'number' ? value.toFixed(1).replace('.', separator) : '-',
}));

jest.mock('@utils/matomo', () => ({
  trackMatomoEvent: (...args: any[]) => mockTrackMatomoEvent(...args),
}));

jest.mock('../../src/components/weather/charts/settings', () => ({
  observationTypeParameters: {
    weather: ['temperature', 'dewPoint', 'precipitation1h'],
    wind: ['windSpeedMS'],
    pressure: ['pressure'],
    humidity: ['humidity'],
    visCloud: ['visibility', 'totalCloudCover'],
    cloud: ['cloudHeight'],
    snowDepth: ['snowDepth'],
    daily: ['rrday'],
    temperature: ['temperature', 'dewPoint'],
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

jest.mock('@components/common/AppText', () => ({
  __esModule: true,
  default: ({ children, ...props }: any) => {
    const { Text } = require('react-native');
    return <Text {...props}>{children}</Text>;
  },
}));

jest.mock('react-native-raw-bottom-sheet', () => {
  const ReactActual = require('react');
  return {
    __esModule: true,
    default: ReactActual.forwardRef(({ children }: any, ref: any) => {
      ReactActual.useImperativeHandle(ref, () => ({
        close: mockRBSheetClose,
        open: mockRBSheetOpen,
      }));
      const { View } = require('react-native');
      return <View testID="station-rbsheet">{children}</View>;
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

jest.mock('../../src/components/weather/common/CollapsibleHeader', () => ({
  __esModule: true,
  default: ({ onPress, title }: any) => {
    const { Pressable, Text } = require('react-native');
    return (
      <Pressable testID="station-dropdown" onPress={onPress}>
        <Text>{title}</Text>
      </Pressable>
    );
  },
}));

jest.mock('../../src/components/weather/common/ParameterSelector', () => ({
  __esModule: true,
  default: (props: any) => {
    mockParameterSelector(props);
    const { Text } = require('react-native');
    return <Text testID="parameter-selector">{props.parameter}</Text>;
  },
}));

jest.mock('../../src/components/weather/charts/Chart', () => ({
  __esModule: true,
  default: (props: any) => {
    mockChart(props);
    const { Text } = require('react-native');
    return <Text testID="observation-chart">{props.chartType}</Text>;
  },
}));

jest.mock('../../src/components/weather/observation/List', () => ({
  __esModule: true,
  default: (props: any) => {
    mockList(props);
    const { Text } = require('react-native');
    return <Text testID="observation-list">{props.parameter}</Text>;
  },
}));

jest.mock('../../src/components/weather/observation/Latest', () => ({
  __esModule: true,
  default: (props: any) => {
    mockLatest(props);
    const { Text } = require('react-native');
    return <Text testID="latest-observation">{props.data.length}</Text>;
  },
}));

jest.mock('../../src/components/weather/sheets/ObservationStationListBottomSheet', () => ({
  __esModule: true,
  default: ({ onClose }: any) => {
    const { Pressable, Text } = require('react-native');
    return (
      <Pressable testID="station-sheet" onPress={onClose}>
        <Text>stations</Text>
      </Pressable>
    );
  },
}));

const baseData = [
  {
    epochtime: 2000000000,
    temperature: 5,
    dewPoint: 2,
    precipitation1h: 1,
    windSpeedMS: 3,
  },
];

const baseProps = {
  loading: false,
  data: baseData,
  dailyData: [{ epochtime: 2000000000, rrday: 1 }],
  dataId: 'obs-1',
  stationList: [{ id: 'station-1', name: 'Station One', distance: 1.24 }],
  stationId: 'station-1',
  setStationId: mockSetStationId,
  chartParameter: 'weather',
  updateChartParameter: mockUpdateChartParameter,
  displayFormat: 'table',
  updateDisplayFormat: mockUpdateDisplayFormat,
  clockType: 24 as any,
  preferredDailyParameters: [],
};

describe('ObservationPanel', () => {
  beforeEach(() => {
    mockChart.mockClear();
    mockConfigGet.mockReset();
    mockLatest.mockClear();
    mockList.mockClear();
    mockParameterSelector.mockClear();
    mockPanelHeader.mockClear();
    mockRBSheetClose.mockClear();
    mockRBSheetOpen.mockClear();
    mockSetStationId.mockClear();
    mockTrackMatomoEvent.mockClear();
    mockUpdateChartParameter.mockClear();
    mockUpdateDisplayFormat.mockClear();

    mockConfigGet.mockImplementation((key: string) => {
      if (key === 'weather') {
        return {
          layout: 'default',
          observation: {
            enabled: true,
            parameters: [
              'temperature',
              'dewPoint',
              'precipitation1h',
              'windSpeedMS',
            ],
          },
        };
      }
      return {};
    });
  });

  it('returns null when observations are disabled', () => {
    mockConfigGet.mockImplementation((key: string) => {
      if (key === 'weather') {
        return {
          layout: 'default',
          observation: { enabled: false, parameters: [] },
        };
      }
      return {};
    });

    const view = render(<ObservationPanel {...baseProps} />);

    expect(view.toJSON()).toBeNull();
  });

  it('renders station selector, latest observation, parameter selector and list', () => {
    const view = render(<ObservationPanel {...baseProps} />);

    expect(view.getByTestId('panel-header')).toBeTruthy();
    expect(
      view.getByLabelText(
        'observationStation: Station One – distance 1.2 unitAbbreviations:km'
      )
    ).toBeTruthy();
    expect(view.getByText('Station One – distance 1.2 unitAbbreviations:km')).toBeTruthy();
    expect(view.getByTestId('latest-observation')).toBeTruthy();
    expect(view.getByTestId('parameter-selector')).toBeTruthy();
    expect(view.getByTestId('observation-list')).toBeTruthy();
    expect(mockPanelHeader).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'panelHeader', thin: false })
    );
    expect(mockParameterSelector).toHaveBeenCalledWith(
      expect.objectContaining({
        chartTypes: expect.arrayContaining(['weather', 'wind']),
        parameter: 'weather',
        setParameter: mockUpdateChartParameter,
      })
    );
    expect(mockList).toHaveBeenCalledWith(
      expect.objectContaining({
        data: baseData,
        parameter: 'weather',
        clockType: 24,
      })
    );

    fireEvent.press(view.getByTestId('station-dropdown'));
    expect(mockRBSheetOpen).toHaveBeenCalledTimes(1);

    fireEvent.press(view.getByTestId('station-sheet'));
    expect(mockRBSheetClose).toHaveBeenCalledTimes(1);
  });

  it('sets initial station when station id is missing', () => {
    render(
      <ObservationPanel
        {...baseProps}
        stationId={undefined as any}
      />
    );

    expect(mockSetStationId).toHaveBeenCalledWith('obs-1', 'station-1');
  });

  it('switches between chart and list formats with tracking', () => {
    const view = render(<ObservationPanel {...baseProps} displayFormat="chart" />);

    expect(view.getByTestId('observation-chart')).toBeTruthy();
    expect(mockChart).toHaveBeenCalledWith(
      expect.objectContaining({
        chartType: 'weather',
        data: baseData,
        observation: true,
      })
    );

    fireEvent.press(view.getByTestId('observation_list_button'));
    fireEvent.press(view.getByTestId('observation_chart_button'));

    expect(mockTrackMatomoEvent).toHaveBeenCalledWith(
      'User action',
      'Weather',
      'Show OBSERVATIONS in LIST format'
    );
    expect(mockTrackMatomoEvent).toHaveBeenCalledWith(
      'User action',
      'Weather',
      'Show OBSERVATIONS in CHART format'
    );
    expect(mockUpdateDisplayFormat).toHaveBeenCalledWith('table');
    expect(mockUpdateDisplayFormat).toHaveBeenCalledWith('chart');
  });

  it('renders missing observations message when data is empty and not loading', () => {
    const view = render(
      <ObservationPanel
        {...baseProps}
        data={[]}
        dailyData={[]}
        stationList={[]}
        stationId={undefined as any}
      />
    );

    expect(view.getByText('noObservations')).toBeTruthy();
    expect(view.queryByTestId('parameter-selector')).toBeNull();
  });
});
