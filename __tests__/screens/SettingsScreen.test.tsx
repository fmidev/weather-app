import './screenTestMocks';

import React from 'react';
import { Platform } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

import SettingsScreen from '../../src/screens/SettingsScreen';
import defaultConfig from '../../defaultConfig';
import type { MapLibrary } from '../../src/store/settings/types';
import {
  mockChangeLanguage,
  mockConfigGet,
  mockInitMatomo,
  mockPermissionsCheckMultiple,
  mockSetItem,
  resetScreenMocks,
} from './screenTestMocks';

const originalBackgroundImagesEnabled =
  defaultConfig.weather.backgroundImagesEnabled;

const createProps = ({
  forecastBackgroundImages = true,
  mapLibrary = 'react-native-maps',
}: {
  forecastBackgroundImages?: boolean;
  mapLibrary?: MapLibrary;
} = {}) => ({
  clockType: 24,
  geoids: [0, 123, 456],
  mapLibrary,
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
      const props = createProps({ forecastBackgroundImages: images });
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

  it('hides map library settings when no base map is configured', async () => {
    const props = createProps();
    const { queryByText } = render(<SettingsScreen {...props as any} />);

    await waitFor(() =>
      expect(mockPermissionsCheckMultiple).toHaveBeenCalledTimes(1)
    );

    expect(queryByText('settings:mapLibrary')).toBeNull();
    expect(queryByText('settings:maplibre')).toBeNull();
    expect(queryByText('settings:appleMaps')).toBeNull();
    expect(queryByText('settings:googleMaps')).toBeNull();
    expect(props.updateMapLibrary).not.toHaveBeenCalled();
  });

  it.each<MapLibrary>(['react-native-maps', 'maplibre'])(
    'shows map settings with %s selected and forwards a library change when a base map is configured',
    async (mapLibrary) => {
      const getDefaultConfig = mockConfigGet.getMockImplementation();
      mockConfigGet.mockImplementation((key: string) =>
        key === 'map'
          ? {
              baseMap: {
                url: 'https://maps.example.test/styles/',
                lightStyle: 'light.json',
                darkStyle: 'dark.json',
              },
            }
          : getDefaultConfig?.(key)
      );
      const props = createProps({ mapLibrary });
      const { getByText, getByA11yHint } = render(
        <SettingsScreen {...props as any} />
      );

      await waitFor(() =>
        expect(mockPermissionsCheckMultiple).toHaveBeenCalledTimes(1)
      );

      const nativeMapLabel =
        Platform.OS === 'ios' ? 'settings:appleMaps' : 'settings:googleMaps';
      const nativeMapButton = getByA11yHint(
        `settings:mapLibrarySettingHint ${nativeMapLabel}`
      );
      const maplibreButton = getByA11yHint(
        'settings:mapLibrarySettingHint settings:maplibre'
      );

      expect(getByText('settings:mapLibrary')).toBeTruthy();
      expect(getByText(nativeMapLabel)).toBeTruthy();
      expect(getByText('settings:maplibre')).toBeTruthy();
      expect(nativeMapButton.props.accessibilityState.selected).toBe(
        mapLibrary === 'react-native-maps'
      );
      expect(maplibreButton.props.accessibilityState.selected).toBe(
        mapLibrary === 'maplibre'
      );
      expect(props.updateMapLibrary).not.toHaveBeenCalled();

      fireEvent.press(
        mapLibrary === 'react-native-maps' ? maplibreButton : nativeMapButton
      );

      expect(props.updateMapLibrary).toHaveBeenCalledTimes(1);
      expect(props.updateMapLibrary).toHaveBeenCalledWith(
        mapLibrary === 'react-native-maps' ? 'maplibre' : 'react-native-maps'
      );
    }
  );
});
