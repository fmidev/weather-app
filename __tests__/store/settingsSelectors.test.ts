import { selectForecastBackgroundImages } from '@store/settings/selectors';
import type { State } from '@store/types';

jest.mock('@config', () => ({ Config: { get: jest.fn() } }));

describe('selectForecastBackgroundImages', () => {
  it.each([true, false])(
    'selects the stored background images value %s',
    (enabled) => {
      const state = {
        settings: { forecastBackgroundImages: enabled },
      } as State;

      expect(selectForecastBackgroundImages(state)).toBe(enabled);
    }
  );
});
