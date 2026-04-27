import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';

import LegacyLayerInfo from '../../src/components/map/ui/LegacyLayerInfo';

const mockConfigGet = jest.fn();
const mockSelectActiveOverlay = jest.fn();
const mockIcon = jest.fn((props) => (
  <Text {...props} testID={`icon-${props.name}`}>
    icon
  </Text>
));

jest.mock('@config', () => ({
  Config: {
    get: (...args: any[]) => mockConfigGet(...args),
  },
}));

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: (selector: any) => selector({}),
}));

jest.mock('@store/map/selectors', () => ({
  selectActiveOverlay: () => mockSelectActiveOverlay(),
}));

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    dark: false,
    colors: {
      text: '#111111',
      hourListText: '#333333',
      rain: {
        1: '#1',
        2: '#2',
        3: '#3',
        4: '#4',
        5: '#5',
        6: '#6',
        7: '#7',
        8: '#8',
      },
    },
  }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('@assets/Icon', () => ({
  __esModule: true,
  default: (props: any) => mockIcon(props),
}));

jest.mock('@components/markdown/TemperatureLegend', () => ({
  __esModule: true,
  default: () => {
    const { Text: MockText } = require('react-native');
    return <MockText testID="temperature-legend">legend</MockText>;
  },
}));

jest.mock('react-native-gesture-handler', () => {
  const { ScrollView } = require('react-native');
  return { ScrollView };
});

describe('LegacyLayerInfo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders selected layer legend sections and temperature legend', () => {
    mockSelectActiveOverlay.mockReturnValue(5);
    mockConfigGet.mockImplementation((key: string) => {
      if (key === 'map') {
        return {
          layers: [
            {
              id: 5,
              type: 'WMS',
              legend: {
                hasPrecipitationFin: true,
                hasLightning15: true,
                hasWindArrowsShort: true,
                hasTemperatureShort: true,
              },
            },
            {
              id: 7,
              type: 'Timeseries',
            },
          ],
        };
      }
      return {};
    });

    const { getByTestId, getByText } = render(<LegacyLayerInfo />);

    expect(getByTestId('legacy_layer_info')).toBeTruthy();
    expect(
      getByText('infoBottomSheet.mapLayersInfoTitle')
    ).toBeTruthy();
    expect(
      getByText('infoBottomSheet.precipitation.title')
    ).toBeTruthy();
    expect(getByText('infoBottomSheet.lightnings15.title')).toBeTruthy();
    expect(getByText('infoBottomSheet.windArrows.title')).toBeTruthy();
    expect(getByText('infoBottomSheet.temperature.title')).toBeTruthy();
    expect(getByTestId('temperature-legend')).toBeTruthy();
    expect(mockIcon).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'flash1',
      })
    );
    expect(mockIcon).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'wind-arrow-0',
      })
    );
  });

  it('renders timeseries info note when active overlay is 7 and timeseries is enabled', () => {
    mockSelectActiveOverlay.mockReturnValue(7);
    mockConfigGet.mockImplementation((key: string) => {
      if (key === 'map') {
        return {
          layers: [
            { id: 7, type: 'Timeseries' },
          ],
        };
      }
      return {};
    });

    const { getByText } = render(<LegacyLayerInfo />);

    expect(getByText('infoBottomSheet.timeseriesLayerInfo')).toBeTruthy();
  });
});
