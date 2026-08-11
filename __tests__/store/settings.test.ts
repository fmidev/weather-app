import reducer, {
  generateSessionId,
  settingsPersist,
} from '@store/settings/reducer';
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
        {
          units,
          theme: 'automatic',
          clockType: 24,
          mapLibrary: 'react-native-maps',
          sessionId: 123,
          isRunningOnMac: false,
        },
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
      sessionId: 123,
      isRunningOnMac: false,
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
      sessionId: expect.any(Number),
      isRunningOnMac: false,
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
      sessionId: expect.any(Number),
      isRunningOnMac: false,
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
      sessionId: expect.any(Number),
      isRunningOnMac: false,
    });
  });

  it('should handle SET_IS_RUNNING_ON_MAC', () => {
    expect(
      reducer(undefined, {
        type: types.SET_IS_RUNNING_ON_MAC,
        isRunningOnMac: true,
      }).isRunningOnMac
    ).toBe(true);
  });

  it('selects explicitly stored settings', () => {
    const state = {
      settings: {
        clockType: 24,
        mapLibrary: 'maplibre',
        theme: 'dark',
        sessionId: 456,
        isRunningOnMac: true,
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
    expect(selectors.selectSessionId(state)).toBe(456);
    expect(selectors.selectIsRunningOnMac(state)).toBe(true);
  });

  it('generates a session id within the allowed range', () => {
    const randomSpy = jest
      .spyOn(Math, 'random')
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0.999999999);

    expect(generateSessionId()).toBe(1);
    expect(generateSessionId()).toBe(10_000_000);

    randomSpy.mockRestore();
  });

  it('initializes one session id for the store session', () => {
    const initialState = reducer(undefined, {} as types.SettingsActionTypes);
    const nextInitialState = reducer(
      undefined,
      {} as types.SettingsActionTypes
    );

    expect(initialState.sessionId).toBeGreaterThanOrEqual(1);
    expect(initialState.sessionId).toBeLessThanOrEqual(10_000_000);
    expect(nextInitialState.sessionId).toBe(initialState.sessionId);
  });

  it('does not persist the session id', () => {
    expect(settingsPersist.whitelist).not.toContain('sessionId');
  });

  it('does not persist the runtime platform value', () => {
    expect(settingsPersist.whitelist).not.toContain('isRunningOnMac');
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
    actions.setIsRunningOnMac(true)(dispatch);

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
    expect(dispatch).toHaveBeenCalledWith({
      type: types.SET_IS_RUNNING_ON_MAC,
      isRunningOnMac: true,
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
