import React from 'react';
import {
  View,
  SafeAreaView,
  Text,
  StyleSheet,
  Image,
  FlatList,
} from 'react-native';
import { images, WeatherSymbol } from '../assets/images';
import { PRIMARY_BLUE, WHITE } from '../utils/colors';

const SymbolsScreen: React.FC = () => {
  const symbolsArr = Object.values(images.symbols);

  const itemRenderer = ({ item }: { item: WeatherSymbol }) => (
    <View style={styles.row}>
      <Image style={styles.image} source={item.day} />
      <Image style={styles.image} source={item.night} />
      <Text style={styles.description}>{item.description.fi}</Text>
    </View>
  );
  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        style={styles.list}
        data={symbolsArr}
        keyExtractor={(item) => item.description.en}
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
