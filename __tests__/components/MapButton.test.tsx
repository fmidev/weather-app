import React from 'react';
import { Text } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';

import MapButton from '../../src/components/map/ui/MapButton';

const mockIcon = jest.fn((props) => <Text {...props} testID="map-button-icon">icon</Text>);

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    colors: {
      mapButtonBackground: '#f7f7f7',
      mapButtonBorder: '#c0c0c0',
      shadow: '#222222',
      text: '#101010',
    },
  }),
}));

jest.mock('@assets/Icon', () => ({
  __esModule: true,
  default: (props: any) => mockIcon(props),
}));

describe('MapButton', () => {
  beforeEach(() => {
    mockIcon.mockClear();
  });

  it('renders icon-only variant and handles press', () => {
    const onPress = jest.fn();
    const { getByA11yLabel, queryByText, toJSON } = render(
      <MapButton
        style={{}}
        icon="info"
        iconSize={24}
        accessibilityLabel="Open layer information"
        onPress={onPress}
      />
    );

    expect(queryByText('Layers')).toBeNull();
    fireEvent.press(getByA11yLabel('Open layer information'));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(mockIcon).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'info',
        width: 24,
        height: 24,
        style: { color: '#101010' },
      })
    );

    const tree = toJSON() as any;
    const styleArray = Array.isArray(tree.props.style)
      ? tree.props.style
      : [tree.props.style];
    const mergedStyle = Object.assign({}, ...styleArray);
    expect(mergedStyle.backgroundColor).toBe('#f7f7f7');
    expect(mergedStyle.borderColor).toBe('#c0c0c0');
    expect(mergedStyle.shadowColor).toBe('#222222');
  });

  it('renders label on the left when labelPosition is left', () => {
    const { getByText, getAllByText } = render(
      <MapButton
        style={{}}
        icon="info"
        iconSize={20}
        accessibilityLabel="Open layer information"
        onPress={() => {}}
        label="Layers"
        labelPosition="left"
      />
    );

    expect(getByText('Layers')).toBeTruthy();
    const children = getAllByText('Layers');
    expect(children.length).toBe(1);
  });

  it('renders label on the right when labelPosition is right', () => {
    const { getByText } = render(
      <MapButton
        style={{}}
        icon="info"
        iconSize={20}
        accessibilityLabel="Open layer information"
        onPress={() => {}}
        label="Layers"
        labelPosition="right"
      />
    );

    expect(getByText('Layers')).toBeTruthy();
    expect(mockIcon).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'info',
        width: 20,
        height: 20,
      })
    );
  });
});
