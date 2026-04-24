import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import SelectorButton from '../../src/components/common/SelectorButton';

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    colors: {
      timeStepBackground: '#ddeeff',
      inputButtonBackground: '#f7f7f7',
      chartSecondaryLine: '#336699',
      secondaryBorder: '#cccccc',
      primaryText: '#111111',
      hourListText: '#666666',
    },
  }),
}));

describe('SelectorButton', () => {
  it('renders text, forwards accessibility hint and handles press', () => {
    const onPress = jest.fn();
    const { getByText, getByA11yHint } = render(
      <SelectorButton
        text="12 h"
        accessibilityHint="Select 12 hours"
        onPress={onPress}
      />
    );

    expect(getByText('12 h')).toBeTruthy();

    fireEvent.press(getByA11yHint('Select 12 hours'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('applies active styles and active text color', () => {
    const { toJSON } = render(
      <SelectorButton text="24 h" active />
    );

    const tree = toJSON() as any;
    const containerStyleArray = Array.isArray(tree.props.style)
      ? tree.props.style
      : [tree.props.style];
    const mergedContainerStyle = Object.assign({}, ...containerStyleArray);

    const buttonView = tree.children[0];
    const buttonStyleArray = Array.isArray(buttonView.props.style)
      ? buttonView.props.style
      : [buttonView.props.style];
    const mergedButtonStyle = Object.assign({}, ...buttonStyleArray);

    const textNode = buttonView.children[0];
    const textStyleArray = Array.isArray(textNode.props.style)
      ? textNode.props.style
      : [textNode.props.style];
    const mergedTextStyle = Object.assign({}, ...textStyleArray);

    expect(mergedContainerStyle.marginRight).toBe(16);
    expect(mergedButtonStyle.backgroundColor).toBe('#ddeeff');
    expect(mergedButtonStyle.borderColor).toBe('#336699');
    expect(mergedButtonStyle.borderRadius).toBe(20);
    expect(mergedTextStyle.color).toBe('#111111');
    expect(mergedTextStyle.fontFamily).toBe('Roboto-Bold');
  });

  it('applies inactive styles and regular text weight', () => {
    const { toJSON } = render(
      <SelectorButton text="48 h" />
    );

    const tree = toJSON() as any;
    const buttonView = tree.children[0];
    const buttonStyleArray = Array.isArray(buttonView.props.style)
      ? buttonView.props.style
      : [buttonView.props.style];
    const mergedButtonStyle = Object.assign({}, ...buttonStyleArray);

    const textNode = buttonView.children[0];
    const textStyleArray = Array.isArray(textNode.props.style)
      ? textNode.props.style
      : [textNode.props.style];
    const mergedTextStyle = Object.assign({}, ...textStyleArray);

    expect(mergedButtonStyle.backgroundColor).toBe('#f7f7f7');
    expect(mergedButtonStyle.borderColor).toBe('#cccccc');
    expect(mergedTextStyle.color).toBe('#666666');
    expect(mergedTextStyle.fontFamily).toBe('Roboto-Regular');
    expect(tree.props.accessibilityRole).toBe('button');
  });
});
