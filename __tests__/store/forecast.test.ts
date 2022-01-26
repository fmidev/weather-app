import reducer from '@store/forecast/reducer';
import * as types from '@store/forecast/types';
import * as constants from '@store/forecast/constants';

const initialParams = [
  [0, constants.SMART_SYMBOL],
  [1, constants.TEMPERATURE],
  [3, constants.WIND_SPEED_AND_DIRECTION],
  [5, constants.PRECIPITATION_1H],
] as [number, string][];

const defaultState: types.ForecastState = {
  data: {},
  loading: false,
  error: false,
  displayParams: initialParams,
  displayFormat: 'table',
  chartDisplayParam: 'temperature',
};

describe('forecast reducer', () => {
  it('should handle UPDATE_DISPLAY_PARAMS (add)', () => {
    expect(
      reducer(undefined, {
        type: types.UPDATE_DISPLAY_PARAMS,
        param: [6, constants.DEW_POINT],
      })
    ).toMatchObject({
      displayParams: [...initialParams, [6, constants.DEW_POINT]],
    });
  });

  it('should handle UPDATE_DISPLAY_PARAMS (remove)', () => {
    expect(
      reducer(undefined, {
        type: types.UPDATE_DISPLAY_PARAMS,
        param: [3, constants.WIND_SPEED_AND_DIRECTION],
      })
    ).toMatchObject({
      displayParams: [
        [0, constants.SMART_SYMBOL],
        [1, constants.TEMPERATURE],
        [5, constants.PRECIPITATION_1H],
      ],
    });
  });

  it('should handle RESTORE_DEFAULT_DISPLAY_PARAMS', () => {
    expect(
      reducer(
        { ...defaultState, displayParams: [[0, constants.SMART_SYMBOL]] },
        { type: types.RESTORE_DEFAULT_DISPLAY_PARAMS }
      )
    ).toMatchObject({
      displayParams: initialParams,
    });
  });
});
