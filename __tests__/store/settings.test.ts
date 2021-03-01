import reducer from '../../src/store/settings/reducer';
import * as types from '../../src/store/settings/types';

describe('settings reducer', () => {
  it('should handle SET_LANGUAGE', () => {
    expect(
      reducer(undefined, {
        type: types.SET_LANGUAGE,
        locale: 'EN',
      })
    ).toEqual({
      locale: 'EN',
      favorites: [],
    });
  });

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
      locale: 'FI',
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
        { locale: 'SE', favorites },
        { type: types.DELETE_FAVORITE, geoid: 123 }
      )
    ).toEqual({
      locale: 'SE',
      favorites: [
        {
          geoid: 323,
          name: 'Oulu',
        },
      ],
    });
  });
});
