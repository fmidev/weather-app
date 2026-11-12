/* eslint-disable react-native/no-color-literals */
import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import { render } from '@testing-library/react-native';

import AppText from '../../src/components/common/AppText';
import { MacContentSizeProvider } from '../../src/components/common/MacContentSizeContext';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ i18n: { resolvedLanguage: 'fi' } }),
}));

describe('AppText', () => {
  it('uses the app language on iOS and allows a language override', () => {
    const originalPlatform = Platform.OS;
    Object.defineProperty(Platform, 'OS', { value: 'ios' });
    try {
      const view = render(<AppText testID="app-text">Hello</AppText>);
      expect(view.getByTestId('app-text').props.accessibilityLanguage).toBe(
        'fi-FI'
      );
      view.rerender(
        <AppText testID="app-text" accessibilityLanguage="sv-SE">
          Hello
        </AppText>
      );
      expect(view.getByTestId('app-text').props.accessibilityLanguage).toBe(
        'sv-SE'
      );
    } finally {
      Object.defineProperty(Platform, 'OS', { value: originalPlatform });
    }
  });

  it('sets accessibility font scaling defaults', () => {
    const { getByTestId } = render(<AppText testID="app-text">Hello</AppText>);

    const text = getByTestId('app-text');
    expect(text.props.allowFontScaling).toBe(true);
    expect(text.props.maxFontSizeMultiplier).toBe(2);
  });

  it('forwards custom props and renders children', () => {
    const { getByTestId, getByText } = render(
      <AppText
        testID="app-text"
        numberOfLines={1}
        accessibilityRole="header"
        // eslint-disable-next-line react-native/no-inline-styles
        style={{ color: 'red' }}>
        Header text
      </AppText>
    );

    const text = getByTestId('app-text');
    expect(text.props.numberOfLines).toBe(1);
    expect(text.props.accessibilityRole).toBe('header');
    expect(text.props.style).toMatchObject({ color: 'red' });
    expect(getByText('Header text')).toBeTruthy();
  });

  it('scales an explicit font size by 1.3 when running on Mac', () => {
    const { getByTestId } = render(
      <MacContentSizeProvider isRunningOnMac isPlatformDetectionComplete>
        <AppText
          testID="app-text"
          // eslint-disable-next-line react-native/no-inline-styles
          style={{ fontSize: 16 }}>
          Mac text
        </AppText>
      </MacContentSizeProvider>
    );

    const style = StyleSheet.flatten(getByTestId('app-text').props.style);
    expect(style.fontSize).toBe(20.8);
  });

  it('scales the default iOS font size when no font size is provided', () => {
    const { getByTestId } = render(
      <MacContentSizeProvider isRunningOnMac isPlatformDetectionComplete>
        <AppText testID="app-text">Mac text</AppText>
      </MacContentSizeProvider>
    );

    const style = StyleSheet.flatten(getByTestId('app-text').props.style);
    expect(style.fontSize).toBe(18.2);
  });
});
