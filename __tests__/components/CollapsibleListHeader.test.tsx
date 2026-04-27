import React from 'react';
import { Text } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';

import CollapsibleListHeader from '../../src/components/weather/common/CollapsibleListHeader';

const mockIcon = jest.fn((props) => <Text {...props} testID={`icon-${props.name}`}>icon</Text>);
const mockToStringWithDecimal = jest.fn();
const mockPrecipitationStrip = jest.fn((props) => (
  <Text testID="precipitation-strip">{JSON.stringify(props.precipitationData)}</Text>
));

const mockTheme = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useTheme: () => mockTheme(),
}));

jest.mock('@assets/Icon', () => ({
  __esModule: true,
  default: (props: any) => mockIcon(props),
}));

jest.mock('@utils/helpers', () => ({
  toStringWithDecimal: (...args: any[]) => mockToStringWithDecimal(...args),
}));

jest.mock('../../src/components/weather/forecast/PrecipitationStrip', () => ({
  __esModule: true,
  default: (props: any) => mockPrecipitationStrip(props),
}));

describe('CollapsibleListHeader', () => {
  beforeEach(() => {
    mockIcon.mockClear();
    mockToStringWithDecimal.mockClear();
    mockPrecipitationStrip.mockClear();
    mockTheme.mockReset();
    mockTheme.mockReturnValue({
      dark: false,
      colors: {
        border: '#d9d9d9',
        inputBackground: '#f6f6f6',
        inputButtonBackground: '#ececec',
        primaryText: '#121212',
      },
    });
  });

  it('renders title, handles press and shows arrow-down when closed', () => {
    const onPress = jest.fn();
    const { getByText, getByA11yLabel } = render(
      <CollapsibleListHeader
        open={false}
        title="Tuesday"
        accessibilityLabel="Open Tuesday details"
        onPress={onPress}
      />
    );

    expect(getByText('Tuesday')).toBeTruthy();
    fireEvent.press(getByA11yLabel('Open Tuesday details'));
    expect(onPress).toHaveBeenCalledTimes(1);

    expect(mockIcon).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'arrow-down',
        width: 24,
        height: 24,
        style: { color: '#121212' },
      })
    );
  });

  it('renders weather summary values and precipitation strip when data is provided', () => {
    mockToStringWithDecimal.mockReturnValue('1,7');
    const precipitationDay = [
      { precipitation: 0.4, timestamp: 2056579200 },
      { precipitation: 0.1, timestamp: 2056582800 },
    ];

    const { getByText, getByTestId } = render(
      <CollapsibleListHeader
        open
        title="Wednesday"
        accessibilityLabel="Collapse Wednesday details"
        onPress={() => {}}
        maxTemp="+8"
        minTemp="-2"
        totalPrecipitation={1.7}
        precipitationDay={precipitationDay}
      />
    );

    expect(getByText('+8')).toBeTruthy();
    expect(getByText('-2')).toBeTruthy();
    expect(getByText(/1,7/)).toBeTruthy();
    expect(getByText('mm')).toBeTruthy();
    expect(getByTestId('precipitation-strip')).toBeTruthy();

    expect(mockToStringWithDecimal).toHaveBeenCalledWith(1.7, ',');
    expect(mockPrecipitationStrip).toHaveBeenCalledWith(
      expect.objectContaining({
        precipitationData: precipitationDay,
      })
    );

    expect(mockIcon).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'temperature-highest-light', width: 18, height: 18 })
    );
    expect(mockIcon).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'temperature-lowest-light', width: 18, height: 18 })
    );
    expect(mockIcon).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'rain-white', width: 18, height: 18 })
    );
    expect(mockIcon).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'arrow-up', width: 24, height: 24 })
    );
  });

  it('uses dark icon variants and hides precipitation parts when not provided', () => {
    mockTheme.mockReturnValue({
      dark: true,
      colors: {
        border: '#444444',
        inputBackground: '#1c1c1c',
        inputButtonBackground: '#303030',
        primaryText: '#f5f5f5',
      },
    });

    const { queryByTestId, queryByText } = render(
      <CollapsibleListHeader
        open={false}
        title="Thursday"
        accessibilityLabel="Open Thursday details"
        onPress={() => {}}
        maxTemp="+3"
        minTemp="-5"
        totalPrecipitation={undefined}
        precipitationDay={false}
      />
    );

    expect(queryByText('mm')).toBeNull();
    expect(queryByTestId('precipitation-strip')).toBeNull();
    expect(mockToStringWithDecimal).not.toHaveBeenCalled();

    expect(mockIcon).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'temperature-highest-dark' })
    );
    expect(mockIcon).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'temperature-lowest-dark' })
    );
  });
});
