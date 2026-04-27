import React from 'react';
import { ScrollView } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';

import TextList from '../../src/components/warnings/cap/TextList';

const mockConfigGet = jest.fn();
const mockWarningBlock = jest.fn();

jest.mock('@config', () => ({
  Config: {
    get: (...args: any[]) => mockConfigGet(...args),
  },
}));

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    colors: {
      background: '#ffffff',
      hourListText: '#333333',
    },
  }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('../../src/components/warnings/cap/WarningBlock', () => ({
  __esModule: true,
  default: (props: any) => {
    mockWarningBlock(props);
    const { Text } = require('react-native');
    const info = Array.isArray(props.warnings[0].info) ? props.warnings[0].info[0] : props.warnings[0].info;
    return <Text testID={`warning-block-${info.event}`}>{info.event}</Text>;
  },
}));

describe('TextList', () => {
  beforeEach(() => {
    mockConfigGet.mockReset();
    mockWarningBlock.mockReset();
    mockConfigGet.mockImplementation((key: string) => {
      if (key === 'warnings') {
        return {
          capViewSettings: {
            useRelativeDays: true,
          },
        };
      }
      return {};
    });
  });

  it('renders warning blocks ordered by highest severity and passes scroll offset', () => {
    const dates = [
      { time: 1, weekday: 'Mon', date: '1 Jan', relativeDay: 'Today' },
      { time: 2, weekday: 'Tue', date: '2 Jan', relativeDay: 'Tomorrow' },
    ];
    const capData = [
      {
        identifier: '1',
        info: {
          event: 'Rain',
          severity: 'Moderate',
          area: { areaDesc: 'A' },
        },
      },
      {
        identifier: '2',
        info: {
          event: 'Wind',
          severity: 'Severe',
          area: { areaDesc: 'B' },
        },
      },
    ];

    const view = render(
      <TextList capData={capData as any} dates={dates} />
    );

    expect(view.getByText('Today')).toBeTruthy();
    expect(view.getByText('Tomorrow')).toBeTruthy();
    expect(view.getAllByTestId(/warning-block-/)).toHaveLength(2);
    expect(mockWarningBlock.mock.calls[0][0].warnings[0].info.event).toBe('Wind');

    fireEvent.scroll(view.UNSAFE_getByType(ScrollView), {
      nativeEvent: {
        contentOffset: { x: 24, y: 0 },
      },
    });

    expect(mockWarningBlock.mock.calls.at(-1)?.[0].xOffset).toBe(24);
  });

  it('renders empty state when there are no grouped warnings', () => {
    const { getByText } = render(
      <TextList
        capData={[]}
        dates={[{ time: 1, weekday: 'Mon', date: '1 Jan', relativeDay: 'Today' }]}
      />
    );

    expect(getByText('noWarningsText')).toBeTruthy();
  });
});
