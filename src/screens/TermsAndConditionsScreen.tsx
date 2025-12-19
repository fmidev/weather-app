import React, { useRef } from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  AccessibilityInfo,
  findNodeHandle,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Markdown from "react-native-marked";
import type { Text as RNText } from 'react-native';

import Text from '@components/common/AppText';
import AccessibleTouchableOpacity from '@components/common/AccessibleTouchableOpacity';
import { CustomTheme } from '@assets/colors';
import { Config } from '@config';

import termsFi from '@assets/markdown/TermsOfUseFi';
import termsSv from '@assets/markdown/TermsOfUseSv';
import termsEn from '@assets/markdown/TermsOfUseEn';
import termsEs from '@assets/markdown/TermsOfUseEs';

type TermsAndConditionsScreenProps = {
  showCloseButton?: boolean;
  onClose?: () => void;
};

const TermsAndConditionsScreen: React.FC<TermsAndConditionsScreenProps> = ({
  showCloseButton,
  onClose,
}) => {
  const { t, i18n } = useTranslation('termsAndConditions');
  const { colors } = useTheme() as CustomTheme;
  const titleRef = useRef<RNText>(null);
  const insets = useSafeAreaInsets();
  const { termsOfUseFormat } = Config.get('onboardingWizard');

  const closeButtonMarginBottom = Math.round(insets.bottom);

  useFocusEffect(() => {
    if (titleRef && titleRef.current) {
      const reactTag = findNodeHandle(titleRef.current);
      if (reactTag) {
        AccessibilityInfo.setAccessibilityFocus(reactTag);
      }
    }
  });

  const getMarkdown = ():string => {
    switch (i18n.language) {
      case 'fi': return termsFi;
      case 'sv': return termsSv;
      case 'es': return termsEs;
      default: return termsEn;
    }
  }

  return (
    <View
      testID="terms_and_conditions_view"
      style={[styles.container, { backgroundColor: colors.background }]}>
      { termsOfUseFormat === 'markdown' ?
          <View style={styles.markdown}>
            <Markdown
              value={getMarkdown()}
              flatListProps={{
                initialNumToRender: 8,
              }}
            />
          </View>
        : (
          <ScrollView
            style={styles.scrollContainer}
            contentContainerStyle={styles.withPaddingBottom}
            showsVerticalScrollIndicator={false}>
            <Text
              ref={titleRef}
              style={[styles.title, { color: colors.text }]}
              accessibilityRole="header">
              {t('generalTitle')}
            </Text>
            <Text style={[styles.body, { color: colors.hourListText }]}>
              {t('generalDescription')}
            </Text>
            <Text
              style={[styles.title, { color: colors.text }]}
              accessibilityRole="header">
              {t('contentsTitle')}
            </Text>
            <Text style={[styles.body, { color: colors.hourListText }]}>
              {t('contentsDescription')}
            </Text>
            <Text
              style={[styles.title, { color: colors.text }]}
              accessibilityRole="header">
              {t('personalInfoTitle')}
            </Text>
            <Text style={[styles.body, { color: colors.hourListText }]}>
              {t('personalInfoDescription')}
            </Text>
            <Text
              style={[styles.title, { color: colors.text }]}
              accessibilityRole="header">
              {t('immaterialRightsTitle')}
            </Text>
            <Text style={[styles.body, { color: colors.hourListText }]}>
              {t('immaterialRightsDescription')}
            </Text>
            <Text
              style={[styles.title, { color: colors.text }]}
              accessibilityRole="header">
              {t('liabilityTitle')}
            </Text>
            <Text style={[styles.body, { color: colors.hourListText }]}>
              {t('liabilityDescription')}
            </Text>
            <Text
              style={[styles.title, { color: colors.text }]}
              accessibilityRole="header">
              {t('rightToChangesTitle')}
            </Text>
            <Text style={[styles.body, { color: colors.hourListText }]}>
              {t('rightToChangesDescription')}
            </Text>
            <Text
              style={[styles.title, { color: colors.text }]}
              accessibilityRole="header">
              {t('applicableLawTitle')}
            </Text>
            <Text style={[styles.body, { color: colors.hourListText }]}>
              {t('applicableLawDescription')}
            </Text>
            <Text
              style={[styles.title, { color: colors.text }]}
              accessibilityRole="header">
              {t('contactDetailsTitle')}
            </Text>
            <Text style={[styles.body, { color: colors.hourListText }]}>
              {t('contactDetailsDescription')}
            </Text>
          </ScrollView>
        )
      }
      {showCloseButton && (
        <View
          style={[
            styles.closeButtonContainer,
            {
              shadowColor: colors.shadow,
              backgroundColor: colors.background,
            },
          ]}>
          <AccessibleTouchableOpacity
            testID="terms_close_button"
            onPress={onClose}
            accessibilityRole="button"
            accessibilityHint={t('closeButtonAccessibilityHint')}>
            <View style={[styles.closeButton, { borderColor: colors.text, marginBottom: closeButtonMarginBottom }]}>
              <Text style={[styles.closeText, { color: colors.text }]}>
                {t('close')}
              </Text>
            </View>
          </AccessibleTouchableOpacity>
        </View>
      )}
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
  body: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
  },
  closeButtonContainer: {
    width: '100%',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowRadius: 4,
    shadowOpacity: 1,
    elevation: 11,
    alignItems: 'center',
    paddingVertical: 16,
  },
  closeButton: {
    width: 120,
    height: 44,
    borderRadius: 24,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 16,
    fontFamily: 'Roboto-Medium',
  },
  withPaddingBottom: {
    paddingBottom: 24,
  },
  markdown: {
    padding: 16,
    flexShrink: 1,
  },
});

export default TermsAndConditionsScreen;
