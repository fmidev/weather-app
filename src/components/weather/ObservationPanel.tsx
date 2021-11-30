import React, { useEffect, useState, useRef } from 'react';
import RBSheet from 'react-native-raw-bottom-sheet';
import { connect, ConnectedProps } from 'react-redux';
import { View, Text, StyleSheet } from 'react-native';
import { selectCurrent } from '@store/location/selector';
import {
  selectChartDisplayParameter,
  selectData,
  selectDataId,
  selectLoading,
  selectStationId,
  selectStationList,
} from '@store/observation/selector';

import {
  setStationId as setStationIdAction,
  updateChartParameter as updateChartParameterAction,
} from '@store/observation/actions';

import { State } from '@store/types';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { CustomTheme } from '@utils/colors';
import { TouchableOpacity } from 'react-native-gesture-handler';
import CloseButton from '@components/common/CloseButton';
import Chart from './charts/Chart';
import { ChartType } from './charts/types';
import ParameterSelector from './charts/ParameterSelector';
import CollapsibleHeader from './common/CollapsibleHeader';
import PanelHeader from './common/PanelHeader';

import List from './observation/List';
import Latest from './observation/Latest';

const mapStateToProps = (state: State) => ({
  data: selectData(state),
  dataId: selectDataId(state),
  location: selectCurrent(state),
  loading: selectLoading(state),
  stationId: selectStationId(state),
  stationList: selectStationList(state),
  chartParameter: selectChartDisplayParameter(state),
});

const mapDispatchToProps = {
  setStationId: setStationIdAction,
  updateChartParameter: updateChartParameterAction,
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
  chartParameter,
  updateChartParameter,
}) => {
  const { colors } = useTheme() as CustomTheme;
  const { t } = useTranslation('observation');
  const infoSheetRef = useRef() as React.MutableRefObject<RBSheet>;

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

  const parameter = chartParameter ?? charts[0];

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

          <Latest data={data} />
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
            setParameter={updateChartParameter}
          />
          {toDisplay === LIST && <List data={data} parameter={parameter} />}
          {toDisplay === CHART && (
            <Chart chartType={parameter} data={data} observation />
          )}
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
            onPress={() => {
              infoSheetRef.current.close();
            }}
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
    </View>
  );
};

const styles = StyleSheet.create({
  bold: {
    fontFamily: 'Roboto-Bold',
    paddingBottom: 2,
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
    paddingRight: 20,
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
  medium: {
    fontFamily: 'Roboto-Medium',
  },
  observationDropdown: {
    marginBottom: 10,
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
