import React from 'react';
import { View } from 'react-native';
import { render } from '@testing-library/react-native';
import moment from 'moment-timezone';
import type { UnitMap } from '../../src/store/settings/types';

import PrecipitationStrip from '../../src/components/weather/forecast/PrecipitationStrip';

const mockPrecipitationLevel = jest.fn();
let mockLanguage = 'fi';
let mockUnits: UnitMap | undefined;
let mockDefaultPrecipitationUnit = 'mm';

jest.mock('react-redux', () => ({
  useSelector: () => mockUnits,
}));

jest.mock('@config', () => ({
  Config: {
    get: () => ({ units: { precipitation: mockDefaultPrecipitationUnit } }),
  },
}));

jest.mock('react-i18next', () => {
  const i18n = jest.requireActual('i18next').createInstance();
  i18n.init({
    initImmediate: false,
    lng: 'fi',
    defaultNS: 'forecast',
    resources: {
      fi: require('../../i18n/fi.json'),
      en: require('../../i18n/en.json'),
      sv: require('../../i18n/sv.json'),
    },
  });

  return {
    useTranslation: () => ({
      t: (key: string, options?: Record<string, unknown>) =>
        i18n.t(key, { ...options, lng: mockLanguage }),
      i18n: { language: mockLanguage },
    }),
  };
});

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    colors: {
      rain: {
        3: '#3333ff',
      },
      border: '#cccccc',
    },
  }),
}));

jest.mock('@utils/helpers', () => ({
  getPrecipitationLevel: (...args: any[]) => mockPrecipitationLevel(...args),
}));

const makeDay = (amounts: Record<number, number | undefined | null> = {}) =>
  Array.from({ length: 24 }, (_, hour) => ({
    precipitation: Object.prototype.hasOwnProperty.call(amounts, hour)
      ? amounts[hour]
      : 0,
    timestamp: moment.tz('2035-06-01', 'Europe/Helsinki').hour(hour).unix(),
  }));

