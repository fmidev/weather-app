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
import CloseButton from '@components/common/CloseButton';
import Chart from './charts/Chart';
import { ChartType } from './charts/types';
import ParameterSelector from './charts/ParameterSelector';
import CollapsibleHeader from './common/CollapsibleHeader';
import PanelHeader from './common/PanelHeader';
import WeatherInfoBottomSheet from './sheets/WeatherInfoBottomSheet';

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

type ObservationPanelProps = PropsFromRedux & {
  onClose: () => void;
};

const LIST = 'list';
const CHART = 'chart';

const ObservationPanel: React.FC<ObservationPanelProps> = ({
  // loading,
  data,
  dataId,
  stationList,
  stationId,
  setStationId,
  onClose,
}) => {
  const { colors } = useTheme() as CustomTheme;
  const { t } = useTranslation('observation');
  const infoSheetRef = useRef() as React.MutableRefObject<RBSheet>;
  const weatherInfoSheetRef = useRef() as React.MutableRefObject<RBSheet>;
  const [parameter, setParameter] = useState<ChartType>('temperature');

  useEffect(() => {
    const sid = stationList[0]?.id;
    if (sid && !stationId && dataId) {
      setStationId(dataId, sid);
    }
  }, [stationList, stationId, dataId, setStationId]);

  const [toDisplay, setToDisplay] = useState<typeof LIST | typeof CHART>(LIST);

  const charts: ChartType[] = [
    'temperature',
    'precipitation',
    'wind',
    'pressure',
    'humidity',
    'visCloud',
    'cloud',
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

          <View style={[styles.observationDropdown]}>
            <CollapsibleHeader
              onPress={() => infoSheetRef.current.open()}
              open={false}
              title={
                stationList.find((station) => station.id === stationId)?.name ||
                ''
              }
              accessibilityLabel=""
            />
          </View>

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
                  <Icon
                    name="info"
                    color={colors.shadow}
                    height={24}
                    width={24}
                  />
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
        </View>

        <View style={styles.panelContainer}>
          <View style={[styles.row]}>
            <View style={[styles.row, styles.justifyStart]}>
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => setToDisplay(CHART)}
                style={[
                  styles.contentSelectionContainer,
                  styles.withMarginRight,
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
                    styles.observationText,
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
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => setToDisplay(LIST)}
                style={[
                  styles.contentSelectionContainer,
                  styles.withMarginRight,
                  {
                    backgroundColor:
                      toDisplay === LIST
                        ? colors.timeStepBackground
                        : colors.inputButtonBackground,
                    borderColor:
                      toDisplay === LIST
                        ? colors.chartSecondaryLine
                        : colors.secondaryBorder,
                  },
                ]}>
                <Text
                  style={[
                    styles.observationText,
                    styles.medium,
                    toDisplay === LIST && styles.selectedText,
                    {
                      color:
                        toDisplay === LIST
                          ? colors.primaryText
                          : colors.hourListText,
                    },
                  ]}>
                  {t('list')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <Text
          style={[
            styles.panelText,
            styles.withMarginLeft,
            { color: colors.shadow },
          ]}>
          Suure
        </Text>
        <View
          style={[
            styles.container,
            styles.withMarginRight,
            {
              backgroundColor: colors.background,
            },
          ]}>
          <ParameterSelector
            chartTypes={charts}
            parameter={parameter}
            setParameter={setParameter}
          />
          <View style={styles.observationListContainer}>
            <View>
              {data && data.length > 0 && (
                <Text style={(styles.bold, styles.marginBottom)}>
                  {moment(data[0].epochtime * 1000).format(`dddd D.M.`)}
                </Text>
              )}
            </View>
            <View style={styles.observationRow}>
              <Text style={[styles.bold, styles.observationTitleMargin110]}>
                Aika
              </Text>
              <Text style={[styles.bold, styles.observationTitleMargin60]}>
                Lämpötila
              </Text>
              <Text style={styles.bold}>Kastepiste</Text>
            </View>
            <View
              style={
                (styles.marginBottom,
                {
                  borderBottomWidth: 1,
                  borderBottomColor: 'lightgray',
                })
              }
            />

            {data
              .filter((ob) => ob.epochtime % 3600 === 0)
              .map((timeStep) => (
                <View key={timeStep.epochtime} style={styles.observationRow}>
                  <View style={styles.observationListMargin}>
                    <Text style={styles.bold}>
                      klo {moment(timeStep.epochtime * 1000).format(`HH:mm`)}
                    </Text>
                  </View>
                  <View style={styles.observationListMargin}>
                    <Text>{timeStep.temperature?.toFixed(1)} °C</Text>
                  </View>
                  <View>
                    <Text>{timeStep.dewpoint?.toFixed(1)} °C</Text>
                  </View>
                </View>
              ))}
          </View>
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
        <View style={styles.closeButtonContainer}>
          <CloseButton
            onPress={onClose}
            accessibilityLabel={t('paramsBottomSheet.closeAccessibilityLabel')}
          />
        </View>
        <View>
          <Text
            style={[
              styles.bold,
              styles.bottomSheetTitle,
              { color: colors.primaryText },
            ]}>
            {t('observationStation')}
          </Text>
          {stationList.map((station) => (
            <Text
              style={[styles.bottomSheetTextRow, { color: colors.primaryText }]}
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
    </View>
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
  bottomSheetTitle: {
    marginLeft: 15,
    marginBottom: 10,
  },
  bottomSheetTextRow: {
    marginLeft: 20,
    marginBottom: 20,
  },
  closeButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  container: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  contentSelectionContainer: {
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  justifyStart: {
    justifyContent: 'flex-start',
  },
  latestObservation: {
    flexDirection: 'column',
    paddingBottom: 5,
  },
  marginBottom: {
    marginBottom: 20,
  },
  medium: {
    fontFamily: 'Roboto-Medium',
  },
  observationDropdown: {
    marginBottom: 10,
  },
  observationListContainer: {
    marginTop: 20,
  },
  observationListMargin: {
    marginRight: 80,
  },
  observationTitleMargin110: {
    marginRight: 110,
  },
  observationTitleMargin60: {
    marginRight: 58,
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
  observationText: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
  },
  panelContainer: {
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  panelText: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
    paddingBottom: 2,
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  selectedText: {
    fontFamily: 'Roboto-Bold',
  },
  sheetContainer: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  withMarginLeft: {
    marginLeft: 16,
  },
  withMarginRight: {
    marginRight: 16,
  },
});

export default connector(ObservationPanel);
