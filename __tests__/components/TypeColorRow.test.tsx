import React from 'react';
import { render } from '@testing-library/react-native';

import TypeColorRow from '../../src/components/warnings/TypeColorRow';

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    colors: {
      hourListText: '#2b2b2b',
    },
  }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      if (key === 'warnings:severities:2') return 'Severe warning';
      if (key === 'warnings:severities:0') return 'No warning';
      return key;
    },
  }),
}));

const getMergedStyle = (style: any) => {
  if (Array.isArray(style)) return Object.assign({}, ...style);
  return style || {};
};

describe('TypeColorRow', () => {
  it('renders lowercased translated severity text with theme color', () => {
    const severityColors = ['#00aa00', '#f8f800', '#ff9900', '#cc0000'];
    const { getByText } = render(
      <TypeColorRow severity={2} severityColors={severityColors} />
    );

    const label = getByText('severe warning');
    expect(label).toBeTruthy();

    const textStyle = getMergedStyle(label.props.style);
    expect(textStyle.color).toBe('#2b2b2b');
    expect(textStyle.fontSize).toBe(16);
  });

  it('uses severity color for both border and background of indicator ball', () => {
    const severityColors = ['#0f0', '#ff0', '#f90', '#f00'];
    const { toJSON } = render(
      <TypeColorRow severity={3} severityColors={severityColors} />
    );

    const tree = toJSON() as any;
    const iconWrapper = tree.children[0];
    const ball = iconWrapper.children[0];
    const ballStyle = getMergedStyle(ball.props.style);

    expect(ballStyle.backgroundColor).toBe('#f00');
    expect(ballStyle.borderColor).toBe('#f00');
    expect(ball.props.accessibilityElementsHidden).toBe(true);
  });
});
