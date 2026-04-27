import React from 'react';
import { render } from '@testing-library/react-native';

import TemperatureLegend from '../../src/components/markdown/TemperatureLegend';

const mockGetTemperatureIndexColor = jest.fn((index: number) => `color-${index}`);

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    colors: {
      hourListText: '#222222',
    },
  }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      if (key === 'map:infoBottomSheet:temperature:temperatureMinus30') return '-30';
      if (key === 'map:infoBottomSheet:temperature:temperatureMinus20') return '-20';
      if (key === 'map:infoBottomSheet:temperature:temperature0') return '0';
      if (key === 'map:infoBottomSheet:temperature:temperature20') return '20';
      return key;
    },
  }),
}));

jest.mock('@assets/colors', () => {
  const actual = jest.requireActual('@assets/colors');
  return {
    ...actual,
    getTemperatureIndexColor: (index: number) => mockGetTemperatureIndexColor(index),
  };
});

const getMergedStyle = (style: any) => {
  if (Array.isArray(style)) return Object.assign({}, ...style);
  return style || {};
};

describe('TemperatureLegend', () => {
  beforeEach(() => {
    mockGetTemperatureIndexColor.mockClear();
  });

  it('renders labels with themed text color and 50 color blocks', () => {
    const { getByText, getByTestId, queryAllByTestId } = render(<TemperatureLegend />);

    const minus30 = getByText('-30');
    const minus20 = getByText('-20');
    const zero = getByText('0');
    const plus20 = getByText('20');

    expect(getMergedStyle(minus30.props.style).color).toBe('#222222');
    expect(getMergedStyle(minus20.props.style).color).toBe('#222222');
    expect(getMergedStyle(zero.props.style).color).toBe('#222222');
    expect(getMergedStyle(plus20.props.style).color).toBe('#222222');

    expect(mockGetTemperatureIndexColor).toHaveBeenCalledTimes(50);
    expect(mockGetTemperatureIndexColor).toHaveBeenNthCalledWith(1, 1);
    expect(mockGetTemperatureIndexColor).toHaveBeenNthCalledWith(50, 50);

    expect(getByTestId('temperature-legend-row')).toBeTruthy();
    expect(getByTestId('temperature-legend-label-row')).toBeTruthy();

    const legendBlocks = queryAllByTestId(/temperature-legend-block-/);
    expect(legendBlocks.length).toBe(50);
    expect(getMergedStyle(legendBlocks[0].props.style).backgroundColor).toBe('color-1');
    expect(getMergedStyle(legendBlocks[49].props.style).backgroundColor).toBe('color-50');
  });
});
