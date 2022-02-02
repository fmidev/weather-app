import React, { useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import moment from 'moment';

import { CustomTheme } from '@utils/colors';
import { TimeStepData } from '@store/observation/types';
import { getObservationCellValue } from '@utils/helpers';

import Icon from '@components/common/Icon';
import { capitalize } from '@utils/chart';
import WeatherInfoBottomSheet from '../sheets/WeatherInfoBottomSheet';

type LatestProps = {
  data: TimeStepData[];
};
const Latest: React.FC<LatestProps> = ({ data }) => {
  const { colors } = useTheme() as CustomTheme;
  const { t, i18n } = useTranslation('observation');
  const locale = i18n.language;
  const weatherInfoSheetRef = useRef() as React.MutableRefObject<RBSheet>;

  const latestObservation = data && data.length > 0 && data[data.length - 1];
  const latestObservationTime =
    latestObservation &&
    moment(latestObservation.epochtime * 1000)
      .locale(locale)
      .format(`dd D.M. [${t('at')}] HH:mm`);
  return (
    <>
      {!!latestObservation && (
        <View>
          <View style={[styles.row]}>
            <View style={[styles.latestObservation]}>
              <Text style={[styles.panelText, { color: colors.hourListText }]}>
                {t('latestObservation')}
              </Text>
              <Text
                style={[
                  styles.bold,
                  styles.justifyStart,
                  { color: colors.hourListText },
                ]}>
                {latestObservationTime
                  ? capitalize(latestObservationTime)
                  : '-'}
              </Text>
            </View>
            <TouchableOpacity
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
          <View style={styles.observationRow}>
            <View>
              <Text
                style={[
                  styles.panelMeasurement,
                  { color: colors.hourListText },
                ]}>
                {t('measurements.temperature')}
              </Text>
              <Text
                style={[
                  styles.panelMeasurement,
                  { color: colors.hourListText },
                ]}>
                {t('measurements.dewPoint')}
              </Text>
              <Text
                style={[
                  styles.panelMeasurement,
                  { color: colors.hourListText },
                ]}>
                {t('measurements.precipitation1h')}
              </Text>
              <Text
                style={[
                  styles.panelMeasurement,
                  { color: colors.hourListText },
                ]}>
                {t('measurements.windSpeedMS')}
              </Text>
              <Text
                style={[
                  styles.panelMeasurement,
                  { color: colors.hourListText },
                ]}>
                {t('measurements.windDirection')}
              </Text>
              <Text
                style={[
                  styles.panelMeasurement,
                  { color: colors.hourListText },
                ]}>
                {t('measurements.windGust')}
              </Text>
              <Text
                style={[
                  styles.panelMeasurement,
                  { color: colors.hourListText },
                ]}>
                {t('measurements.pressure')}
              </Text>
              <Text
                style={[
                  styles.panelMeasurement,
                  { color: colors.hourListText },
                ]}>
                {t('measurements.humidity')}
              </Text>
              <Text
                style={[
                  styles.panelMeasurement,
                  { color: colors.hourListText },
                ]}>
                {t('measurements.visibility')}
              </Text>
              <Text
                style={[
                  styles.panelMeasurement,
                  { color: colors.hourListText },
                ]}>
                {t('measurements.totalCloudCover')}
              </Text>
              <Text
                style={[
                  styles.panelMeasurement,
                  { color: colors.hourListText },
                ]}>
                {t('measurements.snowDepth')}
              </Text>
            </View>
            <View style={styles.observationRow}>
              <View>
                <Text
                  style={[styles.panelValue, { color: colors.hourListText }]}>
                  {getObservationCellValue(
                    latestObservation,
                    'temperature',
                    '°C',
                    1
                  )}
                </Text>
                <Text
                  style={[styles.panelValue, { color: colors.hourListText }]}>
                  {getObservationCellValue(
                    latestObservation,
                    'dewpoint',
                    '°C',
                    1
                  )}
                </Text>
                <Text
                  style={[styles.panelValue, { color: colors.hourListText }]}>
                  {getObservationCellValue(
                    latestObservation,
                    'ri_10min',
                    'mm',
                    1
                  )}
                </Text>
                <Text
                  style={[styles.panelValue, { color: colors.hourListText }]}>
                  {getObservationCellValue(
                    latestObservation,
                    'windspeedms',
                    'm/s'
                  )}
                </Text>
                <Text
                  style={[styles.panelValue, { color: colors.hourListText }]}>
                  {latestObservation.windcompass8
                    ? t(`winddirection.${data[data.length - 1].windcompass8}`)
                    : '-'}
                  {latestObservation.winddirection
                    ? ` (${data[data.length - 1].winddirection}°)`
                    : ''}
                </Text>
                <Text
                  style={[styles.panelValue, { color: colors.hourListText }]}>
                  {getObservationCellValue(
                    latestObservation,
                    'windgust',
                    'm/s'
                  )}
                </Text>
                <Text
                  style={[styles.panelValue, { color: colors.hourListText }]}>
                  {getObservationCellValue(
                    latestObservation,
                    'pressure',
                    'hPa'
                  )}
                </Text>
                <Text
                  style={[styles.panelValue, { color: colors.hourListText }]}>
                  {getObservationCellValue(latestObservation, 'humidity', '%')}
                </Text>
                <Text
                  style={[styles.panelValue, { color: colors.hourListText }]}>
                  {getObservationCellValue(
                    latestObservation,
                    'visibility',
                    'km',
                    0,
                    1000
                  )}
                </Text>
                <Text
                  style={[styles.panelValue, { color: colors.hourListText }]}>
                  {latestObservation.totalcloudcover !== null &&
                  latestObservation.totalcloudcover !== undefined
                    ? `${t(
                        `cloudcover.${latestObservation.totalcloudcover}`
                      )} (${latestObservation.totalcloudcover}/8)`
                    : '-'}
                </Text>
                <Text
                  style={[styles.panelValue, { color: colors.hourListText }]}>
                  {getObservationCellValue(
                    latestObservation,
                    'snowDepth',
                    'cm'
                  )}
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}
      <RBSheet
        ref={weatherInfoSheetRef}
        height={600}
        closeOnDragDown
        customStyles={{
          container: {
            ...styles.sheetContainer,
            backgroundColor: colors.background,
          },
        }}>
        <WeatherInfoBottomSheet
          onClose={() => weatherInfoSheetRef.current.close()}
        />
      </RBSheet>
    </>
  );
};

const styles = StyleSheet.create({
  bold: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
  },
  bottomSheetButton: {
    padding: 10,
  },
  justifyStart: {
    justifyContent: 'flex-start',
  },
  latestObservation: {
    flexDirection: 'column',
    height: 40,
    marginBottom: 16,
  },
  observationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    flex: 1,
  },
  panelMeasurement: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
    marginBottom: 8,
  },
  panelValue: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
    marginBottom: 8,
  },
  panelText: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  sheetContainer: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
});
export default Latest;
