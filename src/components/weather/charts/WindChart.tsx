import React from 'react';
import { View, StyleSheet } from 'react-native';

import { VictoryLine, VictoryGroup, VictoryArea } from 'victory-native';
import { CustomTheme } from '@utils/colors';
import { useTheme } from '@react-navigation/native';
import Icon from '@components/common/Icon';
import moment from 'moment';
import chartTheme from '@utils/chartTheme';
import { ChartDataProps } from './types';

const WindChart: React.FC<ChartDataProps> = ({
  chartValues,
  chartDomain,
  chartWidth,
}) => {
  const { colors } = useTheme() as CustomTheme;
  const { windGust, hourlymaximumgust, windSpeedMS, windDirection } =
    chartValues;

  const gustParameter =
    windGust && windGust.length > 0 ? windGust : hourlymaximumgust;

  const combinedData =
    windSpeedMS &&
    windSpeedMS.length > 0 &&
    gustParameter &&
    gustParameter.length > 0
      ? windSpeedMS.map((item, index) => ({
          ...item,
          y0: gustParameter[index].y,
        }))
      : false;

  const labelData = (windDirection || []).sort((a, b) => a.x - b.x);
  const labelSize = 20;
  const labelInterval =
    chartWidth /
      ((labelData[labelData.length - 1]?.x - labelData[0]?.x) /
        (60 * 60 * 1000)) >
    labelSize
      ? 1
      : 3;

  const WindLabel = (datum: any) => {
    if (!datum || datum === null) return <></>;
    const { index: dIndex, x: dX } = datum;
    const index = Number(dIndex);

    if (labelData.length === 0 || !labelData[index]) {
      return null;
    }

    const { x, y } = labelData[index];
    const time = moment(x);

    if (
      y === null ||
      time.minutes() !== 0 ||
      time.hours() % labelInterval !== 0
    ) {
      return null;
    }

    return (
      <View style={[styles.arrowStyle, { left: dX - labelSize / 2 }]}>
        <Icon
          name="wind-arrowS"
          width={labelSize}
          height={labelSize}
          style={{
            color: colors.primaryText,
            transform: [
              {
                rotate: `${y + 45 - 180}deg`,
              },
            ],
          }}
        />
      </View>
    );
  };

  return (
    <VictoryGroup theme={chartTheme} width={chartWidth}>
      {combinedData && (
        <VictoryArea
          data={combinedData}
          domain={chartDomain}
          style={{ data: { fill: '#d8d8d8' } }}
          interpolation="basis"
        />
      )}

      {windSpeedMS && windSpeedMS.length > 0 && (
        <VictoryLine
          data={windSpeedMS}
          domain={chartDomain}
          labels={({ datum }) => `${datum}`}
          labelComponent={<WindLabel />}
          style={{ data: { stroke: colors.primaryText } }}
          interpolation="basis"
        />
      )}

      {gustParameter && gustParameter.length > 0 && (
        <VictoryLine
          data={gustParameter}
          domain={chartDomain}
          style={{
            data: {
              stroke: colors.chartSecondaryLine,
              strokeDasharray: '4',
            },
          }}
          interpolation="basis"
        />
      )}
    </VictoryGroup>
  );
};

const styles = StyleSheet.create({
  arrowStyle: {
    position: 'absolute',
    top: 25,
    zIndex: 2,
  },
});

export default WindChart;
