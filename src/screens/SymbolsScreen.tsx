import React from 'react';
import { View, SafeAreaView, Text, StyleSheet, FlatList } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@react-navigation/native';

import { SvgProps } from 'react-native-svg';
import { symbolsLight, symbolsDark } from '../assets/images';
import { WHITE } from '../utils/colors';

const SymbolsScreen: React.FC = () => {
  const { t } = useTranslation('symbols');
  const { colors, dark } = useTheme();

  const symbols = dark ? symbolsDark : symbolsLight;

  const symbolsArr = Object.entries(symbols).map(([key, value]) => ({
    key,
    ...value,
  }));

  const itemRenderer = ({
    item,
  }: {
    item: { key: string; day: React.FC<SvgProps>; night: React.FC<SvgProps> };
  }) => (
    <View style={styles.row}>
      <View style={styles.image}>{item.day({ width: 40, height: 40 })}</View>
      <View style={styles.image}>{item.night({ width: 40, height: 40 })}</View>
      <Text style={[styles.description, { color: colors.text }]}>{`${t(
        `symbols:${item.key}`
      )}`}</Text>
    </View>
  );
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        style={styles.list}
        data={symbolsArr}
        keyExtractor={({ key }) => key}
        renderItem={itemRenderer}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: WHITE,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    margin: 8,
  },
  description: {
    flex: 1,
    paddingHorizontal: 15,
    fontFamily: 'Roboto-Regular',
    fontSize: 16,
  },
  list: {
    width: '100%',
    paddingHorizontal: 20,
  },
});

export default SymbolsScreen;
