import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import ThemeSettings from '../../src/components/settings/ThemeSettings';
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

describe('ThemeSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders theme options and ignores selected theme presses', () => {
    const updateTheme = jest.fn();
    const { getByTestId } = render(
      <ThemeSettings theme="dark" updateTheme={updateTheme} />
    );

    expect(getByTestId('settings_theme_dark')).toBeTruthy();

    fireEvent.press(getByTestId('settings_set_theme_dark'));
    expect(updateTheme).not.toHaveBeenCalled();

    fireEvent.press(getByTestId('settings_set_theme_light'));
    expect(trackMatomoEvent).toHaveBeenCalledWith(
      'User action',
      'Settings',
      'Select theme - light'
    );
    expect(updateTheme).toHaveBeenCalledWith('light');
  });
});
