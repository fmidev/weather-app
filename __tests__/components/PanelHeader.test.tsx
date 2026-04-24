import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';

import PanelHeader from '../../src/components/common/PanelHeader';

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    colors: {
      cardHeader: '#f0f0f0',
      border: '#cccccc',
      primaryText: '#101010',
    },
  }),
}));

describe('PanelHeader', () => {
  it('renders title, additional content and default accessibility values', () => {
    const { getByText, getByA11yLabel, toJSON } = render(
      <PanelHeader
        title="Forecast"
        additionalContent={<Text testID="extra">Updated 3.3. at 12:14</Text>}
      />
    );

    expect(getByText('Forecast')).toBeTruthy();
    expect(getByText('Updated 3.3. at 12:14')).toBeTruthy();
    expect(getByA11yLabel('Forecast')).toBeTruthy();

    const tree = toJSON() as any;
    expect(tree.props.accessibilityHint).toBe('');

    const styleArray = Array.isArray(tree.props.style)
      ? tree.props.style
      : [tree.props.style];
    const mergedStyle = Object.assign({}, ...styleArray);

    expect(mergedStyle.backgroundColor).toBe('#f0f0f0');
    expect(mergedStyle.borderBottomColor).toBe('#cccccc');
  });

  it('applies custom accessibility and layout variants', () => {
    const { toJSON, getByA11yLabel } = render(
      <PanelHeader
        title="Warnings"
        accessibilityLabel="Warnings header"
        accessibilityHint="Shows warning details"
        justifyCenter
        thin
        news
        background="#ffeeaa"
      />
    );

    expect(getByA11yLabel('Warnings header')).toBeTruthy();

    const tree = toJSON() as any;
    expect(tree.props.accessibilityHint).toBe('Shows warning details');

    const styleArray = Array.isArray(tree.props.style)
      ? tree.props.style
      : [tree.props.style];
    const mergedStyle = Object.assign({}, ...styleArray);

    expect(mergedStyle.justifyContent).toBe('center');
    expect(mergedStyle.paddingVertical).toBe(6);
    expect(mergedStyle.marginHorizontal).toBe(16);
    expect(mergedStyle.marginVertical).toBe(16);
    expect(mergedStyle.borderBottomWidth).toBe(0);
    expect(mergedStyle.backgroundColor).toBe('#ffeeaa');
  });
});
