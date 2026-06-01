import { findNearestGeoMagneticObservationStation } from '../../src/utils/geoMagneticStations';

describe('geoMagneticStations helper functions', () => {
  it('returns Nurmijärvi for exact Nurmijärvi coordinates', () => {
    const station = findNearestGeoMagneticObservationStation(60.5, 24.65);

    expect(station).toMatchObject({
      name: 'Nurmijärvi',
      country: 'FI',
      fmisid: 101149,
    });
  });

  it('returns Nurmijärvi for Helsinki coordinates', () => {
    const station = findNearestGeoMagneticObservationStation(60.16952, 24.93545);

    expect(station).toMatchObject({
      name: 'Nurmijärvi',
      country: 'FI',
      fmisid: 101149,
    });
  });

  it('returns Tartto for Tartu coordinates', () => {
    const station = findNearestGeoMagneticObservationStation(58.3776, 26.7290);

    expect(station).toMatchObject({
      name: 'Tartto',
      country: 'EE',
      fmisid: 133843,
    });
  });
});
