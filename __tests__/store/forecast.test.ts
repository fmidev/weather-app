import reducer from '@store/forecast/reducer';
import * as types from '@store/forecast/types';
import * as constants from '@store/forecast/constants';

const defaultParameters = [
  [0, constants.SMART_SYMBOL],
  [1, constants.TEMPERATURE],
  [3, constants.WIND_SPEED_AND_DIRECTION],
  [5, constants.PRECIPITATION_1H],
] as [number, string][];

const defaultState: types.ForecastState = {
  data: {},
  auroraBorealisData: {},
  loading: false,
  error: false,
  displayParams: [],
  displayFormat: 'table',
  chartDisplayParam: 'temperature',
  fetchTimestamp: Date.now(),
  fetchSuccessTime: 0,
};

describe('forecast reducer', () => {
  it('should handle UPDATE_DISPLAY_PARAMS (add)', () => {
    expect(
      reducer(undefined, {
        type: types.UPDATE_DISPLAY_PARAMS,
        param: [7, constants.DEW_POINT],
        defaultParameters: defaultParameters.map(
          ([, param]) => param
        ) as types.DisplayParameters[],
      })
    ).toMatchObject({
      displayParams: [...defaultParameters, [7, constants.DEW_POINT]],
    });
  });

  it('should handle UPDATE_DISPLAY_PARAMS (remove)', () => {
    expect(
      reducer(undefined, {
        type: types.UPDATE_DISPLAY_PARAMS,
        param: [3, constants.WIND_SPEED_AND_DIRECTION],
        defaultParameters: defaultParameters.map(
          ([, param]) => param
        ) as types.DisplayParameters[],
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
      displayParams: [],
    });
  });
});
