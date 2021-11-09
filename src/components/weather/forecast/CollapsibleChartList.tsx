import React, { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { TimestepData } from '@store/forecast/types';
import CollapsibleListHeader from '../common/CollapsibleListHeader';

import Chart from '../charts/Chart';
import { ChartDomain, ChartType } from '../charts/types';

type CollapsibleChartListProps = {
  data: TimestepData[] | false;
};

const CollapsibleChartList: React.FC<CollapsibleChartListProps> = ({
  data,
}) => {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | undefined>(undefined);
  const [chartDomain, setChartDomain] = useState<ChartDomain>({ x: [0, 0] });
  const charts: ChartType[] = ['temperatureFeels', 'precipitation', 'wind'];

  return (
    <View>
      {charts.map((chartType, index) => (
        <View key={`forecast-${chartType}`}>
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
            />
          )}
        </View>
      ))}
    </View>
  );
};

export default CollapsibleChartList;
