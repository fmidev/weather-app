import React from 'react';
import { Text } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import { Provider } from 'react-redux';

import MlTimeseriesMarker from '../../src/components/map/layers/MlTimeseriesMarker';

const mockWeatherSymbolGetter = jest.fn();
const mockConverter = jest.fn();
const mockToPrecision = jest.fn();
const mockSelectUnits = jest.fn((state: any) => state.mock.units);
const mockConfigGet = jest.fn();
const mockIcon = jest.fn((props) => (
  <Text {...props} testID={`icon-${props.name}`}>
    icon
  </Text>
));

jest.mock('@maplibre/maplibre-react-native', () => ({
  Marker: ({ children, ...props }: any) => {
    const { View } = require('react-native');
    return (
      <View testID="ml-marker" {...props}>
        {children}
      </View>
    );
  },
}));

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    dark: true,
    colors: {
      mapButtonBackground: '#f7f7f7',
      mapButtonBorder: '#cccccc',
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

jest.mock('@store/settings/selectors', () => ({
  selectUnits: (state: any) => mockSelectUnits(state),
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

describe('MlTimeseriesMarker', () => {
  beforeEach(() => {
    mockWeatherSymbolGetter.mockReset();
    mockConverter.mockReset();
    mockToPrecision.mockReset();
    mockSelectUnits.mockClear();
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

    mockConverter.mockImplementation((unitAbb: string, value: number) => {
      if (unitAbb === 'C') return value;
      if (unitAbb === 'm/s') return value;
      return value;
    });

    mockToPrecision.mockImplementation((_unit: string, _unitAbb: string, value: number) => value);

    mockWeatherSymbolGetter.mockImplementation(() => {
      const WeatherSymbol = ({ width, height }: { width: number; height: number }) => (
        <Text testID="weather-symbol">{`${width}x${height}`}</Text>
      );
      return WeatherSymbol;
    });
  });

  it('renders marker content with weather symbol and converted temperature', () => {
    const store = createStore({
      mock: {
        units: {
          temperature: { unitAbb: 'C' },
          wind: { unitAbb: 'm/s' },
        },
      },
    });

    const { getByTestId, getByText, getByA11yLabel, toJSON } = render(
      <Provider store={store as any}>
        <MlTimeseriesMarker
          name="Helsinki"
          coordinate={[24.9384, 60.1699]}
          zoom={7}
          smartSymbol={57}
          temperature={0}
          windDirection={180}
          windSpeedMS={5}
        />
      </Provider>
    );

    expect(getByTestId('ml-marker')).toBeTruthy();
    expect(getByTestId('weather-symbol')).toBeTruthy();
    expect(getByText('0°C')).toBeTruthy();
    expect(getByA11yLabel('0 degrees Celsius')).toBeTruthy();
    expect(mockWeatherSymbolGetter).toHaveBeenCalledWith('57', false);

    const tree = toJSON() as any;
    expect(tree.props.lngLat).toEqual([24.9384, 60.1699]);
    expect(tree.props.anchor).toBe('bottom');

    const touchable = tree.children[0];
    const containerView = touchable.children[0];
    const styleArray = Array.isArray(containerView.props.style)
      ? containerView.props.style
      : [containerView.props.style];
    const mergedStyle = Object.assign({}, ...styleArray);

    expect(mergedStyle.backgroundColor).toBe('#f7f7f7');
    expect(mergedStyle.borderColor).toBe('#cccccc');
  });

  it('toggles callout open and shows wind icon, name and wind speed', () => {
    const store = createStore({
      mock: {
        units: {
          temperature: { unitAbb: 'C' },
          wind: { unitAbb: 'm/s' },
        },
      },
    });

    const { getByText, getByA11yLabel, queryByText } = render(
      <Provider store={store as any}>
        <MlTimeseriesMarker
          name="Helsinki"
          coordinate={[24.9384, 60.1699]}
          zoom={7}
          smartSymbol={57}
          temperature={1}
          windDirection={180}
          windSpeedMS={5}
        />
      </Provider>
    );

    expect(queryByText('Helsinki')).toBeNull();

    fireEvent.press(getByA11yLabel('1 degrees Celsius'));

    expect(getByText('Helsinki')).toBeTruthy();
    expect(getByText('Light snow')).toBeTruthy();
    expect(getByText('5 m/s')).toBeTruthy();
    expect(getByA11yLabel('5 meters per second')).toBeTruthy();
    expect(mockIcon).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'wind-dark',
        width: 24,
        height: 24,
        style: {
          transform: [{ rotate: '45deg' }],
        },
      })
    );
  });
});
