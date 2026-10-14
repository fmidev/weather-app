import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import { AccessibilityInfo, Platform, ScrollView } from 'react-native';

import ObservationStationListBottomSheet from '../../src/components/weather/sheets/ObservationStationListBottomSheet';

const mockSetStationId = jest.fn();
const mockTrackMatomoEvent = jest.fn();
const mockMeasureLayout = jest.fn();
const mockSetNativeProps = jest.fn();
const mockStationHandles = new Map<string, any>();

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

jest.mock('@utils/number', () => ({
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
  default: require('react').forwardRef(
    ({ children, onPress, ...props }: any, ref: any) => {
      require('react').useImperativeHandle(ref, () => {
        const handle = {
          measureLayout: mockMeasureLayout,
          setNativeProps: mockSetNativeProps,
          label: props.accessibilityLabel,
        };
        mockStationHandles.set(props.accessibilityLabel, handle);
        return handle;
      }, [props.accessibilityLabel]);
      const { Pressable } = require('react-native');
      return (
        <Pressable onPress={onPress} {...props}>
          {children}
        </Pressable>
      );
    }
  ),
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
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.mocked(AccessibilityInfo.sendAccessibilityEvent).mockClear();
    mockMeasureLayout.mockReset();
    mockMeasureLayout.mockImplementation((_content, onSuccess) =>
      onSuccess(0, 720, 300, 44)
    );
    mockStationHandles.clear();
    mockSetStationId.mockClear();
    mockTrackMatomoEvent.mockClear();
  });

  afterEach(() => jest.useRealTimers());

  it('renders stations, selection state and closes from close button', () => {
    const onClose = jest.fn();
    const view = render(
      <ObservationStationListBottomSheet
        isOpen={false}
        dataId="obs-1"
        stationId="station-1"
        setStationId={mockSetStationId as any}
        stationList={
          [
            { id: 'station-1', name: 'Selected station', distance: 1.24 },
            { id: 'station-2', name: 'Other station', distance: 3.56 },
          ] as any
        }
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
    expect(
      view.getByLabelText(
        'Selected station – observation:distance 1.24 km, 1/2'
      )
    ).toBeTruthy();
    expect(
      view.getByLabelText('Other station – observation:distance 3.56 km, 2/2')
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
        isOpen={false}
        dataId="obs-1"
        stationId="station-1"
        setStationId={mockSetStationId as any}
        stationList={
          [
            { id: 'station-1', name: 'Selected station', distance: 1.2 },
            { id: 'station-2', name: 'Other station', distance: 3.5 },
          ] as any
        }
        onClose={onClose}
      />
    );

    fireEvent.press(
      view.getByLabelText('Selected station – observation:distance 1.2 km, 1/2')
    );

    expect(mockSetStationId).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.press(
      view.getByLabelText('Other station – observation:distance 3.5 km, 2/2')
    );

    expect(mockTrackMatomoEvent).toHaveBeenCalledWith(
      'User action',
      'Weather',
      'Select observation station'
    );
    expect(mockSetStationId).toHaveBeenCalledWith('obs-1', 'station-2');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  const focusProps = {
    dataId: 'obs-1',
    stationId: 'station-2',
    setStationId: mockSetStationId as any,
    stationList: [
      { id: 'station-1', name: 'First station', distance: 1.2 },
      { id: 'station-2', name: 'Selected station', distance: 3.5 },
    ] as any,
    onClose: jest.fn(),
  };

  it('updates station positions and total count when the list changes', () => {
    const view = render(
      <ObservationStationListBottomSheet {...focusProps} isOpen={false} />
    );
    expect(
      view.getByLabelText('Selected station – observation:distance 3.5 km, 2/2')
    ).toBeTruthy();

    view.rerender(
      <ObservationStationListBottomSheet
        {...focusProps}
        stationList={[focusProps.stationList[1]]}
        isOpen={false}
      />
    );
    expect(
      view.getByLabelText('Selected station – observation:distance 3.5 km, 1/1')
    ).toBeTruthy();
  });

  it.each(['android', 'ios'] as const)(
    'requests native view focus before the accessibility event only on Android (%s)',
    (platform) => {
      const originalPlatform = Platform.OS;
      Platform.OS = platform;
      try {
        const view = render(
          <ObservationStationListBottomSheet {...focusProps} isOpen />
        );
        fireEvent(
          view.getByTestId('observation-station-list-content'),
          'layout'
        );
        act(() => jest.advanceTimersByTime(20));

        expect(AccessibilityInfo.sendAccessibilityEvent).toHaveBeenCalledTimes(
          1
        );
        if (platform === 'android') {
          expect(mockSetNativeProps).toHaveBeenCalledTimes(1);
          expect(mockSetNativeProps).toHaveBeenCalledWith({
            hasTVPreferredFocus: true,
          });
          expect(mockSetNativeProps.mock.invocationCallOrder[0]).toBeLessThan(
            jest.mocked(AccessibilityInfo.sendAccessibilityEvent).mock
              .invocationCallOrder[0]
          );
        } else {
          expect(mockSetNativeProps).not.toHaveBeenCalled();
        }
      } finally {
        Platform.OS = originalPlatform;
      }
    }
  );

  it('waits for opening and layout, scrolls to the selected station and then focuses it', () => {
    const view = render(
      <ObservationStationListBottomSheet {...focusProps} isOpen={false} />
    );
    const scroll = view.UNSAFE_getByType(ScrollView).instance;
    expect(AccessibilityInfo.sendAccessibilityEvent).not.toHaveBeenCalled();

    fireEvent(view.getByTestId('observation-station-list-content'), 'layout');
    expect(mockMeasureLayout).not.toHaveBeenCalled();
    view.rerender(<ObservationStationListBottomSheet {...focusProps} isOpen />);

    expect(scroll.scrollTo).toHaveBeenCalledWith({ y: 720, animated: false });
    expect(AccessibilityInfo.sendAccessibilityEvent).not.toHaveBeenCalled();
    act(() => jest.advanceTimersByTime(20));
    expect(AccessibilityInfo.sendAccessibilityEvent).toHaveBeenCalledWith(
      mockStationHandles.get(
        'Selected station – observation:distance 3.5 km, 2/2'
      ),
      'focus'
    );
    expect(scroll.scrollTo.mock.invocationCallOrder[0]).toBeLessThan(
      jest.mocked(AccessibilityInfo.sendAccessibilityEvent).mock
        .invocationCallOrder[0]
    );
    expect(mockSetStationId).not.toHaveBeenCalled();
    expect(mockTrackMatomoEvent).not.toHaveBeenCalled();
  });

  it('waits for layout when the sheet is already open', () => {
    const view = render(
      <ObservationStationListBottomSheet {...focusProps} isOpen />
    );
    act(() => jest.advanceTimersByTime(20));
    expect(mockMeasureLayout).not.toHaveBeenCalled();
    fireEvent(view.getByTestId('observation-station-list-content'), 'layout');
    act(() => jest.advanceTimersByTime(20));
    expect(AccessibilityInfo.sendAccessibilityEvent).toHaveBeenCalledTimes(1);
  });

  it('focuses only once per opening and focuses again when reopened', () => {
    const view = render(
      <ObservationStationListBottomSheet {...focusProps} isOpen />
    );
    fireEvent(view.getByTestId('observation-station-list-content'), 'layout');
    act(() => jest.advanceTimersByTime(20));
    view.rerender(
      <ObservationStationListBottomSheet
        {...focusProps}
        stationList={[...focusProps.stationList]}
        isOpen
      />
    );
    act(() => jest.advanceTimersByTime(20));
    expect(AccessibilityInfo.sendAccessibilityEvent).toHaveBeenCalledTimes(1);

    view.rerender(
      <ObservationStationListBottomSheet {...focusProps} isOpen={false} />
    );
    view.rerender(<ObservationStationListBottomSheet {...focusProps} isOpen />);
    act(() => jest.advanceTimersByTime(20));
    expect(AccessibilityInfo.sendAccessibilityEvent).toHaveBeenCalledTimes(2);
  });

  it('waits for the selected station to arrive in the station list', () => {
    const view = render(
      <ObservationStationListBottomSheet
        {...focusProps}
        stationList={[]}
        isOpen
      />
    );
    fireEvent(view.getByTestId('observation-station-list-content'), 'layout');
    act(() => jest.advanceTimersByTime(20));
    expect(mockMeasureLayout).not.toHaveBeenCalled();
    view.rerender(<ObservationStationListBottomSheet {...focusProps} isOpen />);
    act(() => jest.advanceTimersByTime(20));
    expect(AccessibilityInfo.sendAccessibilityEvent).toHaveBeenCalledTimes(1);
  });

  it('cancels pending focus when the sheet is closed or unmounted', () => {
    const view = render(
      <ObservationStationListBottomSheet {...focusProps} isOpen />
    );
    fireEvent(view.getByTestId('observation-station-list-content'), 'layout');
    view.rerender(
      <ObservationStationListBottomSheet {...focusProps} isOpen={false} />
    );
    act(() => jest.advanceTimersByTime(20));
    expect(AccessibilityInfo.sendAccessibilityEvent).not.toHaveBeenCalled();

    view.rerender(<ObservationStationListBottomSheet {...focusProps} isOpen />);
    view.unmount();
    act(() => jest.advanceTimersByTime(20));
    expect(AccessibilityInfo.sendAccessibilityEvent).not.toHaveBeenCalled();
  });

  it('ignores a measurement result arriving after the sheet closes', () => {
    let onMeasured: ((x: number, y: number) => void) | undefined;
    mockMeasureLayout.mockImplementation((_content, onSuccess) => {
      onMeasured = onSuccess;
    });
    const view = render(
      <ObservationStationListBottomSheet {...focusProps} isOpen />
    );
    fireEvent(view.getByTestId('observation-station-list-content'), 'layout');
    view.rerender(
      <ObservationStationListBottomSheet {...focusProps} isOpen={false} />
    );
    act(() => {
      onMeasured?.(0, 720);
      jest.advanceTimersByTime(20);
    });
    expect(AccessibilityInfo.sendAccessibilityEvent).not.toHaveBeenCalled();
    expect(
      view.UNSAFE_getByType(ScrollView).instance.scrollTo
    ).not.toHaveBeenCalled();
  });
});
