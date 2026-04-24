import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';

import SimpleHeader from '../../src/components/common/SimpleHeader';

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    colors: {
      primaryText: '#101010',
    },
  }),
}));

describe('SimpleHeader', () => {
  it('renders title with accessibility defaults and themed text color', () => {
    const { getByText, getByA11yLabel, toJSON } = render(
      <SimpleHeader
        title="Forecast"
        accessibilityHint="Shows forecast details"
      />
    );

    const text = getByText('Forecast');
    expect(text).toBeTruthy();
    expect(getByA11yLabel('Forecast')).toBeTruthy();

    const textStyleArray = Array.isArray(text.props.style)
      ? text.props.style
      : [text.props.style];
    const mergedTextStyle = Object.assign({}, ...textStyleArray);

    expect(mergedTextStyle.color).toBe('#101010');
    expect(mergedTextStyle.fontSize).toBe(18);
    expect(mergedTextStyle.fontFamily).toBe('Roboto-Bold');

    const tree = toJSON() as any;
    expect(tree.props.accessibilityRole).toBe('header');
    expect(tree.props.accessibilityHint).toBe('Shows forecast details');
  });

  it('renders additional content and applies justifyCenter + thin styles', () => {
    const { getByText, toJSON } = render(
      <SimpleHeader
        title="Warnings"
        justifyCenter
        thin
        additionalContent={<Text testID="extra">Updated 12:00</Text>}
      />
    );

    expect(getByText('Warnings')).toBeTruthy();
    expect(getByText('Updated 12:00')).toBeTruthy();

    const tree = toJSON() as any;
    const styleArray = Array.isArray(tree.props.style)
      ? tree.props.style
      : [tree.props.style];
    const mergedStyle = Object.assign({}, ...styleArray);

    expect(mergedStyle.justifyContent).toBe('center');
    expect(mergedStyle.paddingHorizontal).toBe(16);
    expect(mergedStyle.paddingVertical).toBe(6);
    expect(mergedStyle.marginHorizontal).toBe(16);
    expect(mergedStyle.marginVertical).toBe(16);
    expect(mergedStyle.flexWrap).toBe('wrap');
    expect(mergedStyle.alignItems).toBe('center');
  });
});
