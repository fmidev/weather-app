import React from 'react';
import { Platform } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';

import ParamsBottomSheet from '../../src/components/weather/sheets/ParamsBottomSheet';

const mockConfigGet = jest.fn();
const mockTrackMatomoEvent = jest.fn();
const mockUpdateDisplayParams = jest.fn();
const mockRestoreDefaultDisplayParams = jest.fn();
const mockUpdateShowSingleHourlyForecast = jest.fn();
let mockWeatherLayout = 'vertical';

jest.mock('react-redux', () => ({
  connect: () => (Component: any) => Component,
}));

jest.mock('@store/forecast/selectors', () => ({
  selectDisplayParams: jest.fn(),
  selectShowSingleHourlyForecast: jest.fn(),
}));

jest.mock('@store/settings/selectors', () => ({
  selectUnits: jest.fn(),
}));

jest.mock('@store/forecast/actions', () => ({
  updateDisplayParams: (...args: any[]) => mockUpdateDisplayParams(...args),
  restoreDefaultDisplayParams: (...args: any[]) =>
    mockRestoreDefaultDisplayParams(...args),
  updateShowSingleHourlyForecast: (...args: any[]) =>
    mockUpdateShowSingleHourlyForecast(...args),
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children, ...props }: any) => {
    const { View } = require('react-native');
    return <View {...props}>{children}</View>;
  },
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
    jest.replaceProperty(Platform, 'OS', 'android');
    mockConfigGet.mockReset();
    mockTrackMatomoEvent.mockClear();
    mockUpdateDisplayParams.mockClear();
    mockRestoreDefaultDisplayParams.mockClear();
    mockUpdateShowSingleHourlyForecast.mockClear();
    mockWeatherLayout = 'vertical';

    jest
      .spyOn(require('react-native'), 'useWindowDimensions')
      .mockReturnValue({ width: 390, height: 800, fontScale: 1, scale: 1 });

    mockConfigGet.mockImplementation((key: string) => {
      if (key === 'weather') {
        return {
          layout: mockWeatherLayout,
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
        showSingleHourlyForecast={false}
        updateShowSingleHourlyForecast={
          mockUpdateShowSingleHourlyForecast as any
        }
        units={
          {
            precipitation: { unitAbb: 'mm' },
            pressure: { unitAbb: 'hPa' },
            temperature: { unitAbb: 'C' },
            wind: { unitAbb: 'm/s' },
          } as any
        }
        onClose={onClose}
      />
    );

    expect(view.getByTestId('weather_params_bottom_sheet')).toBeTruthy();
    expect(view.getByText('paramsBottomSheet.title')).toBeTruthy();
    expect(view.getByText('paramsBottomSheet.otherSettingsTitle')).toBeTruthy();
    expect(
      view.getByText('paramsBottomSheet.temperature:unitAbbreviations:C')
    ).toBeTruthy();
    expect(
      view.getByText(
        'paramsBottomSheet.windSpeedMSwindDirection:unitAbbreviations:m/s'
      )
    ).toBeTruthy();
    expect(
      view.getByText('paramsBottomSheet.dayLength:unitAbbreviations:null')
    ).toBeTruthy();

    fireEvent.press(
      view.getByTestId('weather_params_bottom_sheet_close_button')
    );

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('updates parameter switch, tracks event and restores defaults', () => {
    const view = render(
      <ParamsBottomSheet
        displayParams={[[0, 'temperature']] as any}
        updateDisplayParams={mockUpdateDisplayParams as any}
        restoreDefaultDisplayParams={mockRestoreDefaultDisplayParams as any}
        showSingleHourlyForecast={false}
        updateShowSingleHourlyForecast={
          mockUpdateShowSingleHourlyForecast as any
        }
        units={
          {
            precipitation: { unitAbb: 'mm' },
            pressure: { unitAbb: 'hPa' },
            temperature: { unitAbb: 'C' },
            wind: { unitAbb: 'm/s' },
          } as any
        }
        onClose={jest.fn()}
      />
    );

    const windSwitch = view.getByA11yLabel(
      'paramsBottomSheet.windSpeedMSwindDirection:unitAbbreviations:m/s'
    );
    expect(windSwitch.props.accessibilityRole).toBe('switch');
    expect(windSwitch.props.accessibilityState).toEqual({
      checked: false,
      disabled: false,
    });
    expect(windSwitch.props.accessibilityHint).toBe(
      'paramsBottomSheet.selectAccessibilityHint'
    );
    fireEvent.press(windSwitch);

    expect(mockTrackMatomoEvent).toHaveBeenCalledWith(
      'User action',
      'Weather',
      'Forecast parameter windSpeedMSwindDirection - ON'
    );
    expect(mockUpdateDisplayParams).toHaveBeenCalledWith([
      1,
      'windSpeedMSwindDirection',
    ]);

    view.rerender(
      <ParamsBottomSheet
        displayParams={[[0, 'temperature'], [1, 'windSpeedMSwindDirection']] as any}
        updateDisplayParams={mockUpdateDisplayParams as any}
        restoreDefaultDisplayParams={mockRestoreDefaultDisplayParams as any}
        showSingleHourlyForecast={false}
        updateShowSingleHourlyForecast={mockUpdateShowSingleHourlyForecast as any}
        units={
          {
            precipitation: { unitAbb: 'mm' },
            pressure: { unitAbb: 'hPa' },
            temperature: { unitAbb: 'C' },
            wind: { unitAbb: 'm/s' },
          } as any
        }
        onClose={jest.fn()}
      />
    );
    expect(windSwitch.props.accessibilityState.checked).toBe(true);
    expect(windSwitch.props.accessibilityHint).toBe(
      'paramsBottomSheet.unSelectAccessibilityHint'
    );
    fireEvent.press(windSwitch);
    expect(mockUpdateDisplayParams).toHaveBeenCalledTimes(2);
    expect(mockUpdateDisplayParams).toHaveBeenLastCalledWith([
      1,
      'windSpeedMSwindDirection',
    ]);
    expect(mockTrackMatomoEvent).toHaveBeenLastCalledWith(
      'User action',
      'Weather',
      'Forecast parameter windSpeedMSwindDirection - OFF'
    );

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
        showSingleHourlyForecast={false}
        updateShowSingleHourlyForecast={
          mockUpdateShowSingleHourlyForecast as any
        }
        units={
          {
            precipitation: { unitAbb: 'mm' },
            pressure: { unitAbb: 'hPa' },
            temperature: { unitAbb: 'C' },
            wind: { unitAbb: 'm/s' },
          } as any
        }
        onClose={jest.fn()}
      />
    );

    const temperatureSwitch = view.getByA11yLabel(
      'paramsBottomSheet.temperature:unitAbbreviations:C'
    );

    expect(temperatureSwitch.props.accessibilityState).toEqual({
      checked: true,
      disabled: true,
    });
    fireEvent.press(temperatureSwitch);
    expect(mockUpdateDisplayParams).not.toHaveBeenCalled();
    expect(mockTrackMatomoEvent).not.toHaveBeenCalled();
  });

  it('updates the single hourly forecast setting and tracks the event', () => {
    const view = render(
      <ParamsBottomSheet
        displayParams={[[0, 'temperature']] as any}
        updateDisplayParams={mockUpdateDisplayParams as any}
        restoreDefaultDisplayParams={mockRestoreDefaultDisplayParams as any}
        showSingleHourlyForecast={false}
        updateShowSingleHourlyForecast={
          mockUpdateShowSingleHourlyForecast as any
        }
        units={
          {
            precipitation: { unitAbb: 'mm' },
            pressure: { unitAbb: 'hPa' },
            temperature: { unitAbb: 'C' },
            wind: { unitAbb: 'm/s' },
          } as any
        }
        onClose={jest.fn()}
      />
    );

    const hourlySwitch = view.getByA11yLabel(
      'paramsBottomSheet.showSingleHourlyForecast'
    );
    expect(hourlySwitch.props.accessibilityRole).toBe('switch');
    expect(hourlySwitch.props.accessibilityState.checked).toBe(false);
    fireEvent.press(hourlySwitch);

    expect(mockUpdateShowSingleHourlyForecast).toHaveBeenCalledWith(true);
    expect(mockTrackMatomoEvent).toHaveBeenCalledWith(
      'User action',
      'Weather',
      'Show single hourly forecast - ON'
    );
  });

  it('hides the other settings section outside the vertical layout', () => {
    mockWeatherLayout = 'default';

    const view = render(
      <ParamsBottomSheet
        displayParams={[[0, 'temperature']] as any}
        updateDisplayParams={mockUpdateDisplayParams as any}
        restoreDefaultDisplayParams={mockRestoreDefaultDisplayParams as any}
        showSingleHourlyForecast={false}
        updateShowSingleHourlyForecast={
          mockUpdateShowSingleHourlyForecast as any
        }
        units={
          {
            precipitation: { unitAbb: 'mm' },
            pressure: { unitAbb: 'hPa' },
            temperature: { unitAbb: 'C' },
            wind: { unitAbb: 'm/s' },
          } as any
        }
        onClose={jest.fn()}
      />
    );

    expect(view.queryByText('paramsBottomSheet.otherSettingsTitle')).toBeNull();
    expect(view.queryByTestId('show_single_hourly_forecast_switch')).toBeNull();
  });
});
