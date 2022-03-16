import React, { useState, useEffect, useRef } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import {
  ActivityIndicator,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import moment from 'moment-timezone';
import 'moment/locale/fi';
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
} from '@store/forecast/selectors';

import { GRAY_1, CustomTheme } from '@utils/colors';

import Icon from '@components/common/Icon';
import { selectTimeZone } from '@store/location/selector';
import { updateDisplayFormat as updateDisplayFormatAction } from '@store/forecast/actions';
import PanelHeader from './common/PanelHeader';
import DaySelectorList from './forecast/DaySelectorList';
import ForecastByHourList from './forecast/ForecastByHourList';
import ChartList from './forecast/ChartList';
import ParamsBottomSheet from './sheets/ParamsBottomSheet';
import WeatherInfoBottomSheet from './sheets/WeatherInfoBottomSheet';

const TABLE = 'table';
const CHART = 'chart';

const mapStateToProps = (state: State) => ({
  loading: selectLoading(state),
  forecastByDay: selectForecastByDay(state),
  data: selectForecast(state),
  headerLevelForecast: selectHeaderLevelForecast(state),
  forecastLastUpdatedMoment: selectForecastLastUpdatedMoment(state),
  timezone: selectTimeZone(state),
  displayFormat: selectDisplayFormat(state),
});

const mapDispatchToProps = {
  updateDisplayFormat: updateDisplayFormatAction,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

type ForecastPanelProps = PropsFromRedux;

const ForecastPanel: React.FC<ForecastPanelProps> = ({
  loading,
  forecastByDay,
  data,
  forecastLastUpdatedMoment,
  headerLevelForecast,
  timezone,
  displayFormat,
  updateDisplayFormat,
}) => {
  const { colors } = useTheme() as CustomTheme;
  const { t } = useTranslation('forecast');
  const [activeDayIndex, setActiveDayIndex] = useState<number>(0);
  const [selectedDate, setSelectedDate] = useState<string | undefined>(
    undefined
  );
  const paramSheetRef = useRef() as React.MutableRefObject<RBSheet>;
  const weatherInfoSheetRef = useRef() as React.MutableRefObject<RBSheet>;

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

  const forecastLastUpdated =
    forecastLastUpdatedMoment &&
    forecastLastUpdatedMoment.format(`D.M. [${t('at')}] HH:mm`);

  return (
    <View
      style={[
        styles.panelWrapper,
        {
          backgroundColor: colors.background,
          shadowColor: colors.shadow,
        },
      ]}>
      <PanelHeader title={t('panelHeader')} lastUpdated={forecastLastUpdated} />
      <View style={styles.panelContainer}>
        <View style={[styles.row]}>
          <View style={[styles.row, styles.justifyStart]}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityHint={t('tableAccessibilityHint')}
              activeOpacity={1}
              onPress={() => updateDisplayFormat(TABLE)}
              style={[
                styles.contentSelectionContainer,
                styles.withMarginRight,
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
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityHint={t('chartAccessibilityHint')}
              activeOpacity={1}
              onPress={() => updateDisplayFormat(CHART)}
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
            </TouchableOpacity>
          </View>
          {displayFormat === TABLE && (
            <View style={[styles.row, styles.justifyEnd]}>
              <View
                style={[styles.separator, { backgroundColor: colors.border }]}
              />
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={t('paramsAccessibilityLabel')}
                accessibilityHint={t('paramsAccessibilityHint')}
                style={styles.bottomSheetButton}
                onPress={() => paramSheetRef.current.open()}>
                <Icon
                  name="settings"
                  color={colors.primaryText}
                  width={24}
                  height={24}
                />
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={t('infoAccessibilityLabel')}
                accessibilityHint={t('infoAccessibilityHint')}
                style={styles.bottomSheetButton}
                onPress={() => weatherInfoSheetRef.current.open()}>
                <Icon
                  name="info"
                  color={colors.primaryText}
                  height={24}
                  width={24}
                />
              </TouchableOpacity>
            </View>
          )}
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
        {loading && <ActivityIndicator />}
        {sections && sections.length > 0 && displayFormat === TABLE && (
          <ForecastByHourList
            data={data}
            isOpen
            activeDayIndex={activeDayIndex}
            setActiveDayIndex={(i) => setActiveDayIndex(i)}
            currentDayOffset={sections[0].data.length}
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
    marginBottom: 8,
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
    marginLeft: 8,
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

export default connector(ForecastPanel);
