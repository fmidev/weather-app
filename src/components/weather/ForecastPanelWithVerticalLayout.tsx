import React, { useState, useEffect, useRef } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import moment from 'moment-timezone';
import 'moment/locale/fi';
import 'moment/locale/sv';
import 'moment/locale/en-gb';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import RBSheet from 'react-native-raw-bottom-sheet';

import { State } from '@store/types';

import {
  selectLoading,
  selectForecastByDay,
  selectHeaderLevelForecast,
  selectForecastLastUpdatedMoment,
  selectForecast,
  selectDisplayFormat,
  selectForecastAge,
} from '@store/forecast/selectors';

import { GRAY_1, CustomTheme } from '@assets/colors';

import Icon from '@components/common/Icon';
import AccessibleTouchableOpacity from '@components/common/AccessibleTouchableOpacity';
import { selectTimeZone } from '@store/location/selector';
import { updateDisplayFormat as updateDisplayFormatAction } from '@store/forecast/actions';
import { Config } from '@config';
import { selectClockType } from '@store/settings/selectors';
import PanelHeader from './common/PanelHeader';
import DaySelectorList from './forecast/DaySelectorList';
import ForecastByHourList from './forecast/ForecastByHourList';
import ChartList from './forecast/ChartList';
import ParamsBottomSheet from './sheets/ParamsBottomSheet';
import WeatherInfoBottomSheet from './sheets/WeatherInfoBottomSheet';

const TABLE = 'table';
const CHART = 'chart';

const mapStateToProps = (state: State) => ({
  clockType: selectClockType(state),
  loading: selectLoading(state),
  forecastByDay: selectForecastByDay(state),
  data: selectForecast(state),
  headerLevelForecast: selectHeaderLevelForecast(state),
  forecastLastUpdatedMoment: selectForecastLastUpdatedMoment(state),
  forecastAge: selectForecastAge(state),
  timezone: selectTimeZone(state),
  displayFormat: selectDisplayFormat(state),
});

