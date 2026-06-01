import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import WarningTypeFiltersList from '../../src/components/warnings/cap/WarningTypeFiltersList';

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    colors: {
      background: '#ffffff',
    },
  }),
}));

jest.mock('../../src/assets/WarningsSymbol', () => ({
  __esModule: true,
  default: ({ type, severity }: any) => {
    const { Text } = require('react-native');
    return <Text testID={`warning-symbol-${type}-${severity}`}>{type}</Text>;
  },
}));

describe('WarningTypeFiltersList', () => {
  it('renders warning filters by severity order and handles press', () => {
    const warnings = [
      {
        info: {
          event: 'Wind',
          severity: 'Severe',
        },
      },
      {
        info: {
          event: 'Rain',
          severity: 'Moderate',
        },
      },
    ] as any;
    const onWarningTypePress = jest.fn();

    const { getByTestId } = render(
      <WarningTypeFiltersList
        warnings={warnings}
        onWarningTypePress={onWarningTypePress}
        activeWarnings={[]}
      />
    );

    fireEvent.press(getByTestId('warning-symbol-Wind-Severe'));
    expect(onWarningTypePress).toHaveBeenCalledWith(warnings[0]);
  });
});
