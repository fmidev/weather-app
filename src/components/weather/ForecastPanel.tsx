import React, { useState, useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import {
  ActivityIndicator,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import moment from 'moment';
import 'moment/locale/fi';
import 'moment/locale/en-gb';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { State } from '@store/types';

import {
  selectLoading,
  selectForecastByDay,
  selectHeaderLevelForecast,
  selectForecastLastUpdatedMoment,
  selectMinimumsAndMaximums,
} from '@store/forecast/selectors';

import { CustomTheme } from '@utils/colors';

import Icon from '@components/common/Icon';
import CollapsibleListHeader from './common/CollapsibleListHeader';
import PanelHeader from './common/PanelHeader';
import ForecastByHourList from './forecast/ForecastByHourList';
import CollapsibleChartList from './forecast/CollapsibleChartList';

const TABLE = 'table';
const CHART = 'chart';

const mapStateToProps = (state: State) => ({
  loading: selectLoading(state),
  forecastByDay: selectForecastByDay(state),
  headerLevelForecast: selectHeaderLevelForecast(state),
  forecastLastUpdatedMoment: selectForecastLastUpdatedMoment(state),
  minimumsAndMaximums: selectMinimumsAndMaximums(state),
});
const connector = connect(mapStateToProps, {});

type PropsFromRedux = ConnectedProps<typeof connector>;

type ForecastPanelProps = PropsFromRedux;

const ForecastPanel: React.FC<ForecastPanelProps> = ({
  loading,
  forecastByDay,
  forecastLastUpdatedMoment,
  headerLevelForecast,
  minimumsAndMaximums,
}) => {
  const { colors } = useTheme() as CustomTheme;
  const { t, i18n } = useTranslation('forecast');
  const locale = i18n.language;
  const [dayOpenIndexes, setDayOpenIndexes] = useState<number[]>([]);
  const [toDisplay, setToDisplay] = useState<typeof TABLE | typeof CHART>(
    TABLE
  );
  const [selectedDate, setSelectedDate] = useState<string | undefined>(
    undefined
  );

  const dateKeys = Object.keys(forecastByDay);

  useEffect(() => {
    if (forecastByDay) {
      if (dateKeys.length > 0 && !selectedDate) {
        setSelectedDate(dateKeys[0]);
      }
    }
  }, [forecastByDay, dateKeys, selectedDate]);

  const forecastLastUpdated =
    forecastLastUpdatedMoment &&
    forecastLastUpdatedMoment.format(`D.M. [${t('at')}] HH:mm`);

  return (
    <View
      style={[
        styles.panelWrapper,
        {
          backgroundColor: colors.background,
          shadowColor: colors.cardShadow,
        },
      ]}>
      <PanelHeader title={t('panelHeader')} />
      <View style={styles.panelContainer}>
        <Text style={[styles.panelText, { color: colors.primaryText }]}>
          {t('lastUpdated')}{' '}
          <Text style={styles.bold}>{forecastLastUpdated}</Text>
        </Text>
      </View>
      <View style={styles.panelContainer}>
        <View style={[styles.row]}>
          <View style={[styles.row, styles.justifyStart]}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => setToDisplay(TABLE)}
              style={[
                styles.contentSelectionContainer,
                styles.withMarginRight,
                {
                  backgroundColor:
                    toDisplay === TABLE
                      ? colors.timeStepBackground
                      : colors.inputButtonBackground,
                  borderColor:
                    toDisplay === TABLE
                      ? colors.chartSecondaryLine
                      : colors.secondaryBorder,
                },
              ]}>
              <Text
                style={[
                  styles.forecastText,
                  styles.medium,
                  toDisplay === TABLE && styles.selectedText,
                  {
                    color:
                      toDisplay === TABLE
                        ? colors.primaryText
                        : colors.hourListText,
                  },
                ]}>
                {t('table')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => setToDisplay(CHART)}
              style={[
                styles.contentSelectionContainer,
                {
                  backgroundColor:
                    toDisplay === CHART
                      ? colors.timeStepBackground
                      : colors.inputButtonBackground,
                  borderColor:
                    toDisplay === CHART
                      ? colors.chartSecondaryLine
                      : colors.secondaryBorder,
                },
              ]}>
              <Text
                style={[
                  styles.forecastText,
                  styles.medium,
                  toDisplay === CHART && styles.selectedText,
                  {
                    color:
                      toDisplay === CHART
                        ? colors.primaryText
                        : colors.hourListText,
                  },
                ]}>
                {t('chart')}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.row, styles.justifyEnd]}>
            <View
              style={[styles.separator, { backgroundColor: colors.border }]}
            />
            <TouchableOpacity
              style={styles.bottomSheetButton}
              onPress={() => console.log('show settings bottom sheet')}>
              <Icon
                name="settings-outline"
                color={colors.primaryText}
                size={18}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.bottomSheetButton}
              onPress={() => console.log('show info bottom sheet')}>
              <Icon
                name="info"
                color={colors.primaryText}
                height={18}
                width={18}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View style={[styles.forecastContainer]}>
        {loading && <ActivityIndicator />}
        {headerLevelForecast &&
          headerLevelForecast.length > 0 &&
          toDisplay === TABLE &&
          headerLevelForecast.map((dayStep, index) => {
            const stepMoment = moment.unix(dayStep.timeStamp);
            const maxTemperaturePrefix = dayStep.maxTemperature > 0 ? '+' : '';
            const minTemperaturePrefix = dayStep.minTemperature > 0 ? '+' : '';

            return (
              <View key={dayStep.timeStamp}>
                <CollapsibleListHeader
                  accessibilityLabel={
                    !dayOpenIndexes.includes(index)
                      ? `${t(
                          'hourListOpenAccessibilityLabel'
                        )} ${stepMoment.locale(locale).format('ddd D.M.')}`
                      : `${t(
                          'hourListCloseAccessibilityLabel'
                        )} ${stepMoment.locale(locale).format('ddd D.M.')}`
                  }
                  onPress={() => {
                    if (dayOpenIndexes.includes(index)) {
                      setDayOpenIndexes(
                        dayOpenIndexes.filter((i) => i !== index)
                      );
                    } else {
                      setDayOpenIndexes(dayOpenIndexes.concat(index));
                    }
                  }}
                  open={dayOpenIndexes.includes(index)}
                  title={stepMoment.locale(locale).format('ddd D.M.')}
                  maxTemp={`${maxTemperaturePrefix}${dayStep.maxTemperature}°`}
                  minTemp={`${minTemperaturePrefix}${dayStep.minTemperature}°`}
                  totalPrecipitation={dayStep.totalPrecipitation}
                  precipitationDay={
                    forecastByDay &&
                    forecastByDay[stepMoment.format('D.M.')].map((f) => ({
                      precipitation: f.precipitation1h,
                      timestamp: f.epochtime,
                    }))
                  }
                />
                {forecastByDay && dayOpenIndexes.includes(index) && (
                  <ForecastByHourList
                    dayForecast={forecastByDay[stepMoment.format('D.M.')]}
                    isOpen={dayOpenIndexes.includes(index)}
                  />
                )}
              </View>
            );
          })}
        {headerLevelForecast &&
          headerLevelForecast.length > 0 &&
          toDisplay === CHART && (
            <CollapsibleChartList
              data={forecastByDay && forecastByDay[selectedDate!]}
              selectedDate={
                forecastByDay &&
                moment
                  .unix(forecastByDay[selectedDate!][0]?.epochtime)
                  .locale(locale)
                  .format('dddd D.M.')
              }
              showPreviousDay={() => {
                const index =
                  (!!selectedDate && dateKeys.indexOf(selectedDate) - 1) || 0;
                if (index >= 0 && dateKeys[index]) {
                  setSelectedDate(dateKeys[index]);
                }
              }}
              showNextDay={() => {
                const index =
                  !!selectedDate && dateKeys.indexOf(selectedDate) + 1;
                if (index && dateKeys[index]) {
                  setSelectedDate(dateKeys[index]);
                }
              }}
              showPreviousDisabled={
                !!selectedDate && dateKeys.indexOf(selectedDate) === 0
              }
              showNextDisabled={
                !!selectedDate &&
                dateKeys.indexOf(selectedDate) === dateKeys.length - 1
              }
              maxTemp={minimumsAndMaximums?.totalTempMax}
              minTemp={minimumsAndMaximums?.totalTempMin}
            />
          )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  panelWrapper: {
    borderRadius: 8,
    marginBottom: 8,
    shadowOffset: {
      width: -2,
      height: 2,
    },
    shadowRadius: 16,
    shadowOpacity: 1,
  },
  bold: {
    fontFamily: 'Roboto-Bold',
  },
  medium: {
    fontFamily: 'Roboto-Medium',
  },
  panelContainer: {
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  panelText: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  forecastContainer: {
    marginHorizontal: 8,
    marginBottom: 8,
    flex: 1,
  },
  forecastText: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
  },
  justifyStart: {
    justifyContent: 'flex-start',
  },
  justifyEnd: {
    justifyContent: 'flex-end',
  },
  selectedText: {
    fontFamily: 'Roboto-Bold',
  },
  withMarginRight: {
    marginRight: 16,
  },
  contentSelectionContainer: {
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  separator: {
    minHeight: '70%',
    width: 1,
  },
  bottomSheetButton: {
    padding: 10,
  },
});

export default connector(ForecastPanel);
