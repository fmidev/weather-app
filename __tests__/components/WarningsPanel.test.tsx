import React from 'react';
import { render } from '@testing-library/react-native';

import WarningsPanel from '../../src/components/warnings/WarningsPanel';

jest.mock('react-redux', () => ({
  connect: () => (Component: any) => Component,
}));

jest.mock('@store/warnings/selectors', () => ({
  selectDailyWarningData: jest.fn(),
  selectError: jest.fn(),
  selectLoading: jest.fn(),
}));

jest.mock('@store/location/selector', () => ({
  selectCurrent: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    dark: false,
    colors: {
      background: '#ffffff',
      border: '#dddddd',
    },
  }),
  useRoute: () => ({ params: {} }),
  useFocusEffect: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en' },
  }),
}));

jest.mock('react-native-raw-bottom-sheet', () => {
  const ReactMock = require('react');
  const { View } = require('react-native');
  return ReactMock.forwardRef(({ children }: any, forwardedRef: any) => (
    <View ref={forwardedRef}>{children}</View>
  ));
});

jest.mock('../../src/components/warnings/SeverityBar', () => () => null);
jest.mock('../../src/components/warnings/DayDetails', () => () => null);
jest.mock('../../src/components/warnings/InfoSheet', () => () => null);
jest.mock('@components/common/ScalableIcon', () => () => null);
jest.mock('@components/common/AccessibleTouchableOpacity', () => () => null);
jest.mock('@utils/matomo', () => ({
  trackMatomoEvent: jest.fn(),
}));

describe('WarningsPanel', () => {
  it('uses the common skeletons while warnings are loading', () => {
    const { getAllByTestId } = render(
      <WarningsPanel
        {...({
          dailyWarnings: [],
          location: { name: 'Helsinki' },
          loading: true,
          error: false,
        } as any)}
      />
    );

    expect(getAllByTestId('skeleton')).toHaveLength(3);
  });
});
