import React from 'react';
import { Text } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';

import IconButton from '../../src/components/common/IconButton';
import { PRIMARY_BLUE } from '../../src/assets/colors';

const mockIcon = jest.fn((props) => <Text {...props} testID="icon-button-icon">icon</Text>);

jest.mock('@assets/Icon', () => ({
  __esModule: true,
  default: (props: any) => mockIcon(props),
}));

describe('IconButton', () => {
  beforeEach(() => {
    mockIcon.mockClear();
  });

  it('renders touchable circular button, forwards icon props and handles press', () => {
    const onPress = jest.fn();
    const { getByTestId, getByA11yLabel, toJSON } = render(
      <IconButton
        testID="icon-btn"
        onPress={onPress}
        accessibilityLabel="Open menu"
        icon="menu"
        iconSize={44}
        iconColor="tomato"
        circular
        backgroundColor="pink"
      />
    );

    fireEvent.press(getByTestId('icon-btn'));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(getByA11yLabel('Open menu')).toBeTruthy();

    const touchable = getByTestId('icon-btn');
    expect(touchable.props.hitSlop).toEqual({
      top: 12,
      bottom: 12,
      left: 12,
      right: 12,
    });

    expect(mockIcon).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'menu',
        width: 44,
        height: 44,
        style: { color: 'tomato' },
      })
    );

    const tree = toJSON() as any;
    const containerView = tree;
    const styleArray = Array.isArray(containerView.props.style)
      ? containerView.props.style
      : [containerView.props.style];
    const mergedStyle = Object.assign({}, ...styleArray);

    expect(mergedStyle.width).toBe(72);
    expect(mergedStyle.height).toBe(72);
    expect(mergedStyle.borderRadius).toBe(36);
    expect(mergedStyle.backgroundColor).toBe('pink');
  });

  it('renders non-touchable fallback when onPress is missing', () => {
    const { queryByTestId, toJSON } = render(
      <IconButton
        onPress={undefined as any}
        accessibilityLabel="No action"
        icon="close"
        backgroundColor="lightblue"
      />
    );

    expect(queryByTestId('icon-btn')).toBeNull();
    expect(mockIcon).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'close',
        width: 22,
        height: 22,
        style: { color: PRIMARY_BLUE },
      })
    );

    const tree = toJSON() as any;
    const styleArray = Array.isArray(tree.props.style)
      ? tree.props.style
      : [tree.props.style];
    const mergedStyle = Object.assign({}, ...styleArray);
    expect(mergedStyle.width).toBe(48);
    expect(mergedStyle.height).toBe(48);
    expect(mergedStyle.backgroundColor).toBe('lightblue');
  });
});
