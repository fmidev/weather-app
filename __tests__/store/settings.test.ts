import reducer from '@store/settings/reducer';
import * as actions from '@store/settings/actions';
import * as selectors from '@store/settings/selectors';
import * as types from '@store/settings/types';
import { getDefaultUnits } from '@utils/units';

const mockConfigGet = jest.fn();

jest.mock('@config', () => ({
  Config: {
    get: (...args: any[]) => mockConfigGet(...args),
  },
}));

describe('settings reducer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockConfigGet.mockReturnValue({
      clockType: 12,
      themes: {
        dark: true,
        light: true,
      },
    });
  });

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
        { units, theme: 'automatic', clockType: 24, mapLibrary: 'react-native-maps' },
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
      mapLibrary: 'react-native-maps',
    });
  });

  it('should handle UPDATE_THEME', () => {
    const defaultUnits = getDefaultUnits();
    expect(
      reducer(undefined, { type: types.UPDATE_THEME, theme: 'light' })
    ).toEqual({
      units: defaultUnits,
      theme: 'light',
      clockType: undefined,
      mapLibrary: 'react-native-maps',
    });
  });

  it('should handle UPDATE_CLOCK_TYPE', () => {
    const defaultUnits = getDefaultUnits();
    expect(
      reducer(undefined, { type: types.UPDATE_CLOCK_TYPE, clockType: 24 })
    ).toEqual({
      units: defaultUnits,
      theme: undefined,
      clockType: 24,
      mapLibrary: 'react-native-maps',
    });
  });

  it('should handle UPDATE_MAP_LIBRARY', () => {
    expect(
      reducer(undefined, {
        type: types.UPDATE_MAP_LIBRARY,
        library: 'maplibre',
      })
    ).toEqual({
      units: getDefaultUnits(),
      theme: undefined,
      clockType: undefined,
      mapLibrary: 'maplibre',
    });
  });

  it('selects explicitly stored settings', () => {
    const state = {
      settings: {
        clockType: 24,
        mapLibrary: 'maplibre',
        theme: 'dark',
        units: {
          temperature: {
            unitAbb: 'C',
            unitId: 1,
            unit: 'celsius',
            unitPrecision: 0,
          },
        },
      },
    } as any;

    expect(selectors.selectUnits(state)).toEqual(state.settings.units);
    expect(selectors.selectTheme(state)).toBe('dark');
    expect(selectors.selectClockType(state)).toBe(24);
    expect(selectors.selectMapLibrary(state)).toBe('maplibre');
  });

  it('selects theme fallback from config when no theme is stored', () => {
    expect(selectors.selectTheme(createState(undefined))).toBe('automatic');

    mockConfigGet.mockReturnValue({
      clockType: 12,
      themes: { dark: false, light: true },
    });
    expect(selectors.selectTheme(createState(undefined, 'light-only'))).toBe(
      'light'
    );

    mockConfigGet.mockReturnValue({
      clockType: 12,
      themes: { dark: true, light: false },
    });
    expect(selectors.selectTheme(createState(undefined, 'dark-only'))).toBe(
      'dark'
    );
  });

  it('selects clock type fallback from config', () => {
    expect(selectors.selectClockType(createState(undefined))).toBe(12);
  });

  it('dispatches settings actions', () => {
    const dispatch = jest.fn();
    const unit = {
      unitAbb: 'F',
      unitId: 2,
      unit: 'fahrenheit',
      unitPrecision: 0,
    };

    actions.updateUnits('temperature', unit)(dispatch);
    actions.updateTheme('automatic')(dispatch);
    actions.updateClockType(12)(dispatch);
    actions.updateMapLibrary('maplibre')(dispatch);

    expect(dispatch).toHaveBeenCalledWith({
      type: types.UPDATE_UNITS,
      units: { temperature: unit },
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: types.UPDATE_THEME,
      theme: 'automatic',
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: types.UPDATE_CLOCK_TYPE,
      clockType: 12,
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: types.UPDATE_MAP_LIBRARY,
      library: 'maplibre',
    });
  });
});

const createState = (
  theme: types.Theme | undefined,
  cacheKey = 'default'
) =>
  ({
    settings: {
      clockType: undefined,
      mapLibrary: 'react-native-maps',
      theme,
      units: getDefaultUnits(),
      cacheKey,
    },
  } as any);
