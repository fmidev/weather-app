export type MoonPhase = 'newMoon' | 'waxingCrescent' | 'firstQuarter' | 'waxingGibbous' | 'fullMoon' | 'waningGibbous' | 'lastQuarter' | 'waningCrescent';

export const resolveMoonPhase = (moonPhase: number, waning: boolean): MoonPhase => {
  if (moonPhase < 1) return 'newMoon';

  if (waning) {
    if (moonPhase < 49) {
      return 'waningCrescent';
    } else if (moonPhase < 51) {
      return 'lastQuarter';
    } else if (moonPhase < 99) {
      return 'waningGibbous';
    } else {
      return 'fullMoon';
    }
  } else {
    if (moonPhase < 49) {
      return 'waxingCrescent';
    } else if (moonPhase < 51) {
      return 'firstQuarter';
    } else if (moonPhase < 99) {
      return 'waxingGibbous';
    } else {
      return 'fullMoon';
    }
  }
}