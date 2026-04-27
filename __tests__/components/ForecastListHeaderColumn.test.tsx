import React from 'react';
import { render } from '@testing-library/react-native';

import ForecastListHeaderColumn from '../../src/components/weather/forecast/ForecastListHeaderColumn';
import * as constants from '../../src/store/forecast/constants';

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    colors: {
      border: '#cccccc',
      hourListText: '#111111',
      listTint: '#eeeeee',
    },
    dark: false,
  }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('react-native-linear-gradient', () => ({
  __esModule: true,
  default: ({ children }: any) => {
    const { View } = require('react-native');
    return <View testID="linear-gradient">{children}</View>;
  },
}));

jest.mock('@components/common/AppText', () => ({
  __esModule: true,
  default: ({ children, ...props }: any) => {
    const { Text } = require('react-native');
    return <Text {...props}>{children}</Text>;
  },
}));

jest.mock('@assets/Icon', () => ({
  __esModule: true,
  default: ({ name }: any) => {
    const { Text } = require('react-native');
    return <Text testID={`icon-${name}`}>{name}</Text>;
  },
}));

jest.mock('@config', () => ({
  Config: {
    get: () => ({
      units: {
        precipitation: 'mm',
        pressure: 'hPa',
        wind: 'm/s',
      },
    }),
  },
}));

jest.mock('@utils/helpers', () => ({
  isOdd: (value: number) => value % 2 === 1,
}));

describe('ForecastListHeaderColumn', () => {
  it('renders parameter icons and units while excluding day length', () => {
    const view = render(
      <ForecastListHeaderColumn
        displayParams={[
          [0, constants.WIND_SPEED_AND_DIRECTION],
          [1, constants.WIND_GUST],
          [2, constants.PRECIPITATION_1H],
          [3, constants.PRECIPITATION_PROBABILITY],
          [4, constants.RELATIVE_HUMIDITY],
          [5, constants.PRESSURE],
          [6, constants.UV_CUMULATED],
          [7, constants.TEMPERATURE],
          [8, constants.DAY_LENGTH],
        ]}
        units={
          {
            precipitation: { unitAbb: 'in' },
            pressure: { unitAbb: 'hPa' },
            wind: { unitAbb: 'km/h' },
          } as any
        }
      />
    );

    expect(view.getByTestId('linear-gradient')).toBeTruthy();
    expect(view.getByTestId('icon-clock')).toBeTruthy();
    expect(view.getByTestId('icon-wind')).toBeTruthy();
    expect(view.getByTestId('icon-gust')).toBeTruthy();
    expect(view.getAllByTestId('icon-precipitation')).toHaveLength(2);
    expect(view.getByTestId('icon-temperature')).toBeTruthy();
    expect(view.getAllByText('km/h')).toHaveLength(2);
    expect(view.getByText('in')).toBeTruthy();
    expect(view.getByText('%')).toBeTruthy();
    expect(view.getByText('RH%')).toBeTruthy();
    expect(view.getByText('hPa')).toBeTruthy();
    expect(view.getByText('UV')).toBeTruthy();
    expect(view.queryByTestId('icon-time')).toBeNull();
  });
});
