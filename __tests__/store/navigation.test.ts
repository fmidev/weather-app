import reducer from '@store/navigation/reducer';
import * as selectors from '@store/navigation/selectors';
import * as types from '@store/navigation/types';
import packageJSON from '../../package.json';

const mockConfigGet = jest.fn();

jest.mock('@config', () => ({
  Config: {
    get: (...args: any[]) => mockConfigGet(...args),
  },
}));

describe('navigation store', () => {
  beforeEach(() => {
    mockConfigGet.mockReturnValue({ termsOfUseChanged: false });
  });

  it('handles selected tab and app launch state', () => {
    expect(
      reducer(undefined, {
        type: types.SET_NAVIGATION_TAB,
        tab: 'Map',
      })
    ).toEqual({
      didLaunchApp: false,
      tab: 'Map',
      termsOfUseAccepted: false,
    });

    expect(reducer(undefined, { type: types.SET_DID_LAUNCH_APP })).toEqual({
      didLaunchApp: true,
      tab: 'Weather',
      termsOfUseAccepted: packageJSON.version,
    });
  });

  it('selects tab and launch state', () => {
    const state = {
      navigation: {
        didLaunchApp: true,
        tab: 'Warnings',
        termsOfUseAccepted: packageJSON.version,
      },
    } as any;

    expect(selectors.selectTab(state)).toBe('Warnings');
    expect(selectors.selectInitialTab(state)).toBe('Warnings');
    expect(selectors.selectDidLaunchApp(state)).toBe(true);
    expect(selectors.selectTermsOfUseAccepted(state)).toBe(true);
  });

  it('requires accepting terms again when terms changed after launch', () => {
    mockConfigGet.mockReturnValue({ termsOfUseChanged: true });

    expect(
      selectors.selectTermsOfUseAccepted({
        navigation: {
          didLaunchApp: true,
          tab: 'Weather',
          termsOfUseAccepted: '0.0.1',
        },
      } as any)
    ).toBe(false);
  });
});
