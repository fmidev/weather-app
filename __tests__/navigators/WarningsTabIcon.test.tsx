import React from 'react';
import { render } from '@testing-library/react-native';

import WarningsTabIcon from '../../src/navigators/WarningsTabIcon';

const mockScalableIcon = jest.fn();

jest.mock('react-redux', () => ({
  connect: () => (Component: any) => Component,
}));

jest.mock('@store/warnings/selectors', () => ({
  selectCurrentDayWarningData: jest.fn(),
}));

jest.mock('@store/settings/selectors', () => ({
  selectTheme: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    dark: true,
  }),
}));

jest.mock('@components/common/ScalableIcon', () => ({
  __esModule: true,
  default: (props: any) => {
    mockScalableIcon(props);
    const { Text } = require('react-native');
    return <Text testID={`icon-${props.name}`}>{props.name}</Text>;
  },
}));

describe('WarningsTabIcon', () => {
  beforeEach(() => {
    mockScalableIcon.mockClear();
  });

  it('renders warning severity icon and reports severity', () => {
    const updateWarningsSeverity = jest.fn();
    const view = render(
      <WarningsTabIcon
        color="#ff0000"
        size={32}
        warningData={[{ date: 1, severity: 3, count: 2, warnings: [] }]}
        updateWarningsSeverity={updateWarningsSeverity}
      />
    );

    expect(view.getByTestId('icon-warnings-red-dark')).toBeTruthy();
    expect(updateWarningsSeverity).toHaveBeenCalledWith(3);
    expect(mockScalableIcon).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'warnings-red-dark',
        width: 32,
        height: 32,
        maxScaleFactor: 1.2,
      })
    );
  });

  it('falls back to base warnings icon for severity zero', () => {
    const view = render(
      <WarningsTabIcon
        color="#888888"
        size={24}
        warningData={[{ date: 1, severity: 0, count: 0, warnings: [] }]}
        updateWarningsSeverity={jest.fn()}
      />
    );

    expect(view.getByTestId('icon-warnings')).toBeTruthy();
  });
});
