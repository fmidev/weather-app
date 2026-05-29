import React from 'react';
import { Switch } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';

import ParamsBottomSheet from '../../src/components/weather/sheets/ParamsBottomSheet';

const mockConfigGet = jest.fn();
const mockTrackMatomoEvent = jest.fn();
const mockUpdateDisplayParams = jest.fn();
const mockRestoreDefaultDisplayParams = jest.fn();

jest.mock('react-redux', () => ({
  connect: () => (Component: any) => Component,
}));

jest.mock('@store/forecast/selectors', () => ({
  selectDisplayParams: jest.fn(),
}));

jest.mock('@store/settings/selectors', () => ({
  selectUnits: jest.fn(),
}));

jest.mock('@store/forecast/actions', () => ({
  updateDisplayParams: (...args: any[]) => mockUpdateDisplayParams(...args),
  restoreDefaultDisplayParams: (...args: any[]) =>
    mockRestoreDefaultDisplayParams(...args),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({
    left: 5,
    right: 7,
    top: 0,
    bottom: 0,
  }),
}));

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    colors: {
      border: '#cccccc',
      hourListText: '#111111',
      primaryText: '#222222',
    },
  }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) =>
      options?.unit ? `${key}:${options.unit}` : key,
  }),
}));

jest.mock('@utils/hooks', () => ({
  useOrientation: () => false,
}));

jest.mock('@utils/matomo', () => ({
  trackMatomoEvent: (...args: any[]) => mockTrackMatomoEvent(...args),
}));

jest.mock('@components/common/AppText', () => ({
  __esModule: true,
  default: ({ children, ...props }: any) => {
    const { Text } = require('react-native');
    return <Text {...props}>{children}</Text>;
  },
}));

jest.mock('@components/common/CloseButton', () => ({
  __esModule: true,
  default: ({ onPress, testID, accessibilityLabel }: any) => {
    const { Pressable, Text } = require('react-native');
    return (
      <Pressable
        testID={testID}
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}>
        <Text>close</Text>
      </Pressable>
    );
  },
}));

jest.mock('@components/common/AccessibleTouchableOpacity', () => ({
  __esModule: true,
  default: ({ children, onPress, ...props }: any) => {
    const { Pressable } = require('react-native');
    return (
      <Pressable onPress={onPress} {...props}>
        {children}
      </Pressable>
    );
  },
}));

jest.mock('@assets/Icon', () => ({
  __esModule: true,
  default: ({ name }: any) => {
    const { Text } = require('react-native');
    return <Text testID={`icon-${name}`}>{name}</Text>;
  },
}));

jest.mock('@config', () => ({
  Config: {
    get: (...args: any[]) => mockConfigGet(...args),
  },
}));

describe('ParamsBottomSheet', () => {
  beforeEach(() => {
    mockConfigGet.mockReset();
    mockTrackMatomoEvent.mockClear();
    mockUpdateDisplayParams.mockClear();
    mockRestoreDefaultDisplayParams.mockClear();

    jest
      .spyOn(require('react-native'), 'useWindowDimensions')
      .mockReturnValue({ width: 390, height: 800, fontScale: 1, scale: 1 });

    mockConfigGet.mockImplementation((key: string) => {
      if (key === 'weather') {
        return {
          forecast: {
            excludeDayLength: false,
            data: [
              {
                parameters: [
                  'temperature',
                  'windSpeedMS',
                  'windDirection',
                  'precipitation1h',
                  'pressure',
                  'uvCumulated',
                ],
              },
            ],
          },
        };
      }
      return {
        units: {
          precipitation: 'mm',
          pressure: 'hPa',
          temperature: 'C',
          wind: 'm/s',
        },
      };
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders active parameter switches and closes from close button', () => {
    const onClose = jest.fn();
    const view = render(
      <ParamsBottomSheet
        displayParams={[[0, 'temperature']] as any}
        updateDisplayParams={mockUpdateDisplayParams as any}
        restoreDefaultDisplayParams={mockRestoreDefaultDisplayParams as any}
        units={{
          precipitation: { unitAbb: 'mm' },
          pressure: { unitAbb: 'hPa' },
          temperature: { unitAbb: 'C' },
          wind: { unitAbb: 'm/s' },
        } as any}
        onClose={onClose}
      />
    );

    expect(view.getByTestId('weather_params_bottom_sheet')).toBeTruthy();
    expect(view.getByText('paramsBottomSheet.title')).toBeTruthy();
    expect(
      view.getByText('paramsBottomSheet.temperature:unitAbbreviations:C')
    ).toBeTruthy();
    expect(
      view.getByText('paramsBottomSheet.windSpeedMSwindDirection:unitAbbreviations:m/s')
    ).toBeTruthy();
    expect(view.getByText('paramsBottomSheet.dayLength:unitAbbreviations:null')).toBeTruthy();

    fireEvent.press(view.getByTestId('weather_params_bottom_sheet_close_button'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('updates parameter switch, tracks event and restores defaults', () => {
    const view = render(
      <ParamsBottomSheet
        displayParams={[[0, 'temperature']] as any}
        updateDisplayParams={mockUpdateDisplayParams as any}
        restoreDefaultDisplayParams={mockRestoreDefaultDisplayParams as any}
        units={{
          precipitation: { unitAbb: 'mm' },
          pressure: { unitAbb: 'hPa' },
          temperature: { unitAbb: 'C' },
          wind: { unitAbb: 'm/s' },
        } as any}
        onClose={jest.fn()}
      />
    );

    fireEvent(
      view.getByTestId('weather_params_switch_windSpeedMSwindDirection'),
      'valueChange'
    );

    expect(mockTrackMatomoEvent).toHaveBeenCalledWith(
      'User action',
      'Weather',
      'Forecast parameter windSpeedMSwindDirection - ON'
    );
    expect(mockUpdateDisplayParams).toHaveBeenCalledWith([
      1,
      'windSpeedMSwindDirection',
    ]);

    fireEvent.press(view.getByTestId('weather_params_restore_button'));

    expect(mockTrackMatomoEvent).toHaveBeenCalledWith(
      'User action',
      'Weather',
      'Restore default parameters'
    );
    expect(mockRestoreDefaultDisplayParams).toHaveBeenCalledTimes(1);
  });

  it('disables the last selected parameter switch', () => {
    const view = render(
      <ParamsBottomSheet
        displayParams={[[0, 'temperature']] as any}
        updateDisplayParams={mockUpdateDisplayParams as any}
        restoreDefaultDisplayParams={mockRestoreDefaultDisplayParams as any}
        units={{
          precipitation: { unitAbb: 'mm' },
          pressure: { unitAbb: 'hPa' },
          temperature: { unitAbb: 'C' },
          wind: { unitAbb: 'm/s' },
        } as any}
        onClose={jest.fn()}
      />
    );

    const switches = view.UNSAFE_getAllByType(Switch);
    const temperatureSwitch = switches.find(
      (item) => item.props.testID === 'weather_params_switch_temperature'
    );

    expect(temperatureSwitch?.props.disabled).toBe(true);
  });
});
