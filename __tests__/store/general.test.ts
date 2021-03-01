import reducer from '../../src/store/general/reducer';
import * as types from '../../src/store/general/types';

describe('general reducer', () => {
  it('should handle SET_GEOLOCATION', () => {
    const helsinkiCoordinates = {
      latitude: 60.1733244,
      longitude: 24.9410248,
    };

    expect(
      reducer(undefined, {
        type: types.SET_GEOLOCATION,
        geolocation: helsinkiCoordinates,
      })
    ).toEqual({
      geolocation: helsinkiCoordinates,
    });
  });
});
