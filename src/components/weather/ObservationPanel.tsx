import React, { useEffect, useState, useRef } from 'react';
import RBSheet from 'react-native-raw-bottom-sheet';
import { connect, ConnectedProps } from 'react-redux';
import { View, Text, StyleSheet } from 'react-native';
import { selectCurrent } from '@store/location/selector';
import {
  selectData,
  selectDataId,
  selectLoading,
  selectStationId,
  selectStationList,
} from '@store/observation/selector';

import { setStationId as setStationIdAction } from '@store/observation/actions';

import { State } from '@store/types';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { CustomTheme } from '@utils/colors';
import moment from 'moment';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Icon from '@components/common/Icon';
import Chart from './charts/Chart';
import { ChartType } from './charts/types';
import ParameterSelector from './charts/ParameterSelector';
import CollapsibleHeader from './common/CollapsibleHeader';
import PanelHeader from './common/PanelHeader';

const mapStateToProps = (state: State) => ({
  data: selectData(state),
  dataId: selectDataId(state),
  location: selectCurrent(state),
  loading: selectLoading(state),
  stationId: selectStationId(state),
  stationList: selectStationList(state),
});

const mapDispatchToProps = {
  setStationId: setStationIdAction,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

type ObservationPanelProps = PropsFromRedux;

const ObservationPanel: React.FC<ObservationPanelProps> = ({
  // loading,
  data,
  dataId,
  stationList,
  stationId,
  setStationId,
}) => {
  const { colors } = useTheme() as CustomTheme;
  const { t } = useTranslation('observation');
  const infoSheetRef = useRef() as React.MutableRefObject<RBSheet>;
  const [parameter, setParameter] = useState<ChartType>('temperature');

  useEffect(() => {
    const sid = stationList[0]?.id;
    if (sid && !stationId && dataId) {
      setStationId(dataId, sid);
    }
  }, [stationList, stationId, dataId, setStationId]);

  const charts: ChartType[] = [
    'cloud',
    'visCloud',
    'pressure',
    'humidity',
    'wind',
    'temperature',
    'precipitation',
  ];

  return (
    <View>
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
            {t('observationStation')}{' '}
          </Text>

          <View style={[styles.observationContainer]}>
            <CollapsibleHeader
              onPress={() => infoSheetRef.current.open()}
              open={false}
              title=""
              accessibilityLabel=""
            />
          </View>

          {data && data.length > 0 && (
            <View>
              <View style={[styles.row]}>
                <View style={[styles.latestObservation]}>
                  <Text
                    style={[styles.panelText, { color: colors.primaryText }]}>
                    {t('latestObservation')}
                  </Text>
                  <Text
                    style={[
                      styles.bold,
                      styles.justifyStart,
                      { color: colors.primaryText },
                    ]}>
                    {moment(data[data.length - 1].epochtime * 1000).format(
                      `dd D.M. [${t('at')}] HH:mm`
                    )}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.bottomSheetButton}
                  onPress={() => infoSheetRef.current.open()}>
                  <Icon
                    name="info"
                    color={colors.primaryText}
                    height={24}
                    width={24}
                  />
                </TouchableOpacity>
              </View>

              <View style={[styles.observationRow]}>
                <Text
                  style={[
                    styles.bold,
                    styles.observationPadding,
                    { color: colors.primaryText },
                  ]}>
                  {t('measurements.temperature')}
                </Text>
                <Text style={[styles.panelText, { color: colors.primaryText }]}>
                  {data[data.length - 1].temperature} °C
                </Text>
              </View>

              <View style={[styles.observationRow]}>
                <Text
                  style={[
                    styles.bold,
                    styles.observationPadding,
                    { color: colors.primaryText },
                  ]}>
                  {t('measurements.dewPoint')}
                </Text>
                <Text style={[styles.panelText, { color: colors.primaryText }]}>
                  {data[data.length - 1].dewpoint} °C
                </Text>
              </View>

              <View style={[styles.observationRow]}>
                <Text style={[styles.bold, { color: colors.primaryText }]}>
                  {t('measurements.precipitation1h')}
                </Text>
                <Text style={[styles.panelText, { color: colors.primaryText }]}>
                  {data[data.length - 1].precipitation1h != null
                    ? data[data.length - 1].precipitation1h
                    : '0.0'}{' '}
                  mm
                </Text>
              </View>

              <View style={[styles.observationRow]}>
                <Text style={[styles.bold, { color: colors.primaryText }]}>
                  {t('measurements.windSpeedMS')}
                </Text>
                <Text style={[styles.panelText, { color: colors.primaryText }]}>
                  {data[data.length - 1].windspeedms} m/s
                </Text>
              </View>

              <View style={[styles.observationRow]}>
                <Text style={[styles.bold, { color: colors.primaryText }]}>
                  {t('measurements.windDirection')}
                </Text>
                <Text style={[styles.panelText, { color: colors.primaryText }]}>
                  {data[data.length - 1].windcompass8} ({data[0].winddirection}
                  °)
                </Text>
              </View>

              <View style={[styles.observationRow]}>
                <Text style={[styles.bold, { color: colors.primaryText }]}>
                  {t('measurements.windGust')}
                </Text>
                <Text style={[styles.panelText, { color: colors.primaryText }]}>
                  {data[data.length - 1].windgust} m/s
                </Text>
              </View>

              <View style={[styles.observationRow]}>
                <Text style={[styles.bold, { color: colors.primaryText }]}>
                  {t('measurements.pressure')}
                </Text>
                <Text style={[styles.panelText, { color: colors.primaryText }]}>
                  {data[data.length - 1].pressure} hPa
                </Text>
              </View>

              <View style={[styles.observationRow]}>
                <Text style={[styles.bold, { color: colors.primaryText }]}>
                  {t('measurements.humidity')}
                </Text>
                <Text style={[styles.panelText, { color: colors.primaryText }]}>
                  {data[data.length - 1].humidity} %
                </Text>
              </View>

              <View style={[styles.observationRow]}>
                <Text style={[styles.bold, { color: colors.primaryText }]}>
                  {t('measurements.visibility')}
                </Text>
                <Text style={[styles.panelText, { color: colors.primaryText }]}>
                  {Math.round(data[data.length - 1].visibility! / 1000)} km
                </Text>
              </View>

              <View style={[styles.observationRow]}>
                <Text style={[styles.bold, { color: colors.primaryText }]}>
                  {t('measurements.totalCloudCover')}
                </Text>
                <Text style={[styles.panelText, { color: colors.primaryText }]}>
                  Cloudy ({data[data.length - 1].totalcloudcover}
                  /8)
                </Text>
              </View>
            </View>
          )}
        </View>
        <View
          style={[
            styles.container,
            {
              backgroundColor: colors.background,
            },
          ]}>
          <ParameterSelector
            chartTypes={charts}
            parameter={parameter}
            setParameter={setParameter}
          />
          <Chart chartType={parameter} data={data} observation />
        </View>
      </View>

      <RBSheet
        ref={infoSheetRef}
        height={600}
        closeOnDragDown
        dragFromTopOnly
        customStyles={{
          container: {
            ...styles.sheetContainer,
            backgroundColor: colors.background,
          },
        }}>
        <View>
          <Text style={[styles.bold, { color: colors.primaryText }]}>
            {t('observationStation')}
          </Text>
          {stationList.map((station) => (
            <Text
              key={station.id}
              onPress={() => {
                setStationId(dataId, station.id);
                infoSheetRef.current.close();
              }}>
              {station.name}, {station.distance} {t('distanceFromStation')}
            </Text>
          ))}
        </View>
      </RBSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
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
  latestObservation: {
    flexDirection: 'column',
    paddingBottom: 5,
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
  observationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flex: 1,
    paddingBottom: 1,
  },
  observationPadding: {
    paddingRight: 100,
  },
  observationContainer: {
    marginHorizontal: 2,
    marginBottom: 8,
  },
  justifyStart: {
    justifyContent: 'flex-start',
  },
  sheetContainer: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  bottomSheetButton: {
    padding: 10,
  },
});

export default connector(ObservationPanel);
