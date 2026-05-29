import React from 'react';
import { render } from '@testing-library/react-native';

import WarningItem from '../../src/components/warnings/cap/WarningItem';

const mockConfigGet = jest.fn();
const mockIcon = jest.fn((props) => {
  const { Text } = require('react-native');
  return <Text {...props} testID={`icon-${props.name}`}>icon</Text>;
});

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
      primaryText: '#111111',
    },
  }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) => {
      if (key === 'warnings:capInfo:areas') return `${options.count} areas`;
      return key;
    },
    i18n: { language: 'en' },
  }),
}));

jest.mock('@assets/Icon', () => ({
  __esModule: true,
  default: (props: any) => mockIcon(props),
}));

jest.mock('../../src/assets/WarningsSymbol', () => ({
  __esModule: true,
  default: ({ type, severity }: any) => {
    const { Text } = require('react-native');
    return <Text testID={`warning-symbol-${type}-${severity}`}>{type}</Text>;
  },
}));

jest.mock('@utils/helpers', () => ({
  selectCapInfoByLanguage: (info: any) => info[0],
}));

jest.mock('../../src/components/warnings/cap/CapSeverityBar', () => ({
  __esModule: true,
  default: ({ severities }: any) => {
    const { Text } = require('react-native');
    return <Text testID={`severity-${severities.join('-')}`}>bar</Text>;
  },
}));

describe('WarningItem', () => {
  beforeEach(() => {
    mockConfigGet.mockReset();
    mockIcon.mockClear();
    mockConfigGet.mockImplementation((key: string) => {
      if (key === 'warnings') {
        return {
          capViewSettings: {
            warningBlockWarningCountEnabled: true,
            hideLongArealist: true,
          },
        };
      }
      return {};
    });
  });

  it('renders warning heading, count, daily severity bars and accordion arrow', () => {
    const warning = {
      info: {
        event: 'Wind',
        severity: 'Severe',
        area: { areaDesc: 'a, b, c, d, e, f' },
        description: 'Strong wind',
      },
    } as any;

    const { getByText, getByTestId } = render(
      <WarningItem
        warning={warning}
        warningCount={2}
        timespan="Mon 1 Jan"
        includeSeverityBars
        dailySeverities={[[0, 0, 1, 1]]}
        includeArrow
        open={false}
      />
    );

    expect(getByTestId('warning-symbol-Wind-Severe')).toBeTruthy();
    expect(getByText('Wind (2 pcs)')).toBeTruthy();
    expect(getByText('Mon 1 Jan')).toBeTruthy();
    expect(getByText('6 areas')).toBeTruthy();
    expect(getByTestId('severity-0-0-1-1')).toBeTruthy();
    expect(getByTestId('icon-arrow-down')).toBeTruthy();
  });

  it('renders description and area list when requested', () => {
    const warning = {
      info: {
        event: 'Rain',
        severity: 'Moderate',
        area: { areaDesc: 'Helsinki' },
        description: 'Heavy rain expected',
      },
    } as any;

    const { getByText } = render(
      <WarningItem
        warning={warning}
        timespan="Tue 2 Jan"
        includeSeverityBars={false}
        includeArrow={false}
        showDescription
        showAreas
      />
    );

    expect(getByText('Heavy rain expected')).toBeTruthy();
    expect(getByText('Helsinki')).toBeTruthy();
  });
});
