import React from 'react';
import { View, StyleSheet, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import Text from '@components/common/AppText';
import Icon from '@components/common/ScalableIcon';
import AccessibleTouchableOpacity from '@components/common/AccessibleTouchableOpacity';
import { OthersStackParamList } from '@navigators/types';
import { Config } from '@config';
import { trackMatomoEvent } from '@utils/matomo';

interface Props {
  navigation: StackNavigationProp<OthersStackParamList, 'StackOthers'>;
}

const OthersScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation('navigation');
  const { colors, dark } = useTheme();

  const feedback = Config.get('feedback');
  const socialMediaLinks = Config.get('socialMediaLinks');

  const handleSocialPress = async (appUrl: string, fallback: string) => {
    const supported = await Linking.canOpenURL(appUrl);
    if (supported) {
      Linking.openURL(appUrl).catch(() => {});
    } else {
      Linking.openURL(fallback);
    }
  };

  return (
    <SafeAreaView edges={['right', 'left']}>
      <View testID="others_view" style={styles.container}>
        <View>
          <View
            style={[
              styles.withBorderBottom,
              { borderBottomColor: colors.border },
            ]}>
            <AccessibleTouchableOpacity
              delayPressIn={100}
              onPress={() => {
                trackMatomoEvent('User action', 'Settings', 'Navigate to SETTINGS');
                navigation.navigate('Settings')
              }}
              testID="navigation_settings"
              accessibilityRole="menuitem"
              accessibilityHint={`${t('navigateTo')} ${t('settings')}`}>
              <View style={styles.row}>
                <Text style={[styles.text, { color: colors.text }]}>{`${t(
                  'settings'
                )}`}</Text>
                <Icon
                  name="arrow-forward"
                  width={22}
                  height={22}
                  style={{ color: colors.text }}
                />
              </View>
            </AccessibleTouchableOpacity>
          </View>

          <View
            style={[
              styles.withBorderBottom,
              { borderBottomColor: colors.border },
            ]}>
            <View style={styles.row}>
              <Text
                accessibilityRole="header"
                style={[styles.text, { color: colors.text }]}>{`${t(
                'about'
              )}`}</Text>
            </View>
          </View>
          <View
            style={[
              styles.withBorderBottom,
              styles.withMarginLeft,
              { borderBottomColor: colors.border },
            ]}>
            <AccessibleTouchableOpacity
              delayPressIn={100}
              onPress={() => {
                trackMatomoEvent('User action', 'Settings', 'Navigate to ABOUT');
                navigation.navigate('About')
              }}
              testID="navigation_about"
              accessibilityRole="menuitem"
              accessibilityHint={`${t('navigateTo')} ${t('general')}`}>
              <View style={styles.row}>
                <Text
                  style={[styles.textRegular, { color: colors.text }]}>{`${t(
                  'general'
                )}`}</Text>
                <Icon
                  name="arrow-forward"
                  width={22}
                  height={22}
                  style={{ color: colors.text }}
                />
              </View>
            </AccessibleTouchableOpacity>
          </View>
          <View
            style={[
              styles.withBorderBottom,
              styles.withMarginLeft,
              { borderBottomColor: colors.border },
            ]}>
            <AccessibleTouchableOpacity
              delayPressIn={100}
              onPress={() => {
                trackMatomoEvent('User action', 'Settings', 'Navigate to TOC');
                navigation.navigate('TermsAndConditions')
              }}
              testID="navigation_terms_and_conditions"
              accessibilityRole="menuitem"
              accessibilityHint={`${t('navigateTo')} ${t(
                'termsAndConditions'
              )}`}>
              <View style={styles.row}>
                <Text
                  style={[styles.textRegular, { color: colors.text }]}>{`${t(
                  'termsAndConditions'
                )}`}</Text>
                <Icon
                  name="arrow-forward"
                  width={22}
                  height={22}
                  style={{ color: colors.text }}
                />
              </View>
            </AccessibleTouchableOpacity>
          </View>

          {/* <View
            style={[
              styles.withBorderBottom,
              styles.withMarginLeft,
              { borderBottomColor: colors.border },
            ]}>
            <AccessibleTouchableOpacity
              delayPressIn={100}
              onPress={() => navigation.navigate('About')}
              accessibilityRole="menuitem"
              accessibilityHint={`${t('navigateTo')} ${t('dataPrivacy')}`}>
              <View style={styles.row}>
                <Text
                  style={[styles.textRegular, { color: colors.text }]}>{`${t(
                  'dataPrivacy'
                )}`}</Text>
                <Icon
                  name="arrow-forward"
                  width={22}
                  height={22}
                  style={{ color: colors.text }}
                />
              </View>
            </AccessibleTouchableOpacity>
          </View> */}

          <View
            style={[
              styles.withBorderBottom,
              styles.withMarginLeft,
              { borderBottomColor: colors.border },
            ]}>
            <AccessibleTouchableOpacity
              delayPressIn={100}
              onPress={() => {
                trackMatomoEvent('User action', 'Settings', 'Navigate to ACCESSIBILITY');
                navigation.navigate('Accessibility')
              }}
              testID="navigation_accessibility"
              accessibilityRole="menuitem"
              accessibilityHint={`${t('navigateTo')} ${t('accessibility')}`}>
              <View style={styles.row}>
                <Text
                  style={[styles.textRegular, { color: colors.text }]}>{`${t(
                  'accessibility'
                )}`}</Text>
                <Icon
                  name="arrow-forward"
                  width={22}
                  height={22}
                  style={{ color: colors.text }}
                />
              </View>
            </AccessibleTouchableOpacity>
          </View>

          {feedback?.enabled && (
            <View
              style={[
                styles.withBorderBottom,
                { borderBottomColor: colors.border },
              ]}>
              <AccessibleTouchableOpacity
                delayPressIn={100}
                onPress={() => {
                  trackMatomoEvent('User action', 'Settings', 'Navigate to FEEDBACK');
                  navigation.navigate('GiveFeedback')
                }}
                testID="navigation_feedback"
                accessibilityRole="menuitem"
                accessibilityHint={`${t('navigateTo')} ${t('feedback')}`}>
                <View style={styles.row}>
                  <Text style={[styles.text, { color: colors.text }]}>{`${t(
                    'feedback'
                  )}`}</Text>
                  <Icon
                    name="arrow-forward"
                    width={22}
                    height={22}
                    style={{ color: colors.text }}
                  />
                </View>
              </AccessibleTouchableOpacity>
            </View>
          )}
        </View>
        {socialMediaLinks.length > 0 && (
          <View style={styles.withPaddingHorizontal}>
            <View style={styles.textWrapper}>
              <Text style={[styles.text, { color: colors.text }]}>
                {t('about:followUs')}
              </Text>
            </View>
            <View style={styles.socialRow}>
              {socialMediaLinks.map((socialMediaLink) => (
                <AccessibleTouchableOpacity
                  key={socialMediaLink.name}
                  accessibilityLabel={socialMediaLink.name}
                  accessibilityRole="link"
                  accessibilityHint={`${t('open')} ${socialMediaLink.name}`}
                  onPress={() => {
                    trackMatomoEvent('User action', 'Settings', 'Follow us - '+socialMediaLink.name);
                    handleSocialPress(
                      socialMediaLink.appUrl || socialMediaLink.url,
                      socialMediaLink.url
                    );
                  }}
                  style={styles.withMarginRight}>
                  <Icon
                    name={socialMediaLink.icon + (dark ? '-dark' : '-light')}
                    style={{ color: colors.text }}
                  />
                </AccessibleTouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    height: '100%',
    padding: 12,
    paddingBottom: 28,
    justifyContent: 'space-between',
  },
  text: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
  },
  textRegular: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    minHeight: 44,
    width: '100%',
  },
  withBorderBottom: {
    borderBottomWidth: 1,
  },
  socialRow: {
    flexDirection: 'row',
    height: 50,
  },
  withMarginRight: {
    marginRight: 12,
  },
  textWrapper: {
    minHeight: 48,
    justifyContent: 'center',
  },
  withPaddingHorizontal: {
    paddingHorizontal: 12,
  },
  withMarginLeft: {
    marginLeft: 20,
  },
});

export default OthersScreen;
