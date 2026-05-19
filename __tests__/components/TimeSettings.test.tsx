import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import TimeSettings from '../../src/components/settings/TimeSettings';
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

describe('TimeSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders time settings and updates clock type', () => {
    const updateClockType = jest.fn();
    const { getByText } = render(
      <TimeSettings clockType={24} updateClockType={updateClockType} />
    );

    expect(getByText('settings:clock')).toBeTruthy();

    fireEvent.press(getByText('12-hour-clock'));

    expect(trackMatomoEvent).toHaveBeenCalledWith(
      'User action',
      'Settings',
      'Select clock type - 12'
    );
    expect(updateClockType).toHaveBeenCalledWith(12);
  });
});
