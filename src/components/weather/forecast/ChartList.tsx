import React from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { State } from '@store/types';

import { View } from 'react-native';

import { TimestepData } from '@store/forecast/types';

import { selectChartDisplayParameter } from '@store/forecast/selectors';
import { updateChartParameter as updateChartParameterAction } from '@store/forecast/actions';
import Chart from '../charts/Chart';
import { ChartType } from '../charts/types';
import ParameterSelector from '../common/ParameterSelector';

const mapStateToProps = (state: State) => ({
  chartParameter: selectChartDisplayParameter(state),
});

const mapDispatchToProps = {
  updateChartParameter: updateChartParameterAction,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

type ChartListProps = PropsFromRedux & {
  data: TimestepData[] | false;
  activeDayIndex: number;
  setActiveDayIndex: (i: number) => void;
  currentDayOffset: number;
};

const ChartList: React.FC<ChartListProps> = ({
  data,
  chartParameter,
  updateChartParameter,
  activeDayIndex,
  setActiveDayIndex,
  currentDayOffset,
}) => {
  const charts: ChartType[] = ['temperature', 'precipitation', 'wind'];
  const parameter = chartParameter ?? charts[0];

  return (
    <View>
      <ParameterSelector
        chartTypes={charts}
        parameter={parameter}
        setParameter={updateChartParameter}
      />
      {data && (
        <Chart
          chartType={parameter}
          data={data}
          activeDayIndex={activeDayIndex}
          setActiveDayIndex={setActiveDayIndex}
          currentDayOffset={currentDayOffset}
        />
      )}
    </View>
  );
};

export default connector(ChartList);
