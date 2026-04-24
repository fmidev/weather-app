import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';

import AnnouncementIcon from '../../src/components/announcements/AnnouncementIcon';
import { PRIMARY_BLUE, RED } from '../../src/assets/colors';

const mockIcon = jest.fn((props) => <Text {...props} testID="announcement-icon">icon</Text>);

jest.mock('@assets/Icon', () => ({
  __esModule: true,
  default: (props: any) => mockIcon(props),
}));

describe('AnnouncementIcon', () => {
  beforeEach(() => {
    mockIcon.mockClear();
  });

  it('renders crisis icon with crisis styles', () => {
    const { toJSON, getByTestId } = render(<AnnouncementIcon type="crisis" />);

    expect(getByTestId('announcement-icon')).toBeTruthy();
    expect(mockIcon).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'crisis-strip-icon',
        width: 18,
        height: 18,
      })
    );

    const tree = toJSON() as any;
    const styleArray = Array.isArray(tree.props.style)
      ? tree.props.style
      : [tree.props.style];
    const mergedStyle = Object.assign({}, ...styleArray);

    expect(mergedStyle.backgroundColor).toBe(RED);
    expect(mergedStyle.paddingBottom).toBe(2);
    expect(mergedStyle.width).toBe(24);
    expect(mergedStyle.height).toBe(24);
  });

  it('renders maintenance icon with maintenance styles', () => {
    const { toJSON, getByTestId } = render(
      <AnnouncementIcon type="maintenance" />
    );

    expect(getByTestId('announcement-icon')).toBeTruthy();
    expect(mockIcon).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'maintenance-strip-icon',
        width: 18,
        height: 18,
      })
    );

    const tree = toJSON() as any;
    const styleArray = Array.isArray(tree.props.style)
      ? tree.props.style
      : [tree.props.style];
    const mergedStyle = Object.assign({}, ...styleArray);

    expect(mergedStyle.backgroundColor).toBe(PRIMARY_BLUE);
    expect(mergedStyle.paddingBottom).toBeUndefined();
    expect(mergedStyle.width).toBe(24);
    expect(mergedStyle.height).toBe(24);
  });
});
