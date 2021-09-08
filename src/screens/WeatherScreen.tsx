import React, { useEffect } from 'react';
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

import Icon from '../components/common/Icon';
import ForecastPanel from '../components/weather/panels/ForecastPanel';
import ObservationPanel from '../components/weather/panels/ObservationPanel';

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
  const { colors } = useTheme() as CustomTheme;

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
        <ForecastPanel />
        <ObservationPanel />
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
