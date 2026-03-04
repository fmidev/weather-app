import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@react-navigation/native';

import Text from '@components/common/AppText';

import { CustomTheme, getTemperatureIndexColor } from '@assets/colors';

const TemperatureLegend: React.FC = () => {
  const { t } = useTranslation('map');
  const { colors } = useTheme() as CustomTheme;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
      {
        [...Array(50)].map((_, i) => (
          <View
            key={i}
            style={[
              i === 0 ||
              i === 6 ||
              i === 11 ||
              i === 16 ||
              i === 21 ||
              i === 29 ||
              i === 35 ||
              i === 40 ||
              i === 45
                ? styles.rainBlockTen
                : styles.rainBlock,
              { backgroundColor: getTemperatureIndexColor(i+1) },
            ]}
          />
        ))
      }
      </View>
      <View style={styles.labelRow}>
        <Text
          style={[
            styles.temperatureMinus30,
            styles.text,
            { color: colors.hourListText },
          ]}>
          {t('map:infoBottomSheet:temperature:temperatureMinus30')}
        </Text>
        <Text
          style={[
            styles.temperatureMinus20,
            styles.text,
            { color: colors.hourListText },
          ]}>
          {t('map:infoBottomSheet:temperature:temperatureMinus20')}
        </Text>
        <Text
          style={[
            styles.temperature0,
            styles.text,
            { color: colors.hourListText },
          ]}>
          {t('map:infoBottomSheet:temperature:temperature0')}
        </Text>
        <Text
          style={[
            styles.temperature20,
            styles.text,
            { color: colors.hourListText },
          ]}>
          {t('map:infoBottomSheet:temperature:temperature20')}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
  },
  labelRow: {
    marginTop: 8,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  row: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  container: {
    width: '100%',
    marginBottom: 5,
  },
  rainBlock: {
    flex: 1,
    height: 8,
    margin: 1,
  },
  rainBlockTen: {
    flex: 1,
    height: 16,
    margin: 1,
  },
  temperatureMinus30: {
    position: 'absolute',
    left: '19%',
  },
  temperatureMinus20: {
    position: 'absolute',
    left: '39%',
  },
  temperature0: {
    position: 'absolute',
    left: '56%',
  },
  temperature20: {
    position: 'absolute',
    left: '78%',
  },
});

export default TemperatureLegend;
