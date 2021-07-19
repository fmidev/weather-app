import React from 'react';
import {
  View,
  SafeAreaView,
  Text,
  StyleSheet,
  Image,
  FlatList,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@react-navigation/native';

import { images, WeatherSymbol } from '../assets/images';
import { PRIMARY_BLUE, WHITE } from '../utils/colors';

const SymbolsScreen: React.FC = () => {
  const { t } = useTranslation('symbols');
  const { colors } = useTheme();
  const symbolsArr = Object.entries(images.symbols).map(([key, value]) => ({
    key,
    ...value,
  }));

  const itemRenderer = ({ item }: { item: WeatherSymbol }) => (
    <View style={styles.row} testID={item.key}>
      <Image style={styles.image} source={item.day} />
      <Image style={styles.image} source={item.night} />
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
    width: 50,
    height: 50,
    resizeMode: 'contain',
    margin: 8,
  },
  description: {
    flex: 1,
    paddingHorizontal: 15,
    color: PRIMARY_BLUE,
  },
  list: {
    width: '100%',
    paddingHorizontal: 20,
  },
});

export default SymbolsScreen;
