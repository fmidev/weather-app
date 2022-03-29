import React, { useEffect, useRef } from 'react';
import RBSheet from 'react-native-raw-bottom-sheet';
import { connect, ConnectedProps } from 'react-redux';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

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
import { CustomTheme, GRAY_1 } from '@utils/colors';
import { toStringWithDecimal } from '@utils/helpers';
import { Config } from '@config';
import { ObservationParameters } from '@store/observation/types';
import AccessibleTouchableOpacity from '@components/common/AccessibleTouchableOpacity';
import Chart from './charts/Chart';
import { ChartType } from './charts/types';
import ParameterSelector from './common/ParameterSelector';
import CollapsibleHeader from './common/CollapsibleHeader';
import PanelHeader from './common/PanelHeader';

import List from './observation/List';
import Latest from './observation/Latest';
import ObservationStationListBottomSheet from './sheets/ObservationStationListBottomSheet';
import { observationTypeParameters } from './charts/settings';

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
  const { enabled, parameters } = Config.get('weather').observation;

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
  ];
  charts = charts.filter((type) => {
    const typeParameters = observationTypeParameters[type];
    return (
      typeParameters.filter((typeParameter) =>
        parameters?.includes(typeParameter as keyof ObservationParameters)
      ).length > 0
    );
  });

  const parameter = chartParameter ?? charts[0];
  const currentStation = stationList.find(
    (station) => station.id === stationId
  );
  const title = `${currentStation?.name || ''} – ${t(
    'distance'
  )} ${toStringWithDecimal(currentStation?.distance, ',')} km`;

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

        <Latest data={data} />
      </View>

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

      <View style={styles.observationContainer}>
        <ParameterSelector
          chartTypes={charts}
          parameter={parameter}
          setParameter={updateChartParameter}
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
