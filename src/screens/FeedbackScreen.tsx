import React from 'react';
import { View, Text, StyleSheet, Linking, Platform } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import AccessibleTouchableOpacity from '@components/common/AccessibleTouchableOpacity';
import Icon from '@components/common/Icon';

import packageJSON from '../../package.json';

const FeedbackScreen: React.FC = () => {
  const { t } = useTranslation('feedback');
  const { colors } = useTheme();

  const platformInfo = `(${
    Platform.OS === 'ios' ? Platform.constants.systemName : 'android'
  }/${Platform.Version}/${packageJSON.version})`;

  const mailToUrl = `mailto:mobiili@fmi.fi?subject=Ilmatieteen laitoksen sää palaute ${platformInfo}`;

  return (
    <View>
      <View style={styles.container}>
        <Text
          style={[
            styles.title,
            styles.withMarginBottom,
            { color: colors.text },
          ]}>
          {t('title')}
        </Text>
        <Text
          style={[
            styles.text,
            styles.withMarginBottom,
            { color: colors.text },
          ]}>
          {t('body1')}
        </Text>
        <Text
          style={[
            styles.text,
            styles.withLargeMarginBottom,
            { color: colors.text },
          ]}>
          {t('body2')}
        </Text>

        <AccessibleTouchableOpacity
          accessibilityRole="button"
          onPress={() => Linking.openURL(mailToUrl)}
          accessibilityHint={t('moveToHint')}>
          <View
            style={[styles.sendFeedbackButton, { borderColor: colors.text }]}>
            <Text style={[styles.title, { color: colors.text }]}>
              {t('sendFeedback')}
            </Text>
            <Icon
              name="open-in-new"
              style={[styles.withMarginLeft, { color: colors.text }]}
            />
          </View>
        </AccessibleTouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: '100%',
    padding: 20,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
  },
  text: {
    fontSize: 16,
    fontFamily: 'Roboto-Thin',
  },
  withMarginBottom: {
    marginBottom: 16,
  },
  withLargeMarginBottom: {
    marginBottom: 40,
  },
  sendFeedbackButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 44,
    paddingHorizontal: 28,
    borderWidth: 2,
    borderRadius: 24,
  },
  withMarginLeft: {
    marginLeft: 8,
  },
});

export default FeedbackScreen;
