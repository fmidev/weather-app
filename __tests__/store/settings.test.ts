import reducer from '../../src/store/settings/reducer';
import * as types from '../../src/store/settings/types';

describe('settings reducer', () => {
  it('should handle UPDATE_UNITS', () => {
    const units = {
      temperature: 'C',
      precipitation: 'mm',
      wind: 'm/s',
      pressure: 'hPa',
    } as types.Units;
    expect(
      reducer(
        { units, theme: 'automatic' },
        {
          type: types.UPDATE_UNITS,
          param: 'temperature',
          unit: 'F',
        }
      )
    ).toEqual({
      theme: 'automatic',
      units: {
        ...units,
        temperature: 'F',
      },
    });
  });

  it('should handle UPDATE_THEME', () => {
    expect(
      reducer(undefined, { type: types.UPDATE_THEME, theme: 'light' })
    ).toEqual({
      units: undefined,
      theme: 'light',
    });
  });
});
