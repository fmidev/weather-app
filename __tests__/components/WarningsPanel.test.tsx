import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import { ScreenHeaderItemsContext } from '../../src/navigators/ScreenHeaderItemsContext';
import WarningsPanel from '../../src/components/warnings/WarningsPanel';

const mockSheetOpen = jest.fn();
let mockVerticalBarLayout = false;

jest.mock('@utils/hooks', () => ({
  ...jest.requireActual('@utils/hooks'),
  usesVerticalBarLayout: () => mockVerticalBarLayout,
}));

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
  return ReactMock.forwardRef(({ children }: any, forwardedRef: any) => {
    ReactMock.useImperativeHandle(forwardedRef, () => ({ open: mockSheetOpen }));
    return <View>{children}</View>;
  });
});

jest.mock('../../src/components/warnings/SeverityBar', () => () => null);
jest.mock('../../src/components/warnings/DayDetails', () => () => null);
jest.mock('../../src/components/warnings/InfoSheet', () => () => null);
jest.mock('@components/common/ScalableIcon', () => () => null);
jest.mock('@components/common/AccessibleTouchableOpacity', () => ({
  __esModule: true,
  default: (props: any) => {
    const { Pressable } = require('react-native');
    return <Pressable {...props} />;
  },
}));
jest.mock('@utils/matomo', () => ({
  trackMatomoEvent: jest.fn(),
}));

describe('WarningsPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockVerticalBarLayout = false;
  });
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

  it('keeps the inline info button and adds the same action to the vertical header', () => {
    mockVerticalBarLayout = true;
    const setItems = jest.fn();
    const props = {
      dailyWarnings: [{ date: '2026-10-29', severity: 0, count: 0, warnings: [] }],
      location: { name: 'Helsinki' }, loading: false, error: false,
    } as any;
    const view = render(
      <ScreenHeaderItemsContext.Provider value={setItems}>
        <WarningsPanel {...props} />
      </ScreenHeaderItemsContext.Provider>
    );
    const items = setItems.mock.calls.at(-1)![0];
    expect(items).toEqual([expect.objectContaining({
      accessibilityLabel: 'infoAccessibilityLabel',
      icon: { type: 'sfSymbol', name: 'info.circle' },
    })]);
    fireEvent.press(view.getByTestId('warnings_info_button'));
    items[0].onPress();
    expect(mockSheetOpen).toHaveBeenCalledTimes(2);
    expect(require('@utils/matomo').trackMatomoEvent).toHaveBeenCalledWith(
      'User action', 'Warnings', 'Open warnings info panel'
    );

    mockVerticalBarLayout = false;
    view.rerender(
      <ScreenHeaderItemsContext.Provider value={setItems}>
        <WarningsPanel {...props} />
      </ScreenHeaderItemsContext.Provider>
    );
    expect(setItems).toHaveBeenLastCalledWith([]);
    expect(view.getByTestId('warnings_info_button')).toBeTruthy();
  });

  it.each([{ loading: true, error: false }, { loading: false, error: true }])(
    'does not offer a header action without a mounted info sheet (%o)',
    (state) => {
      mockVerticalBarLayout = true;
      const setItems = jest.fn();
      render(
        <ScreenHeaderItemsContext.Provider value={setItems}>
          <WarningsPanel {...({ dailyWarnings: [], location: { name: 'Helsinki' }, ...state } as any)} />
        </ScreenHeaderItemsContext.Provider>
      );
      expect(setItems).toHaveBeenLastCalledWith([]);
    }
  );
});
