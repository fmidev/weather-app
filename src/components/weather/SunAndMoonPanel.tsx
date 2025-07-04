import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MotiView } from 'moti';
import { Skeleton } from 'moti/skeleton';
import moment from 'moment';

import { State } from '@store/types';
import { selectIsWaningMoonPhase, selectLoading, selectNextHourForecast } from '@store/forecast/selectors';
import { selectClockType } from '@store/settings/selectors';

import { sunBackground, sunBackgroundDark, moonPhaseImages } from '@assets/images/backgrounds';
import { useTheme } from '@react-navigation/native';
import { CustomTheme, WHITE, BLACK } from '@assets/colors';
import { resolveMoonPhase } from '@utils/moon';
import Icon from '@assets/Icon';
import { Config } from '@config';

const mapStateToProps = (state: State) => ({
  loading: selectLoading(state),
  forecast: selectNextHourForecast(state),
  waningMoonPhase: selectIsWaningMoonPhase(state),
  clockType: selectClockType(state),
});

const connector = connect(mapStateToProps, {});

type PropsFromRedux = ConnectedProps<typeof connector>;

type NextHoursForecastProps = PropsFromRedux & {};

const SunAndMoonPanel: React.FC<NextHoursForecastProps> = ({
  loading,
  forecast,
  waningMoonPhase,
  clockType
}) => {
  const ICON_SIZE = 16;
  const { t } = useTranslation('forecast');
  const { colors, dark } = useTheme() as CustomTheme;

  const colorMode = dark ? 'dark' : 'light';

  if (loading || !forecast) {
    return (
      <MotiView style={[styles.flex, styles.row, styles.center, { backgroundColor: colors.background }]}>
        <View style={styles.sunBox}>
          <Skeleton colorMode={colorMode} width={175} height={100} radius={10} />
        </View>
        <View style={styles.moonBox}>
          <Skeleton colorMode={colorMode} width={175} height={100} radius={10} />
        </View>
      </MotiView>
    );
  }

  const { excludeDayDuration, excludePolarNightAndMidnightSun } = Config.get('weather').forecast;

  const sunrise = moment(`${forecast.sunrise}Z`);
  const sunset = moment(`${forecast.sunset}Z`);
  const sunriseSunsetDiff = Math.abs(sunset.diff(sunrise, 'hours'));
  const dayHours = Math.floor(forecast.dayLength / 60);
  const dayMinutes = forecast.dayLength % 60;

  // check if sunrise and sunset are on same day or not (works in all timezones)
  const sunriseDay = moment(sunrise).format('D');
  const sunsetDay = moment(sunset).format('D');
  const isSunriseAndDayInSameDay = sunriseDay === sunsetDay;

  const isPolarNight = (excludePolarNightAndMidnightSun === undefined || !excludePolarNightAndMidnightSun)
                        &&!isSunriseAndDayInSameDay && sunset.isBefore(sunrise);
  const isMidnightSun = (excludePolarNightAndMidnightSun === undefined || !excludePolarNightAndMidnightSun)
                        && !isSunriseAndDayInSameDay && sunrise.isBefore(sunset) && sunriseSunsetDiff >= 36;

  const dateFormat = clockType === 12 ? `D.M.YYYY h:mm a` : `D.M.YYYY HH:mm`;
  const accessibleDateFormat = clockType === 12
      ? `D.M.YYYY [${t('at')}] h:mm a`
      : `D.M.YYYY [${t('at')}] HH:mm`;

  const timeFormat = clockType === 12 ? 'h.mm' : 'HH:mm';
  const accessibleTimeFormat = clockType === 12 ? 'h.mm a' : 'HH:mm';

  const moonPhase = resolveMoonPhase(forecast.moonPhase as number, waningMoonPhase);
  const moonBackground = moonPhaseImages[moonPhase];

  return (
    <View style={[styles.flex, styles.row, styles.center, { backgroundColor: colors.background }]}>
      <View
        style={[styles.box, styles.sunBox]}
        accessible
      >
        <ImageBackground source={dark ? sunBackgroundDark : sunBackground}
          resizeMode="cover"
          style={styles.flex}
          imageStyle={styles.background}
        >
          <View style={styles.info} accessible accessibilityRole="header">
            <Text style={[styles.text, { color: colors.primaryText}]}>
              {t('dayLength')}
            </Text>
          </View>
            {isPolarNight && !isMidnightSun && (
              <View accessible>
                <View accessible style={styles.sunInfo}>
                  <Icon
                    width={ICON_SIZE}
                    height={ICON_SIZE}
                    name="polar-night"
                    style={[styles.sunIcon, { color: colors.primaryText}]}
                  />
                  <Text style={[styles.text, { color: colors.primaryText}]}>
                    {t('weatherInfoBottomSheet.polarNight')}
                  </Text>
                </View>
                <View style={[styles.sunInfo]} accessible>
                  <Icon
                    width={ICON_SIZE}
                    height={ICON_SIZE}
                    name="sun-arrow-up"
                    style={[styles.sunIcon, { color: colors.primaryText}]}
                  />
                  <Text
                    accessibilityLabel={`${t('sunrise')} ${sunrise.format(accessibleDateFormat)}`}
                    style={[styles.text, { color: colors.primaryText}]}>
                    {sunrise.format(dateFormat)}
                  </Text>
                </View>
              </View>
            )}

            {isMidnightSun && !isPolarNight && (
              <View accessible>
                <View accessible style={styles.sunInfo}>
                  <Icon
                    width={ICON_SIZE}
                    height={ICON_SIZE}
                    name="midnight-sun"
                    style={[styles.sunIcon, { color: colors.primaryText}]}
                  />
                  <Text style={[styles.text, { color: colors.primaryText}]}>
                    {t('weatherInfoBottomSheet.nightlessNight')}
                  </Text>
                </View>
                <View style={[styles.sunInfo]} accessible>
                  <Icon
                    width={14}
                    height={14}
                    name="sun-arrow-down"
                    style={[styles.sunIcon, { color: colors.primaryText}]}
                  />
                  <Text
                    accessibilityLabel={`${t('sunset')} ${sunset.format(accessibleDateFormat)}`}
                    style={[styles.text, { color: colors.primaryText}]}>
                    {sunset.format(dateFormat)}
                  </Text>
                </View>
              </View>
            )}

            {!isPolarNight && !isMidnightSun && (
              <View>
                <View style={[styles.row]}>
                  <View style={[styles.sunInfo]} accessible>
                    <Icon
                      width={ICON_SIZE}
                      height={ICON_SIZE}
                      name="sun-arrow-up"
                      style={[styles.sunIcon, { color: colors.primaryText}]}
                    />
                    <Text
                      accessibilityLabel={`${t('sunrise')} ${t(
                        'at'
                      )} ${sunrise.format(accessibleTimeFormat)}`}
                      style={[styles.text, { color: colors.primaryText}]}>
                      {sunrise.format(timeFormat)}
                    </Text>
                    { clockType === 12 && (
                      <Text
                        style={[styles.smallText, { color: colors.primaryText}]}
                        accessible={false}
                        importantForAccessibility="no"
                        accessibilityLabel=""
                      >
                        {sunrise.format('a')}
                      </Text>
                    )}
                  </View>
                  <View style={[styles.sunInfo]} accessible>
                    <Icon
                      width={14}
                      height={14}
                      name="sun-arrow-down"
                      style={[styles.sunIcon, { color: colors.primaryText}]}
                    />
                    <Text
                      accessibilityLabel={`${t('sunset')} ${t(
                        'at'
                      )} ${sunset.format(accessibleTimeFormat)}`}
                      style={[styles.text, { color: colors.primaryText}]}>
                      {sunset.format(timeFormat)}
                    </Text>
                    { clockType === 12 && (
                      <Text
                        style={[styles.smallText, { color: colors.primaryText}]}
                        accessible={false}
                        importantForAccessibility="no"
                        accessibilityLabel=""
                      >
                        {sunset.format('a')}
                      </Text>
                    )}
                  </View>
                </View>
                {(excludeDayDuration === undefined || !excludeDayDuration) && (
                  <View style={styles.sunInfo} accessible>
                    <Icon
                      width={ICON_SIZE}
                      height={ICON_SIZE}
                      name="time"
                      style={[styles.sunIcon, { color: colors.primaryText}]}
                    />
                    <Text
                      accessibilityLabel={`${t('dayLength')} ${dayHours} ${t(
                        'hours'
                      )} ${dayMinutes} ${t('minutes')}`}
                      style={[styles.text, { color: colors.primaryText}]}>
                      {`${dayHours} h ${dayMinutes} min`}
                    </Text>
                  </View>
                )}
              </View>
          )}
        </ImageBackground>
      </View>
      <View style={[styles.box, styles.moonBox]}>
        <ImageBackground source={moonBackground} resizeMode="cover" style={styles.flex} imageStyle={styles.background}>
          <View style={styles.info} accessible>
            <Text style={[styles.text, { color: WHITE }]}>
              {t('moonPhase')}
            </Text>
            <Text
              accessibilityLabel={t(`sunAndMoon.${moonPhase}`)}
              style={[styles.text, styles.moonPhase]}>
                {t(`sunAndMoon.${moonPhase}`)}</Text>
          </View>
        </ImageBackground>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  text: {
    fontFamily: 'Roboto-Regular',
    fontSize: 14,
    color: BLACK,
  },
  smallText: {
    fontFamily: 'Roboto-Regular',
    fontSize: 12,
    lineHeight: 13,
    paddingTop: 2,
    paddingLeft: 2,
    color: BLACK,
  },
  flex: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sunInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
    paddingBottom: 8,
  },
  sunIcon: {
    marginRight: 4,
    color: BLACK,
  },
  box: {
    flex: 1,
    width: 175,
    maxWidth: 175,
    height: 100,
    borderRadius: 10,
  },
  sunBox: {
    marginLeft: 16,
    marginRight: 8,
    marginTop: 16,
  },
  moonBox: {
    marginRight: 16,
    marginLeft: 8,
    marginTop: 16,
  },
  background: {
    borderRadius: 10,
  },
  info: {
    padding: 16,
    paddingBottom: 8,
    paddingHorizontal: 12,
  },
  moonPhase: {
    width: 80,
    color: WHITE,
    marginTop: 8
  },
});

export default connector(SunAndMoonPanel);