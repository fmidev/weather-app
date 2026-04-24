import React from 'react';
import { render } from '@testing-library/react-native';

import HeaderTitle from '../../src/components/common/HeaderTitle';
import { PRIMARY_BLUE, WHITE } from '../../src/assets/colors';

describe('HeaderTitle', () => {
  it('renders title with light mode color', () => {
    const { getByText } = render(
      <HeaderTitle title="Weather" isDark={false} />
    );

    const text = getByText('Weather');
    const styleArray = Array.isArray(text.props.style)
      ? text.props.style
      : [text.props.style];
    const mergedStyle = Object.assign({}, ...styleArray);

    expect(mergedStyle.color).toBe(PRIMARY_BLUE);
    expect(text.props.maxFontSizeMultiplier).toBe(1.5);
  });

  it('renders title with dark mode color', () => {
    const { getByText } = render(
      <HeaderTitle title="Warnings" isDark />
    );

    const text = getByText('Warnings');
    const styleArray = Array.isArray(text.props.style)
      ? text.props.style
      : [text.props.style];
    const mergedStyle = Object.assign({}, ...styleArray);

    expect(mergedStyle.color).toBe(WHITE);
  });
});