describe('PrecipitationStrip', () => {
  beforeEach(() => {
    mockLanguage = 'fi';
    mockUnits = undefined;
    mockDefaultPrecipitationUnit = 'mm';
    moment.tz.setDefault('Europe/Helsinki');
    mockPrecipitationLevel.mockReset();
    mockPrecipitationLevel.mockReturnValue(3);
  });

  afterEach(() => {
    moment.tz.setDefault();
  });

  it('normalizes precipitation data to 24 blocks', () => {
    const precipitationData = [
      { precipitation: 1, timestamp: 2000000000 },
      { precipitation: 2, timestamp: 2000003600 },
    ];

    const view = render(
      <PrecipitationStrip precipitationData={precipitationData as any} border />
    );

    expect(view.UNSAFE_getAllByType(View).length).toBeGreaterThan(20);
  });

  it('summarizes rainy periods once each and totals all hourly amounts', () => {
    const view = render(
      <PrecipitationStrip
        precipitationData={makeDay({ 6: 0.4, 11: 0.4, 12: 0.8, 18: 0.8 })}
      />
    );

    const strip = view.getByA11yLabel(
      'Sadetta aamupäivällä, iltapäivällä ja illalla, kokonaissademäärä 2,4 millimetriä'
    );
    expect(strip.props.accessible).toBe(true);
    expect(strip.props.focusable).toBe(false);
    expect(strip.props.accessibilityRole).toBe('image');
  });

  it.each([
    [0, 'yöllä'],
    [5, 'yöllä'],
    [6, 'aamupäivällä'],
    [11, 'aamupäivällä'],
    [12, 'iltapäivällä'],
    [17, 'iltapäivällä'],
    [18, 'illalla'],
    [23, 'illalla'],
  ])('classifies hour %s as %s', (hour, period) => {
    const view = render(
      <PrecipitationStrip precipitationData={makeDay({ [hour]: 1 })} />
    );

    expect(
      view.getByA11yLabel(
        `Sadetta ${period}, kokonaissademäärä 1,0 millimetriä`
      )
    ).toBeTruthy();
  });

  it('uses the conjunction between two rainy periods', () => {
    const view = render(
      <PrecipitationStrip precipitationData={makeDay({ 6: 1, 0: 1 })} />
    );

    expect(
      view.getByA11yLabel(
        'Sadetta yöllä ja aamupäivällä, kokonaissademäärä 2,0 millimetriä'
      )
    ).toBeTruthy();
  });

  it('announces rain all day when rain occurs every hour', () => {
    const view = render(
      <PrecipitationStrip
        precipitationData={makeDay().map((item) => ({
          ...item,
          precipitation: 1,
        }))}
      />
    );

    expect(
      view.getByA11yLabel(
        'Sataa koko päivän ajan, kokonaissademäärä 24,0 millimetriä'
      )
    ).toBeTruthy();
  });

  it('announces rain for most of the day when all four periods have rain and some hours are dry', () => {
    const view = render(
      <PrecipitationStrip
        precipitationData={makeDay({ 0: 1, 6: 1, 12: 1, 18: 1 })}
      />
    );

    expect(
      view.getByA11yLabel(
        'Sataa lähes koko päivän ajan, kokonaissademäärä 4,0 millimetriä'
      )
    ).toBeTruthy();
  });

  it('announces rain for most of the day even when only one hour is dry', () => {
    const view = render(
      <PrecipitationStrip
        precipitationData={makeDay().map((item, hour) => ({
          ...item,
          precipitation: hour === 9 ? 0 : 1,
        }))}
      />
    );

    expect(
      view.getByA11yLabel(
        'Sataa lähes koko päivän ajan, kokonaissademäärä 23,0 millimetriä'
      )
    ).toBeTruthy();
  });

  it('does not treat a missing hour as rain or a dry hour', () => {
    const view = render(
      <PrecipitationStrip
        precipitationData={makeDay().map((item, hour) => ({
          ...item,
          precipitation: hour === 9 ? null : 1,
        }))}
      />
    );

    expect(
      view.getByA11yLabel(
        'Sadetta yöllä, aamupäivällä, iltapäivällä ja illalla, kokonaissademäärä puuttuu'
      )
    ).toBeTruthy();
  });

  it.each([
    [
      'en',
      'Precipitation for most of the day, total precipitation 4.0 millimeters',
    ],
    ['sv', 'Nederbörd under nästan hela dagen, total nederbörd 4,0 millimeter'],
  ])('localizes rain for most of the day for %s', (language, label) => {
    mockLanguage = language;
    const view = render(
      <PrecipitationStrip
        precipitationData={makeDay({ 0: 1, 6: 1, 12: 1, 18: 1 })}
      />
    );

    expect(view.getByA11yLabel(label)).toBeTruthy();
  });

  it('announces no rain all day for zero amounts', () => {
    const view = render(<PrecipitationStrip precipitationData={makeDay()} />);

    expect(
      view.getByA11yLabel(
        'Ei sadetta koko päivänä, kokonaissademäärä 0,0 millimetriä'
      )
    ).toBeTruthy();
  });

  it.each([
    [
      'en',
      'Precipitation in the morning and in the evening, total precipitation 2.4 millimeters',
    ],
    [
      'sv',
      'Nederbörd på förmiddagen och på kvällen, total nederbörd 2,4 millimeter',
    ],
    [
      'en-GB',
      'Precipitation in the morning and in the evening, total precipitation 2.4 millimeters',
    ],
  ])('localizes the period list and amount for %s', (language, label) => {
    mockLanguage = language;
    const view = render(
      <PrecipitationStrip precipitationData={makeDay({ 6: 1.2, 18: 1.2 })} />
    );

    expect(view.getByA11yLabel(label)).toBeTruthy();
  });

  it('uses the same local timezone for the label and the strip', () => {
    moment.tz.setDefault('UTC');
    const view = render(
      <PrecipitationStrip precipitationData={makeDay({ 6: 1 })} />
    );

    expect(
      view.getByA11yLabel('Sadetta yöllä, kokonaissademäärä 1,0 millimetriä')
    ).toBeTruthy();
  });

  it('ignores visual padding when totaling a partial day', () => {
    const view = render(
      <PrecipitationStrip precipitationData={makeDay({ 18: 1 }).slice(18)} />
    );

    expect(
      view.getByA11yLabel('Sadetta illalla, kokonaissademäärä 1,0 millimetriä')
    ).toBeTruthy();
  });

  it('describes only the available periods for a dry partial day', () => {
    const view = render(
      <PrecipitationStrip precipitationData={makeDay().slice(12)} />
    );

    expect(
      view.getByA11yLabel(
        'Ei sadetta iltapäivällä ja illalla, kokonaissademäärä 0,0 millimetriä'
      )
    ).toBeTruthy();
  });

  it('lists periods for a partially wet forecast without a whole-day description', () => {
    const view = render(
      <PrecipitationStrip
        precipitationData={makeDay({ 12: 1, 18: 1 }).slice(12)}
      />
    );

    expect(
      view.getByA11yLabel(
        'Sadetta iltapäivällä ja illalla, kokonaissademäärä 2,0 millimetriä'
      )
    ).toBeTruthy();
  });

  it.each([undefined, null, NaN, -1])(
    'announces missing totals for an invalid amount (%s)',
    (missing) => {
      const view = render(
        <PrecipitationStrip
          precipitationData={makeDay({ 6: 1, 12: missing })}
        />
      );

      expect(
        view.getByA11yLabel('Sadetta aamupäivällä, kokonaissademäärä puuttuu')
      ).toBeTruthy();
    }
  );

  it.each<{
    data: React.ComponentProps<typeof PrecipitationStrip>['precipitationData'];
  }>([
    { data: false },
    { data: [] },
    { data: [{ precipitation: undefined, timestamp: 2000000000 }] },
  ])('announces missing data instead of a dry day (%j)', ({ data }) => {
    const view = render(<PrecipitationStrip precipitationData={data} />);

    expect(view.getByA11yLabel('Sademäärä puuttuu')).toBeTruthy();
  });

  it('does not announce a dry day when some hours are missing', () => {
    const view = render(
      <PrecipitationStrip precipitationData={makeDay({ 6: null })} />
    );

    expect(view.getByA11yLabel('Sademäärä puuttuu')).toBeTruthy();
  });

  it('rounds the total to one decimal without floating point artifacts', () => {
    const view = render(
      <PrecipitationStrip precipitationData={makeDay({ 6: 0.1, 7: 0.2 })} />
    );

    expect(
      view.getByA11yLabel(
        'Sadetta aamupäivällä, kokonaissademäärä 0,3 millimetriä'
      )
    ).toBeTruthy();
  });

  it.each([
    ['fi', 'Sadetta aamupäivällä, kokonaissademäärä 0,10 tuumaa'],
    ['en', 'Precipitation in the morning, total precipitation 0.10 inches'],
    ['sv', 'Nederbörd på förmiddagen, total nederbörd 0,10 tum'],
  ])(
    'converts the amount and localizes the selected inch unit for %s',
    (language, label) => {
      mockLanguage = language;
      mockUnits = {
        precipitation: {
          unitId: 2,
          unitAbb: 'in',
          unit: 'inch',
          unitPrecision: 2,
        },
      };
      const view = render(
        <PrecipitationStrip precipitationData={makeDay({ 6: 2.54 })} />
      );

      expect(view.getByA11yLabel(label)).toBeTruthy();
    }
  );

  it('uses the configured default precipitation unit when no unit is selected', () => {
    mockDefaultPrecipitationUnit = 'in';
    const view = render(
      <PrecipitationStrip precipitationData={makeDay({ 6: 25.4 })} />
    );

    expect(
      view.getByA11yLabel('Sadetta aamupäivällä, kokonaissademäärä 1,00 tuumaa')
    ).toBeTruthy();
  });

  it('uses the selected unit instead of the configured default and responds to changes', () => {
    mockDefaultPrecipitationUnit = 'in';
    mockUnits = {
      precipitation: {
        unitId: 1,
        unitAbb: 'mm',
        unit: 'millimeter',
        unitPrecision: 1,
      },
    };
    const precipitationData = makeDay({ 6: 25.4 });
    const view = render(
      <PrecipitationStrip precipitationData={precipitationData} />
    );

    expect(
      view.getByA11yLabel(
        'Sadetta aamupäivällä, kokonaissademäärä 25,4 millimetriä'
      )
    ).toBeTruthy();

    mockUnits.precipitation = {
      unitId: 2,
      unitAbb: 'in',
      unit: 'inch',
      unitPrecision: 2,
    };
    view.rerender(<PrecipitationStrip precipitationData={precipitationData} />);

    expect(
      view.getByA11yLabel('Sadetta aamupäivällä, kokonaissademäärä 1,00 tuumaa')
    ).toBeTruthy();
  });

  it('uses inch precision for a dry day without changing the rain description', () => {
    mockDefaultPrecipitationUnit = 'in';
    const view = render(<PrecipitationStrip precipitationData={makeDay()} />);

    expect(
      view.getByA11yLabel(
        'Ei sadetta koko päivänä, kokonaissademäärä 0,00 tuumaa'
      )
    ).toBeTruthy();
  });

  it('disables its own accessibility and keyboard focus when described by a parent', () => {
    const view = render(
      <PrecipitationStrip
        precipitationData={makeDay({ 6: 1 })}
        accessible={false}
      />
    );
    const strip = view.getByA11yLabel(
      'Sadetta aamupäivällä, kokonaissademäärä 1,0 millimetriä'
    );

    expect(strip.props.accessible).toBe(false);
    expect(strip.props.focusable).toBe(false);
    expect(strip.props.accessibilityElementsHidden).toBe(true);
    expect(strip.props.importantForAccessibility).toBe('no-hide-descendants');
  });
});
