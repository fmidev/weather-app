import React, { useEffect, useRef } from 'react';
import RBSheet from 'react-native-raw-bottom-sheet';
import { connect, ConnectedProps } from 'react-redux';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { selectCurrent } from '@store/location/selector';
import {
  selectChartDisplayParameter,
  selectHourlyData,
  selectDailyData,
  selectDataId,
  selectDisplayFormat,
  selectLoading,
  selectStationId,
  selectStationList,
} from '@store/observation/selector';

import {
  setStationId as setStationIdAction,
  updateChartParameter as updateChartParameterAction,
  updateDisplayFormat as updateDisplayFormatAction,
} from '@store/observation/actions';

import { State } from '@store/types';
import { CustomTheme, GRAY_1 } from '@utils/colors';
import { isNegativeValueAllowed, toStringWithDecimal } from '@utils/helpers';
import { Config } from '@config';
import {
  DailyObservationParameters,
  ObservationParameters,
} from '@store/observation/types';
import AccessibleTouchableOpacity from '@components/common/AccessibleTouchableOpacity';
import { selectClockType } from '@store/settings/selectors';
import Chart from './charts/Chart';
import { ChartType } from './charts/types';
import ParameterSelector from './common/ParameterSelector';
import CollapsibleHeader from './common/CollapsibleHeader';
import PanelHeader from './common/PanelHeader';

import List from './observation/List';
import Latest from './observation/Latest';
import ObservationStationListBottomSheet from './sheets/ObservationStationListBottomSheet';
import { observationTypeParameters } from './charts/settings';
import InfoMessage from './InfoMessage';

const mapStateToProps = (state: State) => ({
  hourlyData: selectHourlyData(state),
  dailyData: selectDailyData(state),
  dataId: selectDataId(state),
  location: selectCurrent(state),
  loading: selectLoading(state),
  stationId: selectStationId(state),
  stationList: selectStationList(state),
  chartParameter: selectChartDisplayParameter(state),
  displayFormat: selectDisplayFormat(state),
  clockType: selectClockType(state),
});

