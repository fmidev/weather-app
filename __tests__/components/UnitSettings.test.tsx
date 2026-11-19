import React from 'react';
import { fireEvent, render, within } from '@testing-library/react-native';
import { createInstance } from 'i18next';
import { I18nextProvider } from 'react-i18next';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import UnitSettings from '../../src/components/settings/UnitSettings';
import { trackMatomoEvent } from '../../src/utils/matomo';

const mockSheetOpen = jest.fn();
const mockSheetClose = jest.fn();
const mockExcludeUnits = ['F'];

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children, ...props }: any) => {
    const { View } = require('react-native');
    return <View {...props}>{children}</View>;
  },
}));

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    colors: {
      background: '#ffffff',
      border: '#dddddd',
      text: '#111111',
    },
  }),
}));

jest.mock('../../src/utils/matomo', () => ({
  trackMatomoEvent: jest.fn(),
}));

jest.mock('@config', () => ({
  Config: {
    get: jest.fn(() => ({
      excludeUnits: mockExcludeUnits,
    })),
  },
}));

jest.mock('@components/common/ScalableIcon', () => ({
  __esModule: true,
  default: ({ name }: any) => {
    const { Text } = require('react-native');
    return <Text testID={`icon-${name}`}>{name}</Text>;
  },
}));

jest.mock('@components/common/BottomSheet', () => {
  const ReactActual = require('react');
  const { View } = require('react-native');

  return {
    __esModule: true,
    default: ReactActual.forwardRef(({ children }: any, ref: any) => {
      ReactActual.useImperativeHandle(ref, () => ({
        open: mockSheetOpen,
        close: mockSheetClose,
      }));
      return <View testID="rb-sheet">{children}</View>;
    }),
  };
});

describe('UnitSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockExcludeUnits.splice(0, mockExcludeUnits.length, 'F');
  });

  it('renders unit settings and selects allowed unit types', () => {
    const onChangeUnits = jest.fn();
    const units = {
      temperature: {
        unitId: 1,
        unitAbb: 'C',
        unit: 'celsius',
        unitPrecision: 0,
      },
      precipitationIntensity: {
        unitId: 1,
        unitAbb: 'mm/h',
        unit: 'millimeters per hour',
        unitPrecision: 1,
      },
      wind: {
        unitId: 1,
        unitAbb: 'm/s',
        unit: 'meters per second',
        unitPrecision: 0,
      },
    };

    const { getByTestId, queryByTestId, UNSAFE_getAllByType: getAllByType } = render(
      <UnitSettings units={units} onChangeUnits={onChangeUnits} />
    );

    expect(getByTestId('settings_units_header')).toBeTruthy();
    expect(queryByTestId('settings_set_precipitationIntensity')).toBeNull();
    expect(queryByTestId('settings_units_temperature_fahrenheit')).toBeNull();
    const safeAreaContainers = getAllByType(SafeAreaView);
    expect(safeAreaContainers).toHaveLength(2);
    safeAreaContainers.forEach((container) => {
      expect(container.props.edges).toEqual(['left', 'right']);
      expect(container.findByType(ScrollView).props.testID).toBe('unit_sheet_container');
    });

    fireEvent.press(getByTestId('settings_set_temperature'));
    expect(mockSheetOpen).toHaveBeenCalledTimes(1);

    fireEvent.press(getByTestId('settings_units_wind_kilometers per hour'));

    expect(trackMatomoEvent).toHaveBeenCalledWith(
      'User action',
      'Settings',
      'Select unit - wind (km/h)'
    );
    expect(onChangeUnits).toHaveBeenCalledWith('wind', {
      unitId: 2,
      unitAbb: 'km/h',
      unit: 'kilometers per hour',
      unitPrecision: 0,
    });
    expect(mockSheetClose).toHaveBeenCalledTimes(1);
  });

  describe('unit abbreviation translations', () => {
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
      wind: {
        unitId: 1,
        unitAbb: 'm/s',
        unit: 'meters per second',
        unitPrecision: 0,
      },
      pressure: {
        unitId: 1,
        unitAbb: 'hPa',
        unit: 'hehtopascal',
        unitPrecision: 0,
      },
    };

    const renderWithTranslations = async (
      translations: Record<string, string>
    ) => {
      const i18n = createInstance();
      await i18n.init({
        lng: 'sv',
        fallbackLng: false,
        resources: { sv: { unitAbbreviations: translations } },
      });
      const onChangeUnits = jest.fn();
      const view = render(
        <I18nextProvider i18n={i18n}>
          <UnitSettings units={units} onChangeUnits={onChangeUnits} />
        </I18nextProvider>
      );
      return { ...view, onChangeUnits };
    };

    beforeEach(() => {
      mockExcludeUnits.length = 0;
    });

    it.each([
      ['temperature_celsius', 'C', 'Celsius', '°Celsius'],
      ['temperature_fahrenheit', 'F', 'Fahrenheit', '°Fahrenheit'],
      ['precipitation_inch', 'in', 'tum', 'tum'],
      ['wind_kilometers per hour', 'km/h', 'km/t', 'km/t'],
      ['pressure_millimeter of mercury', 'mmHg', 'mm Hg', 'mm Hg'],
    ])(
      'renders translated text and accessibility label for %s',
      async (option, abbreviation, translation, expectedLabel) => {
        const view = await renderWithTranslations({
          [abbreviation]: translation,
        });
        const row = within(view.getByTestId(`settings_units_${option}`));

        expect(row.getByText(expectedLabel)).toBeTruthy();
        expect(row.getByLabelText(expectedLabel)).toBeTruthy();
      }
    );

    it('falls back to the original abbreviations when translations are missing', async () => {
      const view = await renderWithTranslations({});

      [
        ['temperature_celsius', '°C'],
        ['temperature_fahrenheit', '°F'],
        ['precipitation_millimeter', 'mm'],
        ['precipitation_inch', 'in'],
        ['wind_meters per second', 'm/s'],
        ['wind_kilometers per hour', 'km/h'],
        ['wind_miles per hour', 'mph'],
        ['wind_beaufort', 'bft'],
        ['wind_knot', 'kn'],
        ['pressure_hehtopascal', 'hPa'],
        ['pressure_inch of mercury', 'inHg'],
        ['pressure_millimeter of mercury', 'mmHg'],
        ['pressure_millibar', 'mbar'],
      ].forEach(([option, expectedLabel]) => {
        const row = within(view.getByTestId(`settings_units_${option}`));

        expect(row.getByText(expectedLabel)).toBeTruthy();
        expect(row.getByLabelText(expectedLabel)).toBeTruthy();
      });
    });

    it('selects a translated option using the original unit data', async () => {
      const view = await renderWithTranslations({ 'km/h': 'km/t' });

      fireEvent.press(view.getByText('km/t'));

      expect(view.onChangeUnits).toHaveBeenCalledWith('wind', {
        unitId: 2,
        unitAbb: 'km/h',
        unit: 'kilometers per hour',
        unitPrecision: 0,
      });
      expect(trackMatomoEvent).toHaveBeenCalledWith(
        'User action',
        'Settings',
        'Select unit - wind (km/h)'
      );
      expect(mockSheetClose).toHaveBeenCalledTimes(1);
    });
  });
});
