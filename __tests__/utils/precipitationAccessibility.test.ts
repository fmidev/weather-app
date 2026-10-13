import i18next from 'i18next';
import moment from 'moment-timezone';
import { formatAccessiblePrecipitation } from '../../src/utils/precipitationAccessibility';
import en from '../../i18n/en.json';
import fi from '../../i18n/fi.json';

describe('formatAccessiblePrecipitation', () => {
  const i18n = i18next.createInstance();
  i18n.init({
    initImmediate: false,
    lng: 'en',
    // Callers include both a forecast-scoped strip and a daily row with another namespace.
    defaultNS: 'navigation',
    resources: { en, fi },
  });
  const precipitationData = [
    {
      precipitation: 1.2,
      timestamp: moment.utc('2035-06-01T06:00:00Z').unix(),
    },
    {
      precipitation: 1.2,
      timestamp: moment.utc('2035-06-01T18:00:00Z').unix(),
    },
  ];

  beforeEach(() => {
    moment.tz.setDefault('UTC');
  });

  afterEach(() => {
    moment.tz.setDefault();
  });

  it('uses the forecast translations independently of the caller namespace', () => {
    expect(
      formatAccessiblePrecipitation(precipitationData, 'mm', 'en', i18n.t)
    ).toBe(
      'Precipitation in the morning and in the evening, total precipitation 2.4 millimeters'
    );
  });

  it('uses the caller language and selected unit', () => {
    const t = i18n.getFixedT('fi', 'navigation');
    expect(
      formatAccessiblePrecipitation(precipitationData, 'in', 'fi', t)
    ).toBe('Sadetta aamupäivällä ja illalla, kokonaissademäärä 0,09 tuumaa');
  });

  it('reports absent data without a rainfall amount', () => {
    expect(formatAccessiblePrecipitation(false, 'mm', 'en', i18n.t)).toBe(
      'Precipitation amount missing'
    );
  });
});
