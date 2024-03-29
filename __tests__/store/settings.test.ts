import reducer from '../../src/store/settings/reducer';
import * as types from '../../src/store/settings/types';

describe('settings reducer', () => {
  it('should handle UPDATE_UNITS', () => {
    const units = {
      temperature: {
        unitId: 1,
        unitAbb: 'C',
        unit: 'celsius',
        unitPrecision: 0,
      },
      precipitation: {
        unitId: 1,
        unitAbb: 'mm',
        unit: 'millimeter',
        unitPrecision: 1,
      },
    };
    expect(
      reducer(
        { units, theme: 'automatic', clockType: 24 },
        {
          type: types.UPDATE_UNITS,
          units: {
            ...units,
            temperature: {
              unitId: 2,
              unitAbb: 'F',
              unit: 'fahrenheit',
              unitPrecision: 0,
            },
          },
        }
      )
    ).toEqual({
      theme: 'automatic',
      units: {
        ...units,
        temperature: {
          unitId: 2,
          unitAbb: 'F',
          unit: 'fahrenheit',
          unitPrecision: 0,
        },
      },
      clockType: 24,
    });
  });

  it('should handle UPDATE_THEME', () => {
    expect(
      reducer(undefined, { type: types.UPDATE_THEME, theme: 'light' })
    ).toEqual({
      units: undefined,
      theme: 'light',
      clockType: undefined,
    });
  });

  it('should handle UPDATE_CLOCK_TYPE', () => {
    expect(
      reducer(undefined, { type: types.UPDATE_CLOCK_TYPE, clockType: 24 })
    ).toEqual({
      units: undefined,
      theme: undefined,
      clockType: 24,
    });
  });
});
