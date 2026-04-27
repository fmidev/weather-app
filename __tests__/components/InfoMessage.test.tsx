import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';

import InfoMessage from '../../src/components/weather/InfoMessage';
import { GRAY_4, WHITE } from '../../src/assets/colors';

let mockDark = false;

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    dark: mockDark,
  }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => `translated:${key}`,
  }),
}));

describe('InfoMessage', () => {
  beforeEach(() => {
    mockDark = false;
  });

  it('renders translated observation info message with light text color', () => {
    const view = render(<InfoMessage translationKey="tooOld" />);

    expect(view.getByText('translated:tooOld')).toBeTruthy();

    const text = view.UNSAFE_getByType(Text);
    const mergedStyle = Object.assign(
      {},
      ...(Array.isArray(text.props.style) ? text.props.style : [text.props.style])
    );
    expect(mergedStyle.color).toBe(GRAY_4);
  });

  it('uses white text color in dark theme', () => {
    mockDark = true;

    const view = render(<InfoMessage translationKey="onlyDailyValues" />);

    const text = view.UNSAFE_getByType(Text);
    const mergedStyle = Object.assign(
      {},
      ...(Array.isArray(text.props.style) ? text.props.style : [text.props.style])
    );
    expect(view.getByText('translated:onlyDailyValues')).toBeTruthy();
    expect(mergedStyle.color).toBe(WHITE);
  });
});
