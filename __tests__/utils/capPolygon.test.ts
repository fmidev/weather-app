import { parseCapPolygon } from '@utils/capPolygon';

describe('parseCapPolygon', () => {
  test('parses coordinates separated by whitespace', () => {
    expect(parseCapPolygon('60,24  60,25\n61,25\t61,24')).toEqual([
      [24, 60],
      [25, 60],
      [25, 61],
      [24, 61],
      [24, 60],
    ]);
  });

  test('excludes malformed and non-numeric coordinates', () => {
    expect(
      parseCapPolygon('60,24 invalid 60, 61,25 61,not-a-number 61,24')
    ).toEqual([
      [24, 60],
      [25, 61],
      [24, 61],
      [24, 60],
    ]);
  });

  test('closes the ring without simplifying when tolerance is undefined', () => {
    const polygon = parseCapPolygon(
      '60,24 60.0005,24.01 60,24.02 60.02,24.02 60.02,24'
    );

    expect(polygon).toEqual([
      [24, 60],
      [24.01, 60.0005],
      [24.02, 60],
      [24.02, 60.02],
      [24, 60.02],
      [24, 60],
    ]);
  });
});
