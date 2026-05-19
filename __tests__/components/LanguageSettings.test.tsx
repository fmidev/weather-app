import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';

import LanguageSettings from '../../src/components/settings/LanguageSettings';
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

describe('LanguageSettings', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders language options and changes only non-selected language', () => {
    const onChangeLanguage = jest.fn();
    const { getByTestId, getByText } = render(
      <LanguageSettings
        currentLanguage="fi"
        languages={['fi', 'en']}
        onChangeLanguage={onChangeLanguage}
      />
    );

    expect(getByText('settings:language')).toBeTruthy();

    fireEvent.press(getByTestId('settings_set_language_fi'));
    expect(onChangeLanguage).not.toHaveBeenCalled();

    fireEvent.press(getByTestId('settings_set_language_en'));
    expect(onChangeLanguage).toHaveBeenCalledWith('en');
    expect(trackMatomoEvent).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(50);
    });

    expect(trackMatomoEvent).toHaveBeenCalledWith(
      'User action',
      'Settings',
      'Select language - en'
    );
  });
});
