import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import moment from 'moment';

import { CustomTheme, GRAY_1 } from '@assets/colors';
import { getPrecipitationLevel } from '@utils/helpers';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Config } from '@config';
import { selectUnits } from '@store/settings/selectors';
import {
  formatAccessiblePrecipitation,
  PrecipitationData,
} from '@utils/precipitationAccessibility';

type PrecipitationStripProps = {
  precipitationData: PrecipitationData;
  style?: ViewStyle;
  border?: boolean;
  accessible?: boolean;
};

const PrecipitationStrip: React.FC<PrecipitationStripProps> = ({
  precipitationData,
  style,
  border,
  accessible = true,
}) => {
  const { colors } = useTheme() as CustomTheme;
  const { t, i18n } = useTranslation('forecast');
  const units = useSelector(selectUnits);
  const precipitationUnit =
    units?.precipitation.unitAbb ?? Config.get('settings').units.precipitation;
  const precipitationHourArr =
    precipitationData &&
    precipitationData.map((item) => ({
      hour: moment(item.timestamp * 1000).hours(),
      precipitation: item.precipitation,
    }));

  const accessibilityLabel = formatAccessiblePrecipitation(
    precipitationData,
    precipitationUnit,
    i18n.language,
    t
  );

  const normalizedPrecipitationData =
    precipitationHourArr && precipitationHourArr.length < 24
      ? precipitationHourArr.reduce(
          (acc, curr, i) => {
            if (
              (i === 0 && curr.hour > 0) ||
              (i === precipitationHourArr.length - 1 && curr.hour < 23)
            ) {
              const missing = 24 - precipitationHourArr.length;
              let appendable:
                | { precipitation?: number | null; hour: number }
                | { precipitation?: number | null; hour: number }[] = curr;
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
                appendable as { precipitation?: number | null; hour: number }[]
              );
            }
            return acc.concat(curr);
          },
          [] as { precipitation?: number | null; hour: number }[]
        )
      : precipitationHourArr;

  const backgroundStyleGetter = (val: number | undefined | null): ViewStyle => {
    if (val === undefined || val === null)
      return { backgroundColor: GRAY_1, opacity: 0.5 };
    return { backgroundColor: colors.rain[getPrecipitationLevel(val)] };
  };

  return (
    <View
      accessible={accessible}
      focusable={false}
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.row,
        style,
        border && {
          ...styles.border,
          borderColor: colors.precipitationStripBorder,
        },
      ]}>
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
              border && { height: 12 },
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
    height: 18,
  },
  border: {
    borderWidth: 1,
  },
});

export default PrecipitationStrip;
