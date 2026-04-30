import React from 'react';
import { Platform, Text } from 'react-native';
import { render } from '@testing-library/react-native';
import { Provider } from 'react-redux';

import WMSOverlay from '../../src/components/map/layers/WMSOverlay';

const mockSelectActiveOverlay = jest.fn((state: any) => state.mock.activeOverlayId);
const mockSelectSliderTime = jest.fn((state: any) => state.mock.sliderTime);
const mockGetSliderMinUnix = jest.fn();
const mockGetSliderMaxUnix = jest.fn();
const mockGetSliderStepSeconds = jest.fn();
const mockUseIsFocused = jest.fn();
const getTileTime = (urlTemplate: string) =>
  urlTemplate.match(/[?&]time=([^&]+)/)?.[1];
const mockMemoizedWMSTile = jest.fn((props) => (
  <Text testID={`wms-tile-${getTileTime(props.urlTemplate)}`}>
    {props.urlTemplate}
  </Text>
));

jest.mock('@store/map/selectors', () => ({
  selectActiveOverlay: (state: any) => mockSelectActiveOverlay(state),
  selectSliderTime: (state: any) => mockSelectSliderTime(state),
}));

jest.mock('@utils/map', () => ({
  getSliderMinUnix: (...args: any[]) => mockGetSliderMinUnix(...args),
  getSliderMaxUnix: (...args: any[]) => mockGetSliderMaxUnix(...args),
  getSliderStepSeconds: (...args: any[]) => mockGetSliderStepSeconds(...args),
}));

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    dark: false,
  }),
  useIsFocused: () => mockUseIsFocused(),
}));

jest.mock('../../src/components/map/layers/MemoizedWMSTile', () => ({
  __esModule: true,
  default: (props: any) => mockMemoizedWMSTile(props),
}));

const createStore = (state: any) => ({
  getState: () => state,
  dispatch: jest.fn(),
  subscribe: () => () => {},
});

const overlay = {
  type: 'WMS',
  step: 60,
  tileSize: 256,
  observation: {
    url: 'https://example.test/obs',
    start: '2025-01-01T00:00:00.000Z',
    end: '2025-01-01T01:00:00.000Z',
    styles: {
      light: 'obs-light',
      dark: 'obs-dark',
    },
  },
  forecast: {
    url: 'https://example.test/fc',
    start: '2025-01-01T02:00:00.000Z',
    end: '2025-01-01T03:00:00.000Z',
    styles: {
      light: 'fc-light',
      dark: 'fc-dark',
    },
  },
} as any;

const setPlatformOS = (os: 'ios' | 'android') => {
  Object.defineProperty(Platform, 'OS', {
    configurable: true,
    value: os,
  });
};

describe('WMSOverlay', () => {
  beforeEach(() => {
    mockSelectActiveOverlay.mockClear();
    mockSelectSliderTime.mockClear();
    mockGetSliderMinUnix.mockReset();
    mockGetSliderMaxUnix.mockReset();
    mockGetSliderStepSeconds.mockReset();
    mockUseIsFocused.mockReset();
    mockMemoizedWMSTile.mockClear();

    mockGetSliderMinUnix.mockReturnValue(1735689600); // 2025-01-01T00:00:00.000Z
    mockGetSliderMaxUnix.mockReturnValue(1735700400); // 2025-01-01T03:00:00.000Z
    mockGetSliderStepSeconds.mockReturnValue(3600);
    mockUseIsFocused.mockReturnValue(true);
    setPlatformOS('android');
  });

  it('returns null when slider time is zero', () => {
    const store = createStore({
      mock: {
        activeOverlayId: 1,
        sliderTime: 0,
      },
    });

    const { toJSON } = render(
      <Provider store={store as any}>
        <WMSOverlay overlay={overlay} />
      </Provider>
    );

    expect(toJSON()).toBeNull();
    expect(mockMemoizedWMSTile).not.toHaveBeenCalled();
  });

  it('renders all WMS frames for non-ios path and sets current opacity', () => {
    const store = createStore({
      mock: {
        activeOverlayId: 1,
        sliderTime: 1735693200, // 2025-01-01T01:00:00.000Z
      },
    });

    const { getByTestId } = render(
      <Provider store={store as any}>
        <WMSOverlay overlay={overlay} />
      </Provider>
    );

    expect(getByTestId('wms-tile-2025-01-01T00:00:00.000Z')).toBeTruthy();
    expect(getByTestId('wms-tile-2025-01-01T01:00:00.000Z')).toBeTruthy();
    expect(getByTestId('wms-tile-2025-01-01T02:00:00.000Z')).toBeTruthy();
    expect(getByTestId('wms-tile-2025-01-01T03:00:00.000Z')).toBeTruthy();

    expect(mockMemoizedWMSTile).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        opacity: 0,
        library: 'react-native-maps',
        tileSize: 256,
        urlTemplate: expect.stringContaining('https://example.test/obs'),
      })
    );
    expect(mockMemoizedWMSTile).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        opacity: 1,
        urlTemplate: expect.stringContaining('styles=obs-light'),
      })
    );
    expect(mockMemoizedWMSTile).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        opacity: 0,
        urlTemplate: expect.stringContaining('https://example.test/fc'),
      })
    );
    expect(mockMemoizedWMSTile).toHaveBeenNthCalledWith(
      4,
      expect.objectContaining({
        opacity: 0,
        urlTemplate: expect.stringContaining('styles=fc-light'),
      })
    );
  });

  it('renders only current, previous and next tile on ios for react-native-maps', () => {
    setPlatformOS('ios');

    const store = createStore({
      mock: {
        activeOverlayId: 1,
        sliderTime: 1735693200, // second tile
      },
    });

    render(
      <Provider store={store as any}>
        <WMSOverlay overlay={overlay} />
      </Provider>
    );

    expect(mockMemoizedWMSTile).toHaveBeenCalledTimes(3);
    expect(mockMemoizedWMSTile).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        urlTemplate: expect.stringContaining('time=2025-01-01T01:00:00.000Z'),
        opacity: 1,
      })
    );
    expect(mockMemoizedWMSTile).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        urlTemplate: expect.stringContaining('time=2025-01-01T00:00:00.000Z'),
        opacity: 0,
      })
    );
    expect(mockMemoizedWMSTile).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        urlTemplate: expect.stringContaining('time=2025-01-01T02:00:00.000Z'),
        opacity: 0,
      })
    );
  });

  it('returns null when screen is not focused', () => {
    mockUseIsFocused.mockReturnValue(false);

    const store = createStore({
      mock: {
        activeOverlayId: 1,
        sliderTime: 1735693200,
      },
    });

    const { toJSON } = render(
      <Provider store={store as any}>
        <WMSOverlay overlay={overlay} />
      </Provider>
    );

    expect(toJSON()).toBeNull();
    expect(mockMemoizedWMSTile).not.toHaveBeenCalled();
  });
});
