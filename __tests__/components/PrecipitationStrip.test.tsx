import React from 'react';
import { View } from 'react-native';
import { render } from '@testing-library/react-native';

import PrecipitationStrip from '../../src/components/weather/forecast/PrecipitationStrip';

const mockPrecipitationLevel = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    colors: {
      rain: {
        3: '#3333ff',
      },
      border: '#cccccc',
    },
  }),
}));

jest.mock('@utils/helpers', () => ({
  getPrecipitationLevel: (...args: any[]) => mockPrecipitationLevel(...args),
}));

describe('PrecipitationStrip', () => {
  beforeEach(() => {
    mockPrecipitationLevel.mockReset();
    mockPrecipitationLevel.mockReturnValue(3);
  });

  it('normalizes precipitation data to 24 blocks', () => {
    const precipitationData = [
      { precipitation: 1, timestamp: 2000000000 },
      { precipitation: 2, timestamp: 2000003600 },
    ];

    const view = render(
      <PrecipitationStrip precipitationData={precipitationData as any} border />
    );

    expect(view.UNSAFE_getAllByType(View).length).toBeGreaterThan(20);
  });
});
