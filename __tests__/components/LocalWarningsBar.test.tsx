import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import moment from 'moment';

import LocalWarningsBar from '../../src/components/warnings/cap/LocalWarningsBar';

const mockConfigGet = jest.fn();
const mockSheetOpen = jest.fn();
const mockGetSeveritiesForDays = jest.fn();
const mockIsPointInPolygon = jest.fn();
const mockGetBoundingBox = jest.fn();
const mockIsPointInsideBoundingBox = jest.fn();

jest.mock('@config', () => ({
  Config: {
    get: (...args: any[]) => mockConfigGet(...args),
  },
}));

jest.mock('react-redux', () => ({
  connect: () => (Component: any) => Component,
}));

jest.mock('@store/location/selector', () => ({
  selectCurrent: jest.fn(),
}));

jest.mock('@store/settings/selectors', () => ({
  selectClockType: jest.fn(),
}));

jest.mock('@store/warnings/selectors', () => ({
  selectCapWarningData: jest.fn(),
  selectLoading: jest.fn(),
}));

jest.mock('geolib', () => ({
  isPointInPolygon: (...args: any[]) => mockIsPointInPolygon(...args),
}));

jest.mock('@utils/map', () => ({
  getBoundingBox: (...args: any[]) => mockGetBoundingBox(...args),
  isPointInsideBoundingBox: (...args: any[]) => mockIsPointInsideBoundingBox(...args),
}));

jest.mock('@utils/helpers', () => ({
  getSeveritiesForDays: (...args: any[]) => mockGetSeveritiesForDays(...args),
  selectCapInfoByLanguage: (info: any) => info[0],
}));

jest.mock('moti', () => ({
  MotiView: ({ children }: any) => children,
}));

jest.mock('moti/skeleton', () => ({
  Skeleton: () => {
    const { Text } = require('react-native');
    return <Text testID="skeleton">loading</Text>;
  },
}), { virtual: true });

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    colors: {
      background: '#ffffff',
      border: '#d0d0d0',
      primaryText: '#111111',
      selectedDayBackground: '#ddeeff',
      tabBarActive: '#2255aa',
    },
    dark: false,
  }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) => {
      if (key === 'hasWarnings') return 'Warnings';
      if (key === 'dateOpenHint') return 'Open date';
      if (key === 'warnings:highestSeverity') return 'Highest severity';
      if (key.startsWith('warnings:severities:')) return key.split(':').pop();
      if (key === 'panelTitle') return 'Local warnings';
      return options?.count ? `${options.count}` : key;
    },
    i18n: { language: 'en' },
  }),
}));

jest.mock('../../src/components/common/PanelHeader', () => ({
  __esModule: true,
  default: ({ title }: any) => {
    const { Text } = require('react-native');
    return <Text>{title}</Text>;
  },
}));

jest.mock('@components/common/AppText', () => ({
  __esModule: true,
  default: ({ children, ...props }: any) => {
    const { Text } = require('react-native');
    return <Text {...props}>{children}</Text>;
  },
}));

jest.mock('@components/common/ScalableIcon', () => ({
  __esModule: true,
  default: ({ name }: any) => {
    const { Text } = require('react-native');
    return <Text testID={`icon-${name}`}>{name}</Text>;
  },
}));

jest.mock('../../src/components/warnings/cap/CapSeverityBar', () => ({
  __esModule: true,
  default: ({ severities }: any) => {
    const { Text } = require('react-native');
    return <Text testID={`severity-${severities.join('-')}`}>bar</Text>;
  },
}));

jest.mock('../../src/components/warnings/cap/LocalWarningsDetails', () => ({
  __esModule: true,
  default: ({ warnings }: any) => {
    const { Text } = require('react-native');
    return <Text testID="local-warning-details">{warnings.map((warning: any) => warning.identifier).join(',')}</Text>;
  },
}));

describe('LocalWarningsBar', () => {
  beforeEach(() => {
    mockConfigGet.mockReset();
    mockSheetOpen.mockClear();
    mockGetSeveritiesForDays.mockReset();
    mockIsPointInPolygon.mockReset();
    mockGetBoundingBox.mockReset();
    mockIsPointInsideBoundingBox.mockReset();

    mockConfigGet.mockImplementation((key: string) => {
      if (key === 'warnings') {
        return {
          capViewSettings: {
            numberOfDays: 2,
          },
        };
      }
      return {};
    });

    mockGetBoundingBox.mockReturnValue({
      minLatitude: 59,
      maxLatitude: 61,
      minLongitude: 23,
      maxLongitude: 25,
    });
    mockIsPointInsideBoundingBox.mockReturnValue(true);
    mockIsPointInPolygon.mockReturnValue(true);
    mockGetSeveritiesForDays.mockReturnValue([
      [0, 1, 0, 0],
      [0, 0, 2, 0],
    ]);
  });

  it('renders loading skeletons while warnings are loading', () => {
    const { getAllByTestId } = render(
      <LocalWarningsBar
        loading
        currentLocation={null}
        capWarnings={[]}
        clockType={24 as any}
        legendSheetRef={{ current: { open: mockSheetOpen } } as any}
      />
    );

    expect(getAllByTestId('skeleton')).toHaveLength(3);
  });

  it('returns null when location is missing and not loading', () => {
    const { queryByText } = render(
      <LocalWarningsBar
        loading={false}
        currentLocation={null}
        capWarnings={[]}
        clockType={24 as any}
        legendSheetRef={{ current: { open: mockSheetOpen } } as any}
      />
    );

    expect(queryByText('Local warnings')).toBeNull();
  });

  it('renders local warning summary, opens legend and changes selected day', () => {
    const today = moment().startOf('day');
    const warningToday = {
      identifier: 'warning-today',
      info: {
        event: 'Wind',
        severity: 'Moderate',
        effective: today.clone().toISOString(),
        expires: today.clone().endOf('day').toISOString(),
        area: {
          areaDesc: 'Helsinki',
          polygon: '60,24 60.2,24 60.2,24.2 60,24.2',
        },
      },
    };
    const warningTomorrow = {
      identifier: 'warning-tomorrow',
      info: {
        event: 'Rain',
        severity: 'Severe',
        effective: today.clone().add(1, 'day').toISOString(),
        expires: today.clone().add(1, 'day').endOf('day').toISOString(),
        area: {
          areaDesc: 'Espoo',
          polygon: '60,24 60.2,24 60.2,24.2 60,24.2',
        },
      },
    };

    const { getByHintText, getByLabelText, getByText, getByTestId } = render(
      <LocalWarningsBar
        loading={false}
        currentLocation={{ name: 'Helsinki', lat: 60.1, lon: 24.1 } as any}
        capWarnings={[warningToday, warningTomorrow] as any}
        clockType={24 as any}
        legendSheetRef={{ current: { open: mockSheetOpen } } as any}
      />
    );

    expect(getByText('Local warnings')).toBeTruthy();
    expect(getByText('Helsinki')).toBeTruthy();
    expect(getByTestId('local-warning-details').props.children).toBe('warning-today');
    expect(getByTestId('severity-0-1-0-0')).toBeTruthy();

    fireEvent.press(getByLabelText('infoAccessibilityLabel'));
    expect(mockSheetOpen).toHaveBeenCalled();

    fireEvent.press(getByHintText('Open date'));
    expect(getByTestId('local-warning-details').props.children).toBe('warning-tomorrow');
  });
});
