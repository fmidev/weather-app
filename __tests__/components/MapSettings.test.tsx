import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import MapSettings from '../../src/components/settings/MapSettings';
import { trackMatomoEvent } from '../../src/utils/matomo';

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    colors: {
      border: '#dddddd',
      text: '#111111',
    },
  }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('../../src/utils/matomo', () => ({
  trackMatomoEvent: jest.fn(),
}));

jest.mock('@components/common/ScalableIcon', () => ({
  __esModule: true,
  default: ({ name }: any) => {
    const { Text } = require('react-native');
    return <Text testID={`icon-${name}`}>{name}</Text>;
  },
}));

describe('MapSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders map settings and updates selected map library', () => {
    const updateMapLibrary = jest.fn();
    const { getByText } = render(
      <MapSettings
        mapLibrary="react-native-maps"
        updateMapLibrary={updateMapLibrary}
      />
    );

    expect(getByText('settings:mapLibrary')).toBeTruthy();

    fireEvent.press(getByText('settings:maplibre'));

    expect(trackMatomoEvent).toHaveBeenCalledWith(
      'User action',
      'Settings',
      'Select map library - Maplibre'
    );
    expect(updateMapLibrary).toHaveBeenCalledWith('maplibre');
  });
});
