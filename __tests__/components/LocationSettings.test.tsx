import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import LocationSettings from '../../src/components/settings/LocationSettings';
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

describe('LocationSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders location permission and opens settings', () => {
    const onOpenSettings = jest.fn();
    const { getByText } = render(
      <LocationSettings
        locationPermission="location_when_in_use"
        locationPermissionsDisplayString={{
          location_when_in_use: 'When in use',
        }}
        onOpenSettings={onOpenSettings}
      />
    );

    expect(getByText('settings:allowLocation')).toBeTruthy();
    expect(getByText('When in use')).toBeTruthy();

    fireEvent.press(getByText('settings:edit'));

    expect(trackMatomoEvent).toHaveBeenCalledWith(
      'User action',
      'Settings',
      'Open location settings'
    );
    expect(onOpenSettings).toHaveBeenCalledTimes(1);
  });
});
