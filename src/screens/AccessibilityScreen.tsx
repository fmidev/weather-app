import React, { useRef } from 'react';
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  AccessibilityInfo,
  findNodeHandle,
  Linking,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme, useFocusEffect } from '@react-navigation/native';

import AccessibleTouchableOpacity from '@components/common/AccessibleTouchableOpacity';
import Icon from '@components/common/Icon';

import { CustomTheme } from '@utils/colors';
import packageJSON from '../../package.json';

const TermsAndConditionsScreen: React.FC = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation('accessibility');
  const { colors } = useTheme() as CustomTheme;
  const titleRef = useRef() as React.MutableRefObject<Text>;

  useFocusEffect(() => {
    if (titleRef && titleRef.current) {
      const reactTag = findNodeHandle(titleRef.current);
      if (reactTag) {
        AccessibilityInfo.setAccessibilityFocus(reactTag);
      }
    }
  });

  const fmiMailToUrl = `mailto:kirjaamo@fmi.fi?subject=Ilmatieteen laitoksen sää saavutettavuus [versio: ${packageJSON.version}]`;

  const accessibility = 'https://www.saavutettavuusvaatimukset.fi';
  const accessibilitySv = 'https://www.tillgänglighetskrav.fi';

  const legal = 'https://www.finlex.fi/fi/laki/alkup/2019/20190306';
  const legalSv = 'https://www.finlex.fi/sv/laki/ajantasa/2019/20190306';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.withPaddingBottom}
        showsVerticalScrollIndicator={false}>
        <Text
          ref={titleRef}
          style={[styles.title, { color: colors.primaryText }]}
          accessibilityRole="header">
          {t('generalTitle')}
        </Text>
        <Text
          style={[styles.body, styles.bold, { color: colors.hourListText }]}>
          {t('generalAbout')}
        </Text>
        <Text style={[styles.body, { color: colors.hourListText }]}>
          {t('generalDescription')}
        </Text>
        <Text
          style={[styles.title, { color: colors.primaryText }]}
          accessibilityRole="header">
          {t('subTitle1')}
        </Text>
        <Text style={[styles.body, { color: colors.hourListText }]}>
          {t('description1')}
        </Text>
        <Text
          style={[styles.title, { color: colors.primaryText }]}
          accessibilityRole="header">
          {t('subTitle2')}
        </Text>
        <Text style={[styles.body, { color: colors.hourListText }]}>
          {t('description2')}
        </Text>
        <AccessibleTouchableOpacity
          accessibilityRole="link"
          accessibilityHint={t('feedback:moveToHint')}
          onPress={() => Linking.openURL(fmiMailToUrl)}>
          <View style={[styles.link, { borderBottomColor: colors.primary }]}>
            <Text
              style={[
                styles.linkText,
                {
                  color: colors.primaryText,
                },
              ]}>
              {t('email')}
            </Text>
          </View>
        </AccessibleTouchableOpacity>
        <Text
          style={[styles.title, { color: colors.primaryText }]}
          accessibilityRole="header">
          {t('subTitle3')}
        </Text>
        <Text style={[styles.body, { color: colors.hourListText }]}>
          {t('description3')}
        </Text>
        <AccessibleTouchableOpacity
          accessibilityRole="link"
          accessibilityHint={t('openInBrowser')}
          onPress={() =>
            language === 'sv'
              ? Linking.openURL(accessibilitySv)
              : Linking.openURL(accessibility)
          }>
          <View style={[styles.link, { borderBottomColor: colors.primary }]}>
            <Text
              style={[
                styles.linkText,
                {
                  color: colors.primaryText,
                },
              ]}>
              {t('website')}
            </Text>
            <Icon name="open-in-new" color={colors.primaryText} height={18} />
          </View>
        </AccessibleTouchableOpacity>
        <AccessibleTouchableOpacity
          accessibilityRole="link"
          accessibilityHint={t('feedback:moveToHint')}
          onPress={() => Linking.openURL(`mailto:${t('email2')}`)}>
          <View style={[styles.link, { borderBottomColor: colors.primary }]}>
            <Text
              style={[
                styles.linkText,
                {
                  color: colors.primaryText,
                },
              ]}>
              {t('email2')}
            </Text>
          </View>
        </AccessibleTouchableOpacity>
        <Text style={[styles.body, { color: colors.hourListText }]}>
          {t('phone')}
        </Text>
        <Text
          style={[styles.title, { color: colors.primaryText }]}
          accessibilityRole="header">
          {t('subTitle4')}
        </Text>
        <Text style={[styles.body, { color: colors.hourListText }]}>
          {t('description4')}
        </Text>
        <Text
          style={[styles.subTitle, { color: colors.primaryText }]}
          accessibilityRole="header">
          {t('subTitle5')}
        </Text>
        <Text
          style={[
            styles.body,
            styles.withMarginBottom,
            { color: colors.hourListText },
          ]}>
          {t('description5')}
        </Text>
        <Text style={[styles.body, { color: colors.hourListText }]}>
          {t('description5.1')}
        </Text>
        {/* <Text
          style={[styles.subTitle, { color: colors.primaryText }]}
          accessibilityRole="header">
          {t('subTitle6')}
        </Text>
        <Text style={[styles.body, { color: colors.hourListText }]}>
          {t('description6')}
        </Text> */}
        <Text
          style={[styles.title, { color: colors.primaryText }]}
          accessibilityRole="header">
          {t('subTitle7')}
        </Text>
        <Text
          style={[
            styles.body,
            styles.withMarginBottom,
            { color: colors.hourListText },
          ]}>
          {t('description7')}
        </Text>
        <AccessibleTouchableOpacity
          accessibilityRole="link"
          accessibilityHint={t('openInBrowser')}
          onPress={() =>
            language === 'sv'
              ? Linking.openURL(legalSv)
              : Linking.openURL(legal)
          }>
          <View style={[styles.link, { borderBottomColor: colors.primary }]}>
            <Text
              style={[
                styles.linkText,
                {
                  color: colors.primaryText,
                },
              ]}>
              {t('link1')}
            </Text>
            <Icon name="open-in-new" color={colors.primaryText} height={18} />
          </View>
        </AccessibleTouchableOpacity>
        <AccessibleTouchableOpacity
          accessibilityRole="link"
          accessibilityHint={t('openInBrowser')}
          onPress={() =>
            language === 'sv'
              ? Linking.openURL(accessibilitySv)
              : Linking.openURL(accessibility)
          }>
          <View style={[styles.link, { borderBottomColor: colors.primary }]}>
            <Text
              style={[
                styles.linkText,
                {
                  color: colors.primaryText,
                },
              ]}>
              {t('link2')}
            </Text>
            <Icon name="open-in-new" color={colors.primaryText} height={18} />
          </View>
        </AccessibleTouchableOpacity>
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
  subTitle: {
    fontSize: 16,
    fontFamily: 'Roboto-Medium',
    marginTop: 32,
    marginBottom: 16,
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
    fontSize: 16,
  },
  bold: {
    fontFamily: 'Roboto-Bold',
    marginBottom: 16,
  },
  body: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
  },
  withPaddingBottom: {
    paddingBottom: 24,
  },
  withMarginBottom: {
    marginBottom: 16,
  },
});

export default TermsAndConditionsScreen;
