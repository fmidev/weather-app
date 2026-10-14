import React from 'react';
import { Text } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import moment from 'moment-timezone';
import type { UnitMap } from '../../src/store/settings/types';

import CollapsibleListHeader from '../../src/components/weather/common/CollapsibleListHeader';

const mockIcon = jest.fn((props) => (
  <Text {...props} testID={`icon-${props.name}`}>
    icon
  </Text>
));
const mockToStringWithDecimal = jest.fn();
const mockPrecipitationStrip = jest.fn((props) => (
  <Text testID="precipitation-strip">
    {JSON.stringify(props.precipitationData)}
  </Text>
));

const mockTheme = jest.fn();
let mockUnits: UnitMap | undefined;
let mockLanguage = 'en';

jest.mock('react-redux', () => ({ useSelector: () => mockUnits }));
jest.mock('@config', () => ({
  Config: { get: () => ({ units: { precipitation: 'mm' } }) },
}));
jest.mock('react-i18next', () => {
  const i18n = jest.requireActual('i18next').createInstance();
  i18n.init({
    initImmediate: false,
    lng: 'en',
    resources: {
      en: require('../../i18n/en.json'),
      fi: require('../../i18n/fi.json'),
    },
  });
  return {
    ...jest.requireActual('react-i18next'),
    useTranslation: () => ({
      t: (key: string, options?: any) =>
        i18n.t(key, { ...options, lng: mockLanguage }),
      i18n: { language: mockLanguage },
    }),
  };
});

jest.mock('@react-navigation/native', () => ({
  useTheme: () => mockTheme(),
}));

jest.mock('@assets/Icon', () => ({
  __esModule: true,
  default: (props: any) => mockIcon(props),
}));

jest.mock('@utils/number', () => ({
  toStringWithDecimal: (...args: any[]) => mockToStringWithDecimal(...args),
}));

jest.mock('../../src/components/weather/forecast/PrecipitationStrip', () => ({
  __esModule: true,
  default: (props: any) => mockPrecipitationStrip(props),
}));

