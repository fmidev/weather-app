import { findNearestLocation } from '@utils/geolocation';

const locations = [
  {
    id: 'helsinki',
    name: {
      primary: 'Helsinki',
      fi: 'Helsinki',
      sv: 'Helsingfors',
    },
    longitude: 24.9384,
    latitude: 60.1699,
    region: {
      primary: 'Uusimaa',
      fi: 'Uusimaa',
      sv: 'Nyland',
    },
    country: 'FI',
    population: 658864,
    timezone: 'Europe/Helsinki',
  },
  {
    id: 'keski-helsinki',
    name: {
      primary: 'Keski-Helsinki',
      fi: 'Keski-Helsinki',
      sv: 'Mellersta Helsingfors',
    },
    longitude: 24.9355,
    latitude: 60.1884,
    region: {
      primary: 'Uusimaa',
      fi: 'Uusimaa',
      sv: 'Nyland',
    },
    country: 'FI',
    population: 1000000,
    timezone: 'Europe/Helsinki',
  },
  {
    id: 'lahti',
    name: {
      primary: 'Lahti',
      fi: 'Lahti',
    },
    longitude: 25.6615,
    latitude: 60.9827,
    region: {
      primary: 'Paijat-Hame',
      fi: 'Paijat-Hame',
    },
    country: 'FI',
    population: 120000,
    timezone: 'Europe/Helsinki',
  },
  {
    id: 'lappeenranta',
    name: {
      primary: 'Lappeenranta',
      fi: 'Lappeenranta',
    },
    longitude: 28.1887,
    latitude: 61.0549,
    region: {
      primary: 'South Karelia',
      fi: 'Etela-Karjala',
    },
    country: 'FI',
    population: 72000,
    timezone: 'Europe/Helsinki',
  },
  {
    id: 'lapua',
    name: {
      primary: 'Lapua',
      fi: 'Lapua',
    },
    longitude: 23.0088,
    latitude: 62.9693,
    region: {
      primary: 'South Ostrobothnia',
      fi: 'Etela-Pohjanmaa',
    },
    country: 'FI',
    population: 14000,
    timezone: 'Europe/Helsinki',
  },
  {
    id: 'stockholm',
    name: {
      primary: 'Stockholm',
      fi: 'Tukholma',
      sv: 'Stockholm',
    },
    longitude: 18.0686,
    latitude: 59.3293,
    region: {
      primary: 'Stockholm County',
      fi: 'Tukholman alue',
      sv: 'Stockholms lan',
    },
    country: 'SE',
    population: 978770,
    timezone: 'Europe/Stockholm',
  },
];

jest.mock('@assets/locations/locations.json', () => locations);
jest.mock('@assets/locations/countries.json', () => [
  {
    id: 'finland',
    name: {
      primary: 'Finland',
      fi: 'Suomi',
      sv: 'Finland',
    },
    country: 'FI',
  },
  {
    id: 'sweden',
    name: {
      primary: 'Sweden',
      fi: 'Ruotsi',
      sv: 'Sverige',
    },
    country: 'SE',
  },
]);

describe('geolocation search', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('prioritizes exact name matches over higher population substring matches', () => {
    const { search } = require('../../src/utils/geolocation');

    const results = search('helsinki', 'fi');

    expect(results.map(({ id }: { id: string }) => id)).toEqual([
      'helsinki',
      'keski-helsinki',
    ]);
  });

  it('sorts equally scored matches by population', () => {
    const { search } = require('../../src/utils/geolocation');

    const results = search('la', 'fi');

    expect(results.map(({ id }: { id: string }) => id)).toEqual([
      'lahti',
      'lappeenranta',
      'lapua',
    ]);
  });

  it('uses localized location names when scoring search results', () => {
    const { search } = require('../../src/utils/geolocation');

    const results = search('tuk', 'fi');

    expect(results[0].id).toBe('stockholm');
  });

  it('limits returned results after sorting', () => {
    const { search } = require('../../src/utils/geolocation');

    const results = search('la', 'fi', 2);

    expect(results.map(({ id }: { id: string }) => id)).toEqual([
      'lahti',
      'lappeenranta',
    ]);
  });
});

describe('findNearestPlace', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('returns the nearest place within the maximum distance', () => {
    const result = findNearestLocation(60.17, 24.94, 20);

    expect(result?.id).toBe('helsinki');
  });

  it('returns undefined when the nearest place exceeds the maximum distance', () => {
    const result = findNearestLocation(60.5, 24.94, 20);

    expect(result).toBeUndefined();
  });

  it('returns a place located exactly at the given coordinates', () => {
    const result = findNearestLocation(60.9827, 25.6615, 0);

    expect(result?.id).toBe('lahti');
  });
});
