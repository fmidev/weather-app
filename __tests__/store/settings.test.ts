import reducer from '../../src/store/settings/reducer';
import * as types from '../../src/store/settings/types';

describe('settings reducer', () => {
  it('should handle ADD_FAVORITE', () => {
    const favorite = {
      id: 123,
      name: 'Helsinki',
      area: 'Helsinki',
      lat: 12.234,
      lon: 13.234,
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
        id: 123,
        name: 'Helsinki',
        area: 'Helsinki',
        lat: 12.234,
        lon: 13.234,
      },
      {
        id: 323,
        name: 'Oulu',
        area: 'Oulu',
        lat: 12.234,
        lon: 13.234,
      },
    ];

    expect(
      reducer(
        { favorites, units: undefined },
        { type: types.DELETE_FAVORITE, id: 123 }
      )
    ).toEqual({
      favorites: [
        {
          id: 323,
          name: 'Oulu',
          area: 'Oulu',
          lat: 12.234,
          lon: 13.234,
        },
      ],
    });
  });

  it('should handle UPDATE_UNITS', () => {
    const favorites = [
      {
        id: 123,
        name: 'Helsinki',
        area: 'Helsinki',
        lat: 12.234,
        lon: 13.234,
      },
      {
        id: 323,
        name: 'Oulu',
        area: 'Oulu',
        lat: 12.234,
        lon: 13.234,
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
