import { useTheme } from '@react-navigation/native';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { Skeleton } from 'moti/skeleton';

const MeteorologistSnapshot: React.FC = () => {
  const { dark } = useTheme() as CustomTheme;

  const colorMode = dark ? 'dark' : 'light';
  const loading = true;

    if (loading) {
      return (
        <MotiView>
          <View style={styles.box}>
            <Skeleton colorMode={colorMode} width={'100%'} height={200} radius={10} />
          </View>
        </MotiView>
      );
    }

  return (
    <View style={styles.box} />
  )
}

const styles = StyleSheet.create({
  // eslint-disable-next-line react-native/no-color-literals
  box: {
    margin: 16,
    minHeight: 200,
    borderRadius: 10,
    backgroundColor: '#f3f3f3',
  }
});

export default MeteorologistSnapshot;
