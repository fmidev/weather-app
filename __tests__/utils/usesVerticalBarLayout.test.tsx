import React from 'react';
import {
  DeviceEventEmitter,
  NativeModules,
  Platform,
  Text,
} from 'react-native';
import { act, render } from '@testing-library/react-native';

import { usesVerticalBarLayout } from '../../src/utils/usesVerticalBarLayout';

const originalPlatform = Platform.OS;
const originalModule = NativeModules.VerticalBarLayout;
const eventName = 'verticalBarLayoutDidChange';
const mockModule = {
  getUsesVerticalBarLayout: jest.fn(),
  addListener: jest.fn(),
  removeListeners: jest.fn(),
};

const Fixture = () => {
  const vertical = usesVerticalBarLayout();
  return <Text testID="vertical-layout">{String(vertical)}</Text>;
};

describe('usesVerticalBarLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(Platform, 'OS', { value: 'ios' });
    NativeModules.VerticalBarLayout = mockModule;
    mockModule.getUsesVerticalBarLayout.mockResolvedValue(false);
  });

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', { value: originalPlatform });
    NativeModules.VerticalBarLayout = originalModule;
  });

  it.each([true, false])(
    'reads the native initial layout (%s)',
    async (vertical) => {
      mockModule.getUsesVerticalBarLayout.mockResolvedValue(vertical);
      const view = render(<Fixture />);
      await act(async () => {});
      expect(view.getByTestId('vertical-layout').props.children).toBe(
        String(vertical)
      );
    }
  );

  it('updates mounted components when the device layout changes', async () => {
    const view = render(<Fixture />);
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
    const view = render(<Fixture />);
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
    const view = render(<Fixture />);
    view.unmount();
    expect(mockModule.removeListeners).toHaveBeenCalledWith(1);
    await act(async () => resolveInitial(true));
  });

  it('keeps controls available if the native query fails', async () => {
    mockModule.getUsesVerticalBarLayout.mockRejectedValue(
      new Error('unavailable')
    );
    const view = render(<Fixture />);
    await act(async () => {});
    expect(view.getByTestId('vertical-layout').props.children).toBe('false');
  });

  it('returns false outside iOS without querying or observing the native module', () => {
    Object.defineProperty(Platform, 'OS', { value: 'android' });
    const view = render(<Fixture />);
    expect(view.getByTestId('vertical-layout').props.children).toBe('false');
    expect(mockModule.getUsesVerticalBarLayout).not.toHaveBeenCalled();
    expect(mockModule.addListener).not.toHaveBeenCalled();
  });

  it('returns false if the native module is unavailable', () => {
    delete NativeModules.VerticalBarLayout;
    const view = render(<Fixture />);
    expect(view.getByTestId('vertical-layout').props.children).toBe('false');
  });
});
