import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import UnitSettings from '../../src/components/settings/UnitSettings';
import { trackMatomoEvent } from '../../src/utils/matomo';

const mockSheetOpen = jest.fn();
const mockSheetClose = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    colors: {
      background: '#ffffff',
      border: '#dddddd',
      text: '#111111',
    },
  }),
}));

jest.mock('react-i18next', () => ({
  initReactI18next: {
    type: '3rdParty',
    init: jest.fn(),
  },
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('../../src/utils/matomo', () => ({
  trackMatomoEvent: jest.fn(),
}));

jest.mock('@config', () => ({
  Config: {
    get: jest.fn(() => ({
      settings: {
        excludeUnits: ['F'],
      },
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

jest.mock('react-native-raw-bottom-sheet', () => {
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

    const { getByTestId, queryByText } = render(
      <UnitSettings units={units} onChangeUnits={onChangeUnits} />
    );

    expect(getByTestId('settings_units_header')).toBeTruthy();
    expect(queryByText('settings:precipitationIntensity')).toBeNull();
    expect(queryByText('F')).toBeNull();

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
});
