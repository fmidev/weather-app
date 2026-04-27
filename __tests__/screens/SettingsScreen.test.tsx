import './screenTestMocks';

import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

import SettingsScreen from '../../src/screens/SettingsScreen';
import {
  mockChangeLanguage,
  mockInitMatomo,
  mockPermissionsCheckMultiple,
  mockSetItem,
  resetScreenMocks,
} from './screenTestMocks';

describe('SettingsScreen', () => {
  beforeEach(() => {
    resetScreenMocks();
  });

  it('renders settings and dispatches language, theme, clock and map changes', async () => {
    const props = {
      clockType: 24,
      geoids: [0, 123, 456],
      mapLibrary: 'react-native-maps',
      theme: 'light',
      units: {
        temperature: { unit: 'celsius', unitAbb: 'C', unitId: 1 },
      },
      updateClockType: jest.fn(),
      updateLocationsLocales: jest.fn(),
      updateMapLibrary: jest.fn(),
      updateTheme: jest.fn(),
      updateUnits: jest.fn(),
    };

    const { getByTestId, getByText } = render(<SettingsScreen {...props as any} />);

    expect(getByTestId('settings_scrollview')).toBeTruthy();
    expect(mockPermissionsCheckMultiple).toHaveBeenCalled();

    fireEvent.press(getByTestId('settings_set_language_fi'));
    await waitFor(() => expect(mockSetItem).toHaveBeenCalledWith('locale', 'fi'));
    expect(mockChangeLanguage).toHaveBeenCalledWith('fi');
    expect(props.updateLocationsLocales).toHaveBeenCalledWith([123, 456]);
    expect(mockInitMatomo).toHaveBeenCalledTimes(1);

    fireEvent.press(getByTestId('settings_set_theme_dark'));
    expect(props.updateTheme).toHaveBeenCalledWith('dark');

    fireEvent.press(getByText('12-hour-clock'));
    expect(props.updateClockType).toHaveBeenCalledWith(12);

    fireEvent.press(getByText('settings:maplibre'));
    expect(props.updateMapLibrary).toHaveBeenCalledWith('maplibre');
  });
});
