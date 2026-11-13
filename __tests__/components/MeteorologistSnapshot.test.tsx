import React from 'react';
import { Platform, Text as NativeText } from 'react-native';
import { render } from '@testing-library/react-native';

import MeteorologistSnapshot from '../../src/components/weather/MeteorologistSnapshot';

const mockFormatAccessibleDateTime = jest.fn();

jest.mock('react-redux', () => ({
  connect: () => (Component: any) => Component,
}));

jest.mock('@store/meteorologist/selector', () => ({
  selectLoading: jest.fn(),
  selectError: jest.fn(),
  selectMeteorologistSnapshot: jest.fn(),
}));

jest.mock('@store/settings/selectors', () => ({
  selectClockType: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    colors: {
      meteorologistSnapshotCard: '#f5f5f5',
      primaryText: '#111111',
    },
    dark: false,
  }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: { language: 'en' },
    t: (key: string) => key,
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({
    left: 4,
    right: 6,
    top: 0,
    bottom: 0,
  }),
}));

jest.mock(
  '@components/common/Skeleton',
  () => ({
    __esModule: true,
    default: (props: any) => {
      const { Text } = require('react-native');
      return <Text testID="snapshot-skeleton">{JSON.stringify(props)}</Text>;
    },
  })
);

jest.mock('@components/common/AppText', () => ({
  __esModule: true,
  default: ({ children, ...props }: any) => {
    const { Text } = require('react-native');
    return <Text {...props}>{children}</Text>;
  },
}));

jest.mock('@assets/Icon', () => ({
  __esModule: true,
  default: ({ name, ...props }: any) => {
    const { Text } = require('react-native');
    return (
      <Text testID={`icon-${name}`} {...props}>
        {name}
      </Text>
    );
  },
}));

jest.mock('@utils/accessibility', () => ({
  formatAccessibleDateTime: (...args: any[]) =>
    mockFormatAccessibleDateTime(...args),
}));

