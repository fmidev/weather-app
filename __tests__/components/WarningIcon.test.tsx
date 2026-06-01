import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';

import WarningIcon from '../../src/components/warnings/WarningIcon';
import { GREEN, ORANGE, RED, YELLOW } from '../../src/assets/colors';

const mockIcon = jest.fn((props) => <Text {...props} testID="warning-icon-svg">icon</Text>);

jest.mock('@components/common/ScalableIcon', () => ({
  __esModule: true,
  default: (props: any) => mockIcon(props),
}));

const getMergedStyle = (style: any) => {
  if (Array.isArray(style)) return Object.assign({}, ...style);
  return style || {};
};

describe('WarningIcon', () => {
  beforeEach(() => {
    mockIcon.mockClear();
  });

  it('returns null when neither severity nor severityDescription is provided', () => {
    const { toJSON } = render(<WarningIcon type="wind" />);
    expect(toJSON()).toBeNull();
    expect(mockIcon).not.toHaveBeenCalled();
  });

  it('renders severity circle color for numeric severity and hides icon when severity is 0', () => {
    const { toJSON, queryByTestId } = render(<WarningIcon type="rain" severity={0} />);
    const tree = toJSON() as any;
    const containerStyle = getMergedStyle(tree.props.style);

    expect(containerStyle.backgroundColor).toBe(GREEN);
    expect(containerStyle.width).toBe(containerStyle.height);
    expect(containerStyle.borderRadius).toBe(containerStyle.width / 2);
    expect(queryByTestId('warning-icon-svg')).toBeNull();
  });

  it('maps severityDescription to severity color and icon name', () => {
    const { toJSON, getByTestId } = render(
      <WarningIcon type="thunderstorm" severityDescription="Severe" />
    );

    const tree = toJSON() as any;
    const containerStyle = getMergedStyle(tree.props.style);
    expect(containerStyle.backgroundColor).toBe(ORANGE);
    expect(getByTestId('warning-icon-svg')).toBeTruthy();
    expect(mockIcon).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'fmi-warnings-thunderstorm',
        size: expect.any(Number),
      })
    );
  });

  it('renders wind physical overlays with rotation and intensity text', () => {
    const { getByText, toJSON } = render(
      <WarningIcon
        type="wind"
        severity={3}
        physical={{ windDirection: 45, windIntensity: 21 }}
      />
    );

    const tree = toJSON() as any;
    const containerStyle = getMergedStyle(tree.props.style);
    expect(containerStyle.backgroundColor).toBe(RED);
    expect(containerStyle.width).toBe(containerStyle.height);
    expect(containerStyle.borderRadius).toBe(containerStyle.width / 2);

    expect(mockIcon).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'fmi-warnings-wind',
        size: expect.any(Number),
        style: { transform: [{ rotate: '225deg' }] },
      })
    );
    expect(getByText('21')).toBeTruthy();
  });

  it('uses yellow color for Moderate severityDescription', () => {
    const { toJSON } = render(<WarningIcon type="rain" severityDescription="Moderate" />);
    const tree = toJSON() as any;
    const containerStyle = getMergedStyle(tree.props.style);
    expect(containerStyle.backgroundColor).toBe(YELLOW);
  });
});
