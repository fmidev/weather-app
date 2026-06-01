import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import ObservationStationListBottomSheet from '../../src/components/weather/sheets/ObservationStationListBottomSheet';

const mockSetStationId = jest.fn();
const mockTrackMatomoEvent = jest.fn();

jest.mock('react-redux', () => ({
  connect: () => (Component: any) => Component,
}));

jest.mock('@store/observation/selector', () => ({
  selectDataId: jest.fn(),
  selectStationList: jest.fn(),
  selectStationId: jest.fn(),
}));

jest.mock('@store/observation/actions', () => ({
  setStationId: (...args: any[]) => mockSetStationId(...args),
}));

jest.mock('react-native-gesture-handler', () => ({
  ScrollView: ({ children }: any) => {
    const { ScrollView: RNScrollView } = require('react-native');
    return <RNScrollView>{children}</RNScrollView>;
  },
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({
    left: 6,
    right: 4,
    top: 0,
    bottom: 0,
  }),
}));

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    colors: {
      primary: '#0055aa',
      text: '#111111',
    },
  }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en' },
  }),
}));

jest.mock('@utils/helpers', () => ({
  toStringWithDecimal: (value: number, separator: string) =>
    value.toFixed(1).replace('.', separator),
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
  default: ({ onPress, accessibilityLabel }: any) => {
    const { Pressable, Text } = require('react-native');
    return (
      <Pressable accessibilityLabel={accessibilityLabel} onPress={onPress}>
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

describe('ObservationStationListBottomSheet', () => {
  beforeEach(() => {
    mockSetStationId.mockClear();
    mockTrackMatomoEvent.mockClear();
  });

  it('renders stations, selection state and closes from close button', () => {
    const onClose = jest.fn();
    const view = render(
      <ObservationStationListBottomSheet
        dataId="obs-1"
        stationId="station-1"
        setStationId={mockSetStationId as any}
        stationList={[
          { id: 'station-1', name: 'Selected station', distance: 1.24 },
          { id: 'station-2', name: 'Other station', distance: 3.56 },
        ] as any}
        onClose={onClose}
      />
    );

    expect(view.getByText('observation:observationStation')).toBeTruthy();
    expect(
      view.getByText('Selected station – observation:distance 1.2 km')
    ).toBeTruthy();
    expect(
      view.getByText('Other station – observation:distance 3.6 km')
    ).toBeTruthy();
    expect(view.getByTestId('icon-radio-button-on')).toBeTruthy();
    expect(view.getByTestId('icon-radio-button-off')).toBeTruthy();

    fireEvent.press(
      view.getByLabelText('observation:closeSelectStationAcessibilityLabel')
    );

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('selects a different station but ignores the current station', () => {
    const onClose = jest.fn();
    const view = render(
      <ObservationStationListBottomSheet
        dataId="obs-1"
        stationId="station-1"
        setStationId={mockSetStationId as any}
        stationList={[
          { id: 'station-1', name: 'Selected station', distance: 1.2 },
          { id: 'station-2', name: 'Other station', distance: 3.5 },
        ] as any}
        onClose={onClose}
      />
    );

    fireEvent.press(
      view.getByLabelText('Selected station – observation:distance 1.2 km')
    );

    expect(mockSetStationId).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.press(
      view.getByLabelText('Other station – observation:distance 3.5 km')
    );

    expect(mockTrackMatomoEvent).toHaveBeenCalledWith(
      'User action',
      'Weather',
      'Select observation station'
    );
    expect(mockSetStationId).toHaveBeenCalledWith('obs-1', 'station-2');
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
