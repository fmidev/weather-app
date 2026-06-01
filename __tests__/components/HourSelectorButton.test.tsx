import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import HourSelectorButton from '../../src/components/common/HourSelectorButton';

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    colors: {
      selectedButton: '#ffd166',
      primaryText: '#111111',
      hourListText: '#777777',
    },
  }),
}));

describe('HourSelectorButton', () => {
  it('renders text and handles press with accessibility props', () => {
    const onPress = jest.fn();
    const { getByText, getByA11yLabel } = render(
      <HourSelectorButton
        text="06-12"
        accessibilityHint="Select 06-12"
        onPress={onPress}
      />
    );

    expect(getByText('06-12')).toBeTruthy();
    fireEvent.press(getByA11yLabel('Select 06-12'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('applies active styles and active text color', () => {
    const { toJSON } = render(
      <HourSelectorButton text="12-18" active />
    );

    const tree = toJSON() as any;
    const buttonView = tree.children[0];
    const buttonStyles = Array.isArray(buttonView.props.style)
      ? buttonView.props.style
      : [buttonView.props.style];
    const mergedButtonStyle = Object.assign({}, ...buttonStyles);

    const textNode = buttonView.children[0];
    const textStyles = Array.isArray(textNode.props.style)
      ? textNode.props.style
      : [textNode.props.style];
    const mergedTextStyle = Object.assign({}, ...textStyles);

    expect(mergedButtonStyle.backgroundColor).toBe('#ffd166');
    expect(mergedTextStyle.color).toBe('#111111');
    expect(mergedTextStyle.fontFamily).toBe('Roboto-Bold');
  });

  it('applies disabled and separator styles and inactive text color', () => {
    const { toJSON } = render(
      <HourSelectorButton text="18-24" disabled separator />
    );

    const tree = toJSON() as any;
    expect(tree.props.accessibilityState).toMatchObject({ disabled: true });

    const buttonView = tree.children[0];
    const buttonStyles = Array.isArray(buttonView.props.style)
      ? buttonView.props.style
      : [buttonView.props.style];
    const mergedButtonStyle = Object.assign({}, ...buttonStyles);

    const textNode = buttonView.children[0];
    const textStyles = Array.isArray(textNode.props.style)
      ? textNode.props.style
      : [textNode.props.style];
    const mergedTextStyle = Object.assign({}, ...textStyles);

    expect(mergedButtonStyle.opacity).toBe(0.5);
    expect(mergedButtonStyle.borderRightWidth).toBe(1);
    expect(mergedTextStyle.color).toBe('#777777');
    expect(mergedTextStyle.fontFamily).toBe('Roboto-Regular');
  });
});
