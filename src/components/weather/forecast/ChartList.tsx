import React from 'react';
import { View, StyleSheet } from 'react-native';
import { connect, ConnectedProps } from 'react-redux';

import { State } from '@store/types';
import { ForecastParameters, TimeStepData } from '@store/forecast/types';

import { selectChartDisplayParameter } from '@store/forecast/selectors';
import { updateChartParameter as updateChartParameterAction } from '@store/forecast/actions';

import { Config } from '@config';
import Chart from '../charts/Chart';
import { ChartType } from '../charts/types';
import ParameterSelector from '../common/ParameterSelector';
import { forecastTypeParameters } from '../charts/settings';

const mapStateToProps = (state: State) => ({
  chartParameter: selectChartDisplayParameter(state),
});

const mapDispatchToProps = {
  updateChartParameter: updateChartParameterAction,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

type ChartListProps = PropsFromRedux & {
  data: TimeStepData[] | false;
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
  const activeParameters = Config.get('weather').forecast.data.flatMap(
    ({ parameters }) => parameters
  );

  let charts: ChartType[] = ['temperature', 'precipitation', 'wind'];
  charts = charts.filter((type) => {
    const typeParameters = forecastTypeParameters[type];
    return (
      typeParameters.filter((typeParameter) =>
        activeParameters?.includes(typeParameter as keyof ForecastParameters)
      ).length > 0
    );
  });

  const parameter = chartParameter ?? charts[0];

  return (
    <View style={styles.verticalPadding}>
      <View>
        <ParameterSelector
          chartTypes={charts}
          parameter={parameter}
          setParameter={updateChartParameter}
        />
      </View>
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

const styles = StyleSheet.create({
  verticalPadding: {
    paddingVertical: 16,
  },
});

export default connector(ChartList);
