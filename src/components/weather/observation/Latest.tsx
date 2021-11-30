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
              <Text style={[{ color: colors.shadow }]}>
                {t('latestObservation')}
              </Text>
              <Text
                style={[
                  styles.bold,
                  styles.justifyStart,
                  { color: colors.shadow },
                ]}>
                {moment(data[data.length - 1].epochtime * 1000).format(
                  `dd D.M. [${t('at')}] HH:mm`
                )}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.bottomSheetButton}
              onPress={() => weatherInfoSheetRef.current.open()}>
              <Icon name="info" color={colors.shadow} height={24} width={24} />
            </TouchableOpacity>
          </View>
          <View style={styles.observationRow}>
            <View style={styles.observationPadding}>
              <Text style={[styles.bold, { color: colors.shadow }]}>
                {t('measurements.temperature')}
              </Text>
              <Text style={[styles.bold, { color: colors.shadow }]}>
                {t('measurements.dewPoint')}
              </Text>
              <Text style={[styles.bold, { color: colors.shadow }]}>
                {t('measurements.precipitation1h')}
              </Text>
              <Text style={[styles.bold, { color: colors.shadow }]}>
                {t('measurements.windSpeedMS')}
              </Text>
              <Text style={[styles.bold, { color: colors.shadow }]}>
                {t('measurements.windDirection')}
              </Text>
              <Text style={[styles.bold, { color: colors.shadow }]}>
                {t('measurements.windGust')}
              </Text>
              <Text style={[styles.bold, { color: colors.shadow }]}>
                {t('measurements.pressure')}
              </Text>
              <Text style={[styles.bold, { color: colors.shadow }]}>
                {t('measurements.humidity')}
              </Text>
              <Text style={[styles.bold, { color: colors.shadow }]}>
                {t('measurements.visibility')}
              </Text>
              <Text style={[styles.bold, { color: colors.shadow }]}>
                {t('measurements.totalCloudCover')}
              </Text>
            </View>

            <View>
              <Text style={[styles.panelText, { color: colors.shadow }]}>
                {data[data.length - 1].temperature?.toFixed(1)} °C
              </Text>
              <Text style={[styles.panelText, { color: colors.shadow }]}>
                {data[data.length - 1].dewpoint?.toFixed(1)} °C
              </Text>
              <Text style={[styles.panelText, { color: colors.shadow }]}>
                {data[data.length - 1].precipitation1h != null
                  ? data[data.length - 1].precipitation1h
                  : '0.0'}{' '}
                mm
              </Text>
              <Text style={[styles.panelText, { color: colors.shadow }]}>
                {data[data.length - 1].windspeedms} m/s
              </Text>
              <Text style={[styles.panelText, { color: colors.shadow }]}>
                {t(`winddirection.${data[data.length - 1].windcompass8}`)} (
                {data[0].winddirection}
                °)
              </Text>
              <Text style={[styles.panelText, { color: colors.shadow }]}>
                {data[data.length - 1].windgust} m/s
              </Text>
              <Text style={[styles.panelText, { color: colors.shadow }]}>
                {data[data.length - 1].pressure} hPa
              </Text>
              <Text style={[styles.panelText, { color: colors.shadow }]}>
                {data[data.length - 1].humidity} %
              </Text>
              <Text style={[styles.panelText, { color: colors.shadow }]}>
                {Math.round(data[data.length - 1].visibility! / 1000)} km
              </Text>
              <Text style={[styles.panelText, { color: colors.shadow }]}>
                {t(`cloudcover.${data[data.length - 1].totalcloudcover}`)} (
                {data[data.length - 1].totalcloudcover}
                /8)
              </Text>
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
    fontFamily: 'Roboto-Bold',
    paddingBottom: 2,
  },
  bottomSheetButton: {
    padding: 10,
  },
  justifyStart: {
    justifyContent: 'flex-start',
  },
  latestObservation: {
    flexDirection: 'column',
    paddingBottom: 5,
  },
  observationPadding: {
    paddingRight: 100,
  },
  observationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    paddingBottom: 1,
  },
  panelText: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
    paddingBottom: 2,
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
