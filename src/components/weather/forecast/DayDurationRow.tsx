import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@react-navigation/native';
import moment from 'moment';

import AccessibleView from '@components/common/AccessibleView';
import Text from '@components/common/AppText';
import Icon from '@components/common/ScalableIcon';
import { CustomTheme } from '@assets/colors';
import { MEDIUM_FONT, BOLD_FONT } from '@assets/constants';
import { Config } from '@config';
import { TimeStepData } from '@store/forecast/types';
import { ClockType } from '@store/settings/types';

type DayDurationRowProps = {
  step: Pick<TimeStepData, 'sunrise' | 'sunset' | 'dayLength'>;
  clockType: ClockType;
};

const DayDurationRow: React.FC<DayDurationRowProps> = ({ step, clockType }) => {
  const { fontScale } = useWindowDimensions();
  const { colors } = useTheme() as CustomTheme;
  const { t } = useTranslation('forecast');
  const sunrise = moment(`${step.sunrise}Z`);
  const sunset = moment(`${step.sunset}Z`);
  const sunriseSunsetDiff = Math.abs(sunset.diff(sunrise, 'hours'));
  const dayHours = Math.floor(step.dayLength / 60);
  const dayMinutes = step.dayLength % 60;

  const { excludeDayDuration, excludePolarNightAndMidnightSun } =
    Config.get('weather').forecast;

  // check if sunrise and sunset are on same day or not (works in all timezones)
  const sunriseDay = moment(sunrise).format('D');
  const sunsetDay = moment(sunset).format('D');
  const isSunriseAndDayInSameDay = sunriseDay === sunsetDay;

  const isPolarNight =
    (excludePolarNightAndMidnightSun === undefined ||
      !excludePolarNightAndMidnightSun) &&
    !isSunriseAndDayInSameDay &&
    sunset.isBefore(sunrise);

  const isMidnightSun =
    (excludePolarNightAndMidnightSun === undefined ||
      !excludePolarNightAndMidnightSun) &&
    !isSunriseAndDayInSameDay &&
    sunrise.isBefore(sunset) &&
    sunriseSunsetDiff >= 36;

  const dateFormat =
    clockType === 12
      ? `D.M.YYYY [${t('at')}] h.mm a`
      : `D.M.YYYY [${t('at')}] HH.mm`;

  const timeFormat = clockType === 12 ? 'h.mm a' : 'HH.mm';

  const iconSize = 14;
  const headerWidth = Math.min(fontScale * 38, 64);

  return (
    <View
      testID="day_duration"
      style={[styles.dayLengthContainer, styles.forecastHeader]}>
      <View
        testID="day-duration-symbol"
        style={[
          styles.symbolBlock,
          {
            width: headerWidth,
            backgroundColor: colors.dayForecastBackground,
          },
        ]}>
        <Icon
          name="sun"
          color={colors.hourListText}
          width={24}
          height={24}
          maxScaleFactor={1.5}
        />
      </View>
      <View
        style={[styles.row, styles.listContainer, styles.paddingHorizontal]}>
        {isPolarNight && !isMidnightSun && (
          <>
            <AccessibleView
              accessible
              style={[styles.row, styles.alignCenter, styles.listContainer]}>
              <Icon
                width={iconSize}
                height={iconSize}
                maxScaleFactor={1.5}
                name="polar-night"
                style={[
                  styles.withMarginRight,
                  {
                    color: colors.hourListText,
                  },
                ]}
              />
              <Text
                maxFontSizeMultiplier={1.5}
                style={[
                  styles.panelText,
                  styles.bold,
                  { color: colors.hourListText },
                ]}>
                {t('weatherInfoBottomSheet.polarNight')}
              </Text>
            </AccessibleView>
            <AccessibleView style={[styles.row, styles.alignCenter]} accessible>
              <Icon
                width={iconSize}
                height={iconSize}
                maxScaleFactor={1.5}
                name="sun-arrow-up"
                style={[
                  styles.withMarginRight,
                  {
                    color: colors.hourListText,
                  },
                ]}
              />
              <Text
                maxFontSizeMultiplier={1.5}
                accessibilityLabel={`${t('sunrise')} ${t(
                  'at'
                )} ${sunrise.format(dateFormat)}`}
                style={[
                  styles.panelText,
                  styles.bold,
                  { color: colors.hourListText },
                ]}>
                {sunrise.format(dateFormat)}
              </Text>
            </AccessibleView>
          </>
        )}
        {isMidnightSun && !isPolarNight && (
          <>
            <AccessibleView
              accessible
              style={[styles.row, styles.alignCenter, styles.listContainer]}>
              <Icon
                width={iconSize}
                height={iconSize}
                maxScaleFactor={1.5}
                name="midnight-sun"
                style={[
                  styles.withMarginRight,
                  {
                    color: colors.hourListText,
                  },
                ]}
              />
              <Text
                maxFontSizeMultiplier={1.5}
                style={[
                  styles.panelText,
                  styles.bold,
                  { color: colors.hourListText },
                ]}>
                {t('weatherInfoBottomSheet.nightlessNight')}
              </Text>
            </AccessibleView>
            <AccessibleView style={[styles.row, styles.alignCenter]} accessible>
              <Icon
                width={iconSize}
                height={iconSize}
                maxScaleFactor={1.5}
                name="sun-arrow-down"
                style={[
                  styles.withMarginRight,
                  {
                    color: colors.hourListText,
                  },
                ]}
              />
              <Text
                maxFontSizeMultiplier={1.5}
                accessibilityLabel={`${t('sunset')} ${t(
                  'at'
                )} ${sunset.format(dateFormat)}`}
                style={[
                  styles.panelText,
                  styles.bold,
                  { color: colors.hourListText },
                ]}>
                {sunset.format(dateFormat)}
              </Text>
            </AccessibleView>
          </>
        )}
        {!isPolarNight && !isMidnightSun && (
          <View
            style={[
              styles.row,
              styles.listContainer,
              styles.maxWidth,
              styles.justifyContentCenter,
              styles.wrap,
            ]}>
            <AccessibleView
              style={[
                styles.row,
                styles.alignCenter,
                styles.withMarginRight10,
              ]}
              accessible>
              <Icon
                width={iconSize}
                height={iconSize}
                maxScaleFactor={1.5}
                name="sun-arrow-up"
                style={[
                  styles.withMarginRight,
                  {
                    color: colors.hourListText,
                  },
                ]}
              />
              <Text
                maxFontSizeMultiplier={1.5}
                accessibilityLabel={`${t('sunrise')} ${t(
                  'at'
                )} ${sunrise.format(timeFormat)}`}
                style={[
                  styles.panelText,
                  styles.bold,
                  { color: colors.hourListText },
                ]}>
                {sunrise.format(timeFormat)}
              </Text>
            </AccessibleView>
            <AccessibleView style={[styles.row, styles.alignCenter]} accessible>
              <Icon
                width={iconSize}
                height={iconSize}
                maxScaleFactor={1.5}
                name="sun-arrow-down"
                style={[
                  styles.withMarginRight,
                  { color: colors.hourListText },
                ]}
              />
              <Text
                maxFontSizeMultiplier={1.5}
                accessibilityLabel={`${t('sunset')} ${t(
                  'at'
                )} ${sunset.format(timeFormat)}`}
                style={[
                  styles.panelText,
                  styles.bold,
                  { color: colors.hourListText },
                ]}>
                {sunset.format(timeFormat)}
              </Text>
            </AccessibleView>
            {(excludeDayDuration === undefined || !excludeDayDuration) && (
              <>
                <AccessibleView
                  style={[
                    styles.row,
                    styles.alignCenter,
                    styles.withMarginLeft10,
                  ]}
                  accessible>
                  <Icon
                    width={iconSize}
                    height={iconSize}
                    maxScaleFactor={1.5}
                    name="time"
                    style={[
                      styles.alignCenter,
                      styles.withMarginRight,
                      { color: colors.hourListText },
                    ]}
                  />
                  <Text
                    maxFontSizeMultiplier={1.5}
                    accessibilityLabel={`${t('dayLength')} ${dayHours} ${t(
                      'hours'
                    )} ${dayMinutes} ${t('minutes')}`}
                    style={[
                      styles.panelText,
                      styles.bold,
                      { color: colors.hourListText },
                    ]}>
                    {`${dayHours} h ${dayMinutes} min`}
                  </Text>
                </AccessibleView>
              </>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  wrap: {
    flexWrap: 'wrap',
  },
  dayLengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listContainer: {
    flex: 1,
  },
  justifyContentCenter: {
    justifyContent: 'center',
  },
  bold: {
    fontFamily: BOLD_FONT,
  },
  panelText: {
    fontSize: 14,
    fontFamily: MEDIUM_FONT,
  },
  withMarginRight10: {
    marginRight: 10,
  },
  withMarginLeft10: {
    marginLeft: 10,
  },
  withMarginRight: {
    marginRight: 2,
  },
  forecastHeader: {
    height: 52,
  },
  maxWidth: {
    width: '100%',
  },
  alignCenter: {
    alignItems: 'center',
  },
  symbolBlock: {
    height: '100%',
    width: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paddingHorizontal: {
    paddingHorizontal: 16,
  },
});

export default DayDurationRow;
