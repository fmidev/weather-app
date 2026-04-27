import './screenTestMocks';

import React from 'react';
import { render } from '@testing-library/react-native';

import MapScreen from '../../src/screens/MapScreen';
import { resetScreenMocks } from './screenTestMocks';

describe('MapScreen', () => {
  beforeEach(() => {
    resetScreenMocks();
  });

  it('renders Maplibre map and bottom sheets', () => {
    const { getByTestId, queryByTestId } = render(
      <MapScreen mapLibrary="maplibre" />
    );

    expect(getByTestId('ml-map-view')).toBeTruthy();
    expect(queryByTestId('rn-map-view')).toBeNull();
    expect(getByTestId('info-bottom-sheet')).toBeTruthy();
    expect(getByTestId('map-layers-bottom-sheet')).toBeTruthy();
  });

  it('renders react-native-maps map when configured', () => {
    const { getByTestId } = render(
      <MapScreen mapLibrary="react-native-maps" />
    );

    expect(getByTestId('rn-map-view')).toBeTruthy();
  });
});
