import React from 'react';
import { Text } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';
import { Provider } from 'react-redux';

import TimeseriesMarker from '../../src/components/map/layers/TimeseriesMarker';

const mockWeatherSymbolGetter = jest.fn();
const mockConverter = jest.fn();
const mockToPrecision = jest.fn();
const mockSelectSelectedCallout = jest.fn((state: any) => state.mock.selectedCallout);
const mockSelectUnits = jest.fn((state: any) => state.mock.units);
const mockUpdateSelectedCallout = jest.fn((value: string | undefined) => ({
  type: 'MAP/UPDATE_SELECTED_CALLOUT',
  payload: value,
}));
const mockConfigGet = jest.fn();
const mockIcon = jest.fn((props) => (
  <Text {...props} testID={`icon-${props.name}`}>
    icon
  </Text>
));

jest.mock('react-native-maps', () => ({
  Marker: ({ children, ...props }: any) => {
    const { View } = require('react-native');
    return (
      <View testID="rn-marker" {...props}>
        {children}
      </View>
    );
  },
}));

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    dark: false,
    colors: {
      mapButtonBackground: '#fafafa',
      mapButtonBorder: '#cfcfcf',
      text: '#111111',
    },
  }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      if (key === 'observation:paramUnits:°C') return 'degrees Celsius';
      if (key === 'observation:paramUnits:m/s') return 'meters per second';
      if (key === 'symbols:57') return 'Light snow';
      return key;
    },
  }),
}));

jest.mock('@assets/images', () => ({
  weatherSymbolGetter: (...args: any[]) => mockWeatherSymbolGetter(...args),
}));

jest.mock('@utils/units', () => ({
  converter: (...args: any[]) => mockConverter(...args),
  toPrecision: (...args: any[]) => mockToPrecision(...args),
}));

jest.mock('@store/map/selectors', () => ({
  selectSelectedCallout: (state: any) => mockSelectSelectedCallout(state),
}));

jest.mock('@store/settings/selectors', () => ({
  selectUnits: (state: any) => mockSelectUnits(state),
}));

jest.mock('@store/map/actions', () => ({
  updateSelectedCallout: (value: string | undefined) => mockUpdateSelectedCallout(value),
}));

jest.mock('@config', () => ({
  Config: {
    get: (...args: any[]) => mockConfigGet(...args),
  },
}));

jest.mock('@assets/Icon', () => ({
  __esModule: true,
  default: (props: any) => mockIcon(props),
}));

const createStore = (state: any) => ({
  getState: () => state,
  dispatch: jest.fn(),
  subscribe: () => () => {},
});

describe('TimeseriesMarker', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockWeatherSymbolGetter.mockReset();
    mockConverter.mockReset();
    mockToPrecision.mockReset();
    mockSelectSelectedCallout.mockClear();
    mockSelectUnits.mockClear();
    mockUpdateSelectedCallout.mockClear();
    mockConfigGet.mockReset();
    mockIcon.mockClear();

    mockConfigGet.mockImplementation((key: string) => {
      if (key === 'settings') {
        return {
          units: {
            temperature: 'C',
            wind: 'm/s',
          },
        };
      }
      return {};
    });

    mockConverter.mockImplementation((_unitAbb: string, value: number) => value);
    mockToPrecision.mockImplementation((_unit: string, _unitAbb: string, value: number) => value);

    mockWeatherSymbolGetter.mockImplementation(() => {
      const WeatherSymbol = ({ width, height }: { width: number; height: number }) => (
        <Text testID="weather-symbol">{`${width}x${height}`}</Text>
      );
      return WeatherSymbol;
    });
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it('renders marker content and dispatches selected callout update on press', () => {
    const store = createStore({
      mock: {
        selectedCallout: undefined,
        units: {
          temperature: { unitAbb: 'C' },
          wind: { unitAbb: 'm/s' },
        },
      },
    });

    const { getByTestId, getByText, getByA11yLabel, toJSON } = render(
      <Provider store={store as any}>
        <TimeseriesMarker
          name="Helsinki"
          coordinate={{ latitude: 60.1699, longitude: 24.9384 }}
          smartSymbol={57}
          temperature={0}
          windDirection={180}
          windSpeedMS={5}
        />
      </Provider>
    );

    expect(getByTestId('rn-marker')).toBeTruthy();
    expect(getByTestId('weather-symbol')).toBeTruthy();
    expect(getByText('0°C')).toBeTruthy();
    expect(getByA11yLabel('0 degrees Celsius')).toBeTruthy();
    expect(mockWeatherSymbolGetter).toHaveBeenCalledWith('57', false);

    const tree = toJSON() as any;
    expect(tree.props.coordinate).toEqual({
      latitude: 60.1699,
      longitude: 24.9384,
    });
    expect(tree.props.tracksViewChanges).toBe(true);

    fireEvent.press(getByTestId('rn-marker'));

    expect(mockUpdateSelectedCallout).toHaveBeenCalledWith('Helsinki');
    expect(store.dispatch).toHaveBeenCalledWith({
      type: 'MAP/UPDATE_SELECTED_CALLOUT',
      payload: 'Helsinki',
    });
  });

  it('renders selected callout content and dispatches close when pressing selected marker', () => {
    const store = createStore({
      mock: {
        selectedCallout: 'Helsinki',
        units: {
          temperature: { unitAbb: 'C' },
          wind: { unitAbb: 'm/s' },
        },
      },
    });

    const { getByText, getByA11yLabel, getByTestId } = render(
      <Provider store={store as any}>
        <TimeseriesMarker
          name="Helsinki"
          coordinate={{ latitude: 60.1699, longitude: 24.9384 }}
          smartSymbol={57}
          temperature={1}
          windDirection={180}
          windSpeedMS={5}
        />
      </Provider>
    );

    expect(getByText('Helsinki')).toBeTruthy();
    expect(getByText('Light snow')).toBeTruthy();
    expect(getByText('5 m/s')).toBeTruthy();
    expect(getByA11yLabel('5 meters per second')).toBeTruthy();
    expect(mockIcon).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'wind-light-map',
        width: 24,
        height: 24,
        style: {
          transform: [{ rotate: '45deg' }],
        },
      })
    );

    fireEvent.press(getByTestId('rn-marker'));

    expect(mockUpdateSelectedCallout).toHaveBeenCalledWith(undefined);
    expect(store.dispatch).toHaveBeenCalledWith({
      type: 'MAP/UPDATE_SELECTED_CALLOUT',
      payload: undefined,
    });
  });
});
