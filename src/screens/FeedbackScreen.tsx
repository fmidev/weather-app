import React from 'react';
import { View, StyleSheet, Linking, Platform } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Config } from '@config';

import AccessibleTouchableOpacity from '@components/common/AccessibleTouchableOpacity';
import Text from '@components/common/AppText';
import Icon from '@assets/Icon';

import packageJSON from '../../package.json';
import { trackMatomoEvent } from '@utils/matomo';
import { WHITE, BLACK } from '@assets/colors';

const FeedbackScreen: React.FC = () => {
  const { t, i18n } = useTranslation('feedback');
  const { colors, dark } = useTheme();

  const feedback = Config.get('feedback');
  const linkTextColor = dark ? WHITE : BLACK;

  const platformInfo = `(${
    Platform.OS === 'ios' ? Platform.constants.systemName : 'android'
  }/${Platform.Version}/${packageJSON.version})`;

  const mailToUrl = `mailto:${feedback?.email || ''}?subject=${
    feedback?.subject[i18n.language] || ''
  } ${platformInfo}`;
  const faqUrl = feedback?.faqUrl?.[i18n.language] || '';

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

        {!!faqUrl && (
          <AccessibleTouchableOpacity
            testID="feedback_faq_button"
            accessibilityRole="link"
            onPress={() => {
              trackMatomoEvent('User action', 'Settings', 'Open URL - '+faqUrl);
              Linking.openURL(faqUrl);
            }}
            accessibilityHint={t('openFAQHint')}>
            <View
              style={[
                styles.link,
                styles.withLargeMarginBottom,
                { borderBottomColor: colors.primary }
              ]}>
              <Text
                maxFontSizeMultiplier={1.5}
                style={[
                  styles.linkText,
                  {
                    color: linkTextColor
                  },
                ]}>
                {t('openFAQ')}
              </Text>
                <Icon
                  name="open-in-new"
                  style={styles.withMarginLeft}
                  color={linkTextColor}
                  width={18}
                  height={18}
                  maxFontSizeMultiplier={1.5}
                />
            </View>
          </AccessibleTouchableOpacity>
        )}

        <AccessibleTouchableOpacity
          testID="feedback_button"
          accessibilityRole="button"
          onPress={() => {
            trackMatomoEvent('User action', 'Settings', 'Open URL - '+mailToUrl);
            Linking.openURL(mailToUrl);
          }}
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
  link: {
    padding: 4,
    borderBottomWidth: 2,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkText: {
    fontFamily: 'Roboto-Bold',
    fontWeight: 'bold',
    fontSize: 16,
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
