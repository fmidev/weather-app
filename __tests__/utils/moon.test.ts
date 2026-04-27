import { resolveMoonPhase } from '../../src/utils/moon';

describe('moon utils', () => {
  it('resolves new moon before the first phase threshold', () => {
    expect(resolveMoonPhase(0, false)).toBe('newMoon');
    expect(resolveMoonPhase(0.9, true)).toBe('newMoon');
  });

  it('resolves waxing moon phases', () => {
    expect(resolveMoonPhase(1, false)).toBe('waxingCrescent');
    expect(resolveMoonPhase(49, false)).toBe('firstQuarter');
    expect(resolveMoonPhase(51, false)).toBe('waxingGibbous');
    expect(resolveMoonPhase(99, false)).toBe('fullMoon');
  });

  it('resolves waning moon phases', () => {
    expect(resolveMoonPhase(1, true)).toBe('waningCrescent');
    expect(resolveMoonPhase(49, true)).toBe('lastQuarter');
    expect(resolveMoonPhase(51, true)).toBe('waningGibbous');
    expect(resolveMoonPhase(99, true)).toBe('fullMoon');
  });
});