describe('MeteorologistSnapshot', () => {
  const cachedSnapshot = {
    title: 'Weather bulletin',
    text: 'Sää muuttuu illalla sateiseksi.',
    hasAlert: true,
    date: '2035-03-03T12:30:00Z',
  };

  beforeEach(() => {
    mockFormatAccessibleDateTime.mockReset();
    mockFormatAccessibleDateTime.mockReturnValue('accessible snapshot date');
  });

  afterEach(() => jest.restoreAllMocks());

  it('renders skeleton while loading', () => {
    const view = render(
      <MeteorologistSnapshot
        loading
        error={false}
        snapshot={null}
        clockType={24 as any}
      />
    );

    expect(view.getByTestId('snapshot-skeleton')).toBeTruthy();
    expect(view.getByText(/"height":150/)).toBeTruthy();
  });

  it('renders error content when loading fails', () => {
    const view = render(
      <MeteorologistSnapshot
        loading={false}
        error="network"
        snapshot={null}
        clockType={24 as any}
      />
    );

    expect(view.getByText('Meteorologin sääkatsaus')).toBeTruthy();
    expect(view.getByText('Sääkatsauksen hakeminen epäonnistui')).toBeTruthy();
  });

  it('renders snapshot text, updated time and warning icon', () => {
    const view = render(
      <MeteorologistSnapshot
        loading={false}
        error={false}
        clockType={24 as any}
        snapshot={{
          title: 'Ignored title',
          text: 'Sää muuttuu illalla sateiseksi.',
          hasAlert: true,
          date: '2035-03-03T12:30:00Z',
        }}
      />
    );

    expect(view.getByText('Meteorologin sääkatsaus')).toBeTruthy();
    expect(view.getByText('Sää muuttuu illalla sateiseksi.')).toBeTruthy();
    expect(view.getByA11yLabel('accessible snapshot date')).toBeTruthy();
    expect(view.getByTestId('icon-warnings')).toBeTruthy();
    expect(
      view.getByA11yLabel('Sääkatsaus sisältää varoituksia')
    ).toBeTruthy();
    expect(mockFormatAccessibleDateTime).toHaveBeenCalledWith(
      expect.anything(),
      expect.any(Function),
      true
    );
  });

  it('uses grid layout margins and 12 hour time format', () => {
    const view = render(
      <MeteorologistSnapshot
        loading={false}
        error={false}
        clockType={12 as any}
        gridLayout
        snapshot={{
          title: 'Ignored title',
          text: 'Aurinkoista.',
          hasAlert: false,
          date: '2035-03-03T12:30:00Z',
        }}
      />
    );

    expect(view.queryByTestId('icon-warnings')).toBeNull();
    expect(view.getByText(/pm/)).toBeTruthy();

    const root = view.toJSON() as any;
    const mergedStyle = Object.assign(
      {},
      ...(Array.isArray(root.props.style) ? root.props.style : [root.props.style])
    );
    expect(mergedStyle.marginLeft).toBe(8);
    expect(mergedStyle.marginRight).toBe(6);
    expect(mergedStyle.minHeight).toBe(160);
  });

  it('preserves the same accessible content throughout a refresh', () => {
    const props = { loading: false, error: false, snapshot: cachedSnapshot, clockType: 24 as const };
    const view = render(<MeteorologistSnapshot {...props} />);
    const header = view.getByText('Meteorologin sääkatsaus');
    const text = view.getByText(cachedSnapshot.text);
    const date = view.getByA11yLabel('accessible snapshot date');

    view.rerender(<MeteorologistSnapshot {...props} loading />);

    expect(view.queryByTestId('snapshot-skeleton')).toBeNull();
    expect(view.getByText('Meteorologin sääkatsaus')).toBe(header);
    expect(view.getByText(cachedSnapshot.text)).toBe(text);
    expect(view.getByA11yLabel('accessible snapshot date')).toBe(date);
    expect(header.props.accessibilityState).toBeUndefined();
    expect(view.queryByTestId('snapshot_refresh_status')).toBeNull();

    view.rerender(<MeteorologistSnapshot {...props} snapshot={{
      ...cachedSnapshot, text: 'Aurinkoista.', date: '2035-03-03T13:30:00Z',
    }} />);

    expect(view.getByText('Aurinkoista.')).toBe(text);
    expect(view.getByA11yLabel('accessible snapshot date')).toBe(date);
    expect(header.props.accessibilityState).toBeUndefined();
    expect(view.queryByTestId('snapshot_refresh_status')).toBeNull();
  });

  it('keeps the previous snapshot and its accessible targets after a refresh error and retry', () => {
    const props = { loading: false, error: false, snapshot: cachedSnapshot, clockType: 24 as const };
    const view = render(<MeteorologistSnapshot {...props} />);
    const text = view.getByText(cachedSnapshot.text);
    const content = view.toJSON();

    view.rerender(<MeteorologistSnapshot {...props} error="network" />);

    expect(view.getByText(cachedSnapshot.text)).toBe(text);
    expect(view.toJSON()).toEqual(content);
    expect(view.queryByTestId('snapshot_refresh_status')).toBeNull();
    expect(view.queryByText('Sääkatsauksen hakeminen epäonnistui')).toBeNull();

    view.rerender(<MeteorologistSnapshot {...props} loading />);

    expect(view.getByText(cachedSnapshot.text)).toBe(text);
    expect(view.toJSON()).toEqual(content);
    expect(view.queryByTestId('snapshot-skeleton')).toBeNull();
    expect(view.queryByTestId('snapshot_refresh_status')).toBeNull();
  });

  it.each([false, true])('makes the complete Android snapshot one focusable card (hasAlert=%s)', hasAlert => {
    jest.replaceProperty(Platform, 'OS', 'android');
    const view = render(<MeteorologistSnapshot
      loading={false}
      error={false}
      snapshot={{ ...cachedSnapshot, hasAlert }}
      clockType={24 as any}
    />);
    const label = [
      'Meteorologin sääkatsaus',
      ...(hasAlert ? ['Sääkatsaus sisältää varoituksia'] : []),
      'accessible snapshot date',
      cachedSnapshot.text,
    ].join('. ');

    const card = view.getByA11yLabel(label);
    expect(card.props.accessible).toBe(true);
    expect(card.props.accessibilityRole).toBe('header');
    view.UNSAFE_getAllByType(NativeText).forEach(node => {
      expect(node.props.accessible).toBe(false);
      expect(node.props.importantForAccessibility).toBe('no-hide-descendants');
    });
  });

  it('keeps the Android error card in the tab order when no fresh snapshot is available', () => {
    jest.replaceProperty(Platform, 'OS', 'android');
    const view = render(<MeteorologistSnapshot
      loading={false}
      error="network"
      snapshot={null}
      clockType={24 as any}
    />);

    const card = view.getByA11yLabel('Meteorologin sääkatsaus. Sääkatsauksen hakeminen epäonnistui');
    expect(card.props.accessible).toBe(true);
    expect(card.props.accessibilityRole).toBe('header');
    view.UNSAFE_getAllByType(NativeText).forEach(node => {
      expect(node.props.accessible).toBe(false);
    });
  });

  it('preserves individually readable snapshot content on iOS', () => {
    jest.replaceProperty(Platform, 'OS', 'ios');
    const view = render(<MeteorologistSnapshot
      loading={false}
      error={false}
      snapshot={cachedSnapshot}
      clockType={24 as any}
    />);

    expect((view.toJSON() as any).props.accessible).toBe(false);
    expect(view.getByText(cachedSnapshot.text).props.accessible).toBe(true);
    expect(view.getByTestId('icon-warnings').props.accessible).toBe(true);
  });
});
