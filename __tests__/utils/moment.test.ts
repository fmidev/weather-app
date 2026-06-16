import moment from '../../src/utils/moment';

describe('moment formatDateTime extension', () => {
  const baseMoment = moment.utc('2026-06-15T17:08:00Z');

  it('formats dateTime using locale-specific format when available', () => {
    expect(baseMoment.formatDateTime('dateTime', 'en')).toBe('15 Jun 17:08');
  });

  it('formats dateTime with locale fallback to default settings', () => {
    expect(baseMoment.formatDateTime('dateTime', 'fi')).toBe('15.6. 17:08');
  });

  it('formats time with default format when locale-specific time is missing', () => {
    expect(baseMoment.formatDateTime('time', 'en')).toBe('17:08');
  });

  it('formats dateTime with 12-hour clock time when clock type is 12', () => {
    expect(baseMoment.formatDateTime('dateTime', 'en', 12)).toBe(
      '15 Jun 5:08 pm'
    );
  });

  it('formats time as 12-hour clock time when clock type is 12', () => {
    expect(baseMoment.formatDateTime('time', 'en', 12)).toBe('5:08 pm');
  });

  it('uppercases the first formatted character when format starts with U', () => {
    expect(baseMoment.formatDateTime('weekday', 'fi')).toBe('Maanantai');
  });

  it('resolves language tags to base locale for format lookup', () => {
    expect(baseMoment.formatDateTime('dateTime', 'en-US')).toBe('15 Jun 17:08');
  });

  it('uses moment instance locale when locale argument is not provided', () => {
    expect(baseMoment.clone().locale('en').formatDateTime('dateTime')).toBe(
      '15 Jun 17:08'
    );
  });
});
