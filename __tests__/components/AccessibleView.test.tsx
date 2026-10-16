import React from 'react';
import { View, Platform } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';

import AccessibleView from '../../src/components/common/AccessibleView';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ i18n: { resolvedLanguage: 'fi' } }),
}));

describe('AccessibleView', () => {
  it('uses the app language on iOS and allows a language override', () => {
    const originalPlatform = Platform.OS;
    Object.defineProperty(Platform, 'OS', { value: 'ios' });
    try {
      const view = render(<AccessibleView testID="header" />);
      expect(view.getByTestId('header').props.accessibilityLanguage).toBe(
        'fi-FI'
      );
      view.rerender(
        <AccessibleView
          testID="header"
          accessibilityLanguage="sv-SE" />
      );
      expect(view.getByTestId('header').props.accessibilityLanguage).toBe(
        'sv-SE'
      );
    } finally {
      Object.defineProperty(Platform, 'OS', { value: originalPlatform });
    }
  });

  it('forwards the accessibility properties, children and layout handler', () => {
    const onLayout = jest.fn();
    const view = render(
      <AccessibleView
        testID="header"
        accessibilityRole="header"
        accessibilityLabel="Asetukset"
        accessibilityHint="Vaihda asetuksia"
        onLayout={onLayout}>
        <View testID="child" />
      </AccessibleView>
    );

    expect(view.getByTestId('header').props.accessibilityRole).toBe('header');
    expect(view.getByTestId('header').props.accessibilityLabel).toBe(
      'Asetukset'
    );
    expect(view.getByTestId('header').props.accessibilityHint).toBe(
      'Vaihda asetuksia'
    );
    expect(view.getByTestId('child')).toBeTruthy();
    fireEvent(view.getByTestId('header'), 'layout', {});
    expect(onLayout).toHaveBeenCalledWith({});
  });
});
