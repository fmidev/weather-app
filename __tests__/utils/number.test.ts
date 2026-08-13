import {
  numericOrDash,
  roundCoordinates,
  roundToNearestTen,
  toStringWithDecimal,
} from '../../src/utils/number';

describe('number utils', () => {
  describe('numericOrDash', () => {
    it.each([
      [0, '0'],
      [-5, '-5'],
      ['0', '0'],
      ['1.25', '1.25'],
      ['-3', '-3'],
    ])('formats numeric value %p as %s', (value, expected) => {
      expect(numericOrDash(value)).toBe(expected);
    });

    it.each([undefined, null, '', '   ', 'NaN', 'hello', NaN, Infinity])(
      'returns a dash for invalid value %p',
      (value) => {
        expect(numericOrDash(value)).toBe('-');
      }
    );
  });

  describe('toStringWithDecimal', () => {
    it('formats integers and decimals with the selected separator', () => {
      expect(toStringWithDecimal(2, '.')).toBe('2.0');
      expect(toStringWithDecimal(1.25, ',')).toBe('1,25');
    });

    it('returns zero for missing, zero and NaN values', () => {
      expect(toStringWithDecimal(undefined, ',')).toBe('0,0');
      expect(toStringWithDecimal(0, '.')).toBe('0.0');
      expect(toStringWithDecimal(NaN, ',')).toBe('0,0');
    });
  });

  describe('roundCoordinates', () => {
    it('rounds coordinates to four decimal places', () => {
      expect(roundCoordinates(60.123456)).toBe(60.1235);
      expect(roundCoordinates(-24.987654)).toBe(-24.9877);
    });

    it('keeps values that have at most four decimal places', () => {
      expect(roundCoordinates(60.1234)).toBe(60.1234);
      expect(roundCoordinates(24)).toBe(24);
    });
  });

  describe('roundToNearestTen', () => {
    it('rounds to the nearest multiple of ten', () => {
      expect(roundToNearestTen(14)).toBe(10);
      expect(roundToNearestTen(15)).toBe(20);
      expect(roundToNearestTen(-16)).toBe(-20);
    });

    it('normalizes negative zero', () => {
      expect(Object.is(roundToNearestTen(-1), -0)).toBe(false);
      expect(roundToNearestTen(-1)).toBe(0);
    });
  });
});
