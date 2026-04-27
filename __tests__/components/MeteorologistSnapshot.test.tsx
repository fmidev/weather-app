import React from 'react';
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

jest.mock('moti', () => ({
  MotiView: ({ children, style }: any) => {
    const { View } = require('react-native');
    return (
      <View testID="moti-view" style={style}>
        {children}
      </View>
    );
  },
}));

jest.mock(
  'moti/skeleton',
  () => ({
    Skeleton: (props: any) => {
      const { Text } = require('react-native');
      return <Text testID="snapshot-skeleton">{JSON.stringify(props)}</Text>;
    },
  }),
  { virtual: true }
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
  default: ({ name, accessibilityLabel }: any) => {
    const { Text } = require('react-native');
    return (
      <Text testID={`icon-${name}`} accessibilityLabel={accessibilityLabel}>
        {name}
      </Text>
    );
  },
}));

jest.mock('@utils/helpers', () => ({
  formatAccessibleDateTime: (...args: any[]) =>
    mockFormatAccessibleDateTime(...args),
}));

describe('MeteorologistSnapshot', () => {
  beforeEach(() => {
    mockFormatAccessibleDateTime.mockReset();
    mockFormatAccessibleDateTime.mockReturnValue('accessible snapshot date');
  });

  it('renders skeleton while loading', () => {
    const view = render(
      <MeteorologistSnapshot
        loading
        error={false}
        snapshot={null}
        clockType={24 as any}
      />
    );

    expect(view.getByTestId('moti-view')).toBeTruthy();
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
});
