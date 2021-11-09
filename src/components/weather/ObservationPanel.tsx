import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { View, Text } from 'react-native';
import { selectGeoid } from '@store/location/selector';
import { useTranslation } from 'react-i18next';
import {
  selectData,
  selectDataId,
  selectLoading,
  selectStationId,
  selectStationList,
} from '@store/observation/selector';

import {
  fetchObservation as fetchObservationAction,
  setStationId as setStationIdAction,
} from '@store/observation/actions';

import { State } from '@store/types';
import { useTheme } from '@react-navigation/native';
import { CustomTheme } from '@utils/colors';
import Chart from './charts/Chart';
import { ChartDomain, ChartType } from './charts/types';
import CollapsibleListHeader from './common/CollapsibleListHeader';

const mapStateToProps = (state: State) => ({
  data: selectData(state),
  dataId: selectDataId(state),
  geoid: selectGeoid(state),
  loading: selectLoading(state),
  stationId: selectStationId(state),
  stationList: selectStationList(state),
});

const mapDispatchToProps = {
  fetchObservation: fetchObservationAction,
  setStationId: setStationIdAction,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

type ObservationPanelProps = PropsFromRedux;

const ObservationPanel: React.FC<ObservationPanelProps> = ({
  // loading,
  geoid,
  data,
  dataId,
  stationList,
  stationId,
  fetchObservation,
  setStationId,
}) => {
  const { colors } = useTheme() as CustomTheme;
  const { t } = useTranslation();
  const [chartDomain, setChartDomain] = useState<ChartDomain>({ x: [0, 0] });
  const [openIndex, setOpenIndex] = useState<number | undefined>(undefined);
  useEffect(() => {
    fetchObservation({ geoid });
  }, [geoid, fetchObservation]);

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
    <View style={{ backgroundColor: colors.background }}>
      {stationList.map((station) => (
        <Text
          style={{ color: colors.primaryText }}
          key={station.id}
          onPress={() => {
            setStationId(dataId, station.id);
          }}>
          {station.name} -- {station.distance}
        </Text>
      ))}

      {charts.map((chartType, index) => (
        <View key={`observation-${chartType}`}>
          <CollapsibleListHeader
            accessibilityLabel={t(
              `weather:charts:${chartType}AccessibilityLabel`
            )}
            title={t(`weather:charts:${chartType}`)}
            onPress={() =>
              openIndex === index
                ? setOpenIndex(undefined)
                : setOpenIndex(index)
            }
            open={openIndex === index}
          />
          {openIndex === index && (
            <Chart
              data={data}
              chartType={chartType}
              domain={chartDomain}
              setDomain={setChartDomain}
              observation
            />
          )}
        </View>
      ))}
    </View>
  );
};

export default connector(ObservationPanel);
