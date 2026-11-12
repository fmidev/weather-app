import React from 'react';
import { Text, Platform } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';

import AccessibleTouchableOpacity from '../../src/components/common/AccessibleTouchableOpacity';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ i18n: { resolvedLanguage: 'fi' } }),
}));

describe('AccessibleTouchableOpacity', () => {
  it('uses the app language on iOS and allows a language override', () => {
    const originalPlatform = Platform.OS;
    Object.defineProperty(Platform, 'OS', { value: 'ios' });
    try {
      const view = render(
        <AccessibleTouchableOpacity testID="touchable" />
      );
      expect(view.getByTestId('touchable').props.accessibilityLanguage).toBe(
        'fi-FI'
      );
      view.rerender(
        <AccessibleTouchableOpacity
          testID="touchable"
          accessibilityLanguage="sv-SE" />
      );
      expect(view.getByTestId('touchable').props.accessibilityLanguage).toBe(
        'sv-SE'
      );
    } finally {
      Object.defineProperty(Platform, 'OS', { value: originalPlatform });
    }
  });

  it('applies minimum accessible touch dimensions', () => {
    const { getByTestId } = render(
      <AccessibleTouchableOpacity testID="touchable">
        <Text>Press</Text>
      </AccessibleTouchableOpacity>
    );

    const touchable = getByTestId('touchable');
    const styleArray = Array.isArray(touchable.props.style)
      ? touchable.props.style
      : [touchable.props.style];

    expect(styleArray).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          minHeight: 44,
          minWidth: 44,
          justifyContent: 'center',
          alignItems: 'center',
        }),
      ])
    );
  });

  it('merges custom style with accessible base style', () => {
    const { getByTestId } = render(
      <AccessibleTouchableOpacity
        testID="touchable"
        // eslint-disable-next-line react-native/no-inline-styles, react-native/no-color-literals
        style={{ backgroundColor: 'red' }}>
        <Text>Press</Text>
      </AccessibleTouchableOpacity>
    );

    const touchable = getByTestId('touchable');
    const styleArray = Array.isArray(touchable.props.style)
      ? touchable.props.style
      : [touchable.props.style];

    expect(styleArray).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ backgroundColor: 'red' }),
      ])
    );
    expect(styleArray).toEqual(
      expect.arrayContaining([expect.objectContaining({ minHeight: 44 })])
    );
  });

  it('forwards onPress events', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <AccessibleTouchableOpacity testID="touchable" onPress={onPress}>
        <Text>Press</Text>
      </AccessibleTouchableOpacity>
    );

    fireEvent.press(getByTestId('touchable'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
