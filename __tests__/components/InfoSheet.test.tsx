import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import InfoSheet from '../../src/components/warnings/InfoSheet';

const mockUseOrientation = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    colors: {
      hourListText: '#2b2b2b',
      text: '#111111',
      border: '#cfcfcf',
      primaryText: '#101010',
      background: '#ffffff',
    },
  }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('@utils/hooks', () => ({
  __esModule: true,
  default: () => mockUseOrientation(),
}));

jest.mock('@components/common/AppText', () => ({
  __esModule: true,
  default: ({ children, ...props }: any) => {
    const { Text } = require('react-native');
    return <Text {...props}>{children}</Text>;
  },
}));

jest.mock('@components/common/CloseButton', () => ({
  __esModule: true,
  default: ({ onPress, testID }: any) => {
    const { Pressable, Text } = require('react-native');
    return (
      <Pressable testID={testID} onPress={onPress}>
        <Text>close</Text>
      </Pressable>
    );
  },
}));

jest.mock('../../src/components/warnings/SeverityBar', () => ({
  __esModule: true,
  default: ({ severity }: any) => {
    const { Text } = require('react-native');
    return <Text testID={`severity-bar-${severity}`}>{severity}</Text>;
  },
}));

jest.mock('../../src/components/warnings/TypeColorRow', () => ({
  __esModule: true,
  default: ({ severity }: any) => {
    const { Text } = require('react-native');
    return <Text testID={`type-color-row-${severity}`}>{severity}</Text>;
  },
}));

jest.mock('../../src/components/warnings/WarningIcon', () => ({
  __esModule: true,
  default: ({ type, physical }: any) => {
    const { Text } = require('react-native');
    return (
      <Text testID={`warning-icon-${type}-${physical ? 'physical' : 'normal'}`}>
        {type}
      </Text>
    );
  },
}));

jest.mock('@store/warnings/constants', () => ({
  knownWarningTypes: ['wind', 'rain'],
}));

describe('InfoSheet', () => {
  beforeEach(() => {
    mockUseOrientation.mockReset();
    mockUseOrientation.mockReturnValue(false);
  });

  it('renders info sheet sections and closes from close button', () => {
    const onClose = jest.fn();
    const { getByTestId, getByText } = render(<InfoSheet onClose={onClose} />);

    expect(getByTestId('warnings_info_bottom_sheet')).toBeTruthy();
    expect(getByText('warnings:info:dailyTitle')).toBeTruthy();
    expect(getByText('warnings:info:mapTitle')).toBeTruthy();
    expect(getByText('warnings:info:timezone')).toBeTruthy();
    expect(getByText('warnings:info:dailyBadge')).toBeTruthy();
    expect(getByText('warnings:info:timezoneText')).toBeTruthy();

    fireEvent.press(getByTestId('warnings_info_bottom_sheet_close_button'));
    expect(onClose).toHaveBeenCalled();
  });

  it('renders severity rows, type rows and physical wind icon example', () => {
    const { getByTestId } = render(<InfoSheet onClose={jest.fn()} />);

    expect(getByTestId('severity-bar-0')).toBeTruthy();
    expect(getByTestId('severity-bar-1')).toBeTruthy();
    expect(getByTestId('severity-bar-2')).toBeTruthy();
    expect(getByTestId('severity-bar-3')).toBeTruthy();

    expect(getByTestId('type-color-row-0')).toBeTruthy();
    expect(getByTestId('type-color-row-1')).toBeTruthy();
    expect(getByTestId('type-color-row-2')).toBeTruthy();
    expect(getByTestId('type-color-row-3')).toBeTruthy();

    expect(getByTestId('warning-icon-wind-physical')).toBeTruthy();
    expect(getByTestId('warning-icon-rain-normal')).toBeTruthy();
  });
});
