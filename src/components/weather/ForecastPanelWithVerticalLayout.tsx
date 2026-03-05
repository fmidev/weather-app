import React, { useState, useEffect, useRef } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import moment from 'moment-timezone';
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

import Text from '@components/common/AppText';
import Icon from '@components/common/ScalableIcon';
import AccessibleTouchableOpacity from '@components/common/AccessibleTouchableOpacity';
import { selectTimeZone } from '@store/location/selector';
import { updateDisplayFormat as updateDisplayFormatAction } from '@store/forecast/actions';
import { Config } from '@config';
import { selectClockType } from '@store/settings/selectors';
import PanelHeader from './common/PanelHeader';
import ChartList from './forecast/ChartList';
import ParamsBottomSheet from './sheets/ParamsBottomSheet';
import WeatherInfoBottomSheet from './sheets/WeatherInfoBottomSheet';
import Vertical10DaysForecast from './forecast/Vertical10DaysForecast';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { trackMatomoEvent } from '@utils/matomo';
import { formatAccessibleDateTime } from '@utils/helpers';

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  currentHour, // just for re-rendering every hour
}) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme() as CustomTheme;
  const { t, i18n } = useTranslation('forecast');
  const locale = i18n.language;
  const [activeDayIndex, setActiveDayIndex] = useState<number>(0);
  const [selectedDate, setSelectedDate] = useState<string | undefined>(
    undefined
  );
  const paramSheetRef = useRef<RBSheet>(null);
  const weatherInfoSheetRef = useRef<RBSheet>(null);
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
          `${locale === 'en' ? 'D MMM' : 'D.M.'} ${
            clockType === 12 ? 'h:mm a' : 'HH:mm'
          }`
        )
      : undefined,
    ageCheck: forecastAge > (ageWarning ?? 720) * 60 * 1000,
  };

  const accessibleLastUpdated = forecastLastUpdatedMoment
    ? formatAccessibleDateTime(forecastLastUpdatedMoment, t, clockType === 24, false)
    : '';

  return (
    <View
      style={[
        styles.panelWrapper,
        {
          backgroundColor: colors.background,
          shadowColor: colors.shadow,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
      ]}>
      <PanelHeader
        title={t('panelHeader', { forecastLength: forecastLengthTitle || 10 })}
        accessibleTitle={t('accessiblePanelHeader', { forecastLength: forecastLengthTitle || 10 })}
        lastUpdated={forecastLastUpdated}
        accessibleLastUpdated={accessibleLastUpdated}
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
              onPress={() => {
                trackMatomoEvent('User action', 'Weather', 'Show forecast in TABLE format');
                updateDisplayFormat(TABLE)
              }}
              style={styles.withMarginRight}>
              <View
                style={[
                  styles.contentSelectionContainer,
                  {
                    backgroundColor:
                      displayFormat === TABLE
                        ? colors.timeStepBackground : colors.inputButtonBackground,
                    borderColor:
                      displayFormat === TABLE
                        ? colors.chartSecondaryLine
                        : colors.secondaryBorder,
                  },
                ]}>
                <Text
                  maxFontSizeMultiplier={1.6}
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
              onPress={() => {
                trackMatomoEvent('User action', 'Weather', 'Show forecast in CHART format');
                updateDisplayFormat(CHART)
              }}>
              <View
                style={[
                  styles.contentSelectionContainer,
                  {
                    backgroundColor:
                      displayFormat === CHART
                        ? colors.timeStepBackground : colors.inputButtonBackground,
                    borderColor:
                      displayFormat === CHART
                        ? colors.chartSecondaryLine
                        : colors.secondaryBorder,
                  },
                ]}>
                <Text
                  maxFontSizeMultiplier={1.6}
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
            <AccessibleTouchableOpacity
              testID="params_button"
              accessibilityRole="button"
              accessibilityLabel={t('paramsAccessibilityLabel')}
              accessibilityHint={t('paramsBottomSheet.subTitle')}
              style={styles.bottomSheetButton}
              onPress={() => {
                trackMatomoEvent('User action', 'Weather', 'Open forecast parameter settings');
                paramSheetRef.current?.open();
              }}
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
                maxScaleFactor={1.5}
              />
            </AccessibleTouchableOpacity>
            <AccessibleTouchableOpacity
              testID="info_button"
              accessibilityRole="button"
              accessibilityLabel={t('infoAccessibilityLabel')}
              accessibilityHint={t('infoAccessibilityHint')}
              style={styles.bottomSheetButton}
              onPress={() => {
                trackMatomoEvent('User action', 'Weather', 'Open forecast info bottomsheet');
                weatherInfoSheetRef.current?.open();
              }}
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
                maxScaleFactor={1.5}
              />
            </AccessibleTouchableOpacity>
          </View>
        </View>
      </View>
      <View style={[styles.forecastContainer]}>
        {loading && (
          <ActivityIndicator accessibilityLabel={t('weather:loading')} />
        )}
        {headerLevelForecast && headerLevelForecast.length > 0 && displayFormat === TABLE && (
          <Vertical10DaysForecast dayData={headerLevelForecast} />
        )}
        {sections &&
          sections.length > 0 &&
          headerLevelForecast &&
          headerLevelForecast.length > 0 &&
          displayFormat === CHART && (
            <ChartList
              data={data}
              activeDayIndex={activeDayIndex}
              setActiveDayIndex={(i:number) => setActiveDayIndex(i)}
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
        <ParamsBottomSheet onClose={() => paramSheetRef.current?.close()} />
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
          onClose={() => weatherInfoSheetRef.current?.close()}
        />
      </RBSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  panelWrapper: {
    borderRadius: 8,
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
  bottomSheetButton: {
    paddingHorizontal: 6,
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