const mapDispatchToProps = {
  updateDisplayFormat: updateDisplayFormatAction,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

type ForecastPanelProps = PropsFromRedux & {
  currentHour: number;
};

const ForecastPanelWithVerticalLayout: React.FC<ForecastPanelProps> = ({
  clockType,
  loading,
  forecastByDay,
  data,
  forecastLastUpdatedMoment,
  forecastAge,
  headerLevelForecast,
  timezone,
  displayFormat,
  updateDisplayFormat,
  currentHour, // just for re-rendering every hour
}) => {
  const { colors } = useTheme() as CustomTheme;
  const { t, i18n } = useTranslation('forecast');
  const locale = i18n.language;
  const [activeDayIndex, setActiveDayIndex] = useState<number>(0);
  const [selectedDate, setSelectedDate] = useState<string | undefined>(
    undefined
  );
  const paramSheetRef = useRef() as React.MutableRefObject<RBSheet>;
  const weatherInfoSheetRef = useRef() as React.MutableRefObject<RBSheet>;
  const { ageWarning, forecastLengthTitle } = Config.get('weather').forecast;

  const dateKeys = forecastByDay && Object.keys(forecastByDay);

  useEffect(() => {
    if (forecastByDay) {
      if (dateKeys && dateKeys.length > 0 && !selectedDate) {
        setSelectedDate(dateKeys[0]);
      }
    }
  }, [forecastByDay, dateKeys, selectedDate]);

  useEffect(() => {
    moment.tz.setDefault(timezone);
  }, [timezone]);
  const sections =
    forecastByDay &&
    Object.keys(forecastByDay).map((k) => ({
      day: k,
      data: forecastByDay[k],
    }));

  const forecastLastUpdated = {
    time: forecastLastUpdatedMoment
      ? forecastLastUpdatedMoment.format(
          `${locale === 'en' ? 'D MMM' : 'D.M.'} [${t('at')}] ${
            clockType === 12 ? 'h.mm a' : 'HH.mm'
          }`
        )
      : undefined,
    ageCheck: forecastAge > (ageWarning ?? 720) * 60 * 1000,
  };

  return (
    <View
      style={[
        styles.panelWrapper,
        {
          backgroundColor: colors.background,
          shadowColor: colors.shadow,
        },
      ]}>
      <PanelHeader
        title={t('panelHeader', { forecastLength: forecastLengthTitle || 10 })}
        lastUpdated={forecastLastUpdated}
        thin
      />
      <View style={styles.panelContainer}>
        <View style={[styles.row]}>
          <View style={[styles.row, styles.justifyStart]}>
            <AccessibleTouchableOpacity
              testID="forecast_table_button"
              accessibilityRole="button"
              accessibilityHint={`${t('tableAccessibilityHint')}. ${
                displayFormat === TABLE ? t('active') : t('notActive')
              }`}
              activeOpacity={1}
              onPress={() => updateDisplayFormat(TABLE)}
              style={styles.withMarginRight}>
              <View
                style={[
                  styles.contentSelectionContainer,
                  {
                    backgroundColor:
                      displayFormat === TABLE
                        ? colors.timeStepBackground
                        : colors.inputButtonBackground,
                    borderColor:
                      displayFormat === TABLE
                        ? colors.chartSecondaryLine
                        : colors.secondaryBorder,
                  },
                ]}>
                <Text
                  style={[
                    styles.forecastText,
                    displayFormat === TABLE && styles.selectedText,
                    {
                      color:
                        displayFormat === TABLE
                          ? colors.primaryText
                          : colors.hourListText,
                    },
                  ]}>
                  {t('table')}
                </Text>
              </View>
            </AccessibleTouchableOpacity>
            <AccessibleTouchableOpacity
              testID="forecast_chart_button"
              accessibilityRole="button"
              accessibilityHint={`${t('chartAccessibilityHint')}. ${
                displayFormat === CHART ? t('active') : t('notActive')
              }`}
              activeOpacity={1}
              onPress={() => updateDisplayFormat(CHART)}>
              <View
                style={[
                  styles.contentSelectionContainer,
                  {
                    backgroundColor:
                      displayFormat === CHART
                        ? colors.timeStepBackground
                        : colors.inputButtonBackground,
                    borderColor:
                      displayFormat === CHART
                        ? colors.chartSecondaryLine
                        : colors.secondaryBorder,
                  },
                ]}>
                <Text
                  style={[
                    styles.forecastText,
                    displayFormat === CHART && styles.selectedText,
                    {
                      color:
                        displayFormat === CHART
                          ? colors.primaryText
                          : colors.hourListText,
                    },
                  ]}>
                  {t('chart')}
                </Text>
              </View>
            </AccessibleTouchableOpacity>
          </View>
          <View style={[styles.row, styles.justifyEnd]}>
            <View
              style={[styles.separator, { backgroundColor: colors.border }]}
            />
            <AccessibleTouchableOpacity
              testID="params_button"
              accessibilityRole="button"
              accessibilityLabel={t('paramsAccessibilityLabel')}
              accessibilityHint={t('paramsBottomSheet.subTitle')}
              style={styles.bottomSheetButton}
              onPress={() => paramSheetRef.current.open()}
              disabled={displayFormat === CHART}>
              <Icon
                name="settings"
                color={
                  displayFormat === CHART
                    ? colors.secondaryBorder
                    : colors.primaryText
                }
                width={24}
                height={24}
              />
            </AccessibleTouchableOpacity>
            <AccessibleTouchableOpacity
              testID="info_button"
              accessibilityRole="button"
              accessibilityLabel={t('infoAccessibilityLabel')}
              accessibilityHint={t('infoAccessibilityHint')}
              style={styles.bottomSheetButton}
              onPress={() => weatherInfoSheetRef.current.open()}
              disabled={displayFormat === CHART}>
              <Icon
                name="info"
                color={
                  displayFormat === CHART
                    ? colors.secondaryBorder
                    : colors.primaryText
                }
                height={24}
                width={24}
              />
            </AccessibleTouchableOpacity>
          </View>
        </View>
      </View>
      <View style={styles.forecastContainer}>
        {headerLevelForecast && headerLevelForecast.length > 0 && (
          <DaySelectorList
            activeDayIndex={activeDayIndex}
            setActiveDayIndex={setActiveDayIndex}
            dayData={headerLevelForecast}
          />
        )}
      </View>
      <View style={[styles.forecastContainer]}>
        {loading && (
          <ActivityIndicator accessibilityLabel={t('weather:loading')} />
        )}
        {sections && sections.length > 0 && displayFormat === TABLE && (
          <ForecastByHourList
            data={data}
            isOpen
            activeDayIndex={activeDayIndex}
            setActiveDayIndex={(i) => setActiveDayIndex(i)}
            currentDayOffset={sections[0].data.length}
            currentHour={currentHour}
          />
        )}
        {sections &&
          sections.length > 0 &&
          headerLevelForecast &&
          headerLevelForecast.length > 0 &&
          displayFormat === CHART && (
            <ChartList
              data={data}
              activeDayIndex={activeDayIndex}
              setActiveDayIndex={(i) => setActiveDayIndex(i)}
              currentDayOffset={sections[0].data.length}
            />
          )}
      </View>
      <RBSheet
        ref={paramSheetRef}
        height={600}
        closeOnDragDown
        customStyles={{
          container: {
            ...styles.sheetContainer,
            backgroundColor: colors.background,
          },
          draggableIcon: styles.draggableIcon,
        }}>
        <ParamsBottomSheet onClose={() => paramSheetRef.current.close()} />
      </RBSheet>
      <RBSheet
        ref={weatherInfoSheetRef}
        height={600}
        closeOnDragDown
        customStyles={{
          container: {
            ...styles.sheetContainer,
            backgroundColor: colors.background,
          },
          draggableIcon: styles.draggableIcon,
        }}>
        <WeatherInfoBottomSheet
          onClose={() => weatherInfoSheetRef.current.close()}
        />
      </RBSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  panelWrapper: {
    borderRadius: 8,
    shadowOffset: {
      width: -2,
      height: 2,
    },
    shadowRadius: 16,
    shadowOpacity: 1,
    elevation: 3,
  },
  panelContainer: {
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  forecastContainer: {
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
    borderRadius: 20,
  },
  separator: {
    minHeight: '70%',
    width: 1,
  },
  bottomSheetButton: {
    paddingHorizontal: 10,
  },
  sheetContainer: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  draggableIcon: {
    backgroundColor: GRAY_1,
    width: 65,
  },
});

export default connector(ForecastPanelWithVerticalLayout);
