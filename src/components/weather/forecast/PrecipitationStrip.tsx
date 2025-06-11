import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import moment from 'moment';

import { CustomTheme, GRAY_1 } from '@assets/colors';
import { getPrecipitationLevel } from '@utils/helpers';
import { useTheme } from '@react-navigation/native';

type PrecipitationStripProps = {
  precipitationData:
    | { precipitation: number | undefined; timestamp: number }[]
    | false;
  style?: ViewStyle;
  border?: boolean;
};

const PrecipitationStrip: React.FC<PrecipitationStripProps> = ({
  precipitationData,
  style,
  border,
}) => {
  const { colors } = useTheme() as CustomTheme;
  const precipitationHourArr =
    precipitationData &&
    precipitationData.map((item) => ({
      hour: moment(item.timestamp * 1000).hours(),
      precipitation: item.precipitation,
    }));

  const normalizedPrecipitationData =
    precipitationHourArr && precipitationHourArr.length < 24
      ? precipitationHourArr.reduce((acc, curr, i) => {
          if (
            (i === 0 && curr.hour > 0) ||
            (i === precipitationHourArr.length - 1 && curr.hour < 23)
          ) {
            const missing = 24 - precipitationHourArr.length;
            let appendable:
              | { precipitation?: number; hour: number }
              | { precipitation?: number; hour: number }[] = curr;
            for (let j = 0; j < missing; j += 1) {
              if (!Array.isArray(appendable)) {
                appendable =
                  i === 0 && curr.hour > 0
                    ? [{ hour: -1 }, appendable]
                    : [appendable, { hour: -1 }];
              } else if (i === 0 && curr.hour > 0) {
                appendable.unshift({ hour: -1 });
              } else {
                appendable.push({ hour: -1 });
              }
            }
            return acc.concat(
              appendable as { precipitation?: number; hour: number }[]
            );
          }
          return acc.concat(curr);
        }, [] as { precipitation?: number; hour: number }[])
      : precipitationHourArr;

  const backgroundStyleGetter = (val: number | undefined): ViewStyle => {
    if (val === undefined) return { backgroundColor: GRAY_1, opacity: 0.5 };
    return { backgroundColor: colors.rain[getPrecipitationLevel(val)] };
  };

  return (
    // eslint-disable-next-line react-native/no-inline-styles
    <View style={[styles.row, style, border && { borderWidth: 1, borderColor: colors.border }]}>
      {normalizedPrecipitationData &&
        normalizedPrecipitationData.map((obj, i) => (
          <View
            key={`${obj.hour}-${i + 1}`}
            style={[
              styles.precipitationBlock,
              {
                ...backgroundStyleGetter(obj.precipitation),
              },
              // eslint-disable-next-line react-native/no-inline-styles
              border && { height: 12 }
            ]}
          />
        ))}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  precipitationBlock: {
    flex: 1,
    height: 14,
  },
});

export default PrecipitationStrip;
