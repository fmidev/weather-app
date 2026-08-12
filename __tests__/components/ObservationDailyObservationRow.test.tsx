import React from 'react';
import { render } from '@testing-library/react-native';

import DailyObservationRow from '../../src/components/weather/observation/DailyObservationRow';

let mockLanguage = 'en';

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
    i18n: { language: mockLanguage },
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
    showUnit: boolean,
    decimalSeparator?: string
  ) => {
    const precision = decimals ?? 1;
    const separator = decimalSeparator ?? '.';
    const value = timeStep[parameter];
    if (value === null || value === undefined) return '-';
    if (typeof value !== 'number') return value;
    const formattedValue = value.toFixed(precision).replace('.', separator);
    return showUnit && unit
      ? `${formattedValue} ${unit.replace('°', '')}`
      : formattedValue;
  },
}));

describe('DailyObservationRow', () => {
  beforeEach(() => {
    mockLanguage = 'en';
  });

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

    expect(view.getByText('1.2 mm')).toBeTruthy();
    expect(view.getByText('-4.2 ... 3.8 C')).toBeTruthy();
    expect(view.getByText('-6.1 C')).toBeTruthy();
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
      view.getByA11yLabel('measurements.snowDepth06: paramUnits.na')
    ).toBeTruthy();
  });

  it('omits the dash from a missing precipitation accessibility label', () => {
    const view = render(
      <DailyObservationRow
        parameter="daily"
        epochtime={2000000000}
        data={[{ epochtime: 2000000000, rrday: null }] as any}
      />
    );

    expect(view.getByA11yLabel('measurements.rrday: paramUnits.na')).toBeTruthy();
  });

  it('reports missing extreme temperatures without dashes or a unit', () => {
    const view = render(
      <DailyObservationRow
        parameter="daily"
        epochtime={2000000000}
        data={[
          {
            epochtime: 2000000000,
            minimumTemperature: null,
            maximumTemperature: null,
          },
        ] as any}
      />
    );

    expect(
      view.getByA11yLabel(
        'measurements.maxAndMinTemperatures: paramUnits.na'
      )
    ).toBeTruthy();
  });

  it('uses decimal points for both temperatures in the accessibility label', () => {
    mockLanguage = 'fi';
    const view = render(
      <DailyObservationRow
        parameter="daily"
        epochtime={2000000000}
        data={[
          {
            epochtime: 2000000000,
            minimumTemperature: 13.1,
            maximumTemperature: 27.5,
          },
        ] as any}
      />
    );

    expect(view.getByText('13,1 ... 27,5 C')).toBeTruthy();
    expect(
      view.getByA11yLabel(
        'measurements.maxAndMinTemperatures: 13.1 ... 27.5 paramUnits.°C'
      )
    ).toBeTruthy();
  });

  it('renders labels and values in rows in compact layout', () => {
    const view = render(
      <DailyObservationRow
        parameter="daily"
        epochtime={2000000000}
        compactLayout
        data={[
          {
            epochtime: 2000000000,
            rrday: 1.24,
            minimumTemperature: -4.2,
            maximumTemperature: 3.8,
            minimumGroundTemperature06: -6.1,
          },
        ] as any}
      />
    );

    expect(view.getByA11yLabel('measurements.rrday: 1.2 paramUnits.mm')).toBeTruthy();
    expect(
      view.getByA11yLabel(
        'measurements.maxAndMinTemperatures: -4.2 ... 3.8 paramUnits.°C'
      )
    ).toBeTruthy();
    expect(
      view.getByA11yLabel(
        'measurements.minimumGroundTemperature06: -6.1 paramUnits.°C'
      )
    ).toBeTruthy();
  });
});
