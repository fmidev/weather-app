import React from 'react';
import { render } from '@testing-library/react-native';

import CapSeverityBar from '../../src/components/warnings/cap/CapSeverityBar';

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    colors: {
      primaryText: '#111111',
    },
  }),
}));

describe('CapSeverityBar', () => {
  it('renders four severity blocks with expected colors and borders', () => {
    const { toJSON } = render(<CapSeverityBar severities={[0, 1, 1, 3]} />);

    const tree = toJSON() as any;
    const containerStyles = Array.isArray(tree.props.style)
      ? tree.props.style
      : [tree.props.style];
    const mergedContainerStyle = Object.assign({}, ...containerStyles);
    expect(mergedContainerStyle.borderColor).toBe('#111111');

    const firstBarStyles = Array.isArray(tree.children[0].props.style)
      ? tree.children[0].props.style
      : [tree.children[0].props.style];
    const mergedFirstBarStyle = Object.assign({}, ...firstBarStyles);
    expect(mergedFirstBarStyle.borderRightWidth).toBe(1);

    const secondBarStyles = Array.isArray(tree.children[1].props.style)
      ? tree.children[1].props.style
      : [tree.children[1].props.style];
    const mergedSecondBarStyle = Object.assign({}, ...secondBarStyles);
    expect(mergedSecondBarStyle.borderRightWidth).toBeUndefined();

    const fourthBarStyles = Array.isArray(tree.children[3].props.style)
      ? tree.children[3].props.style
      : [tree.children[3].props.style];
    const mergedFourthBarStyle = Object.assign({}, ...fourthBarStyles);
    expect(mergedFourthBarStyle.borderTopRightRadius).toBe(4);
  });
});
