import React from 'react';
import { Linking, Text } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import { Provider } from 'react-redux';

import AnnouncementStrip from '../../src/components/announcements/AnnouncementStrip';
import {
  CRISIS_BG,
  MAINTENANCE_BG,
} from '../../src/assets/colors';

const mockConfigGet = jest.fn();
const mockSelectCrisis = jest.fn();
const mockSelectMaintenance = jest.fn();
const mockSelectFetchTimestamp = jest.fn<any, any[]>(() => 0);
const mockDismissAnnouncement = jest.fn((id: string) => ({
  type: 'DISMISS_ANNOUNCEMENT',
  id,
}));

jest.mock('@config', () => ({
  Config: {
    get: (...args: any[]) => mockConfigGet(...args),
  },
}));

jest.mock('@store/announcements/selectors', () => ({
  selectCrisis: (state: any) => mockSelectCrisis(state),
  selectMaintenance: (state: any) => mockSelectMaintenance(state),
  selectFetchTimestamp: (state: any) => mockSelectFetchTimestamp(state),
}));

jest.mock('@store/announcements/actions', () => ({
  fetchAnnouncements: () => ({
    type: 'ANNOUNCEMENTS/FETCH',
  }),
  dismissAnnouncement: (id: string) => mockDismissAnnouncement(id),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      if (key === 'crisisPrefix') return 'Crisis';
      if (key === 'maintenancePrefix') return 'Maintenance';
      if (key === 'openInBrowser') return 'Open in browser';
      return key;
    },
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({
    top: 12,
    right: 0,
    bottom: 0,
    left: 0,
  }),
}));

jest.mock('@react-navigation/native', () => ({
  useRoute: () => ({
    name: 'StackWeather',
  }),
}));

jest.mock('../../src/components/announcements/AnnouncementIcon', () => ({
  __esModule: true,
  default: ({ type }: { type: string }) => {
    const { Text: MockText } = require('react-native');
    return <MockText testID={`announcement-strip-icon-${type}`}>{type}</MockText>;
  },
}));

jest.mock('@components/common/CloseButton', () => ({
  __esModule: true,
  default: ({ onPress, accessibilityLabel }: any) => {
    const {
      Text: MockText,
      TouchableOpacity,
    } = require('react-native');
    return (
      <TouchableOpacity
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        testID="announcement-strip-close-button">
        <MockText>{accessibilityLabel}</MockText>
      </TouchableOpacity>
    );
  },
}));

const mockIcon = jest.fn((props) => (
  <Text {...props} testID={`icon-${props.name}`}>
    icon
  </Text>
));

jest.mock('@assets/Icon', () => ({
  __esModule: true,
  default: (props: any) => mockIcon(props),
}));

const createStore = (state: any) => ({
  getState: () => state,
  dispatch: jest.fn(),
  subscribe: () => () => {},
});

describe('AnnouncementStrip', () => {
  let openURLSpy: jest.SpyInstance;

  beforeEach(() => {
    openURLSpy = jest.spyOn(Linking, 'openURL').mockResolvedValueOnce(undefined);
    mockConfigGet.mockImplementation((key: string) => {
      if (key === 'announcements') {
        return { enabled: true };
      }
      if (key === 'weather') {
        return { layout: 'vertical' };
      }
      return {};
    });
    mockSelectCrisis.mockReset();
    mockSelectMaintenance.mockReset();
    mockSelectFetchTimestamp.mockClear();
    mockDismissAnnouncement.mockClear();
    mockIcon.mockClear();
  });

  afterEach(() => {
    openURLSpy.mockRestore();
  });

  it('returns null when announcements are disabled', () => {
    mockConfigGet.mockImplementation((key: string) => {
      if (key === 'announcements') {
        return { enabled: false };
      }
      if (key === 'weather') {
        return { layout: 'vertical' };
      }
      return {};
    });
    mockSelectCrisis.mockReturnValue({
      content: 'Important message',
      link: 'https://example.test/crisis',
    });
    mockSelectMaintenance.mockReturnValue(undefined);

    const store = createStore({ mock: {} });
    const { toJSON } = render(
      <Provider store={store as any}>
        <AnnouncementStrip type="crisis" />
      </Provider>
    );

    expect(toJSON()).toBeNull();
  });

  it('renders maintenance announcement without link as plain text', () => {
    mockSelectCrisis.mockReturnValue(undefined);
    mockSelectMaintenance.mockReturnValue({
      id: 'maintenance-1',
      content: 'Planned maintenance at 10:00',
      link: 'maintenance-info',
    });

    const store = createStore({ mock: {} });
    const { getByText, queryByA11yRole, getByA11yLabel, getByTestId, toJSON } = render(
      <Provider store={store as any}>
        <AnnouncementStrip type="maintenance" />
      </Provider>
    );

    expect(getByText('Planned maintenance at 10:00')).toBeTruthy();
    expect(getByA11yLabel('Maintenance Planned maintenance at 10:00')).toBeTruthy();
    expect(queryByA11yRole('link')).toBeNull();

    fireEvent.press(getByTestId('announcement-strip-close-button'));

    expect(mockDismissAnnouncement).toHaveBeenCalledWith('maintenance-1');
    expect(store.dispatch).toHaveBeenCalledWith({
      type: 'DISMISS_ANNOUNCEMENT',
      id: 'maintenance-1',
    });

    const tree = toJSON() as any;
    const styleArray = Array.isArray(tree.props.style)
      ? tree.props.style
      : [tree.props.style];
    const mergedStyle = Object.assign({}, ...styleArray);

    expect(mergedStyle.backgroundColor).toBe(MAINTENANCE_BG);
    expect(mergedStyle.paddingTop).toBe(12);
  });

  it('renders crisis announcement as link and opens browser on press', async () => {
    mockSelectCrisis.mockReturnValue({
      content: 'Storm warning in effect',
      link: 'https://example.test/crisis',
    });
    mockSelectMaintenance.mockReturnValue(undefined);

    const store = createStore({ mock: {} });
    const { getByA11yRole, getByA11yHint, getByA11yLabel, getByTestId, toJSON } = render(
      <Provider store={store as any}>
        <AnnouncementStrip type="crisis" />
      </Provider>
    );

    expect(getByA11yRole('link')).toBeTruthy();
    expect(getByA11yHint('Open in browser')).toBeTruthy();
    expect(getByA11yLabel('Crisis Storm warning in effect')).toBeTruthy();
    expect(getByTestId('announcement-strip-icon-crisis')).toBeTruthy();

    const tree = toJSON() as any;
    const styleArray = Array.isArray(tree.props.style)
      ? tree.props.style
      : [tree.props.style];
    const mergedStyle = Object.assign({}, ...styleArray);

    expect(mergedStyle.backgroundColor).toBe(CRISIS_BG);

    fireEvent.press(getByA11yRole('link'));

    expect(openURLSpy).toHaveBeenCalledWith('https://example.test/crisis');
  });
});
