import React from 'react';
import { AccessibilityInfo, findNodeHandle } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';
import { useFocusEffect } from '@react-navigation/native';
import { trackMatomoEvent } from '@utils/matomo';

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

jest.mock('@store/settings/selectors', () => ({
  selectClockType: jest.fn(),
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

jest.mock('@components/common/BottomSheet', () => {
  const ReactMock = require('react');
  const { View } = require('react-native');
  return ReactMock.forwardRef(({ children }: any, forwardedRef: any) => {
    ReactMock.useImperativeHandle(forwardedRef, () => ({ open: mockSheetOpen }));
    return <View>{children}</View>;
  });
});

jest.mock('../../src/components/warnings/SeverityBar', () => () => null);
jest.mock('../../src/components/warnings/WarningIcon', () => () => null);
jest.mock('@assets/Icon', () => () => null);
jest.mock('../../src/components/warnings/InfoSheet', () => () => null);
jest.mock('@components/common/ScalableIcon', () => () => null);
jest.mock('@utils/matomo', () => ({
  trackMatomoEvent: jest.fn(),
}));

describe('WarningsPanel', () => {
  const warning = {
    type: 'wind',
    severity: 'moderate',
    physical: false,
    description: 'Strong wind',
    duration: {
      startTime: '2026-11-03T10:00:00Z',
      endTime: '2026-11-03T20:00:00Z',
    },
  };
  const props = {
    dailyWarnings: [
      { date: '2026-11-03', count: 0, severity: 'safe', warnings: [] },
      { date: '2026-11-04', count: 2, severity: 'moderate', warnings: [
        warning,
        { ...warning, type: 'rain' },
      ] },
    ],
    location: { name: 'Helsinki' },
    loading: false,
    error: false,
  };

  const renderPanel = () => render(<WarningsPanel {...props as any} />, {
    createNodeMock: (element) => ({ props: element.props }),
  });

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    mockVerticalBarLayout = false;
    jest.spyOn(require('react-native'), 'findNodeHandle').mockReturnValue(42);
    jest.spyOn(AccessibilityInfo, 'setAccessibilityFocus').mockImplementation(() => {});
    jest.spyOn(globalThis, 'requestAnimationFrame').mockImplementation(callback =>
      setTimeout(() => callback(0), 0) as unknown as number
    );
    jest.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation(frame => clearTimeout(frame));
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
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

  it('appends the translated warning types to the day label', () => {
    const view = renderPanel();

    expect(view.getByA11yLabel(/Wednesday/).props.accessibilityLabel).toBe(
      'Wednesday 04 November, hasWarnings: 2, warnings:severities:moderate, types.wind, types.rain'
    );
  });

  it('excludes the panel wrapper and count badges from Android accessibility while keeping the controls', () => {
    const view = renderPanel();
    const panel = view.getByTestId('warnings_panel');
    expect(panel.props.accessible).toBe(false);
    expect(panel.props.importantForAccessibility).toBe('no');
    const badge = view.container.findByProps({ accessibilityElementsHidden: true });
    expect(badge.props.importantForAccessibility).toBe('no-hide-descendants');
    expect(view.getByText('2')).toBeTruthy();
    expect(view.getByA11yLabel(/Wednesday/).props.accessibilityRole).toBe('button');
    expect(view.getByTestId('warnings_info_button').props.accessibilityRole).toBe('button');

    act(() => jest.mocked(useFocusEffect).mock.calls.slice(-1)[0][0]());
    expect(findNodeHandle).toHaveBeenLastCalledWith(
      expect.objectContaining({ props: expect.objectContaining({
        accessible: true,
        accessibilityRole: 'header',
      }) })
    );
  });

  it('keeps the day label unchanged when there are no warnings', () => {
    const view = renderPanel();

    expect(view.getByA11yLabel(/Tuesday/).props.accessibilityLabel).toBe(
      'Tuesday 03 November, hasWarnings: 0, warnings:severities:safe'
    );
  });

  it('announces each warning type only once when several warnings share a type', () => {
    const view = render(<WarningsPanel {...{
      ...props,
      dailyWarnings: [{
        ...props.dailyWarnings[1],
        count: 3,
        warnings: [
          warning,
          { ...warning, type: 'rain' },
          { ...warning, severity: 'severe' },
        ],
      }],
    } as any} />);

    expect(view.getByA11yLabel(/Wednesday/).props.accessibilityLabel).toBe(
      'Wednesday 04 November, hasWarnings: 3, warnings:severities:moderate, types.wind, types.rain'
    );
  });

  it('focuses the first warning after selecting a day, including selecting it again', () => {
    const view = renderPanel();
    expect(AccessibilityInfo.setAccessibilityFocus).not.toHaveBeenCalled();
    const headerFocus = jest.mocked(useFocusEffect).mock.calls[0][0];

    fireEvent.press(view.getByA11yLabel(/Wednesday/));
    expect(AccessibilityInfo.setAccessibilityFocus).not.toHaveBeenCalled();
    act(() => jest.advanceTimersByTime(20));

    expect(findNodeHandle).toHaveBeenLastCalledWith(
      expect.objectContaining({ props: expect.objectContaining({
        accessibilityRole: 'button',
        accessibilityHint: 'moreAccessibilityHint',
      }) })
    );
    expect(AccessibilityInfo.setAccessibilityFocus).toHaveBeenCalledWith(42);
    expect(jest.mocked(useFocusEffect).mock.calls.slice(-1)[0][0]).toBe(headerFocus);
    expect(trackMatomoEvent).toHaveBeenCalledWith(
      'User action', 'Warnings', 'Select day 2 / (2 warnings) / moderate'
    );

    fireEvent.press(view.getByA11yLabel(/Wednesday/));
    act(() => jest.advanceTimersByTime(20));
    expect(AccessibilityInfo.setAccessibilityFocus).toHaveBeenCalledTimes(2);
  });

  it('focuses the no-warnings message when the selected day has no warnings', () => {
    const view = renderPanel();
    fireEvent.press(view.getByA11yLabel(/Tuesday/));
    act(() => jest.advanceTimersByTime(20));

    expect(findNodeHandle).toHaveBeenLastCalledWith(
      expect.objectContaining({ props: expect.objectContaining({
        accessible: true,
        children: expect.objectContaining({ props: expect.objectContaining({
          children: 'warnings:noWarningsText',
        }) }),
      }) })
    );
    expect(AccessibilityInfo.setAccessibilityFocus).toHaveBeenCalledWith(42);
  });

  it('cancels a pending focus request when the panel unmounts', () => {
    const view = renderPanel();
    fireEvent.press(view.getByA11yLabel(/Wednesday/));
    view.unmount();
    act(() => jest.advanceTimersByTime(20));
    expect(AccessibilityInfo.setAccessibilityFocus).not.toHaveBeenCalled();
  });

  it('keeps the inline info button and adds the same action to the vertical header', () => {
    mockVerticalBarLayout = true;
    const setItems = jest.fn();
    const headerProps = {
      dailyWarnings: [{ date: '2026-10-29', severity: 0, count: 0, warnings: [] }],
      location: { name: 'Helsinki' }, loading: false, error: false,
    } as any;
    const view = render(
      <ScreenHeaderItemsContext.Provider value={setItems}>
        <WarningsPanel {...headerProps} />
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
        <WarningsPanel {...headerProps} />
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
