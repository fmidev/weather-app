import React, { useState, useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import moment from 'moment';
import 'moment/locale/fi';
import { useTheme } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { ForecastStackParamList } from '../navigators/types';

import { State } from '../store/types';
import { selectCurrentLocation, selectGeoid } from '../store/general/selectors';
import { selectForecast } from '../store/forecast/selectors';
import { fetchForecast as fetchForecastAction } from '../store/forecast/actions';

import Icon from '../components/Icon';

import { weatherSymbolGetter } from '../assets/images';
import { GREEN, WHITE, CustomTheme } from '../utils/colors';
import { TimestepData } from '../store/forecast/types';

const mapStateToProps = (state: State) => ({
  forecast: selectForecast(state),
  currentLocation: selectCurrentLocation(state),
  geoid: selectGeoid(state),
});

const mapDispatchToProps = {
  fetchForecast: fetchForecastAction,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

type WeatherScreenProps = {
  navigation: StackNavigationProp<ForecastStackParamList, 'Forecast'>;
} & PropsFromRedux;

const WeatherScreen: React.FC<WeatherScreenProps> = ({
  forecast,
  fetchForecast,
  // currentLocation,
  geoid,
  navigation,
}) => {
  const { colors, dark } = useTheme() as CustomTheme;
  const [weatherDataOpenIndex, setWeatherDataOpenIndex] = useState<
    number | undefined
  >(undefined);

  useEffect(() => {
    fetchForecast({ geoid }, [geoid]);
  }, [geoid, fetchForecast]);

  const forecastByDay = forecast.reduce(
    (acc: { [key: string]: any }, curr: TimestepData) => {
      const day = moment.unix(curr.epochtime).format('D.M.');
      if (acc[day]) {
        return { ...acc, [day]: acc[day].concat(curr) };
      }
      return { ...acc, [day]: [curr] };
    },
    {}
  );

  const headerLevelForecast: TimestepData[] =
    forecastByDay &&
    Object.keys(forecastByDay).map((key: string, index: number) => {
      const weatherDataArr = forecastByDay[key];
      if (weatherDataArr.length >= 16) {
        return weatherDataArr[15];
      }
      return index === 0
        ? weatherDataArr[0]
        : weatherDataArr[weatherDataArr.length - 1];
    });
  const forecastLastUpdated =
    headerLevelForecast &&
    headerLevelForecast.length > 0 &&
    headerLevelForecast[0]?.modtime &&
    moment(headerLevelForecast[0].modtime).format('D.M. [klo] HH:mm');

  const warningsHeaders5Days = headerLevelForecast.slice(0, 5).map((day) => {
    const dayMoment = moment.unix(day.epochtime);
    return dayMoment.format('ddd D.M.');
  });

  return (
    <SafeAreaView>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.screenBackground }]}
        showsVerticalScrollIndicator={false}>
        <View
          style={[
            styles.cardWrapper,
            {
              backgroundColor: colors.background,
              shadowColor: colors.cardShadow,
            },
          ]}>
          <View
            style={[styles.cardHeader, { backgroundColor: colors.cardHeader }]}>
            <Text style={[styles.headerTitle, { color: WHITE }]}>
              Varoitukset maa-alueilla
            </Text>
          </View>
          <View style={styles.cardContainer}>
            <View style={styles.row}>
              <Text style={[styles.cardText, { color: colors.primaryText }]}>
                Tämä on placeholder
              </Text>
            </View>
            <View
              style={[
                styles.weekWarningsContainer,
                {
                  borderColor: colors.border,
                },
              ]}>
              <View
                style={[
                  styles.warningDaysContainer,
                  {
                    borderColor: colors.border,
                  },
                ]}>
                {warningsHeaders5Days &&
                  warningsHeaders5Days.length > 0 &&
                  warningsHeaders5Days.map((day, index) => (
                    <View
                      key={day}
                      style={[
                        styles.warningsSingleDayContainer,
                        index === 0 && styles.startBorderRadius,
                        index === 4 && styles.endBorderRadius,
                        index < 4 && styles.withBorderRight,
                        {
                          backgroundColor:
                            index === 0
                              ? colors.selectedDayBackground
                              : undefined,
                          borderRightColor: colors.border,
                        },
                      ]}>
                      <View>
                        <Text
                          style={[
                            styles.cardText,
                            index === 0 ? styles.bold : styles.medium,
                            styles.dayWarningHeaderText,
                            {
                              color: index === 0 ? WHITE : colors.text,
                            },
                          ]}>
                          {day.split(' ')[0]}
                        </Text>
                        <Text
                          style={[
                            styles.cardText,
                            index === 0 ? styles.bold : styles.medium,
                            styles.dayWarningHeaderText,
                            {
                              color: index === 0 ? WHITE : colors.text,
                            },
                          ]}>
                          {day.split(' ')[1]}
                        </Text>
                      </View>

                      <View
                        style={[styles.severityBar, { backgroundColor: GREEN }]}
                      />
                    </View>
                  ))}
              </View>
              <View style={[styles.row, styles.alignCenter]}>
                <Icon
                  name="arrow-down"
                  width={24}
                  height={24}
                  style={{ color: colors.text }}
                />
              </View>
            </View>
            <View style={styles.row}>
              <View style={[styles.row, styles.alignStart]}>
                <Text
                  style={[
                    styles.headerTitle,
                    styles.withMarginRight,
                    { color: colors.primaryText },
                  ]}>
                  Katso koko Suomen varoitukset
                </Text>
                <Icon
                  width={24}
                  height={24}
                  name="warnings-status-orange"
                  style={{
                    color: colors.warningsIconFill,
                  }}
                />
              </View>
              <TouchableOpacity
                onPress={() =>
                  // use TabBarNavigation:navigation
                  navigation.dangerouslyGetParent()?.navigate('Warnings')
                }>
                <Icon
                  width={24}
                  height={24}
                  name="arrow-forward"
                  style={{ color: colors.text }}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View
          style={[
            styles.cardWrapper,
            {
              backgroundColor: colors.background,
              shadowColor: colors.cardShadow,
            },
          ]}>
          <View
            style={[styles.cardHeader, { backgroundColor: colors.cardHeader }]}>
            <Text style={[styles.headerTitle, { color: WHITE }]}>
              Sääennuste
            </Text>
          </View>
          <View style={styles.cardContainer}>
            <Text style={[styles.cardText, { color: colors.primaryText }]}>
              Päivitetty viimeksi{' '}
              <Text style={styles.bold}>{forecastLastUpdated}</Text>
            </Text>
          </View>
          <View style={[styles.forecastContainer]}>
            {headerLevelForecast &&
              headerLevelForecast.length > 0 &&
              headerLevelForecast.map((dayStep, index) => {
                const stepMoment = moment.unix(dayStep.epochtime);
                const temperaturePrefix = dayStep.temperature > 0 && '+';
                const smartSymbol = weatherSymbolGetter(
                  dayStep.smartSymbol.toString(),
                  dark
                );
                return (
                  <View key={dayStep.epochtime}>
                    <View
                      style={[
                        styles.row,
                        styles.forecastHeader,
                        {
                          borderBottomColor: colors.border,
                          backgroundColor: colors.inputBackground,
                        },
                      ]}>
                      <Text
                        style={[
                          styles.headerTitle,
                          {
                            color: colors.primaryText,
                          },
                        ]}>
                        {stepMoment.format('ddd D.M.')}
                      </Text>
                      <Text
                        style={[
                          styles.forecastText,
                          { color: colors.primaryText },
                        ]}>
                        {stepMoment.format('HH:mm')}
                      </Text>
                      <Text>{smartSymbol?.({ width: 40, height: 40 })}</Text>
                      <Text
                        style={[
                          styles.temperature,
                          { color: colors.primaryText },
                        ]}>{`${temperaturePrefix}${dayStep.temperature}°`}</Text>
                      <TouchableOpacity
                        onPress={() => {
                          if (weatherDataOpenIndex === index) {
                            setWeatherDataOpenIndex(undefined);
                          } else {
                            setWeatherDataOpenIndex(index);
                          }
                        }}>
                        <Icon
                          width={24}
                          height={24}
                          name={
                            weatherDataOpenIndex === index
                              ? 'arrow-up'
                              : 'arrow-down'
                          }
                          style={{ color: colors.primaryText }}
                        />
                      </TouchableOpacity>
                    </View>
                    {weatherDataOpenIndex === index &&
                      forecastByDay &&
                      forecastByDay[stepMoment.format('D.M.')].map(
                        (hourStep: TimestepData, hourIndex: number) => {
                          const dayStepMoment = moment.unix(hourStep.epochtime);
                          const dayTempPrefix = hourStep.temperature > 0 && '+';
                          const hourSmartSymbol = weatherSymbolGetter(
                            hourStep.smartSymbol.toString(),
                            dark
                          );
                          const sunrise = moment(hourStep.sunrise);
                          const sunset = moment(hourStep.sunset);
                          const dayDuration = moment.duration(
                            sunset.diff(sunrise)
                          );

                          const dayLength = moment
                            .utc(dayDuration.asMilliseconds())
                            .format('HH [h] mm [min]');

                          return (
                            <View
                              style={{
                                backgroundColor: colors.background,
                              }}>
                              {hourIndex === 0 && (
                                <View
                                  style={[
                                    styles.row,
                                    styles.forecastHeader,
                                    styles.alignStart,
                                    { borderBottomColor: colors.border },
                                  ]}>
                                  <View style={styles.withMarginRight}>
                                    <Icon
                                      width={24}
                                      height={24}
                                      name="sunrise"
                                      style={[
                                        styles.withMarginRight,
                                        {
                                          color: colors.text,
                                        },
                                      ]}
                                    />
                                  </View>
                                  <View>
                                    <Text
                                      style={[
                                        styles.cardText,
                                        { color: colors.text },
                                      ]}>
                                      Aurinko nousee{' '}
                                      <Text style={styles.bold}>
                                        {sunrise.format('HH:mm')}
                                      </Text>{' '}
                                      Laskee{' '}
                                      <Text style={styles.bold}>
                                        {sunset.format('HH:mm')}
                                      </Text>
                                    </Text>
                                    <Text
                                      style={[
                                        styles.cardText,
                                        { color: colors.text },
                                      ]}>
                                      Päivän pituus{' '}
                                      <Text style={styles.bold}>
                                        {dayLength}
                                      </Text>
                                    </Text>
                                  </View>
                                </View>
                              )}
                              <View
                                key={hourStep.epochtime}
                                style={[
                                  styles.row,
                                  styles.hourContainer,
                                  styles.alignStart,
                                  {
                                    borderBottomColor: colors.border,
                                  },
                                ]}>
                                <View
                                  style={[
                                    styles.timeContainer,
                                    {
                                      borderRightColor: colors.border,
                                    },
                                  ]}>
                                  <Text
                                    style={[
                                      styles.forecastText,
                                      styles.medium,
                                      { color: colors.primaryText },
                                    ]}>
                                    {dayStepMoment.format('HH:mm')}
                                  </Text>
                                </View>
                                <View
                                  style={[
                                    styles.row,
                                    styles.alignStart,
                                    styles.withPaddingLeft,
                                  ]}>
                                  <View style={styles.hourColumn}>
                                    <View
                                      style={[styles.row, styles.alignStart]}>
                                      <View style={styles.withMarginRight}>
                                        {hourSmartSymbol?.({
                                          width: 40,
                                          height: 40,
                                        })}
                                      </View>
                                      <Text
                                        style={[
                                          styles.hourTemperature,
                                          { color: colors.primaryText },
                                        ]}>{`${dayTempPrefix}${hourStep.temperature}°`}</Text>
                                    </View>
                                    <View
                                      style={[styles.row, styles.alignStart]}>
                                      <View>
                                        <Icon
                                          name={
                                            dark ? 'rain-dark' : 'rain-light'
                                          }
                                          width={24}
                                          height={24}
                                        />
                                      </View>
                                      <Text
                                        style={[
                                          styles.hourText,
                                          { color: colors.text },
                                        ]}>
                                        <Text style={styles.bold}>
                                          {hourStep.pop}
                                        </Text>{' '}
                                        %{' '}
                                        <Text style={styles.bold}>
                                          {hourStep.precipitation1h}
                                        </Text>{' '}
                                        mm
                                      </Text>
                                    </View>
                                  </View>
                                  <View
                                    style={[
                                      styles.withPaddingLeft,
                                      styles.hourColumn,
                                    ]}>
                                    <View
                                      style={[styles.row, styles.alignStart]}>
                                      <View>
                                        <Icon
                                          size={22}
                                          name="person"
                                          color={colors.text}
                                        />
                                      </View>
                                      <Text
                                        style={[
                                          styles.hourText,
                                          { color: colors.primaryText },
                                        ]}>
                                        Tuntuu{' '}
                                        <Text
                                          style={
                                            styles.bold
                                          }>{`${dayTempPrefix}${hourStep.feelsLike}°`}</Text>
                                      </Text>
                                    </View>
                                    <View
                                      style={[styles.row, styles.alignStart]}>
                                      <View>
                                        <Icon
                                          name={
                                            dark ? 'wind-dark' : 'wind-light'
                                          }
                                          width={24}
                                          height={24}
                                          style={{
                                            transform: [
                                              {
                                                rotate: `${
                                                  hourStep.winddirection +
                                                  45 -
                                                  180
                                                }deg`,
                                              },
                                            ],
                                          }}
                                        />
                                      </View>
                                      <Text
                                        style={[
                                          styles.hourText,
                                          { color: colors.text },
                                        ]}>
                                        <Text style={styles.bold}>
                                          {hourStep.windspeedms}
                                        </Text>{' '}
                                        m/s
                                      </Text>
                                    </View>
                                  </View>
                                </View>
                              </View>
                            </View>
                          );
                        }
                      )}
                  </View>
                );
              })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: '100%',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  cardWrapper: {
    borderRadius: 8,
    marginBottom: 8,
    shadowOffset: {
      width: -2,
      height: 2,
    },
    shadowRadius: 16,
    shadowOpacity: 1,
  },
  cardHeader: {
    height: 44,
    borderTopRightRadius: 8,
    borderTopLeftRadius: 8,
    paddingVertical: 12,
    paddingLeft: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
    textTransform: 'capitalize',
  },
  bold: {
    fontFamily: 'Roboto-Bold',
  },
  medium: {
    fontFamily: 'Roboto-Medium',
  },
  cardContainer: {
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  cardText: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  alignStart: {
    justifyContent: 'flex-start',
  },
  alignCenter: {
    justifyContent: 'center',
  },
  withMarginRight: {
    marginRight: 9,
  },
  withPaddingLeft: {
    paddingLeft: 8,
  },
  forecastContainer: {
    marginHorizontal: 8,
    marginBottom: 8,
  },
  forecastHeader: {
    height: 56,
    borderBottomWidth: 1,
    paddingHorizontal: 16,
  },
  hourContainer: {
    height: 80,
    borderBottomWidth: 1,
    paddingHorizontal: 18,
  },
  forecastText: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
  },
  temperature: {
    fontSize: 18,
    fontFamily: 'Roboto-Bold',
  },
  hourTemperature: {
    fontSize: 24,
    fontFamily: 'Roboto-Bold',
  },
  hourText: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
  },
  hourColumn: {
    flex: 1,
  },
  timeContainer: {
    height: '100%',
    borderRightWidth: 1,
    justifyContent: 'center',
    paddingRight: 10,
  },
  weekWarningsContainer: {
    borderWidth: 1,
    borderRadius: 4,
    height: 100,
    marginVertical: 12,
  },
  warningDaysContainer: {
    borderBottomWidth: 1,
    height: 60,
    flexDirection: 'row',
  },
  warningsSingleDayContainer: {
    height: '100%',
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    justifyContent: 'space-between',
  },
  startBorderRadius: {
    borderTopLeftRadius: 4,
  },
  endBorderRadius: {
    borderTopRightRadius: 4,
  },
  withBorderRight: {
    borderRightWidth: 1,
  },
  dayWarningHeaderText: {
    textTransform: 'capitalize',
    textAlign: 'center',
  },
  severityBar: {
    height: 6,
    borderWidth: 1,
    backgroundColor: GREEN,
  },
});

export default connector(WeatherScreen);
