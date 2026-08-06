import React from 'react';
import { AccessibilityInfo, Animated, StyleSheet } from 'react-native';
import { act, render } from '@testing-library/react-native';

import Skeleton from '../../src/components/common/Skeleton';

const mockUseTheme = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useTheme: () => mockUseTheme(),
}));

describe('Skeleton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTheme.mockReturnValue({ dark: false });
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders with the requested dimensions and light theme color', () => {
    const { getByTestId } = render(
      <Skeleton width="75%" height={40} radius={10} />
    );

    expect(StyleSheet.flatten(getByTestId('skeleton').props.style)).toEqual(
      expect.objectContaining({
        width: '75%',
        height: 40,
        borderRadius: 10,
        backgroundColor: '#E6E6E6',
      })
    );
  });

  it('uses the dark theme color', () => {
    mockUseTheme.mockReturnValue({ dark: true });

    const { getByTestId } = render(<Skeleton />);

    expect(StyleSheet.flatten(getByTestId('skeleton').props.style)).toEqual(
      expect.objectContaining({
        backgroundColor: '#353944',
      })
    );
  });

  it('stops animation when reduced motion is enabled', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);
    const stopAnimation = jest.spyOn(Animated.Value.prototype, 'stopAnimation');

    render(<Skeleton />);

    await act(async () => {});

    expect(stopAnimation).toHaveBeenCalled();
  });
});
