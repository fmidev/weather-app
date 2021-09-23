import React from 'react';
import { View, StyleSheet, Text, ViewStyle } from 'react-native';
import { useTheme } from '@react-navigation/native';

import { CustomTheme, GRAY_1 } from '@utils/colors';
import { getPrecipitationColorOrTransparent } from '@utils/helpers';

type PrecipitationStripProps = {
  precipitationData: { precipitation: number; timestamp: number }[] | false;
};

const PrecipitationStrip: React.FC<PrecipitationStripProps> = ({
  precipitationData,
}) => {
  const { colors } = useTheme() as CustomTheme;

  const precipitationHourArr =
    precipitationData &&
    precipitationData.map((item) => ({
      hour: new Date(item.timestamp * 1000).getHours(),
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
    return { backgroundColor: getPrecipitationColorOrTransparent(val) };
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.timeTextContainer}>
          <Text
            style={[
              styles.precipitationLineText,
              { color: colors.primaryText },
            ]}>
            03
          </Text>
        </View>
        <View style={styles.timeTextContainer}>
          <Text
            style={[
              styles.precipitationLineText,
              { color: colors.primaryText },
            ]}>
            09
          </Text>
        </View>
        <View style={styles.timeTextContainer}>
          <Text
            style={[
              styles.precipitationLineText,
              { color: colors.primaryText },
            ]}>
            15
          </Text>
        </View>
        <View style={styles.timeTextContainer}>
          <Text
            style={[
              styles.precipitationLineText,
              { color: colors.primaryText },
            ]}>
            21
          </Text>
        </View>
      </View>
      <View
        style={[
          styles.row,
          styles.withBorderBottom,
          { borderColor: colors.primaryText },
        ]}>
        {normalizedPrecipitationData &&
          normalizedPrecipitationData.map((obj, i) => (
            <View
              key={`${obj.hour}-${i + 1}`}
              style={[
                styles.precipitationBlock,
                (i === 0 || i % 3 === 0) && styles.withBorderLeft,
                i === 23 && styles.withBorderRight,
                {
                  ...backgroundStyleGetter(obj.precipitation),
                  borderColor: colors.primaryText,
                },
              ]}
            />
          ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 10,
  },
  row: {
    flexDirection: 'row',
  },
  timeTextContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  precipitationLineText: {
    fontSize: 14,
    fontFamily: 'Roboto-Medium',
  },
  precipitationBlock: {
    flex: 1,
    height: 4,
  },
  withBorderBottom: {
    borderBottomWidth: 1,
  },
  withBorderLeft: {
    borderLeftWidth: 1,
  },
  withBorderRight: {
    borderRightWidth: 1,
  },
});

export default PrecipitationStrip;
