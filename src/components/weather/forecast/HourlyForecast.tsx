import React, { memo } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import {
  View,
  StyleSheet,
  FlatList,
  useWindowDimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@react-navigation/native';
import moment from 'moment';
import LinearGradient from 'react-native-linear-gradient';

import Text from '@components/common/AppText';
import Icon from '@components/common/ScalableIcon';
import { State } from '@store/types';
import { TimeStepData } from '@store/forecast/types';
import { selectDisplayParams } from '@store/forecast/selectors';
import { selectUnits, selectClockType } from '@store/settings/selectors';
import { CustomTheme } from '@assets/colors';

import { DAY_LENGTH } from '@store/forecast/constants';
import { Config } from '@config';
import ForecastListColumn from './ForecastListColumn';
import ForecastListHeaderColumn from './ForecastListHeaderColumn';

import { MEDIUM_FONT, BOLD_FONT } from '@assets/constants';
// import { trackMatomoEvent } from '@utils/matomo';

const mapStateToProps = (state: State) => ({
  clockType: selectClockType(state),
  displayParams: selectDisplayParams(state),
  units: selectUnits(state),
});

const connector = connect(mapStateToProps, {});

type PropsFromRedux = ConnectedProps<typeof connector>;

type HourlyForecastProps = PropsFromRedux & {
  data: TimeStepData[];
};

const HourlyForecast: React.FC<HourlyForecastProps> = ({
  data,
  displayParams,
  clockType,
  units,
}) => {
  const { fontScale } = useWindowDimensions();
  const { colors, dark } = useTheme() as CustomTheme;
  const { t } = useTranslation('forecast');
  const { excludeDayLength } = Config.get('weather').forecast;

  if (!data || data.length === 0) return null;

  // eslint-disable-next-line react/no-unstable-nested-components
  const DayDurationRow = () => {
    const step = data[data.length - 1];
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

    const lightGradient = [
      'rgba(238, 239, 241, 0.64)',
      'rgba(244, 245, 247, 0.48)',
      'rgba(255, 255, 255, 0.80)'
    ];

    const darkGradient = [
      'rgba(25, 25, 25, 0.64)',
      'rgba(32, 32, 32, 0.48)',
      'rgba(40, 40, 40, 0.80)'
    ];

    const iconSize = 14;
    const headerWidth = Math.min(fontScale * 38, 64);

    return (
      <View
        testID="day_duration"
        style={[
          styles.dayLengthContainer,
          styles.forecastHeader,
        ]}>
          <View style={[styles.symbolBlock, { width: headerWidth }]}>
            <LinearGradient
              colors={ dark ? darkGradient : lightGradient }
              start={{ x: 1, y: 0 }}
              end={{ x: 0, y: 0 }}
              style={[styles.gradient, { width: headerWidth }]}
            >
              <Icon
                name="sun"
                color={colors.hourListText}
                width={24}
                height={24}
                maxScaleFactor={1.5}
              />
            </LinearGradient>
          </View>
          <View
            style={[styles.row, styles.listContainer, styles.paddingHorizontal]}>
            {isPolarNight && !isMidnightSun && (
              <>
                <View
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
                </View>
                <View style={[styles.row, styles.alignCenter]} accessible>
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
                </View>
              </>
            )}
            {isMidnightSun && !isPolarNight && (
              <>
                <View
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
                </View>
                <View style={[styles.row, styles.alignCenter]} accessible>
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
                </View>
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
                <View
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
                </View>
                <View style={[styles.row, styles.alignCenter]} accessible>
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
                </View>
                {(excludeDayDuration === undefined || !excludeDayDuration) && (
                  <>
                    <View
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
                    </View>
                  </>
                )}
              </View>
            )}
          </View>
      </View>
    );
  };

  return (
    <>
      <View style={styles.row}>
        <ForecastListHeaderColumn displayParams={displayParams} units={units} compact />
        <View style={styles.listContainer}>
          <FlatList
            data={data}
            keyExtractor={(item) => `${item.epochtime}`}
            renderItem={({ item }: any) => (
              <ForecastListColumn
                clockType={clockType}
                data={item}
                displayParams={displayParams}
                units={units}
                compact
              />
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>
      </View>
      {displayParams.map((displayParam) => displayParam[1]).includes(DAY_LENGTH) &&
        !excludeDayLength && <DayDurationRow />}
    </>
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
  gradient: {
    flex: 1,
    width: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default memo(connector(HourlyForecast));
