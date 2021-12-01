import React, { useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { CustomTheme } from '@utils/colors';
import { TimeStepData } from '@store/observation/types';
import moment from 'moment';

import Icon from '@components/common/Icon';
import WeatherInfoBottomSheet from '../sheets/WeatherInfoBottomSheet';

type LatestProps = {
  data: TimeStepData[];
};
const Latest: React.FC<LatestProps> = ({ data }) => {
  const { colors } = useTheme() as CustomTheme;
  const { t } = useTranslation('observation');
  const weatherInfoSheetRef = useRef() as React.MutableRefObject<RBSheet>;

  return (
    <>
      {data && data.length > 0 && (
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
                {moment(data[data.length - 1].epochtime * 1000).format(
                  `dd D.M. [${t('at')}] HH:mm`
                )}
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
            </View>
            <View style={styles.observationRow}>
              <View>
                <Text
                  style={[styles.panelValue, { color: colors.hourListText }]}>
                  {data[data.length - 1].temperature
                    ? `${data[data.length - 1].temperature?.toFixed(1)} °C`
                    : '-'}
                </Text>
                <Text
                  style={[styles.panelValue, { color: colors.hourListText }]}>
                  {data[data.length - 1].dewpoint
                    ? `${data[data.length - 1].dewpoint?.toFixed(1)} °C`
                    : '-'}
                </Text>
                <Text
                  style={[styles.panelValue, { color: colors.hourListText }]}>
                  {data[data.length - 1].precipitation1h
                    ? `${data[data.length - 1].precipitation1h} mm`
                    : '-'}
                </Text>
                <Text
                  style={[styles.panelValue, { color: colors.hourListText }]}>
                  {data[data.length - 1].windspeedms
                    ? `${data[data.length - 1].windspeedms?.toFixed(0)} m/s`
                    : '-'}
                </Text>
                <Text
                  style={[styles.panelValue, { color: colors.hourListText }]}>
                  {data[data.length - 1].windcompass8
                    ? t(`winddirection.${data[data.length - 1].windcompass8}`)
                    : '-'}
                  {data[data.length - 1].winddirection
                    ? ` (${data[data.length - 1].winddirection}°)`
                    : ''}
                </Text>
                <Text
                  style={[styles.panelValue, { color: colors.hourListText }]}>
                  {data[data.length - 1].windgust
                    ? `${data[data.length - 1].windgust?.toFixed(0)} m/s`
                    : '-'}
                </Text>
                <Text
                  style={[styles.panelValue, { color: colors.hourListText }]}>
                  {data[data.length - 1].pressure
                    ? `${data[data.length - 1].pressure?.toFixed(0)} hPa`
                    : '-'}
                </Text>
                <Text
                  style={[styles.panelValue, { color: colors.hourListText }]}>
                  {data[data.length - 1].humidity
                    ? `${data[data.length - 1].humidity} %`
                    : '-'}
                </Text>
                <Text
                  style={[styles.panelValue, { color: colors.hourListText }]}>
                  {data[data.length - 1].visibility
                    ? `${Math.round(
                        data[data.length - 1].visibility! / 1000
                      )} km`
                    : '-'}
                </Text>
                <Text
                  style={[styles.panelValue, { color: colors.hourListText }]}>
                  {data[data.length - 1].totalcloudcover !== null
                    ? t(`cloudcover.${data[data.length - 1].totalcloudcover}`)
                    : '-'}
                  {data[data.length - 1].totalcloudcover !== null
                    ? ` (${data[data.length - 1].totalcloudcover}/8)`
                    : '-'}
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
    marginBottom: 24,
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
