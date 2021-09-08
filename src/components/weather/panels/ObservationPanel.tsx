import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { View, Text } from 'react-native';
import { selectGeoid } from '../../../store/general/selectors';

import {
  selectData,
  selectDataId,
  selectLoading,
  selectStationId,
  selectStationList,
} from '../../../store/observation/selector';

import {
  fetchObservation as fetchObservationAction,
  setStationId as setStationIdAction,
} from '../../../store/observation/actions';

import { State } from '../../../store/types';

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
  useEffect(() => {
    fetchObservation({ geoid });
  }, [geoid, fetchObservation]);

  useEffect(() => {
    const sid = stationList[0]?.id;
    if (sid && !stationId && dataId) {
      setStationId(dataId, sid);
    }
  }, [stationList, stationId, dataId, setStationId]);

  return (
    <View>
      {stationList.map((station) => (
        <Text
          key={station.id}
          onPress={() => {
            setStationId(dataId, station.id);
          }}>
          {station.name} -- {station.distance}
        </Text>
      ))}
      {data.map((timeStep) => (
        <Text key={timeStep.epochtime}>
          {timeStep.epochtime} -- {timeStep.temperature}
        </Text>
      ))}
    </View>
  );
};
export default connector(ObservationPanel);
