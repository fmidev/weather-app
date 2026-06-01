import React from 'react';
import { render } from '@testing-library/react-native';

import SeverityBar from '../../src/components/warnings/SeverityBar';
import { GREEN, ORANGE, RED, YELLOW } from '../../src/assets/colors';

const getMergedStyle = (style: any) => {
  if (Array.isArray(style)) return Object.assign({}, ...style);
  return style || {};
};

describe('SeverityBar', () => {
  it('renders one green bar for severity 0', () => {
    const { toJSON } = render(<SeverityBar severity={0} />);
    const tree = toJSON() as any;

    expect(tree.children).toHaveLength(1);
    const barStyle = getMergedStyle(tree.children[0].props.style);
    expect(barStyle.backgroundColor).toBe(GREEN);
    expect(barStyle.height).toBe(5);
    expect(barStyle.borderWidth).toBe(1);
    expect(barStyle.marginLeft).toBeUndefined();
    expect(barStyle.marginRight).toBeUndefined();
  });

  it('renders four red bars for severity 3 with spacing between bars', () => {
    const { toJSON } = render(<SeverityBar severity={3} />);
    const tree = toJSON() as any;

    expect(tree.children).toHaveLength(4);

    tree.children.forEach((child: any) => {
      const style = getMergedStyle(child.props.style);
      expect(style.backgroundColor).toBe(RED);
    });

    const firstStyle = getMergedStyle(tree.children[0].props.style);
    const middleStyle = getMergedStyle(tree.children[1].props.style);
    const lastStyle = getMergedStyle(tree.children[3].props.style);

    expect(firstStyle.marginRight).toBe(1);
    expect(firstStyle.marginLeft).toBeUndefined();
    expect(middleStyle.marginLeft).toBe(1);
    expect(middleStyle.marginRight).toBe(1);
    expect(lastStyle.marginLeft).toBe(1);
    expect(lastStyle.marginRight).toBeUndefined();
  });

  it('maps severity values to expected colors', () => {
    const { toJSON: severityOne } = render(<SeverityBar severity={1} />);
    const { toJSON: severityTwo } = render(<SeverityBar severity={2} />);

    const severityOneTree = severityOne() as any;
    const severityTwoTree = severityTwo() as any;

    expect(getMergedStyle(severityOneTree.children[0].props.style).backgroundColor).toBe(YELLOW);
    expect(getMergedStyle(severityTwoTree.children[0].props.style).backgroundColor).toBe(ORANGE);
  });
});
