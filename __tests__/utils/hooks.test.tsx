import React from 'react';
import { View, Text, DeviceEventEmitter, NativeModules, Platform, findNodeHandle } from 'react-native';
import type { LayoutChangeEvent, ViewProps } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';
import { createInstance } from 'i18next';
import { I18nextProvider } from 'react-i18next';

import {
  useAccessibilityHintLanguage,
  useAccessibilityLanguage,
  usesVerticalBarLayout,
} from '../../src/utils/hooks';

const LanguageFixture = () => {
  const accessibilityLanguage = useAccessibilityLanguage();
  return (
    <View
      testID="language-view"
      accessibilityLanguage={accessibilityLanguage}
    />
  );
};

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

describe('useAccessibilityLanguage', () => {
  afterEach(() => {
    Object.defineProperty(Platform, 'OS', { value: originalPlatform });
  });

  it('updates mounted iOS elements when the app language changes', async () => {
    Object.defineProperty(Platform, 'OS', { value: 'ios' });
    const instance = createInstance();
    await instance.init({
      lng: 'fi',
      fallbackLng: 'en',
      resources: {
        fi: { translation: { title: 'Asetukset' } },
        sv: { translation: { title: 'Inställningar' } },
        en: { translation: { title: 'Settings' } },
      },
    });
    const view = render(
      <I18nextProvider i18n={instance}>
        <LanguageFixture />
      </I18nextProvider>
    );
    expect(view.getByTestId('language-view').props.accessibilityLanguage).toBe(
      'fi-FI'
    );

    for (const [language, expected] of [
      ['sv', 'sv-SE'],
      ['en', 'en-GB'],
      ['fi', 'fi-FI'],
    ]) {
      await act(async () => {
        await instance.changeLanguage(language);
      });
      expect(
        view.getByTestId('language-view').props.accessibilityLanguage
      ).toBe(expected);
    }
  });

  it('preserves an explicitly configured regional locale', async () => {
    Object.defineProperty(Platform, 'OS', { value: 'ios' });
    const instance = createInstance();
    await instance.init({ lng: 'en-US', fallbackLng: false, resources: {} });
    const view = render(
      <I18nextProvider i18n={instance}>
        <LanguageFixture />
      </I18nextProvider>
    );
    expect(view.getByTestId('language-view').props.accessibilityLanguage).toBe(
      'en-US'
    );
  });

  it('leaves Android pronunciation to the native app language implementation', async () => {
    Object.defineProperty(Platform, 'OS', { value: 'android' });
    const instance = createInstance();
    await instance.init({ lng: 'fi', resources: {} });
    const view = render(
      <I18nextProvider i18n={instance}>
        <LanguageFixture />
      </I18nextProvider>
    );
    expect(
      view.getByTestId('language-view').props.accessibilityLanguage
    ).toBeUndefined();
  });
});

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
    jest.mocked(findNodeHandle).mockReturnValue(undefined);
    fireEvent(view.getByTestId('hinted-view'), 'layout', layoutEvent);

    expect(localizeAccessibilityHint).not.toHaveBeenCalled();
  });
});

describe('usesVerticalBarLayout', () => {
  const originalVerticalBarModule = NativeModules.VerticalBarLayout;
  const eventName = 'verticalBarLayoutDidChange';
  const mockModule = {
    getUsesVerticalBarLayout: jest.fn(),
    addListener: jest.fn(),
    removeListeners: jest.fn(),
  };

  const VerticalBarLayoutFixture = () => {
    const vertical = usesVerticalBarLayout();
    return <Text testID="vertical-layout">{String(vertical)}</Text>;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(Platform, 'OS', { value: 'ios' });
    NativeModules.VerticalBarLayout = mockModule;
    mockModule.getUsesVerticalBarLayout.mockResolvedValue(false);
  });

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', { value: originalPlatform });
    NativeModules.VerticalBarLayout = originalVerticalBarModule;
  });

  it.each([true, false])(
    'reads the native initial layout (%s)',
    async (vertical) => {
      mockModule.getUsesVerticalBarLayout.mockResolvedValue(vertical);
      const view = render(<VerticalBarLayoutFixture />);
      await act(async () => {});
      expect(view.getByTestId('vertical-layout').props.children).toBe(
        String(vertical)
      );
    }
  );

  it('updates mounted components when the device layout changes', async () => {
    const view = render(<VerticalBarLayoutFixture />);
    await act(async () => {});
    act(() => DeviceEventEmitter.emit(eventName, true));
    expect(view.getByTestId('vertical-layout').props.children).toBe('true');
    act(() => DeviceEventEmitter.emit(eventName, false));
    expect(view.getByTestId('vertical-layout').props.children).toBe('false');
  });

  it('ignores a stale initial response after receiving a layout change', async () => {
    let resolveInitial!: (value: boolean) => void;
    mockModule.getUsesVerticalBarLayout.mockReturnValue(
      new Promise<boolean>((resolve) => {
        resolveInitial = resolve;
      })
    );
    const view = render(<VerticalBarLayoutFixture />);
    act(() => DeviceEventEmitter.emit(eventName, true));
    await act(async () => resolveInitial(false));
    expect(view.getByTestId('vertical-layout').props.children).toBe('true');
  });

  it('removes the native listener when unmounted, including while the initial read is pending', async () => {
    let resolveInitial!: (value: boolean) => void;
    mockModule.getUsesVerticalBarLayout.mockReturnValue(
      new Promise<boolean>((resolve) => {
        resolveInitial = resolve;
      })
    );
    const view = render(<VerticalBarLayoutFixture />);
    view.unmount();
    expect(mockModule.removeListeners).toHaveBeenCalledWith(1);
    await act(async () => resolveInitial(true));
  });

  it('keeps controls available if the native query fails', async () => {
    mockModule.getUsesVerticalBarLayout.mockRejectedValue(
      new Error('unavailable')
    );
    const view = render(<VerticalBarLayoutFixture />);
    await act(async () => {});
    expect(view.getByTestId('vertical-layout').props.children).toBe('false');
  });

  it('returns false outside iOS without querying or observing the native module', () => {
    Object.defineProperty(Platform, 'OS', { value: 'android' });
    const view = render(<VerticalBarLayoutFixture />);
    expect(view.getByTestId('vertical-layout').props.children).toBe('false');
    expect(mockModule.getUsesVerticalBarLayout).not.toHaveBeenCalled();
    expect(mockModule.addListener).not.toHaveBeenCalled();
  });

  it('returns false if the native module is unavailable', () => {
    delete NativeModules.VerticalBarLayout;
    const view = render(<VerticalBarLayoutFixture />);
    expect(view.getByTestId('vertical-layout').props.children).toBe('false');
  });
});
