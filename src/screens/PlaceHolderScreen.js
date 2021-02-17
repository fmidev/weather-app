import React from 'react';
import { SafeAreaView, Text, StyleSheet } from 'react-native';

const PlaceholderScreen = ({ text }) => (
  <SafeAreaView style={styles.container}>
    <Text style={styles.text}>{text}</Text>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  text: {
    fontSize: 16,
  },
});

export default PlaceholderScreen;
