import React from 'react';
import { View, NativeModules, Platform, findNodeHandle } from 'react-native';
import type { LayoutChangeEvent, ViewProps } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';

import { useAccessibilityHintLanguage } from '../../src/utils/hooks';

const Fixture = ({ accessibilityHint, onLayout }: ViewProps) => {
  const handleLayout = useAccessibilityHintLanguage(
    accessibilityHint,
    onLayout
  );
  return <View testID="hinted-view" onLayout={handleLayout} />;
};

const originalPlatform = Platform.OS;
const originalModule = NativeModules.AppLanguage;
const layoutEvent = {
  currentTarget: {},
  nativeEvent: { layout: { x: 0, y: 0, width: 100, height: 40 } },
} as LayoutChangeEvent;

describe('useAccessibilityHintLanguage', () => {
  const localizeAccessibilityHint = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(Platform, 'OS', { value: 'android' });
    NativeModules.AppLanguage = { localizeAccessibilityHint };
    jest.spyOn(require('react-native'), 'findNodeHandle').mockReturnValue(42);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    Object.defineProperty(Platform, 'OS', { value: originalPlatform });
    NativeModules.AppLanguage = originalModule;
  });

  it('localizes the mounted host view and forwards its layout event', () => {
    const onLayout = jest.fn();
    const view = render(
      <Fixture accessibilityHint="Vaihda kieli" onLayout={onLayout} />
    );

    fireEvent(view.getByTestId('hinted-view'), 'layout', layoutEvent);

    expect(findNodeHandle).toHaveBeenCalledWith(layoutEvent.currentTarget);
    expect(localizeAccessibilityHint).toHaveBeenCalledWith(42);
    expect(onLayout).toHaveBeenCalledWith(layoutEvent);
  });

  it('handles a hint added or translated after the initial layout', () => {
    const view = render(<Fixture />);
    fireEvent(view.getByTestId('hinted-view'), 'layout', layoutEvent);
    expect(localizeAccessibilityHint).not.toHaveBeenCalled();

    view.rerender(<Fixture accessibilityHint="Vaihda kieli" />);
    expect(localizeAccessibilityHint).toHaveBeenCalledWith(42);
    localizeAccessibilityHint.mockClear();
    view.rerender(<Fixture accessibilityHint="Ändra språk" />);
    expect(localizeAccessibilityHint).toHaveBeenCalledWith(42);
    localizeAccessibilityHint.mockClear();
    view.rerender(<Fixture />);
    expect(localizeAccessibilityHint).toHaveBeenCalledWith(42);
  });

  it('does not bind an unmounted view before layout', () => {
    render(<Fixture accessibilityHint="Vaihda kieli" />);

    expect(localizeAccessibilityHint).not.toHaveBeenCalled();
  });

  it('keeps the iOS layout handler and native behavior', () => {
    Object.defineProperty(Platform, 'OS', { value: 'ios' });
    const onLayout = jest.fn();
    const view = render(
      <Fixture accessibilityHint="Vaihda kieli" onLayout={onLayout} />
    );
    fireEvent(view.getByTestId('hinted-view'), 'layout', layoutEvent);

    expect(onLayout).toHaveBeenCalledWith(layoutEvent);
    expect(findNodeHandle).not.toHaveBeenCalled();
    expect(localizeAccessibilityHint).not.toHaveBeenCalled();
  });

  it('handles a missing module and a view without a native handle', () => {
    NativeModules.AppLanguage = undefined;
    const view = render(<Fixture accessibilityHint="Vaihda kieli" />);
    fireEvent(view.getByTestId('hinted-view'), 'layout', layoutEvent);
    NativeModules.AppLanguage = { localizeAccessibilityHint };
    jest.mocked(findNodeHandle).mockReturnValue(null);
    fireEvent(view.getByTestId('hinted-view'), 'layout', layoutEvent);

    expect(localizeAccessibilityHint).not.toHaveBeenCalled();
  });
});
