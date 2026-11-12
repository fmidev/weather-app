import React from 'react';
import { StyleSheet } from 'react-native';
import { render } from '@testing-library/react-native';

import HorizontalScrollFades from '../../src/components/common/HorizontalScrollFades';

let mockBackground = '#ffffff';
let mockDark = false;

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({ colors: { background: mockBackground }, dark: mockDark }),
}));

jest.mock('react-native-linear-gradient', () => ({
  __esModule: true,
  default: (props: any) => {
    const { View } = require('react-native');
    return <View {...props} />;
  },
}));

describe('HorizontalScrollFades', () => {
  beforeEach(() => {
    mockBackground = '#ffffff';
    mockDark = false;
  });

  it('does not render fades when all content is visible', () => {
    const view = render(
      <HorizontalScrollFades edges={{ left: false, right: false }} testIDPrefix="list" />
    );
    expect(view.toJSON()).toBeNull();
  });

  it.each([
    { background: '#ffffff', rgb: '255, 255, 255', dark: false },
    { background: '#000000', rgb: '0, 0, 0', dark: true },
    { background: '#0F0F2D', rgb: '15, 15, 45', dark: true },
  ])('uses theme colors without intercepting touches or accessibility ($background)', ({ background, rgb, dark }) => {
    mockBackground = background;
    mockDark = dark;
    const view = render(
      <HorizontalScrollFades edges={{ left: true, right: true }} testIDPrefix="list" />
    );
    const left = view.getByTestId('list-left-fade');
    const right = view.getByTestId('list-right-fade');
    const colors = dark
      ? [background, `rgba(${rgb}, 0.65)`, `rgba(${rgb}, 0)`]
      : [background, `rgba(${rgb}, 0)`];
    expect(left.props.colors).toEqual(colors);
    expect(right.props.colors).toEqual([...colors].reverse());
    expect(left.props.locations).toEqual(dark ? [0, 0.45, 1] : undefined);
    expect(right.props.locations).toEqual(dark ? [0, 0.55, 1] : undefined);
    [left, right].forEach((fade) => {
      expect(fade.props.pointerEvents).toBe('none');
      expect(fade.props.accessible).toBe(false);
      expect(fade.props.accessibilityElementsHidden).toBe(true);
      expect(fade.props.importantForAccessibility).toBe('no-hide-descendants');
      expect(StyleSheet.flatten(fade.props.style).width).toBe(dark ? 40 : 30);
    });
  });
});
