import moment from 'moment-timezone';
import {
  formatAccessibleDateTime,
  formatAccessibleTemperature,
  formatAccessibleTime,
} from '../../src/utils/accessibility';

const translateTime = (key: string) =>
  key === 'time:amSpoken' ? 'in the morning' : 'in the afternoon';

describe('formatAccessibleTime', () => {
  it('formats only the time using a 24-hour clock by default', () => {
    const t = jest.fn();
    const date = moment.utc('2024-01-02T09:05:00Z');

    expect(formatAccessibleTime(date, t)).toBe('9:05');
    expect(formatAccessibleTime(date, t, true)).toBe('9:05');
    expect(t).not.toHaveBeenCalled();
  });

  it.each([
    ['00:00', '12:00 in the morning'],
    ['09:05', '9:05 in the morning'],
    ['11:59', '11:59 in the morning'],
    ['12:00', '12:00 in the afternoon'],
    ['23:59', '11:59 in the afternoon'],
  ])('uses a spoken period for %s on a 12-hour clock', (time, expected) => {
    const date = moment.utc(`2024-01-02T${time}:00Z`);

    expect(formatAccessibleTime(date, translateTime, false)).toBe(expected);
  });

  it('uses the time in the supplied timezone without changing the moment', () => {
    const date = moment.utc('2024-01-02T22:05:00Z').tz('Europe/Helsinki');
    const original = date.format();

    expect(formatAccessibleTime(date, translateTime)).toBe('0:05');
    expect(formatAccessibleTime(date, translateTime, false)).toBe(
      '12:05 in the morning'
    );
    expect(date.format()).toBe(original);
  });
});

describe('formatAccessibleDateTime', () => {
  const date = moment.utc('2024-01-02T13:05:00Z').locale('en');

  it('includes the date and 24-hour time by default', () => {
    expect(formatAccessibleDateTime(date, translateTime)).toBe(
      'Tuesday, January 2, 2024 13:05'
    );
  });

  it('supports a 12-hour time and omitting the year', () => {
    expect(formatAccessibleDateTime(date, translateTime, false, false)).toBe(
      'Tuesday, 2. January 1:05 in the afternoon'
    );
  });
});

describe('formatAccessibleTemperature', () => {
  const t = (key: string) => (key === 'forecast:minus' ? 'minus' : key);

  it('converts negative temperature to spoken minus format', () => {
    expect(formatAccessibleTemperature(-7, t)).toBe('minus 7');
    expect(formatAccessibleTemperature('-3', t)).toBe('minus 3');
  });

  it('returns plain value for zero and positive values', () => {
    expect(formatAccessibleTemperature(0, t)).toBe('0');
    expect(formatAccessibleTemperature(12, t)).toBe('12');
  });

  it('returns dash for invalid values', () => {
    expect(formatAccessibleTemperature('', t)).toBe('-');
    expect(formatAccessibleTemperature(undefined, t)).toBe('-');
    expect(formatAccessibleTemperature(null, t)).toBe('-');
    expect(formatAccessibleTemperature('not-a-number', t)).toBe('-');
  });
});
