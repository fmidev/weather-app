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
  domain,
  width,
}) => {
  const { colors } = useTheme() as CustomTheme;
  const {
    windgust,
    hourlymaximumgust,
    windspeedms,
    winddirection,
  } = chartValues;

  const gustParameter =
    windgust && windgust.length > 0 ? windgust : hourlymaximumgust;

  const combinedData =
    windspeedms &&
    windspeedms.length > 0 &&
    gustParameter &&
    gustParameter.length > 0
      ? windspeedms.map((item, index) => ({
          ...item,
          y0: gustParameter[index].y,
        }))
      : false;

  const WindLabel = (asd: any) => {
    const index = Number(asd.index);

    const { x, y } = winddirection[index];
    const time = moment(x);

    if (y === null || time.minutes() !== 0) {
      return null;
    }

    return (
      <View style={[styles.arrowStyle, { left: asd.x - 10 }]}>
        <Icon
          name="wind-arrow"
          width={20}
          height={20}
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
    <VictoryGroup theme={chartTheme} width={width}>
      {combinedData && (
        <VictoryArea
          data={combinedData}
          domain={domain}
          style={{ data: { fill: '#d8d8d8' } }}
        />
      )}

      {windspeedms && windspeedms.length > 0 && (
        <VictoryLine
          data={windspeedms}
          domain={domain}
          labels={({ datum }) => `${datum}`}
          labelComponent={<WindLabel />}
          style={{ data: { stroke: colors.primaryText } }}
          interpolation="natural"
        />
      )}

      {gustParameter && gustParameter.length > 0 && (
        <VictoryLine
          data={gustParameter}
          domain={domain}
          style={{
            data: {
              stroke: colors.chartSecondaryLine,
              strokeDasharray: '4',
            },
          }}
          interpolation="natural"
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
