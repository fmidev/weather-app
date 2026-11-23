import React from 'react';
import { render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import moment from 'moment-timezone';

import DayDurationRow from '../../src/components/weather/forecast/DayDurationRow';

let mockExcludeDayDuration = false;
let mockExcludePolarNightAndMidnightSun = false;

jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    colors: {
      dayForecastBackground: '#dddddd',
      hourListText: '#111111',
    },
  }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('@config', () => ({
  Config: {
    get: () => ({
      forecast: {
        excludeDayDuration: mockExcludeDayDuration,
        excludePolarNightAndMidnightSun: mockExcludePolarNightAndMidnightSun,
      },
    }),
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

const step = {
  sunrise: '2035-06-01T03:15:00',
  sunset: '2035-06-01T21:45:00',
  dayLength: 1110,
};

describe('DayDurationRow', () => {
  beforeEach(() => {
    moment.tz.setDefault('UTC');
    mockExcludeDayDuration = false;
    mockExcludePolarNightAndMidnightSun = false;
  });

  afterEach(() => {
    moment.tz.setDefault();
  });

  it.each([
    { clockType: 24 as const, sunrise: '03.15', sunset: '21.45' },
    { clockType: 12 as const, sunrise: '3.15 am', sunset: '9.45 pm' },
  ])('renders the times and accessible day duration with a $clockType-hour clock', ({ clockType, sunrise, sunset }) => {
    const view = render(<DayDurationRow step={step} clockType={clockType} />);

    expect(view.getByText(sunrise)).toBeTruthy();
    expect(view.getByText(sunset)).toBeTruthy();
    expect(view.getByA11yLabel(`sunrise at ${sunrise}`)).toBeTruthy();
    expect(view.getByA11yLabel(`sunset at ${sunset}`)).toBeTruthy();
    expect(view.getByText('18 h 30 min')).toBeTruthy();
    expect(view.getByA11yLabel('dayLength 18 hours 30 minutes')).toBeTruthy();
    expect(
      StyleSheet.flatten(view.getByTestId('day-duration-symbol').props.style)
        .backgroundColor
    ).toBe('#dddddd');
  });

  it('omits the duration when excluded while retaining sunrise and sunset', () => {
    mockExcludeDayDuration = true;
    const view = render(<DayDurationRow step={step} clockType={24} />);

    expect(view.queryByText('18 h 30 min')).toBeNull();
    expect(view.getByA11yLabel('sunrise at 03.15')).toBeTruthy();
    expect(view.getByA11yLabel('sunset at 21.45')).toBeTruthy();
  });

  it.each([
    {
      sunrise: '2035-01-15T09:00:00',
      sunset: '2034-11-25T12:00:00',
      dayLength: 0,
      description: 'weatherInfoBottomSheet.polarNight',
      timeLabel: 'sunrise at 15.1.2035 at 09.00',
      icon: 'polar-night',
    },
    {
      sunrise: '2035-05-15T03:00:00',
      sunset: '2035-07-25T21:00:00',
      dayLength: 1440,
      description: 'weatherInfoBottomSheet.nightlessNight',
      timeLabel: 'sunset at 25.7.2035 at 21.00',
      icon: 'midnight-sun',
    },
  ])('renders $description and the next solar event', ({ description, timeLabel, icon, ...polarStep }) => {
    const view = render(<DayDurationRow step={polarStep} clockType={24} />);

    expect(view.getByText(description)).toBeTruthy();
    expect(view.getByA11yLabel(timeLabel)).toBeTruthy();
    expect(view.getByTestId(`icon-${icon}`)).toBeTruthy();
    expect(view.queryByTestId('icon-time')).toBeNull();
  });

  it('uses regular times when polar night and midnight sun are excluded', () => {
    mockExcludePolarNightAndMidnightSun = true;
    const view = render(
      <DayDurationRow
        step={{ ...step, sunset: '2035-07-15T21:45:00', dayLength: 1440 }}
        clockType={24}
      />
    );

    expect(view.queryByText('weatherInfoBottomSheet.nightlessNight')).toBeNull();
    expect(view.getByA11yLabel('sunrise at 03.15')).toBeTruthy();
    expect(view.getByA11yLabel('sunset at 21.45')).toBeTruthy();
    expect(view.getByText('24 h 0 min')).toBeTruthy();
  });
});
