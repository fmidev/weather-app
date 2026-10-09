import React from 'react';
import { Platform, StyleSheet, Switch } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';

import AccessibleSwitch from '../../src/components/common/AccessibleSwitch';
import fi from '../../i18n/fi.json';
import sv from '../../i18n/sv.json';
import en from '../../i18n/en.json';

const mockTranslations = { fi: fi.accessibility, sv: sv.accessibility, en: en.accessibility };
let mockLanguage: keyof typeof mockTranslations = 'fi';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => (mockTranslations[mockLanguage] as Record<string, string>)[key],
  }),
}));

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({ colors: { text: '#111111', hourListText: '#333333' } }),
}));

describe('AccessibleSwitch', () => {
  beforeEach(() => {
    mockLanguage = 'fi';
    jest.replaceProperty(Platform, 'OS', 'android');
  });
  afterEach(() => jest.restoreAllMocks());

  it.each([
    ['android', true],
    ['android', false],
    ['ios', true],
    ['ios', false],
  ] as const)('exposes one named and focusable switch on %s with value %s', (platform, value) => {
    jest.replaceProperty(Platform, 'OS', platform);
    const { getAllByA11yRole, getByA11yLabel, UNSAFE_queryByType: queryByType } = render(
      <AccessibleSwitch label="Show my location" value={value} onValueChange={jest.fn()} />
    );

    expect(getAllByA11yRole('switch')).toHaveLength(1);
    const control = getByA11yLabel('Show my location');
    expect(control.props.accessible).toBe(true);
    expect(control.props.focusable).toBe(true);
    expect(control.props.accessibilityState).toEqual(
      platform === 'ios' ? { disabled: false } : { checked: value, disabled: false }
    );
    expect(control.props.accessibilityValue?.text).toBe(
      platform === 'ios' ? (value ? 'Päällä' : 'Pois päältä') : undefined
    );
    expect(StyleSheet.flatten(control.props.style)).toMatchObject({ minWidth: 44, minHeight: 44 });
    expect(queryByType(Switch)).toBeNull();
    expect(control.children[0]).toMatchObject({ props: {
      accessible: false,
      accessibilityElementsHidden: true,
      importantForAccessibility: 'no-hide-descendants',
    } });
  });

  it.each([
    ['fi', 'Päällä', 'Pois päältä'],
    ['sv', 'På', 'Av'],
    ['en', 'On', 'Off'],
  ] as const)('exposes localized iOS values in %s without the numeric checked state', (language, on, off) => {
    jest.replaceProperty(Platform, 'OS', 'ios');
    mockLanguage = language;
    const onValueChange = jest.fn();
    const { getByA11yLabel, rerender } = render(
      <AccessibleSwitch label="Location" value={false} onValueChange={onValueChange} />
    );
    const control = getByA11yLabel('Location');
    expect(control.props.accessibilityRole).toBe('switch');
    expect(control.props.accessibilityState.checked).toBeUndefined();
    expect(control.props.accessibilityValue).toEqual({ text: off });
    fireEvent.press(control);
    expect(onValueChange).toHaveBeenLastCalledWith(true);

    rerender(<AccessibleSwitch label="Location" value onValueChange={onValueChange} />);
    expect(getByA11yLabel('Location')).toBe(control);
    expect(control.props.accessibilityState.checked).toBeUndefined();
    expect(control.props.accessibilityValue).toEqual({ text: on });
    fireEvent.press(control);
    expect(onValueChange).toHaveBeenLastCalledWith(false);
  });

  it('reports the next value and preserves the same control across checked state changes', () => {
    const onValueChange = jest.fn();
    const { getByA11yLabel, rerender } = render(
      <AccessibleSwitch label="Location" value onValueChange={onValueChange} accessibilityHint="Hide location" />
    );
    const control = getByA11yLabel('Location');
    fireEvent.press(control);
    expect(onValueChange).toHaveBeenLastCalledWith(false);
    // This is controlled: the caller updates the value after receiving the event.
    expect(control.props.accessibilityState.checked).toBe(true);

    rerender(
      <AccessibleSwitch label="Location" value={false} onValueChange={onValueChange} accessibilityHint="Show location" />
    );
    expect(getByA11yLabel('Location')).toBe(control);
    expect(control.props.focusable).toBe(true);
    expect(control.props.accessibilityState.checked).toBe(false);
    expect(control.props.accessibilityHint).toBe('Show location');
    fireEvent.press(control);
    expect(onValueChange).toHaveBeenLastCalledWith(true);
    expect(onValueChange).toHaveBeenCalledTimes(2);
  });

  it('handles the native click event used by keyboard and accessibility activation', () => {
    const onValueChange = jest.fn();
    const { getByA11yLabel } = render(
      <AccessibleSwitch label="Location" value={false} onValueChange={onValueChange} />
    );
    fireEvent(getByA11yLabel('Location'), 'click', { nativeEvent: {} });
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith(true);
  });

  it('does not change value when disabled and exposes the disabled state', () => {
    const onValueChange = jest.fn();
    const { getByA11yLabel } = render(
      <AccessibleSwitch label="Location" value disabled onValueChange={onValueChange} />
    );
    const control = getByA11yLabel('Location');
    expect(control.props.accessibilityState).toEqual({ checked: true, disabled: true });
    expect(control.props.focusable).toBe(false);
    fireEvent.press(control);
    fireEvent(control, 'click', { nativeEvent: {} });
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('shows keyboard focus and clears the indicator on blur', () => {
    const { getByA11yLabel } = render(
      <AccessibleSwitch label="Location" value={false} onValueChange={jest.fn()} />
    );
    const control = getByA11yLabel('Location');
    fireEvent(control, 'focus');
    expect(StyleSheet.flatten(control.props.style).borderColor).toBe('#111111');
    fireEvent(control, 'blur');
    expect(StyleSheet.flatten(control.props.style).borderColor).toBe('transparent');
  });
});
