import React from 'react';
import * as ReactNative from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';

import CloseButton from '../../src/components/common/CloseButton';

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    colors: {
      inputBackground: '#eeeeee',
      text: '#111111',
    },
  }),
}));

jest.mock('@components/common/ScalableIcon', () => {
  const { Text } = require('react-native');

  return ({ name }: { name: string }) => <Text testID="close-icon">{name}</Text>;
});

describe('CloseButton', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders with accessibility props and triggers onPress', () => {
    jest.spyOn(ReactNative, 'useWindowDimensions').mockReturnValue({
      width: 390,
      height: 844,
      scale: 3,
      fontScale: 1,
    });

    const onPress = jest.fn();
    const { getByTestId, getByA11yLabel } = render(
      <CloseButton
        onPress={onPress}
        accessibilityLabel="Close panel"
        testID="close-btn"
      />
    );

    fireEvent.press(getByTestId('close-btn'));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(getByA11yLabel('Close panel')).toBeTruthy();
    expect(getByTestId('close-icon')).toBeTruthy();
  });

  it('uses maxScaleFactor, custom size and backgroundColor for button container', () => {
    jest.spyOn(ReactNative, 'useWindowDimensions').mockReturnValue({
      width: 390,
      height: 844,
      scale: 3,
      fontScale: 3,
    });

    const { toJSON } = render(
      <CloseButton
        onPress={() => {}}
        accessibilityLabel="Close panel"
        testID="close-btn"
        size={10}
        maxScaleFactor={1.5}
        backgroundColor="pink"
        // eslint-disable-next-line react-native/no-inline-styles
        style={{ marginTop: 4 }}
      />
    );

    const tree = toJSON() as any;
    const containerView = tree.children[0];
    const styleArray = Array.isArray(containerView.props.style)
      ? containerView.props.style
      : [containerView.props.style];
    const mergedStyle = Object.assign({}, ...styleArray);

    expect(mergedStyle.width).toBe(15);
    expect(mergedStyle.height).toBe(15);
    expect(mergedStyle.borderRadius).toBe(7.5);
    expect(mergedStyle.backgroundColor).toBe('pink');
    expect(mergedStyle.marginTop).toBe(4);
  });
});
