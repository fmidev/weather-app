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
      units: undefined,
      theme: undefined,
      recentSearches: [],
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
        { favorites, units: undefined, theme: 'automatic', recentSearches: [] },
        { type: types.DELETE_FAVORITE, id: 123 }
      )
    ).toEqual({
      units: undefined,
      theme: 'automatic',
      favorites: [
        {
          id: 323,
          name: 'Oulu',
          area: 'Oulu',
          lat: 12.234,
          lon: 13.234,
        },
      ],
      recentSearches: [],
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
        { favorites, units, theme: 'automatic', recentSearches: [] },
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
      recentSearches: [],
    });
  });

  it('should handle UPDATE_THEME', () => {
    expect(
      reducer(undefined, { type: types.UPDATE_THEME, theme: 'light' })
    ).toEqual({
      favorites: [],
      units: undefined,
      theme: 'light',
      recentSearches: [],
    });
  });
});
