import React from 'react';
import { Text } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';

import HeaderButton from '../../src/components/common/HeaderButton';

const mockUseOrientation = jest.fn();
const mockIcon = jest.fn((props) => <Text {...props} testID="header-button-icon">icon</Text>);

jest.mock('@utils/hooks', () => ({
  useOrientation: () => mockUseOrientation(),
}));

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    colors: {
      text: '#222222',
    },
  }),
}));

jest.mock('@components/common/ScalableIcon', () => ({
  __esModule: true,
  default: (props: any) => mockIcon(props),
}));

describe('HeaderButton', () => {
  beforeEach(() => {
    mockUseOrientation.mockReset();
    mockIcon.mockClear();
  });

  it('renders title variant, forwards accessibility props and handles press', () => {
    mockUseOrientation.mockReturnValue(false); // portrait
    const onPress = jest.fn();

    const { getByText, getByA11yLabel, getByTestId } = render(
      <HeaderButton
        testID="header-btn"
        title="Settings"
        icon="settings"
        onPress={onPress}
        accessibilityLabel="Open settings"
        accessibilityHint="Opens settings screen"
      />
    );

    expect(getByText('Settings')).toBeTruthy();
    expect(getByTestId('header-button-icon')).toBeTruthy();
    expect(getByA11yLabel('Open settings')).toBeTruthy();

    fireEvent.press(getByA11yLabel('Open settings'));
    expect(onPress).toHaveBeenCalledTimes(1);

    expect(mockIcon).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'settings',
        maxScaleFactor: 1,
        width: 24,
        height: 24,
        style: { color: '#222222' },
      })
    );
  });

  it('renders icon-only variant with larger icon scaling and no title', () => {
    mockUseOrientation.mockReturnValue(true); // landscape

    const { queryByText, toJSON } = render(
      <HeaderButton
        icon="close-outline"
        right
        onPress={() => {}}
        accessibilityLabel="Close"
        accessibilityHint="Closes view"
      />
    );

    expect(queryByText('Close')).toBeNull();
    expect(mockIcon).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'close-outline',
        maxScaleFactor: 2,
      })
    );

    const tree = toJSON() as any;
    const containerView = tree.children[0];
    const styleArray = Array.isArray(containerView.props.style)
      ? containerView.props.style
      : [containerView.props.style];
    const mergedStyle = Object.assign({}, ...styleArray);

    expect(mergedStyle.minWidth).toBe(32);
    expect(mergedStyle.flexDirection).toBe('row-reverse');
    expect(mergedStyle.alignItems).toBe('center');
  });
});
