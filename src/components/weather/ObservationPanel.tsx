import React, { useEffect, useState } from 'react';
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

import {
  fetchObservation as fetchObservationAction,
  setStationId as setStationIdAction,
} from '@store/observation/actions';

import { State } from '@store/types';
import { useTheme } from '@react-navigation/native';
import { CustomTheme } from '@utils/colors';
import Chart from './charts/Chart';
import { ChartType } from './charts/types';
import ParameterSelector from './charts/ParameterSelector';

const mapStateToProps = (state: State) => ({
  data: selectData(state),
  dataId: selectDataId(state),
  location: selectCurrent(state),
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
  location,
  data,
  dataId,
  stationList,
  stationId,
  fetchObservation,
  setStationId,
}) => {
  const { colors } = useTheme() as CustomTheme;
  const [parameter, setParameter] = useState<ChartType>('temperature');
  useEffect(() => {
    fetchObservation({ geoid: location.id }, location.country);
  }, [location, fetchObservation]);

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
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}>
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
      <ParameterSelector
        chartTypes={charts}
        parameter={parameter}
        setParameter={setParameter}
      />
      <Chart chartType={parameter} data={data} observation />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
});

export default connector(ObservationPanel);
