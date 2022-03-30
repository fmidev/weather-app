import React from 'react';
import { View, SafeAreaView, Text, StyleSheet, Linking } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import Icon from '@components/common/Icon';
import AccessibleTouchableOpacity from '@components/common/AccessibleTouchableOpacity';
import { OthersStackParamList } from '@navigators/types';

interface Props {
  navigation: StackNavigationProp<OthersStackParamList, 'StackOthers'>;
}

const OthersScreen: React.FC<Props> = ({ navigation }) => {
  const {
    t,
    i18n: { language },
  } = useTranslation('navigation');
  const { colors, dark } = useTheme();

  return (
    <SafeAreaView>
      <View style={styles.container}>
        <View>
          <View
            style={[
              styles.withBorderBottom,
              { borderBottomColor: colors.border },
            ]}>
            <AccessibleTouchableOpacity
              delayPressIn={100}
              onPress={() => navigation.navigate('Settings')}
              testID="navigation_settings">
              <View style={styles.row}>
                <Text style={[styles.text, { color: colors.text }]}>{`${t(
                  'navigation:settings'
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
              <Text style={[styles.text, { color: colors.text }]}>{`${t(
                'navigation:about'
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
              onPress={() => navigation.navigate('About')}>
              <View style={styles.row}>
                <Text
                  style={[styles.textRegular, { color: colors.text }]}>{`${t(
                  'navigation:general'
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
              onPress={() => navigation.navigate('TermsAndConditions')}>
              <View style={styles.row}>
                <Text
                  style={[styles.textRegular, { color: colors.text }]}>{`${t(
                  'navigation:termsAndConditions'
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
              onPress={() => navigation.navigate('About')}>
              <View style={styles.row}>
                <Text
                  style={[styles.textRegular, { color: colors.text }]}>{`${t(
                  'navigation:dataPrivacy'
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
              onPress={() => navigation.navigate('About')}>
              <View style={styles.row}>
                <Text
                  style={[styles.textRegular, { color: colors.text }]}>{`${t(
                  'navigation:accessibility'
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
            <AccessibleTouchableOpacity
              delayPressIn={100}
              onPress={() => navigation.navigate('GiveFeedback')}>
              <View style={styles.row}>
                <Text style={[styles.text, { color: colors.text }]}>{`${t(
                  'navigation:feedback'
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
        </View>

        <View style={styles.withPaddingHorizontal}>
          <Icon
            name={`logo-fmi-${language}`}
            style={[styles.withMarginBottom, { color: colors.text }]}
          />
          <View style={styles.textWrapper}>
            <Text style={[styles.text, { color: colors.text }]}>
              {t('about:followUs')}
            </Text>
          </View>
          <View style={styles.socialRow}>
            <AccessibleTouchableOpacity
              onPress={() =>
                Linking.openURL('https://twitter.com/meteorologit')
              }
              style={styles.withMarginRight}>
              <Icon
                name={dark ? 'social-twitter-dark' : 'social-twitter-light'}
                style={{ color: colors.text }}
              />
            </AccessibleTouchableOpacity>
            <AccessibleTouchableOpacity
              onPress={() =>
                Linking.openURL('https://www.instagram.com/ilmatieteenlaitos/')
              }
              style={styles.withMarginRight}>
              <Icon
                name={dark ? 'social-instagram-dark' : 'social-instagram-light'}
                style={{ color: colors.text }}
              />
            </AccessibleTouchableOpacity>
            <AccessibleTouchableOpacity
              onPress={() =>
                Linking.openURL(
                  'https://www.youtube.com/user/ilmatieteenlaitos'
                )
              }
              style={styles.withMarginRight}>
              <Icon
                name={dark ? 'social-youtube-dark' : 'social-youtube-light'}
                style={{ color: colors.text }}
              />
            </AccessibleTouchableOpacity>
          </View>
        </View>
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
  },
  withMarginRight: {
    marginRight: 12,
  },
  textWrapper: {
    minHeight: 48,
    justifyContent: 'center',
  },
  withMarginBottom: {
    marginBottom: 24,
  },
  withPaddingHorizontal: {
    paddingHorizontal: 12,
  },
  withMarginLeft: {
    marginLeft: 20,
  },
});

export default OthersScreen;
