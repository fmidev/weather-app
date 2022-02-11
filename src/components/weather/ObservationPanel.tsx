import React, { useEffect, useRef } from 'react';
import RBSheet from 'react-native-raw-bottom-sheet';
import { connect, ConnectedProps } from 'react-redux';
import { View, Text, StyleSheet } from 'react-native';
import { selectCurrent } from '@store/location/selector';
import {
  selectChartDisplayParameter,
  selectData,
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
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { CustomTheme, GRAY_1 } from '@utils/colors';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { toStringWithDecimal } from '@utils/helpers';
import { Config } from '@config';
import Chart from './charts/Chart';
import { ChartType } from './charts/types';
import ParameterSelector from './common/ParameterSelector';
import CollapsibleHeader from './common/CollapsibleHeader';
import PanelHeader from './common/PanelHeader';

import List from './observation/List';
import Latest from './observation/Latest';
import ObservationStationListBottomSheet from './sheets/ObservationStationListBottomSheet';

const mapStateToProps = (state: State) => ({
  data: selectData(state),
  dataId: selectDataId(state),
  location: selectCurrent(state),
  loading: selectLoading(state),
  stationId: selectStationId(state),
  stationList: selectStationList(state),
  chartParameter: selectChartDisplayParameter(state),
  displayFormat: selectDisplayFormat(state),
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
  // loading,
  data,
  dataId,
  stationList,
  stationId,
  setStationId,
  chartParameter,
  updateChartParameter,
  displayFormat,
  updateDisplayFormat,
}) => {
  const { colors } = useTheme() as CustomTheme;
  const { t } = useTranslation('observation');
  const stationSheetRef = useRef() as React.MutableRefObject<RBSheet>;
  const { enabled } = Config.get('weather').observation;

  useEffect(() => {
    const sid = stationList[0]?.id;
    if (sid && !stationId && dataId) {
      setStationId(dataId, sid);
    }
  }, [stationList, stationId, dataId, setStationId]);

  if (!enabled) {
    return null;
  }

  const charts: ChartType[] = [
    'temperature',
    'precipitation',
    'wind',
    'pressure',
    'humidity',
    'visCloud',
    'cloud',
    'snowDepth',
  ];

  const parameter = chartParameter ?? charts[0];
  const currentStation = stationList.find(
    (station) => station.id === stationId
  );
  const title = `${currentStation?.name || ''} – ${t(
    'distance'
  )} ${toStringWithDecimal(currentStation?.distance, ',')}`;

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
        <Latest data={data} />
      </View>

      <View style={styles.panelContainer}>
        <View style={[styles.row]}>
          <View style={[styles.row, styles.justifyStart]}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => updateDisplayFormat(CHART)}
              style={[
                styles.contentSelectionContainer,
                styles.withMarginRight,
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
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => updateDisplayFormat(LIST)}
              style={[
                styles.contentSelectionContainer,
                styles.withMarginRight,
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
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.observationContainer}>
        <ParameterSelector
          chartTypes={charts}
          parameter={parameter}
          setParameter={updateChartParameter}
          showHeader
        />
        {displayFormat === LIST && <List data={data} parameter={parameter} />}
        {displayFormat === CHART && (
          <Chart chartType={parameter} data={data} observation />
        )}
      </View>

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
    borderRadius: 16,
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
