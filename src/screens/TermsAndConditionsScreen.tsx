import React from 'react';
import { SafeAreaView, ScrollView, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@react-navigation/native';

import { CustomTheme } from '@utils/colors';

const TermsAndConditionsScreen = () => {
  const { t } = useTranslation('termsAndConditions');
  const { colors } = useTheme() as CustomTheme;
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <Text style={[styles.title, { color: colors.primaryText }]}>
          {t('generalTitle')}
        </Text>
        <Text style={[styles.body, { color: colors.hourListText }]}>
          {t('loremIpsum')}
        </Text>
        <Text style={[styles.title, { color: colors.primaryText }]}>
          {t('contentsTitle')}
        </Text>
        <Text style={[styles.body, { color: colors.hourListText }]}>
          {t('loremIpsum')}
        </Text>
        <Text style={[styles.title, { color: colors.primaryText }]}>
          {t('someOtherTitle')}
        </Text>
        <Text style={[styles.body, { color: colors.hourListText }]}>
          {t('loremIpsum')}
        </Text>
      </ScrollView>
    </SafeAreaView>
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
  body: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
  },
});

export default TermsAndConditionsScreen;
