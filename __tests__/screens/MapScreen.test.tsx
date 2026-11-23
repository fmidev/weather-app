import './screenTestMocks';

import React from 'react';
import { render } from '@testing-library/react-native';

import MapScreen from '../../src/screens/MapScreen';
import { mockConfigGet, resetScreenMocks } from './screenTestMocks';

describe('MapScreen', () => {
  beforeEach(() => {
    resetScreenMocks();
  });

  it('renders Maplibre map and bottom sheets', () => {
    mockConfigGet.mockReturnValue({
      baseMap: {
        url: 'https://maps.example.test/styles/',
        lightStyle: 'light.json',
        darkStyle: 'dark.json',
      },
    });
    const { getByTestId, queryByTestId } = render(<MapScreen />);

    expect(getByTestId('ml-map-view')).toBeTruthy();
    expect(queryByTestId('rn-map-view')).toBeNull();
    expect(getByTestId('info-bottom-sheet')).toBeTruthy();
    expect(getByTestId('map-layers-bottom-sheet')).toBeTruthy();
  });

  it('renders react-native-maps map when no base map is configured', () => {
    const { getByTestId, queryByTestId } = render(<MapScreen />);

    expect(getByTestId('rn-map-view')).toBeTruthy();
    expect(queryByTestId('ml-map-view')).toBeNull();
    expect(getByTestId('info-bottom-sheet')).toBeTruthy();
    expect(getByTestId('map-layers-bottom-sheet')).toBeTruthy();
  });
});
