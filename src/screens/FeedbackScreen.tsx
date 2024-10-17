import React from 'react';
import { View, Text, StyleSheet, Linking, Platform } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Config } from '@config';

import AccessibleTouchableOpacity from '@components/common/AccessibleTouchableOpacity';
import Icon from '@components/common/Icon';

import packageJSON from '../../package.json';

const FeedbackScreen: React.FC = () => {
  const { t, i18n } = useTranslation('feedback');
  const { colors } = useTheme();

  const feedback = Config.get('feedback');

  const platformInfo = `(${
    Platform.OS === 'ios' ? Platform.constants.systemName : 'android'
  }/${Platform.Version}/${packageJSON.version})`;

  const mailToUrl = `mailto:${feedback?.email || ''}?subject=${
    feedback?.subject[i18n.language] || ''
  } ${platformInfo}`;

  return (
    <View testID="feedback_view">
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
          testID="feedback_button"
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
    fontFamily: 'Roboto-Bold',
  },
  text: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
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
