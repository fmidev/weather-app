import React from 'react';
import { Text } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';

import CollapsibleHeader from '../../src/components/weather/common/CollapsibleHeader';

const mockIcon = jest.fn((props) => <Text {...props} testID={`icon-${props.name}`}>icon</Text>);

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    colors: {
      border: '#d9d9d9',
      inputBackground: '#f5f5f5',
      primaryText: '#101010',
    },
  }),
}));

jest.mock('@assets/Icon', () => ({
  __esModule: true,
  default: (props: any) => mockIcon(props),
}));

const getMergedStyle = (style: any) => {
  if (Array.isArray(style)) return Object.assign({}, ...style);
  return style || {};
};

describe('CollapsibleHeader', () => {
  beforeEach(() => {
    mockIcon.mockClear();
  });

  it('renders title, accessibility label and handles press', () => {
    const onPress = jest.fn();
    const { getByText, getByA11yLabel } = render(
      <CollapsibleHeader
        open={false}
        title="Forecast details"
        accessibilityLabel="Open forecast details"
        onPress={onPress}
      />
    );

    expect(getByText('Forecast details')).toBeTruthy();
    fireEvent.press(getByA11yLabel('Open forecast details'));
    expect(onPress).toHaveBeenCalledTimes(1);

    expect(mockIcon).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'arrow-down',
        width: 24,
        height: 24,
        style: { color: '#101010' },
      })
    );
  });

  it('renders start icon and arrow-up when open', () => {
    render(
      <CollapsibleHeader
        open
        title="Observations"
        accessibilityLabel="Collapse observations"
        onPress={() => {}}
        iconStart="thermometer"
      />
    );

    expect(mockIcon).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'thermometer',
        width: 24,
        height: 24,
        style: { color: '#101010' },
      })
    );
    expect(mockIcon).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'arrow-up',
        width: 24,
        height: 24,
      })
    );
  });

  it('applies rounded style when rounded prop is true', () => {
    const { toJSON } = render(
      <CollapsibleHeader
        open={false}
        title="Warnings"
        accessibilityLabel="Open warnings"
        onPress={() => {}}
        rounded
      />
    );

    const tree = toJSON() as any;
    const rowView = tree.children[0];
    const rowStyle = getMergedStyle(rowView.props.style);

    expect(rowStyle.borderRadius).toBe(20);
    expect(rowStyle.borderBottomWidth).toBe(0);
    expect(rowStyle.backgroundColor).toBe('#f5f5f5');
    expect(rowStyle.borderBottomColor).toBe('#d9d9d9');
  });
});
