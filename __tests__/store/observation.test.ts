import reducer from '@store/observation/reducer';
import * as selectors from '@store/observation/selector';
import * as types from '@store/observation/types';

const hourlyRaw: types.ObservationDataRaw = {
  10: {
    StationA: {
      AWS: {
        2: [
          { epochtime: 1200, temperature: 1 },
          { epochtime: 700, temperature: 2 },
          { epochtime: 600, temperature: 3 },
        ],
      },
    },
  },
  11: {
    StationB: {
      ROAD: {
        1: [{ epochtime: 1200, temperature: 4 }],
      },
    },
  },
};

const dailyRaw: types.ObservationDataRaw = {
  10: {
    StationA: {
      AWS: {
        2: Array.from({ length: 11 }).map((_, index) => ({
          epochtime: 1000 + index * 86400,
          maximumTemperature: index,
          minimumTemperature: null,
          rrday: index,
          snowDepth06: index,
        })),
      },
    },
  },
};

describe('observation store', () => {
  it('handles observation fetch success and formats station data', () => {
    const state = reducer(undefined, {
      type: types.FETCH_OBSERVATION_SUCCESS,
      payload: {
        data: [hourlyRaw, dailyRaw, true],
        location: { geoid: 99 },
      },
    });

    expect(state).toMatchObject({
      error: false,
      id: 99,
      isAuroraBorealisLikely: true,
      loading: false,
      stations: [
        { distance: 2, id: 10, name: 'StationA', type: 'AWS' },
        { distance: 1, id: 11, name: 'StationB', type: 'ROAD' },
      ],
    });
    expect(state.data?.[10]).toEqual([
      { epochtime: 600, temperature: 3 },
      { epochtime: 1200, temperature: 1 },
    ]);
  });

  it('handles settings actions and reset', () => {
    const populated = reducer(undefined, {
      type: types.FETCH_OBSERVATION_SUCCESS,
      payload: {
        data: [hourlyRaw, dailyRaw],
        location: { latlon: '60,24' },
      },
    });

    const withSettings = reducer(populated, {
      type: types.SET_STATION_ID,
      key: '60,24',
      id: 10,
    });

    expect(
      reducer(withSettings, {
        type: types.UPDATE_OBSERVATION_DISPLAY_FORMAT,
        value: 'table',
      })
    ).toMatchObject({ displayFormat: 'table' });
    expect(
      reducer(withSettings, {
        type: types.UPDATE_OBSERVATION_CHART_PARAMETER,
        value: 'temperature' as any,
      })
    ).toMatchObject({ chartDisplayParam: 'temperature' });
    expect(reducer(withSettings, { type: types.RESET_OBSERVATION_STATE })).toMatchObject({
      data: {},
      dailyData: {},
      error: false,
      loading: false,
      stations: [],
    });
  });

  it('selects station data and daily parameters', () => {
    const state = {
      observation: {
        chartDisplayParam: 'temperature',
        dailyData: {
          10: Array.from({ length: 11 }).map((_, index) => ({
            epochtime: index,
            maximumTemperature: index,
            minimumGroundTemperature06: null,
            minimumTemperature: null,
            rrday: index,
            snowDepth06: index,
          })),
        },
        data: {
          10: [{ epochtime: 600, temperature: 3 }],
        },
        displayFormat: 'chart',
        error: false,
        id: 'place',
        loading: false,
        stationId: { place: 10 },
        stations: [
          { distance: 10, id: 20, name: 'Road', type: 'ROAD' },
          { distance: 2, id: 10, name: 'AWS', type: 'AWS' },
          { distance: 4, id: 11, name: 'AVI', type: 'AVI' },
        ],
      },
    } as any;

    expect(selectors.selectStationId(state)).toBe(10);
    expect(selectors.selectData(state)).toEqual([
      { epochtime: 600, temperature: 3 },
    ]);
    expect(selectors.selectDailyObservationParametersWithData(state)).toEqual([
      'rrday',
      'maximumTemperature',
    ]);
    expect(selectors.selectPreferredDailyParameters(state)).toEqual([
      'snowDepth',
    ]);
    expect(selectors.selectStationList(state).map((station) => station.id)).toEqual([
      10,
      11,
      20,
    ]);
  });
});
