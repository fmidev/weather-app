import React, { createRef } from 'react';
import { Text, View } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';

import AccessibleTouchableOpacity from '../../src/components/common/AccessibleTouchableOpacity';

describe('AccessibleTouchableOpacity', () => {
  it('applies minimum accessible touch dimensions', () => {
    const { getByTestId } = render(
      <AccessibleTouchableOpacity testID="touchable">
        <Text>Press</Text>
      </AccessibleTouchableOpacity>
    );

    const touchable = getByTestId('touchable');
    const styleArray = Array.isArray(touchable.props.style)
      ? touchable.props.style
      : [touchable.props.style];

    expect(styleArray).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          minHeight: 44,
          minWidth: 44,
          justifyContent: 'center',
          alignItems: 'center',
        }),
      ])
    );
  });

  it('merges custom style with accessible base style', () => {
    const { getByTestId } = render(
      <AccessibleTouchableOpacity
        testID="touchable"
        // eslint-disable-next-line react-native/no-inline-styles, react-native/no-color-literals
        style={{ backgroundColor: 'red' }}
      >
        <Text>Press</Text>
      </AccessibleTouchableOpacity>
    );

    const touchable = getByTestId('touchable');
    const styleArray = Array.isArray(touchable.props.style)
      ? touchable.props.style
      : [touchable.props.style];

    expect(styleArray).toEqual(
      expect.arrayContaining([expect.objectContaining({ backgroundColor: 'red' })])
    );
    expect(styleArray).toEqual(
      expect.arrayContaining([expect.objectContaining({ minHeight: 44 })])
    );
  });

  it('forwards onPress events', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <AccessibleTouchableOpacity testID="touchable" onPress={onPress}>
        <Text>Press</Text>
      </AccessibleTouchableOpacity>
    );

    fireEvent.press(getByTestId('touchable'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('forwards the ref to the native touchable and preserves press handling', () => {
    const ref = createRef<View>();
    const onPress = jest.fn();
    const view = render(
      <AccessibleTouchableOpacity
        ref={ref}
        onPress={onPress}
        accessibilityLabel="Station">
        <Text>Station</Text>
      </AccessibleTouchableOpacity>
    );

    expect(ref.current).not.toBeNull();
    expect(ref.current?.measureLayout).toEqual(expect.any(Function));
    fireEvent.press(view.getByA11yLabel('Station'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
