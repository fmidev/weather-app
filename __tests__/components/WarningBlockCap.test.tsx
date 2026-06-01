import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import WarningBlock from '../../src/components/warnings/cap/WarningBlock';

const mockScrollTo = jest.fn();

jest.mock('react-redux', () => ({
  connect: () => (Component: any) => Component,
}));

jest.mock('@store/settings/selectors', () => ({
  selectClockType: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    colors: {
      accordionContentBackground: '#f3f3f3',
    },
  }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: { language: 'en' },
  }),
}));

jest.mock('@utils/helpers', () => ({
  getSeveritiesForDays: () => [[0, 1, 0, 0]],
  selectCapInfoByLanguage: (info: any) => info[0],
}));

jest.mock('../../src/components/warnings/cap/WarningItem', () => ({
  __esModule: true,
  default: (props: any) => {
    if (props.scrollViewRef) {
      props.scrollViewRef.current = { scrollTo: mockScrollTo };
    }
    const { Text } = require('react-native');
    const info = Array.isArray(props.warning.info) ? props.warning.info[0] : props.warning.info;
    return (
      <Text testID={`warning-item-${info.event}-${props.includeArrow ? 'header' : 'detail'}`}>
        {props.timespan}
      </Text>
    );
  },
}));

describe('WarningBlock', () => {
  beforeEach(() => {
    mockScrollTo.mockClear();
  });

  it('renders header item, scrolls severity bars and opens details on press', () => {
    const warnings = [
      {
        identifier: '1',
        info: {
          event: 'Wind',
          severity: 'Moderate',
          effective: '2024-01-01T00:00:00Z',
          expires: '2024-01-01T12:00:00Z',
          area: { areaDesc: 'helsinki' },
        },
      },
      {
        identifier: '2',
        info: {
          event: 'Wind',
          severity: 'Severe',
          effective: '2024-01-01T06:00:00Z',
          expires: '2024-01-02T12:00:00Z',
          area: { areaDesc: 'espoo' },
        },
      },
    ];

    const { getByTestId, getAllByTestId } = render(
      <WarningBlock
        clockType={24 as any}
        dates={[{ time: 1, date: '1 Jan', weekday: 'Mon' }]}
        warnings={warnings as any}
        xOffset={32}
      />
    );

    expect(getByTestId('warning-item-Wind-header')).toBeTruthy();
    expect(mockScrollTo).toHaveBeenCalledWith({
      x: 32,
      y: 0,
      animated: true,
    });

    fireEvent.press(getByTestId('warning-item-Wind-header'));
    expect(getAllByTestId(/warning-item-Wind-/)).toHaveLength(3);
  });
});
