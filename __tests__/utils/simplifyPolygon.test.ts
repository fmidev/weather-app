import { simplifyPolygon } from '@utils/simplifyPolygon';

describe('simplifyPolygon', () => {
  test('removes points less than one kilometer from the simplified edge', () => {
    const ring: [number, number][] = [
      [24, 60],
      [24.01, 60.0005],
      [24.02, 60],
      [24.02, 60.02],
      [24, 60.02],
      [24, 60],
    ];

    const simplified = simplifyPolygon(ring, 1000);

    expect(simplified).not.toContainEqual([24.01, 60.0005]);
    expect(simplified.length).toBeLessThan(ring.length);
    expect(simplified.length).toBeGreaterThanOrEqual(4);
    expect(simplified[0]).toEqual(simplified[simplified.length - 1]);
  });

  test('keeps deviations larger than the tolerance', () => {
    const ring: [number, number][] = [
      [24, 60],
      [24.01, 60.02],
      [24.02, 60],
      [24.02, 60.04],
      [24, 60.04],
      [24, 60],
    ];

    expect(simplifyPolygon(ring, 1000)).toContainEqual([24.01, 60.02]);
  });

  test('closes an open polygon ring', () => {
    const ring: [number, number][] = [
      [24, 60],
      [25, 60],
      [25, 61],
      [24, 61],
    ];

    const simplified = simplifyPolygon(ring, 1000);

    expect(simplified[0]).toEqual(simplified[simplified.length - 1]);
  });
});
