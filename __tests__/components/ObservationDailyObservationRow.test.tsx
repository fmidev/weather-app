import React from 'react';
import { render } from '@testing-library/react-native';

import DailyObservationRow from '../../src/components/weather/observation/DailyObservationRow';

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    colors: {
      hourListText: '#111111',
    },
  }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en' },
  }),
}));

jest.mock('@components/common/AppText', () => ({
  __esModule: true,
  default: ({ children, ...props }: any) => {
    const { Text } = require('react-native');
    return <Text {...props}>{children}</Text>;
  },
}));

jest.mock('@utils/helpers', () => ({
  getObservationCellValue: (
    timeStep: any,
    parameter: string,
    unit: string,
    decimals: number | undefined,
    _divider: number,
    _daily: boolean,
    decimalSeparator?: string
  ) => {
    const precision = decimals ?? 1;
    const separator = decimalSeparator ?? '.';
    const value = timeStep[parameter];
    if (value === null || value === undefined) return '-';
    if (typeof value !== 'number') return value;
    return value.toFixed(precision).replace('.', separator);
  },
}));

describe('DailyObservationRow', () => {
  it('renders daily precipitation, temperature range and ground temperature for selected day', () => {
    const data = [
      {
        epochtime: 2000000000,
        rrday: 1.24,
        minimumTemperature: -4.2,
        maximumTemperature: 3.8,
        minimumGroundTemperature06: -6.1,
      },
      {
        epochtime: 2000086400,
        rrday: 9.9,
        minimumTemperature: -1,
        maximumTemperature: 2,
        minimumGroundTemperature06: -3,
      },
    ];

    const view = render(
      <DailyObservationRow
        parameter="daily"
        epochtime={2000000000}
        data={data as any}
      />
    );

    expect(view.getByText('1.2')).toBeTruthy();
    expect(view.getByText('-4.2 ... 3.8')).toBeTruthy();
    expect(view.getByText('-6.1')).toBeTruthy();
    expect(
      view.getByA11yLabel(
        'measurements.maxAndMinTemperatures: -4.2 ... 3.8 paramUnits.°C'
      )
    ).toBeTruthy();
  });

  it('renders snow depth row and missing value accessibility text', () => {
    const view = render(
      <DailyObservationRow
        parameter="snowDepth06"
        epochtime={2000000000}
        data={[{ epochtime: 2000000000, snowDepth06: null }] as any}
      />
    );

    expect(view.getByText('-')).toBeTruthy();
    expect(
      view.getByA11yLabel('measurements.snowDepth06: - paramUnits.na')
    ).toBeTruthy();
  });
});
