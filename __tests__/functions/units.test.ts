import { converter, toPrecision } from '../../src/utils/units';

describe('unit helper functions', () => {
  it('should convert units correctly to correct precision', () => {
    const celcius = 28;
    const fahrenheit = '82';
    const millimeter = 10;
    const inch = '0.39';
    const metersPerSecond = 5;
    const kilometersPerHour = '18';
    const milesPerHour = '11';
    const beaufort = '6';
    const knots = '10';
    const hehtopascal = 10;
    const inchesOfMercury = '0.3';
    const millimetersOfMercury = '8';

    expect(toPrecision('temperature', 'F', converter('F', celcius))).toBe(
      fahrenheit
    );
    expect(
      toPrecision('precipitation', 'in', converter('in', millimeter))
    ).toBe(inch);
    expect(
      toPrecision('wind', 'km/h', converter('km/h', metersPerSecond))
    ).toBe(kilometersPerHour);
    expect(toPrecision('wind', 'mph', converter('mph', metersPerSecond))).toBe(
      milesPerHour
    );
    expect(toPrecision('wind', 'bft', converter('bft', metersPerSecond))).toBe(
      beaufort
    );
    expect(toPrecision('wind', 'kn', converter('kn', metersPerSecond))).toBe(
      knots
    );
    expect(
      toPrecision('pressure', 'inHg', converter('inHg', hehtopascal))
    ).toBe(inchesOfMercury);
    expect(
      toPrecision('pressure', 'mmHg', converter('mmHg', hehtopascal))
    ).toBe(millimetersOfMercury);
    // kph is wrong and converter should return input value
    // toPrecision should return input value as string if unit or unitAbb are wrong
    expect(toPrecision('wind', 'kph', converter('kph', metersPerSecond))).toBe(
      '5'
    );
    // winf is misspelled but converter should return correct value
    expect(
      toPrecision('winf', 'km/h', converter('km/h', metersPerSecond))
    ).toBe('18');
  });
});
