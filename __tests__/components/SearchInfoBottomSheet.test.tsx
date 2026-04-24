import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import SearchInfoBottomSheet from '../../src/components/search/SearchInfoBottomSheet';

const mockTheme = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useTheme: () => mockTheme(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'infoSheet.closeButtonAccessibilityLabel': 'Close search info',
        'infoSheet.saveAndDeleteTitle': 'Save and delete locations',
        'infoSheet.savedLocation': 'Saved location',
        'infoSheet.unsavedLocation': 'Unsaved location',
        'infoSheet.saveHint': 'Tap star to save location',
        'infoSheet.deleteHint': 'Tap star again to remove location',
        'infoSheet.deleteElaboration': 'Removed locations disappear from your favorites list.',
        'infoSheet.locateTitle': 'Use current location',
        'infoSheet.locateHint': 'Use locate button to move to your position',
        'infoSheet.locateElaboration': 'Location permission is required.',
      };
      return translations[key] || key;
    },
  }),
}));

jest.mock('@components/common/CloseButton', () => {
  const { Text, TouchableOpacity } = require('react-native');
  return ({ onPress, testID, accessibilityLabel }: any) => (
    <TouchableOpacity testID={testID} onPress={onPress} accessibilityLabel={accessibilityLabel}>
      <Text>Close</Text>
    </TouchableOpacity>
  );
});

jest.mock('@components/common/ScalableIcon', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, { testID: `icon-${props.name}` }, props.name);
  },
}));

describe('SearchInfoBottomSheet', () => {
  beforeEach(() => {
    mockTheme.mockReset();
  });

  it('renders info sheet content and triggers onClose from close button', () => {
    mockTheme.mockReturnValue({
      dark: false,
      colors: {
        text: '#111111',
        hourListText: '#222222',
        primary: '#0062cc',
        border: '#d9d9d9',
      },
    });

    const onClose = jest.fn();
    const { getByTestId, getByText, getByA11yLabel } = render(
      <SearchInfoBottomSheet onClose={onClose} />
    );

    expect(getByTestId('search_info_bottom_sheet')).toBeTruthy();
    expect(getByText('Save and delete locations')).toBeTruthy();
    expect(getByText('Saved location')).toBeTruthy();
    expect(getByText('Unsaved location')).toBeTruthy();
    expect(getByText('Use current location')).toBeTruthy();

    fireEvent.press(getByTestId('search_info_bottom_sheet_close_button'));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(getByA11yLabel('Close search info')).toBeTruthy();

    expect(getByTestId('icon-star-selected')).toBeTruthy();
    expect(getByTestId('icon-star-unselected')).toBeTruthy();
    expect(getByTestId('icon-info-save-location-light')).toBeTruthy();
    expect(getByTestId('icon-info-delete-location-light')).toBeTruthy();
    expect(getByTestId('icon-info-locate-light')).toBeTruthy();
  });

  it('uses dark variant icons when theme is dark', () => {
    mockTheme.mockReturnValue({
      dark: true,
      colors: {
        text: '#f5f5f5',
        hourListText: '#ebebeb',
        primary: '#71a7ff',
        border: '#555555',
      },
    });

    const { getByTestId } = render(<SearchInfoBottomSheet onClose={() => {}} />);

    expect(getByTestId('icon-info-save-location-dark')).toBeTruthy();
    expect(getByTestId('icon-info-delete-location-dark')).toBeTruthy();
    expect(getByTestId('icon-info-locate-dark')).toBeTruthy();
  });
});
