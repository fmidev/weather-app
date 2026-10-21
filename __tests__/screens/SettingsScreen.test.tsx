import './screenTestMocks';

import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

import SettingsScreen from '../../src/screens/SettingsScreen';
import defaultConfig from '../../defaultConfig';
import {
  mockChangeLanguage,
  mockInitMatomo,
  mockPermissionsCheckMultiple,
  mockSetItem,
  resetScreenMocks,
} from './screenTestMocks';

const originalBackgroundImagesEnabled =
  defaultConfig.weather.backgroundImagesEnabled;

const createProps = (forecastBackgroundImages = true) => ({
  clockType: 24,
  geoids: [0, 123, 456],
  mapLibrary: 'react-native-maps',
  theme: 'light',
  forecastBackgroundImages,
  units: {
    temperature: { unit: 'celsius', unitAbb: 'C', unitId: 1 },
  },
  updateClockType: jest.fn(),
  updateLocationsLocales: jest.fn(),
  updateMapLibrary: jest.fn(),
  updateTheme: jest.fn(),
  updateUnits: jest.fn(),
  updateForecastBackgroundImages: jest.fn(),
});

describe('SettingsScreen', () => {
  beforeEach(() => {
    resetScreenMocks();
  });

  afterEach(() => {
    defaultConfig.weather.backgroundImagesEnabled =
      originalBackgroundImagesEnabled;
  });

  it('renders settings and dispatches language, theme and clock changes', async () => {
    const props = createProps();

    const { getByTestId, getByText } = render(
      <SettingsScreen {...(props as any)} />
    );

    expect(getByTestId('settings_scrollview')).toBeTruthy();
    expect(mockPermissionsCheckMultiple).toHaveBeenCalled();

    fireEvent.press(getByTestId('settings_set_language_fi'));
    await waitFor(() =>
      expect(mockSetItem).toHaveBeenCalledWith('locale', 'fi')
    );
    expect(mockChangeLanguage).toHaveBeenCalledWith('fi');
    expect(props.updateLocationsLocales).toHaveBeenCalledWith([123, 456]);
    expect(mockInitMatomo).toHaveBeenCalledTimes(1);

    fireEvent.press(getByTestId('settings_set_theme_dark'));
    expect(props.updateTheme).toHaveBeenCalledWith('dark');

    fireEvent.press(getByText('12-hour-clock'));
    expect(props.updateClockType).toHaveBeenCalledWith(12);
  });

  it.each([
    { configured: true, images: true },
    { configured: undefined, images: true },
    { configured: true, images: false },
  ])(
    'shows background settings last and forwards changes with config $configured and images $images',
    async ({ configured, images }) => {
      defaultConfig.weather.backgroundImagesEnabled = configured;
      const props = createProps(images);
      const { getByTestId, getAllByA11yRole } = render(
        <SettingsScreen {...(props as any)} />
      );

      await waitFor(() =>
        expect(mockPermissionsCheckMultiple).toHaveBeenCalled()
      );

      const headers = getAllByA11yRole('header');
      expect(headers[headers.length - 1].props.children).toBe(
        'settings:forecastBackground'
      );
      expect(
        getByTestId('settings_set_forecast_background_image').props
          .accessibilityState.selected
      ).toBe(images);
      expect(
        getByTestId('settings_set_forecast_background_gradient').props
          .accessibilityState.selected
      ).toBe(!images);

      fireEvent.press(
        getByTestId(
          `settings_set_forecast_background_${images ? 'gradient' : 'image'}`
        )
      );

      expect(props.updateForecastBackgroundImages).toHaveBeenCalledTimes(1);
      expect(props.updateForecastBackgroundImages).toHaveBeenCalledWith(
        !images
      );
    }
  );

  it('hides background settings when default config disables background images', async () => {
    defaultConfig.weather.backgroundImagesEnabled = false;
    const props = createProps();
    const { queryByTestId } = render(<SettingsScreen {...(props as any)} />);

    await waitFor(() =>
      expect(mockPermissionsCheckMultiple).toHaveBeenCalled()
    );

    expect(queryByTestId('settings_forecast_background_header')).toBeNull();
    expect(queryByTestId('settings_set_forecast_background_image')).toBeNull();
    expect(
      queryByTestId('settings_set_forecast_background_gradient')
    ).toBeNull();
    expect(props.updateForecastBackgroundImages).not.toHaveBeenCalled();
  });
});
