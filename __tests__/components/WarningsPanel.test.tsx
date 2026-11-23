import React from 'react';
import { AccessibilityInfo, findNodeHandle } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';
import { trackMatomoEvent } from '@utils/matomo';

import { ScreenHeaderItemsContext } from '../../src/navigators/ScreenHeaderItemsContext';
import WarningsPanel from '../../src/components/warnings/WarningsPanel';

const mockRoute = { params: { day: 0 } };
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
  useRoute: () => mockRoute,
  useFocusEffect: (callback: () => void | (() => void)) => {
    const { useEffect } = require('react');
    useEffect(callback, [callback]);
  },
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

const baseProps = {
  dailyWarnings: Array.from({ length: 5 }, (_, index) => ({
    date: Date.parse('2035-06-01T00:00:00Z') + index * 86400000,
    severity: 0,
    type: undefined,
    count: 0,
    warnings: [],
  })),
  location: { name: 'Helsinki' } as any,
  loading: false,
  error: false as const,
};

const renderPanel = (overrides: Partial<typeof baseProps> = {}) =>
  render(<WarningsPanel {...baseProps} {...overrides} />, {
    createNodeMock: () => ({}),
  });

const layoutHeader = (view: ReturnType<typeof render>) =>
  fireEvent(view.getByA11yRole('header'), 'layout', {
    currentTarget: 42,
    nativeEvent: { layout: { x: 0, y: 0, width: 200, height: 40 } },
  });

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

  const renderWarningPanel = () => render(<WarningsPanel {...props as any} />, {
    createNodeMock: (element) => ({ props: element.props }),
  });

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    mockRoute.params.day = 0;
    mockVerticalBarLayout = false;
    jest.spyOn(require('react-native'), 'findNodeHandle').mockReturnValue(42);
    jest.spyOn(AccessibilityInfo, 'sendAccessibilityEvent').mockImplementation(() => {});
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

  it('does not refocus the header when the user selects another day', () => {
    const view = renderPanel();
    layoutHeader(view);
    const secondDay = view.getAllByA11yRole('button')[2];

    fireEvent.press(secondDay);

    expect(secondDay.props.accessibilityState).toEqual({ selected: true });
    layoutHeader(view);
    expect(AccessibilityInfo.sendAccessibilityEvent).toHaveBeenCalledTimes(1);
  });

  it('does not refocus the header when warning data or route day changes', () => {
    const view = renderPanel();
    layoutHeader(view);

    mockRoute.params.day = 2;
    view.rerender(
      <WarningsPanel
        {...baseProps}
        dailyWarnings={baseProps.dailyWarnings.map((day) => ({ ...day, count: 1 }))}
      />
    );

    expect(view.getAllByA11yRole('button')[3].props.accessibilityState)
      .toEqual({ selected: true });
    layoutHeader(view);
    expect(AccessibilityInfo.sendAccessibilityEvent).toHaveBeenCalledTimes(1);
  });

  it('waits for the initial load and header layout before focusing', () => {
    const view = renderPanel({ loading: true });
    expect(AccessibilityInfo.sendAccessibilityEvent).not.toHaveBeenCalled();

    view.rerender(<WarningsPanel {...baseProps} />);
    expect(AccessibilityInfo.sendAccessibilityEvent).not.toHaveBeenCalled();
    layoutHeader(view);

    expect(AccessibilityInfo.sendAccessibilityEvent).toHaveBeenCalledTimes(1);
  });

  it('appends the translated warning types to the day label', () => {
    const view = renderWarningPanel();

    expect(view.getByA11yLabel(/Wednesday/).props.accessibilityLabel).toBe(
      'Wednesday 04 November, hasWarnings: 2, warnings:severities:moderate, types.wind, types.rain'
    );
  });

  it('excludes the panel wrapper and count badges from Android accessibility while keeping the controls', () => {
    const view = renderWarningPanel();
    const panel = view.getByTestId('warnings_panel');
    expect(panel.props.accessible).toBe(false);
    expect(panel.props.importantForAccessibility).toBe('no');
    const badge = view.container.findByProps({ accessibilityElementsHidden: true });
    expect(badge.props.importantForAccessibility).toBe('no-hide-descendants');
    expect(view.getByText('2')).toBeTruthy();
    expect(view.getByA11yLabel(/Wednesday/).props.accessibilityRole).toBe('button');
    expect(view.getByTestId('warnings_info_button').props.accessibilityRole).toBe('button');

    layoutHeader(view);
    expect(AccessibilityInfo.sendAccessibilityEvent).toHaveBeenLastCalledWith(
      expect.objectContaining({ props: expect.objectContaining({
        accessible: true,
        accessibilityRole: 'header',
      }) }),
      'focus'
    );
  });

  it('keeps the day label unchanged when there are no warnings', () => {
    const view = renderWarningPanel();

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
    const view = renderWarningPanel();
    layoutHeader(view);
    expect(AccessibilityInfo.setAccessibilityFocus).not.toHaveBeenCalled();

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
    layoutHeader(view);
    expect(AccessibilityInfo.sendAccessibilityEvent).toHaveBeenCalledTimes(1);
    expect(trackMatomoEvent).toHaveBeenCalledWith(
      'User action', 'Warnings', 'Select day 2 / (2 warnings) / moderate'
    );

    fireEvent.press(view.getByA11yLabel(/Wednesday/));
    act(() => jest.advanceTimersByTime(20));
    expect(AccessibilityInfo.setAccessibilityFocus).toHaveBeenCalledTimes(2);
  });

  it('focuses the no-warnings message when the selected day has no warnings', () => {
    const view = renderWarningPanel();
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
    const view = renderWarningPanel();
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
