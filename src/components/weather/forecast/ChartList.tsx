import React, { useState } from 'react';
import { View } from 'react-native';

import { TimestepData } from '@store/forecast/types';

import Chart from '../charts/Chart';
import { ChartType } from '../charts/types';
import ParameterSelector from '../charts/ParameterSelector';

type ChartListProps = {
  data: TimestepData[] | false;
};

const ChartList: React.FC<ChartListProps> = ({ data }) => {
  const [parameter, setParameter] = useState<ChartType>('temperatureFeels');
  const charts: ChartType[] = ['temperatureFeels', 'precipitation', 'wind'];

  return (
    <View>
      <ParameterSelector
        chartTypes={charts}
        parameter={parameter}
        setParameter={setParameter}
      />
      <Chart chartType={parameter} data={data} />
    </View>
  );
};

export default ChartList;
