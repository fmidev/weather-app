import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { connect, ConnectedProps } from 'react-redux';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { State } from '@store/types';
import { ForecastParameters, TimeStepData } from '@store/forecast/types';

import { selectChartDisplayParameter } from '@store/forecast/selectors';
import { updateChartParameter as updateChartParameterAction } from '@store/forecast/actions';

import { CustomTheme } from '@utils/colors';
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
  const { colors } = useTheme() as CustomTheme;
  const { t } = useTranslation();

  return (
    <View>
      <Text
        style={[
          styles.parameter,
          styles.verticalPadding,
          { color: colors.primaryText },
        ]}>
        {t(`weather:charts:${parameter}`)}
      </Text>
      {data && (
        <Chart
          chartType={parameter}
          data={data}
          activeDayIndex={activeDayIndex}
          setActiveDayIndex={setActiveDayIndex}
          currentDayOffset={currentDayOffset}
        />
      )}
      <View style={styles.verticalPadding}>
        <ParameterSelector
          chartTypes={charts}
          parameter={parameter}
          setParameter={updateChartParameter}
          showHeader={false}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  parameter: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
    paddingHorizontal: 8,
  },
  verticalPadding: {
    paddingVertical: 16,
  },
});

export default connector(ChartList);
