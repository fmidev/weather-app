import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import SimpleButton from '../../src/components/common/SimpleButton';

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    colors: {
      inputButtonBackground: '#f2f2f2',
      text: '#222222',
    },
  }),
}));

describe('SimpleButton', () => {
  it('renders text, forwards accessibility hint and handles press', () => {
    const onPress = jest.fn();
    const { getByText, toJSON } = render(
      <SimpleButton
        text="Graph"
        accessibilityHint="Open graph"
        onPress={onPress}
      />
    );

    const label = getByText('Graph');
    expect(label).toBeTruthy();
    fireEvent.press(label);
    expect(onPress).toHaveBeenCalledTimes(1);

    const tree = toJSON() as any;
    expect(tree.props.accessibilityHint).toBe('Open graph');
  });

  it('applies themed container and text colors', () => {
    const { toJSON } = render(<SimpleButton text="Retry" />);
    const tree = toJSON() as any;
    const containerView = tree.children[0];

    const containerStyles = Array.isArray(containerView.props.style)
      ? containerView.props.style
      : [containerView.props.style];
    const mergedContainerStyle = Object.assign({}, ...containerStyles);
    expect(mergedContainerStyle.backgroundColor).toBe('#f2f2f2');
    expect(mergedContainerStyle.borderColor).toBe('#222222');
    expect(mergedContainerStyle.borderWidth).toBe(3);

    const textNode = containerView.children[0];
    const textStyles = Array.isArray(textNode.props.style)
      ? textNode.props.style
      : [textNode.props.style];
    const mergedTextStyle = Object.assign({}, ...textStyles);
    expect(mergedTextStyle.color).toBe('#222222');
    expect(mergedTextStyle.fontFamily).toBe('Roboto-Bold');
    expect(mergedTextStyle.fontSize).toBe(15);
  });
});
