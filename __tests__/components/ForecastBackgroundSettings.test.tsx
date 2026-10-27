import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import ForecastBackgroundSettings from '../../src/components/settings/ForecastBackgroundSettings';
import { trackMatomoEvent } from '../../src/utils/matomo';

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({ colors: { border: '#dddddd', text: '#111111' } }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('../../src/utils/matomo', () => ({ trackMatomoEvent: jest.fn() }));

jest.mock('@components/common/ScalableIcon', () => ({
  __esModule: true,
  default: ({ name }: any) => {
    const { Text } = require('react-native');
    return <Text testID={`icon-${name}`}>{name}</Text>;
  },
}));

describe('ForecastBackgroundSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each([true, false])(
    'shows the selected background and tracks a change from images=%s',
    (enabled) => {
      const updateForecastBackgroundImages = jest.fn();
      const { getByTestId, getByText, rerender, getAllByTestId } = render(
        <ForecastBackgroundSettings
          forecastBackgroundImages={enabled}
          updateForecastBackgroundImages={updateForecastBackgroundImages}
        />
      );
      const selected = enabled ? 'image' : 'gradient';
      const next = enabled ? 'gradient' : 'image';

      expect(getByText('settings:forecastBackground')).toBeTruthy();
      expect(
        getByTestId(`settings_set_forecast_background_${selected}`).props
          .accessibilityState.selected
      ).toBe(true);
      expect(
        getByTestId(`settings_set_forecast_background_${next}`).props
          .accessibilityState.selected
      ).toBe(false);
      expect(getAllByTestId('icon-checkmark')).toHaveLength(1);

      fireEvent.press(
        getByTestId(`settings_set_forecast_background_${selected}`)
      );
      expect(updateForecastBackgroundImages).not.toHaveBeenCalled();
      expect(trackMatomoEvent).not.toHaveBeenCalled();

      fireEvent.press(getByTestId(`settings_set_forecast_background_${next}`));
      expect(updateForecastBackgroundImages).toHaveBeenCalledWith(!enabled);
      expect(trackMatomoEvent).toHaveBeenCalledWith(
        'User action',
        'Settings',
        `Select forecast background - ${next}`
      );

      rerender(
        <ForecastBackgroundSettings
          forecastBackgroundImages={!enabled}
          updateForecastBackgroundImages={updateForecastBackgroundImages}
        />
      );

      expect(
        getByTestId(`settings_set_forecast_background_${next}`).props
          .accessibilityState.selected
      ).toBe(true);
      expect(
        getByTestId(`settings_set_forecast_background_${selected}`).props
          .accessibilityState.selected
      ).toBe(false);
    }
  );
});
