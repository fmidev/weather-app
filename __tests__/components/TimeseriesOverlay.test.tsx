import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import { Provider } from 'react-redux';

import TimeseriesOverlay from '../../src/components/map/layers/TimeseriesOverlay';

const mockSelectRegion = jest.fn((state: any) => state.mock.region);
const mockSelectSliderTime = jest.fn((state: any) => state.mock.sliderTime);
const mockTimeseriesMarker = jest.fn((props) => (
  <Text testID={`timeseries-marker-${props.name}`}>{props.name}</Text>
));
const mockMlTimeseriesMarker = jest.fn((props) => (
  <Text testID={`ml-timeseries-marker-${props.name}`}>{props.name}</Text>
));

jest.mock('@store/map/selectors', () => ({
  selectRegion: (state: any) => mockSelectRegion(state),
  selectSliderTime: (state: any) => mockSelectSliderTime(state),
}));

jest.mock('../../src/components/map/layers/TimeseriesMarker', () => ({
  __esModule: true,
  default: (props: any) => mockTimeseriesMarker(props),
}));

jest.mock('../../src/components/map/layers/MlTimeseriesMarker', () => ({
  __esModule: true,
  default: (props: any) => mockMlTimeseriesMarker(props),
}));

const createStore = (state: any) => ({
  getState: () => state,
  dispatch: jest.fn(),
  subscribe: () => () => {},
});

const baseOverlay = {
  type: 'Timeseries',
  step: 60,
  data: {
    '24.9384,60.1699': {
      '658864': {
        Helsinki: [
          {
            epochtime: 1710000000,
            smartSymbol: 57,
            temperature: 2,
            windDirection: 180,
            windSpeedMS: 5,
          },
        ],
      },
    },
    '23.761,61.4978': {
      '244223': {
        Tampere: [
          {
            epochtime: 1710000000,
            smartSymbol: 60,
            temperature: 1,
            windDirection: 90,
            windSpeedMS: 4,
          },
        ],
      },
    },
  },
} as any;

describe('TimeseriesOverlay', () => {
  beforeEach(() => {
    mockSelectRegion.mockClear();
    mockSelectSliderTime.mockClear();
    mockTimeseriesMarker.mockClear();
    mockMlTimeseriesMarker.mockClear();
  });

  it('renders react-native-maps markers for matching slider time', () => {
    const store = createStore({
      mock: {
        region: {
          latitude: 60.1699,
          longitude: 24.9384,
          latitudeDelta: 6,
          longitudeDelta: 6,
        },
        sliderTime: 1710000000,
      },
    });

    const { getByTestId } = render(
      <Provider store={store as any}>
        <TimeseriesOverlay overlay={baseOverlay} />
      </Provider>
    );

    expect(getByTestId('timeseries-marker-Helsinki')).toBeTruthy();
    expect(getByTestId('timeseries-marker-Tampere')).toBeTruthy();
    expect(mockTimeseriesMarker).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Helsinki',
        coordinate: { latitude: 60.1699, longitude: 24.9384 },
        smartSymbol: 57,
        temperature: 2,
        windDirection: 180,
        windSpeedMS: 5,
      })
    );
    expect(mockTimeseriesMarker).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Tampere',
        coordinate: { latitude: 61.4978, longitude: 23.761 },
        smartSymbol: 60,
      })
    );
    expect(mockMlTimeseriesMarker).not.toHaveBeenCalled();
  });

  it('renders maplibre markers when library is maplibre', () => {
    const store = createStore({
      mock: {
        region: {
          latitude: 60.1699,
          longitude: 24.9384,
          latitudeDelta: 6,
          longitudeDelta: 6,
        },
        sliderTime: 1710000000,
      },
    });

    const { getByTestId } = render(
      <Provider store={store as any}>
        <TimeseriesOverlay
          overlay={baseOverlay}
          library="maplibre"
          mapBounds={[[25.5, 62], [23, 59.5]]}
          zoom={7}
        />
      </Provider>
    );

    expect(getByTestId('ml-timeseries-marker-Helsinki')).toBeTruthy();
    expect(getByTestId('ml-timeseries-marker-Tampere')).toBeTruthy();
    expect(mockMlTimeseriesMarker).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Helsinki',
        coordinate: [24.9384, 60.1699],
        zoom: 7,
        smartSymbol: 57,
      })
    );
    expect(mockTimeseriesMarker).not.toHaveBeenCalled();
  });

  it('does not render markers when matching slider frame has no smart symbol', () => {
    const overlayWithoutFrame = {
      ...baseOverlay,
      data: {
        '24.9384,60.1699': {
          '658864': {
            Helsinki: [
              {
                epochtime: 1710003600,
                smartSymbol: 57,
                temperature: 2,
                windDirection: 180,
                windSpeedMS: 5,
              },
            ],
          },
        },
      },
    };

    const store = createStore({
      mock: {
        region: {
          latitude: 60.1699,
          longitude: 24.9384,
          latitudeDelta: 6,
          longitudeDelta: 6,
        },
        sliderTime: 1710000000,
      },
    });

    const { queryByTestId, toJSON } = render(
      <Provider store={store as any}>
        <TimeseriesOverlay overlay={overlayWithoutFrame as any} />
      </Provider>
    );

    expect(queryByTestId('timeseries-marker-Helsinki')).toBeNull();
    expect(toJSON()).toBeNull();
    expect(mockTimeseriesMarker).not.toHaveBeenCalled();
    expect(mockMlTimeseriesMarker).not.toHaveBeenCalled();
  });
});
