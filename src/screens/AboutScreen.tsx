import React from 'react';
import { SafeAreaView, Text, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import packageJSON from '../../package.json';

const AboutScreen: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <SafeAreaView style={styles.container}>
      <Text
        style={[styles.text, { color: colors.text }]}
        testID="about_version_info">
        {`${t('about:versionInfo')}: ${packageJSON.version}`}
      </Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  text: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
  },
});

export default AboutScreen;
