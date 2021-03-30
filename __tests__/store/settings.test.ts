import reducer from '../../src/store/settings/reducer';
import * as types from '../../src/store/settings/types';

describe('settings reducer', () => {
  it('should handle ADD_FAVORITE', () => {
    const favorite = {
      geoid: 123,
      name: 'Helsinki',
    };

    expect(
      reducer(undefined, {
        type: types.ADD_FAVORITE,
        favorites: [favorite],
      })
    ).toEqual({
      favorites: [favorite],
    });
  });

  it('should handle DELETE_FAVORITE', () => {
    const favorites = [
      {
        geoid: 123,
        name: 'Helsinki',
      },
      {
        geoid: 323,
        name: 'Oulu',
      },
    ];

    expect(
      reducer(
        { favorites, units: undefined },
        { type: types.DELETE_FAVORITE, geoid: 123 }
      )
    ).toEqual({
      favorites: [
        {
          geoid: 323,
          name: 'Oulu',
        },
      ],
    });
  });

  it('should handle UPDATE_UNITS', () => {
    const favorites = [
      {
        geoid: 123,
        name: 'Helsinki',
      },
      {
        geoid: 323,
        name: 'Oulu',
      },
    ];

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
        { favorites, units },
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
      favorites,
      units: {
        ...units,
        temperature: {
          unitId: 2,
          unitAbb: 'F',
          unit: 'fahrenheit',
          unitPrecision: 0,
        },
      },
    });
  });
});
