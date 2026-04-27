import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { Provider } from 'react-redux';

import CommonHeaderTitle from '../../src/components/common/CommonHeaderTitle';

jest.mock('@store/location/selector', () => ({
  selectCurrent: (state: any) => state.mock.currentLocation,
  selectIsGeolocation: (state: any) => state.mock.isGeolocation,
}));

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    colors: {
      text: '#111111',
    },
  }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      if (key === 'openSearch') return 'Open search';
      if (key === 'currentLocation') return 'Current location';
      return key;
    },
  }),
}));

jest.mock('@utils/hooks', () => ({
  useOrientation: () => false,
}));

jest.mock('@components/common/ScalableIcon', () => {
  const { Text } = require('react-native');
  return ({ name }: { name: string }) => <Text testID="map-marker-icon">{name}</Text>;
});

const createStore = (state: any) => ({
  getState: () => state,
  dispatch: jest.fn(),
  subscribe: () => () => {},
});

describe('CommonHeaderTitle', () => {
  it('renders location with area, shows geolocation icon and handles press', () => {
    const onPress = jest.fn();
    const store = createStore({
      mock: {
        currentLocation: { name: 'Helsinki', area: 'Uusimaa' },
        isGeolocation: true,
      },
    });

    const { getByText, getByA11yHint, getByTestId, getByA11yLabel } = render(
      <Provider store={store as any}>
        <CommonHeaderTitle onPress={onPress} />
      </Provider>
    );

    expect(getByText('Helsinki, Uusimaa')).toBeTruthy();
    expect(getByTestId('map-marker-icon')).toBeTruthy();
    expect(getByA11yLabel('Helsinki, Uusimaa, Current location')).toBeTruthy();

    fireEvent.press(getByA11yHint('Open search'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders only name when area equals name and hides geolocation icon', () => {
    const store = createStore({
      mock: {
        currentLocation: { name: 'Bogota', area: 'Bogota' },
        isGeolocation: false,
      },
    });

    const { getByText, queryByTestId, getByA11yLabel } = render(
      <Provider store={store as any}>
        <CommonHeaderTitle onPress={() => {}} />
      </Provider>
    );

    expect(getByText('Bogota')).toBeTruthy();
    expect(queryByTestId('map-marker-icon')).toBeNull();
    expect(getByA11yLabel('Bogota')).toBeTruthy();
  });
});