const mapDispatchToProps = {
  setStationId: setStationIdAction,
  updateChartParameter: updateChartParameterAction,
  updateDisplayFormat: updateDisplayFormatAction,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

type ObservationPanelProps = PropsFromRedux;

const LIST = 'table';
const CHART = 'chart';

const ObservationPanel: React.FC<ObservationPanelProps> = ({
  loading,
  hourlyData,
  dailyData,
  dataId,
  stationList,
  stationId,
  setStationId,
  chartParameter,
  updateChartParameter,
  displayFormat,
  updateDisplayFormat,
  clockType,
}) => {
  const { colors } = useTheme() as CustomTheme;
  const { t, i18n } = useTranslation('observation');
  const locale = i18n.language;
  const decimalSeparator = locale === 'en' ? '.' : ',';
  const stationSheetRef = useRef() as React.MutableRefObject<RBSheet>;
  const { enabled, parameters, dailyParameters, timePeriod } =
    Config.get('weather').observation;
  const numberOfDays = (timePeriod || 0) / 24;

  useEffect(() => {
    const sid = stationList[0]?.id;
    if (sid && !stationId && dataId) {
      setStationId(dataId, sid);
    }
  }, [stationList, stationId, dataId, setStationId]);

  if (!enabled) {
    return null;
  }
  let charts: ChartType[] = [
    'temperature',
    'precipitation',
    'wind',
    'pressure',
    'humidity',
    'visCloud',
    'cloud',
    'snowDepth',
    'daily',
  ];

  charts = charts.filter((type) => {
    const typeParameters = observationTypeParameters[type];
    const data = type === 'daily' ? dailyData : hourlyData;
    const dataForParameter = typeParameters.map((typeParam) =>
      data.map(
        (dataPoint) => dataPoint[typeParam as keyof ObservationParameters]
      )
    );
    const observationDataExistsForParameter = dataForParameter.some(
      (parameterData) =>
        parameterData.some(
          (dataPoint) =>
            dataPoint !== null &&
            dataPoint !== undefined &&
            (isNegativeValueAllowed(type) || (dataPoint as number) >= 0)
        )
    );

    return (
      observationDataExistsForParameter &&
      typeParameters.filter(
        (typeParameter) =>
          parameters?.includes(typeParameter as keyof ObservationParameters) ||
          dailyParameters?.includes(
            typeParameter as keyof DailyObservationParameters
          )
      )
    );
  });

  const parameter = chartParameter ?? charts[0];
  const currentStation = stationList.find(
    (station) => station.id === stationId
  );
  const title = `${currentStation?.name || ''} – ${t(
    'distance'
  )} ${toStringWithDecimal(currentStation?.distance, decimalSeparator)} km`;
  return (
    <View
      style={[
        styles.panelWrapper,
        {
          backgroundColor: colors.background,
          shadowColor: colors.shadow,
        },
      ]}>
      <PanelHeader title={t('panelHeader')} />
      <View style={styles.panelContainer}>
        {loading && <ActivityIndicator />}
        {stationList.length > 0 && (
          <View
            accessible
            accessibilityRole="menu"
            accessibilityLabel={`${t('observationStation')}: ${title}`}
            accessibilityHint={t('stationAccessibilityHint')}>
            <Text style={[styles.panelText, { color: colors.primaryText }]}>
              {t('observationStation')}{' '}
            </Text>
            <View style={[styles.observationDropdown]}>
              <CollapsibleHeader
                onPress={() => stationSheetRef.current.open()}
                open={false}
                title={title}
                accessibilityLabel=""
                iconStart="map-marker"
              />
            </View>
          </View>
        )}
        <Latest data={hourlyData} />
      </View>
      {hourlyData.length > 0 && (
        <View style={styles.panelContainer}>
          <View style={[styles.row]}>
            <View style={[styles.row, styles.justifyStart]}>
              <AccessibleTouchableOpacity
                accessibilityRole="button"
                accessibilityState={{ selected: displayFormat === CHART }}
                activeOpacity={1}
                onPress={() => updateDisplayFormat(CHART)}
                style={styles.withMarginRight}>
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
                      styles.observationText,
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
              <AccessibleTouchableOpacity
                accessibilityRole="button"
                accessibilityState={{ selected: displayFormat === LIST }}
                activeOpacity={1}
                onPress={() => updateDisplayFormat(LIST)}>
                <View
                  style={[
                    styles.contentSelectionContainer,
                    {
                      backgroundColor:
                        displayFormat === LIST
                          ? colors.timeStepBackground
                          : colors.inputButtonBackground,
                      borderColor:
                        displayFormat === LIST
                          ? colors.chartSecondaryLine
                          : colors.secondaryBorder,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.observationText,
                      displayFormat === LIST && styles.selectedText,
                      {
                        color:
                          displayFormat === LIST
                            ? colors.primaryText
                            : colors.hourListText,
                      },
                    ]}>
                    {t('list')}
                  </Text>
                </View>
              </AccessibleTouchableOpacity>
            </View>
          </View>
        </View>
      )}
      {hourlyData.length > 0 && (
        <View style={styles.observationContainer}>
          <ParameterSelector
            chartTypes={charts}
            parameter={charts.includes(parameter) ? parameter : charts[0]}
            setParameter={updateChartParameter}
          />
          {(hourlyData.length > numberOfDays || parameter === 'daily') &&
            displayFormat === LIST && (
              <List
                data={parameter === 'daily' ? dailyData : hourlyData}
                parameter={charts.includes(parameter) ? parameter : charts[0]}
                clockType={clockType}
              />
            )}
          {(hourlyData.length > numberOfDays || parameter === 'daily') &&
            displayFormat === CHART && (
              <Chart
                chartType={charts.includes(parameter) ? parameter : charts[0]}
                data={parameter === 'daily' ? dailyData : hourlyData}
                observation
                daily={parameter === 'daily'}
              />
            )}
          {hourlyData.length <= numberOfDays && parameter !== 'daily' && (
            <InfoMessage translationKey="onlyDailyValues" />
          )}
        </View>
      )}

      {hourlyData.length === 0 && (
        <View style={styles.observationContainer}>
          <Text
            style={[styles.observationText, { color: colors.hourListText }]}>
            {t('noObservations')}
          </Text>
        </View>
      )}

      <RBSheet
        ref={stationSheetRef}
        height={600}
        closeOnDragDown
        dragFromTopOnly
        customStyles={{
          container: {
            ...styles.sheetContainer,
            backgroundColor: colors.background,
          },
          draggableIcon: styles.draggableIcon,
        }}>
        <ObservationStationListBottomSheet
          onClose={() => stationSheetRef.current.close()}
        />
      </RBSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  observationContainer: {
    marginHorizontal: 8,
    marginBottom: 8,
    flex: 1,
    paddingBottom: 28,
  },
  contentSelectionContainer: {
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  justifyStart: {
    justifyContent: 'flex-start',
  },
  observationDropdown: {
    marginBottom: 10,
    marginLeft: -6,
    marginRight: -6,
    marginTop: 2,
  },
  observationText: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
  },
  panelContainer: {
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  panelText: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
    paddingBottom: 2,
  },
  panelWrapper: {
    shadowOffset: {
      width: -2,
      height: 2,
    },
    shadowRadius: 16,
    shadowOpacity: 1,
    elevation: 3,
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
  withMarginRight: {
    marginRight: 16,
  },
  draggableIcon: {
    backgroundColor: GRAY_1,
    width: 65,
  },
});

export default connector(ObservationPanel);
