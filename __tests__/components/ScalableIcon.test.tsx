import React from 'react';
import * as ReactNative from 'react-native';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';

import ScalableIcon from '../../src/components/common/ScalableIcon';

const mockIcon = jest.fn((props) => <Text {...props} testID="scalable-icon">icon</Text>);

jest.mock('@assets/Icon', () => ({
  __esModule: true,
  default: (props: any) => mockIcon(props),
}));

describe('ScalableIcon', () => {
  beforeEach(() => {
    mockIcon.mockClear();
  });

  it('scales width, height and size with default maxScaleFactor=2', () => {
    jest.spyOn(ReactNative, 'useWindowDimensions').mockReturnValue({
      width: 390,
      height: 844,
      scale: 3,
      fontScale: 1.5,
    });

    render(<ScalableIcon name="menu" width={20} height={10} size={16} />);

    expect(mockIcon).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'menu',
        width: 40,
        height: 20,
        size: 32,
      })
    );
  });

  it('caps scaling with provided maxScaleFactor', () => {
    jest.spyOn(ReactNative, 'useWindowDimensions').mockReturnValue({
      width: 390,
      height: 844,
      scale: 3,
      fontScale: 3,
    });

    render(
      <ScalableIcon
        name="close-outline"
        width={10}
        height={12}
        size={8}
        maxScaleFactor={1.25}
      />
    );

    expect(mockIcon).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'close-outline',
        width: 12.5,
        height: 15,
        size: 10,
      })
    );
  });

  it('keeps dimensions undefined when width/height/size are not provided', () => {
    jest.spyOn(ReactNative, 'useWindowDimensions').mockReturnValue({
      width: 390,
      height: 844,
      scale: 3,
      fontScale: 2,
    });

    render(<ScalableIcon name="arrow-back" />);

    expect(mockIcon).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'arrow-back',
        width: undefined,
        height: undefined,
        size: undefined,
      })
    );
  });
});
