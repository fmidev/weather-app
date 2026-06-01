import React from 'react';
import { ScrollView } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import moment from 'moment';

import TimeSlider from '../../src/components/map/ui/TimeSlider';

const mockSelectSliderTime = jest.fn((state: any) => state.mock.sliderTime);
const mockSelectActiveOverlay = jest.fn((state: any) => state.mock.activeOverlayId);
const mockSelectOverlay = jest.fn((state: any) => state.mock.overlay);
const mockSelectAnimationSpeed = jest.fn((state: any) => state.mock.animationSpeed);
const mockSelectClockType = jest.fn((state: any) => state.mock.clockType);
const mockUpdateSliderTime = jest.fn((time: number) => ({
  type: 'MAP/UPDATE_SLIDER_TIME',
  payload: time,
}));
const mockGetSliderMinUnix = jest.fn();
const mockGetSliderMaxUnix = jest.fn();
const mockGetSliderStepSeconds = jest.fn();
const mockTrackMatomoEvent = jest.fn();
const mockHapticTrigger = jest.fn();
const mockUseIsFocused = jest.fn();

jest.mock('@store/map/selectors', () => ({
  selectSliderTime: (state: any) => mockSelectSliderTime(state),
  selectActiveOverlay: (state: any) => mockSelectActiveOverlay(state),
  selectOverlay: (state: any) => mockSelectOverlay(state),
  selectAnimationSpeed: (state: any) => mockSelectAnimationSpeed(state),
}));

jest.mock('@store/settings/selectors', () => ({
  selectClockType: (state: any) => mockSelectClockType(state),
}));

jest.mock('@store/map/actions', () => ({
  updateSliderTime: (time: number) => mockUpdateSliderTime(time),
}));

jest.mock('@utils/map', () => ({
  getSliderMinUnix: (...args: any[]) => mockGetSliderMinUnix(...args),
  getSliderMaxUnix: (...args: any[]) => mockGetSliderMaxUnix(...args),
  getSliderStepSeconds: (...args: any[]) => mockGetSliderStepSeconds(...args),
}));

jest.mock('@utils/matomo', () => ({
  trackMatomoEvent: (...args: any[]) => mockTrackMatomoEvent(...args),
}));

jest.mock('react-native-haptic-feedback', () => ({
  trigger: (...args: any[]) => mockHapticTrigger(...args),
}));

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    dark: false,
    colors: {
      mapButtonBackground: '#ffffff',
      mapButtonBorder: '#cccccc',
      shadow: '#000000',
      border: '#d9d9d9',
      text: '#111111',
      hourListText: '#333333',
      primary: '#0062cc',
      timeSliderObservationText: '#555555',
      timeSliderTick: '#999999',
    },
  }),
  useIsFocused: () => mockUseIsFocused(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'map:playButton': 'Play',
        'map:pauseButton': 'Pause',
        'map:playButtonAccessibilityHint': 'Start animation',
        'map:pauseButtonAccessibilityHint': 'Pause animation',
        'map:timeSlider:forecast': 'Forecast',
        'map:timeSlider:observation': 'Observation',
      };
      return translations[key] ?? key;
    },
    i18n: {
      language: 'en',
    },
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({
    left: 4,
    right: 6,
    bottom: 0,
    top: 0,
  }),
}));

jest.mock('react-native-linear-gradient', () => 'LinearGradient');

jest.mock('../../src/components/map/ui/SliderStep', () => ({
  __esModule: true,
  default: ({ item }: any) => {
    const { Text: MockText } = require('react-native');
    return <MockText testID={`slider-step-${item}`}>{item}</MockText>;
  },
}));

jest.mock('@assets/Icon', () => ({
  __esModule: true,
  default: ({ name }: any) => {
    const { Text: MockText } = require('react-native');
    return <MockText testID={`icon-${name}`}>{name}</MockText>;
  },
}));

const createStore = (state: any) => ({
  getState: () => state,
  dispatch: jest.fn(),
  subscribe: () => () => {},
});

describe('TimeSlider', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    mockUseIsFocused.mockReturnValue(true);
    mockGetSliderMinUnix.mockReturnValue(1710000000);
    mockGetSliderMaxUnix.mockReturnValue(1710007200);
    mockGetSliderStepSeconds.mockReturnValue(3600);
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it('renders steps and current observation label', () => {
    const store = createStore({
      mock: {
        activeOverlayId: 1,
        sliderTime: 1710000000,
        overlay: {
          step: 60,
          observation: { end: '2024-03-09T16:00:00Z' },
        },
        clockType: 24,
        animationSpeed: 50,
      },
    });

    const { getByText, getByTestId } = render(
      <Provider store={store as any}>
        <TimeSlider />
      </Provider>
    );

    const expectedTime = moment
      .unix(1710000000)
      .locale('en')
      .format('ddd HH.mm');

    expect(getByTestId('slider-step-1710000000')).toBeTruthy();
    expect(getByTestId('slider-step-1710003600')).toBeTruthy();
    expect(getByTestId('slider-step-1710007200')).toBeTruthy();
    expect(getByText(expectedTime)).toBeTruthy();
    expect(getByText('Observation')).toBeTruthy();
  });

  it('shows activity indicator when slider time is zero', () => {
    const store = createStore({
      mock: {
        activeOverlayId: 1,
        sliderTime: 0,
        overlay: {
          step: 60,
          observation: { end: '2024-03-09T16:00:00Z' },
        },
        clockType: 24,
        animationSpeed: 50,
      },
    });

    const { UNSAFE_getByType: unsafeGetByType } = render(
      <Provider store={store as any}>
        <TimeSlider />
      </Provider>
    );

    expect(unsafeGetByType(require('react-native').ActivityIndicator)).toBeTruthy();
  });

  it('starts animation and tracks play event from play button', () => {
    const store = createStore({
      mock: {
        activeOverlayId: 1,
        sliderTime: 1710000000,
        overlay: {
          step: 60,
          observation: { end: '2024-03-09T16:00:00Z' },
        },
        clockType: 24,
        animationSpeed: 50,
      },
    });

    const { getByA11yLabel } = render(
      <Provider store={store as any}>
        <TimeSlider />
      </Provider>
    );

    fireEvent.press(getByA11yLabel('Play'));

    expect(mockTrackMatomoEvent).toHaveBeenCalledWith(
      'User action',
      'Map',
      'Animation - START'
    );
  });

  it('dispatches initial slider time selection and triggers haptics after layout', () => {
    const store = createStore({
      mock: {
        activeOverlayId: 1,
        sliderTime: 1710000000,
        overlay: {
          step: 60,
          observation: { end: '2024-03-09T16:00:00Z' },
        },
        clockType: 24,
        animationSpeed: 50,
      },
    });

    const { UNSAFE_getByType: unsafeGetByType } = render(
      <Provider store={store as any}>
        <TimeSlider />
      </Provider>
    );

    const scrollView = unsafeGetByType(ScrollView);

    act(() => {
      fireEvent(scrollView, 'layout');
    });

    expect(mockUpdateSliderTime).toHaveBeenCalledWith(1710000000);
    expect(store.dispatch).toHaveBeenCalledWith({
      type: 'MAP/UPDATE_SLIDER_TIME',
      payload: 1710000000,
    });
    expect(mockHapticTrigger).toHaveBeenCalled();
  });
});
