import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Callout } from 'react-native-maps';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import Icon from '@components/common/Icon';

import { CustomTheme } from '@utils/colors';

type TimeseriesCalloutProps = {
  item: {
    name: string;
    smartSymbol: number;
    windSpeedMS: number;
    windDirection: number;
  };
};

const TimeseriesCallout: React.FC<TimeseriesCalloutProps> = ({ item }) => {
  const { t } = useTranslation();
  const { colors, dark } = useTheme() as CustomTheme;

  const { name, smartSymbol, windSpeedMS, windDirection } = item;
  return (
    <Callout key={name} tooltip style={styles.calloutWrapper}>
      <View
        style={[
          styles.calloutContainer,
          {
            backgroundColor: colors.mapButtonBackground,
            borderColor: colors.mapButtonBorder,
          },
        ]}>
        <Text style={[styles.calloutTitle, { color: colors.text }]}>
          {name}
        </Text>
        <Text style={[styles.calloutText, { color: colors.text }]}>
          {`${t(`symbols:${smartSymbol}`)}`}
        </Text>
        <View style={styles.windSpeedRow}>
          <Icon
            name={dark ? 'wind-dark' : 'wind-light'}
            width={24}
            height={24}
            style={{
              transform: [
                {
                  rotate: `${(windDirection || 0) + 45 - 180}deg`,
                },
              ],
            }}
          />
          <Text style={[styles.calloutText, { color: colors.text }]}>
            {`${windSpeedMS} m/s`}
          </Text>
        </View>
      </View>
    </Callout>
  );
};

const styles = StyleSheet.create({
  calloutWrapper: {
    flex: 1,
    position: 'relative',
  },
  calloutContainer: {
    padding: 10,
    borderRadius: 4,
    borderWidth: 1,
  },
  calloutTitle: {
    fontFamily: 'Roboto-Medium',
    fontSize: 16,
  },
  calloutText: {
    fontFamily: 'Roboto-Regular',
    fontSize: 14,
  },
  windSpeedRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default TimeseriesCallout;
