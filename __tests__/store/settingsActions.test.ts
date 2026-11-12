import { updateForecastBackgroundImages } from '@store/settings/actions';
import { UPDATE_FORECAST_BACKGROUND_IMAGES } from '@store/settings/types';

describe('updateForecastBackgroundImages', () => {
  it.each([true, false])(
    'dispatches the selected background images value %s',
    (enabled) => {
      const dispatch = jest.fn();

      updateForecastBackgroundImages(enabled)(dispatch);

      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledWith({
        type: UPDATE_FORECAST_BACKGROUND_IMAGES,
        enabled,
      });
    }
  );
});
