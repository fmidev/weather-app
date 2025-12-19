import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import Text from '@components/common/AppText';
import packageJSON from '../../package.json';

const AboutScreen: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t('about:title')}
        </Text>
        <Text style={[styles.text, { color: colors.text }]}>
          {t('about:body')}
        </Text>
        <Text
          style={[styles.text, { color: colors.text }]}
          testID="about_version_info">
          {`${t('about:versionInfo')}: ${packageJSON.version}`}
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
    marginTop: 32,
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
    marginBottom: 16,
  },
});

export default AboutScreen;
