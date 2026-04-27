import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import DaySelectorList from '../../src/components/warnings/cap/DaySelectorList';

const mockConfigGet = jest.fn();

jest.mock('@config', () => ({
  Config: {
    get: (...args: any[]) => mockConfigGet(...args),
  },
}));

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    colors: {
      tabBarActive: '#0062cc',
      background: '#ffffff',
      screenBackground: '#f4f4f4',
      primaryText: '#111111',
    },
  }),
}));

jest.mock('../../src/components/warnings/cap/CapSeverityBar', () => ({
  __esModule: true,
  default: ({ severities }: any) => {
    const { Text } = require('react-native');
    return <Text testID={`severity-${severities.join('-')}`}>bar</Text>;
  },
}));

describe('DaySelectorList', () => {
  beforeEach(() => {
    mockConfigGet.mockReset();
  });

  it('renders relative days and handles selection', () => {
    mockConfigGet.mockImplementation((key: string) => {
      if (key === 'warnings') {
        return { capViewSettings: { useRelativeDays: true } };
      }
      return {};
    });

    const onDayChange = jest.fn();
    const { getByText, getByTestId } = render(
      <DaySelectorList
        activeDay={0}
        dates={[
          { time: 1, weekday: 'Mon', date: '1.1.', relativeDay: 'Today' },
          { time: 2, weekday: 'Tue', date: '2.1.', relativeDay: 'Tomorrow' },
        ]}
        dailySeverities={[[0, 0, 0, 0], [1, 1, 1, 1]]}
        onDayChange={onDayChange}
      />
    );

    expect(getByText('Today')).toBeTruthy();
    expect(getByText('Tomorrow')).toBeTruthy();
    expect(getByTestId('severity-1-1-1-1')).toBeTruthy();

    fireEvent.press(getByText('Tomorrow'));
    expect(onDayChange).toHaveBeenCalledWith(1);
  });
});
