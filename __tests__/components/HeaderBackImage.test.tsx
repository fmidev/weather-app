import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';

import HeaderBackImage from '../../src/components/common/HeaderBackImage';

const mockIcon = jest.fn((props) => <Text {...props} testID="header-back-icon">icon</Text>);

jest.mock('@assets/Icon', () => ({
  __esModule: true,
  default: (props: any) => mockIcon(props),
}));

describe('HeaderBackImage', () => {
  beforeEach(() => {
    mockIcon.mockClear();
  });

  it('renders arrow-back icon with given tintColor', () => {
    const { getByTestId } = render(<HeaderBackImage tintColor="#123456" />);

    expect(getByTestId('header-back-icon')).toBeTruthy();
    expect(mockIcon).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'arrow-back',
        style: { color: '#123456' },
        width: 26,
        height: 26,
      })
    );
  });

  it('applies container styles for header back image', () => {
    const { toJSON } = render(<HeaderBackImage tintColor="red" />);
    const tree = toJSON() as any;
    const styleArray = Array.isArray(tree.props.style)
      ? tree.props.style
      : [tree.props.style];
    const mergedStyle = Object.assign({}, ...styleArray);

    expect(mergedStyle.flex).toBe(1);
    expect(mergedStyle.paddingVertical).toBe(10);
  });
});