describe('CollapsibleListHeader', () => {
  beforeEach(() => {
    mockLanguage = 'en';
    mockUnits = undefined;
    moment.tz.setDefault('UTC');
    mockIcon.mockClear();
    mockToStringWithDecimal.mockClear();
    mockPrecipitationStrip.mockClear();
    mockTheme.mockReset();
    mockTheme.mockReturnValue({
      dark: false,
      colors: {
        border: '#d9d9d9',
        inputBackground: '#f6f6f6',
        inputButtonBackground: '#ececec',
        primaryText: '#121212',
      },
    });
  });

  afterEach(() => moment.tz.setDefault());

  it('renders title, handles press and shows arrow-down when closed', () => {
    const onPress = jest.fn();
    const { getByText, getByA11yLabel } = render(
      <CollapsibleListHeader
        open={false}
        title="Tuesday"
        accessibilityLabel="Open Tuesday details"
        onPress={onPress}
      />
    );

    expect(getByText('Tuesday')).toBeTruthy();
    fireEvent.press(getByA11yLabel('Open Tuesday details'));
    expect(onPress).toHaveBeenCalledTimes(1);

    expect(mockIcon).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'arrow-down',
        width: 24,
        height: 24,
        style: { color: '#121212' },
      })
    );
  });

  it('renders weather summary values and precipitation strip when data is provided', () => {
    mockToStringWithDecimal.mockReturnValue('1,7');
    const precipitationDay = [
      {
        precipitation: 0.4,
        timestamp: Date.parse('2035-06-01T06:00:00Z') / 1000,
      },
      {
        precipitation: 0.1,
        timestamp: Date.parse('2035-06-01T12:00:00Z') / 1000,
      },
    ];

    const { getByText, getByTestId, getByRole } = render(
      <CollapsibleListHeader
        open
        title="Wednesday"
        accessibilityLabel="Collapse Wednesday details"
        onPress={() => {}}
        maxTemp="+8"
        minTemp="-2"
        totalPrecipitation={1.7}
        precipitationDay={precipitationDay}
      />
    );

    expect(getByText('+8')).toBeTruthy();
    expect(getByText('-2')).toBeTruthy();
    expect(getByText(/1,7/)).toBeTruthy();
    expect(getByText('mm')).toBeTruthy();
    expect(getByTestId('precipitation-strip')).toBeTruthy();
    const button = getByRole('button');
    expect(button.props.accessibilityLabel).toBe(
      'Collapse Wednesday details. Precipitation in the morning and in the afternoon, total precipitation 0.5 millimeters'
    );
    expect(button.props.accessibilityState).toEqual({ expanded: true });
    expect(
      button.find((node) => node.props.accessibilityElementsHidden === true)
        .props.importantForAccessibility
    ).toBe('no-hide-descendants');

    expect(mockToStringWithDecimal).toHaveBeenCalledWith(1.7, ',');
    expect(mockPrecipitationStrip).toHaveBeenCalledWith(
      expect.objectContaining({
        precipitationData: precipitationDay,
        accessible: false,
      })
    );

    expect(mockIcon).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'temperature-highest-light',
        width: 18,
        height: 18,
      })
    );
    expect(mockIcon).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'temperature-lowest-light',
        width: 18,
        height: 18,
      })
    );
    expect(mockIcon).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'rain-white', width: 18, height: 18 })
    );
    expect(mockIcon).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'arrow-up', width: 24, height: 24 })
    );
  });

  it('uses dark icon variants and hides precipitation parts when not provided', () => {
    mockTheme.mockReturnValue({
      dark: true,
      colors: {
        border: '#444444',
        inputBackground: '#1c1c1c',
        inputButtonBackground: '#303030',
        primaryText: '#f5f5f5',
      },
    });

    const { queryByTestId, queryByText } = render(
      <CollapsibleListHeader
        open={false}
        title="Thursday"
        accessibilityLabel="Open Thursday details"
        onPress={() => {}}
        maxTemp="+3"
        minTemp="-5"
        totalPrecipitation={undefined}
        precipitationDay={false}
      />
    );

    expect(queryByText('mm')).toBeNull();
    expect(queryByTestId('precipitation-strip')).toBeNull();
    expect(mockToStringWithDecimal).not.toHaveBeenCalled();

    expect(mockIcon).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'temperature-highest-dark' })
    );
    expect(mockIcon).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'temperature-lowest-dark' })
    );
  });

  it.each([
    [
      'en',
      'in',
      2.54,
      'Precipitation in the morning, total precipitation 0.10 inches',
    ],
    [
      'fi',
      'mm',
      2.4,
      'Sadetta aamupäivällä, kokonaissademäärä 2,4 millimetriä',
    ],
    [
      'en',
      'mm',
      0,
      'No precipitation all day, total precipitation 0.0 millimeters',
    ],
    ['en', 'mm', null, 'Precipitation amount missing'],
  ])(
    'appends the precipitation summary for %s in %s (%s)',
    (language, unit, amount, summary) => {
      mockLanguage = language as string;
      mockUnits = { precipitation: { unitAbb: unit } } as any;
      const view = render(
        <CollapsibleListHeader
          open={false}
          title="Friday"
          accessibilityLabel="Open Friday details"
          onPress={jest.fn()}
          precipitationDay={[
            {
              precipitation: amount as number | null,
              timestamp: Date.parse('2035-06-01T06:00:00Z') / 1000,
            },
          ]}
        />
      );
      const button = view.getByRole('button');
      expect(button.props.accessibilityLabel).toBe(
        `Open Friday details. ${summary}`
      );
      expect(button.props.accessibilityState).toEqual({ expanded: false });
    }
  );

  it('announces missing precipitation for an empty day while keeping the button action', () => {
    const onPress = jest.fn();
    const view = render(
      <CollapsibleListHeader
        open={false}
        title="Friday"
        accessibilityLabel="Open Friday details"
        onPress={onPress}
        precipitationDay={[]}
      />
    );
    fireEvent.press(
      view.getByA11yLabel('Open Friday details. Precipitation amount missing')
    );
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
