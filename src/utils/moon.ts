export type MoonPhase = 'newMoon' | 'waxingCrescent' | 'firstQuarter' | 'waxingGibbous' | 'fullMoon' | 'waningGibbous' | 'lastQuarter' | 'waningCrescent';

export const resolveMoonPhase = (moonPhase: number): MoonPhase => {
  if (moonPhase < 1) {
    return 'newMoon';
  } else if (moonPhase < 7) {
    return 'waxingCrescent';
  } else if (moonPhase === 7) {
    return 'firstQuarter';
  } else if (moonPhase < 14) {
    return 'waxingGibbous';
  } else if (moonPhase === 14) {
    return 'fullMoon';
  } else if (moonPhase < 21) {
    return 'waningGibbous';
  } else if (moonPhase === 21) {
    return 'lastQuarter';
  } else {
    return 'waningCrescent';
  }
}