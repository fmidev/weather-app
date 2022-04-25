import React, { useRef } from 'react';
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  AccessibilityInfo,
  findNodeHandle,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme, useFocusEffect } from '@react-navigation/native';

import AccessibleTouchableOpacity from '@components/common/AccessibleTouchableOpacity';

import { CustomTheme } from '@utils/colors';

type TermsAndConditionsScreenProps = {
  showCloseButton?: boolean;
  onClose?: () => void;
};

const TermsAndConditionsScreen: React.FC<TermsAndConditionsScreenProps> = ({
  showCloseButton,
  onClose,
}) => {
  const { t } = useTranslation('termsAndConditions');
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
        <Text style={[styles.body, { color: colors.hourListText }]}>
          {t('generalDescription')}
        </Text>
        <Text
          style={[styles.title, { color: colors.primaryText }]}
          accessibilityRole="header">
          {t('contentsTitle')}
        </Text>
        <Text style={[styles.body, { color: colors.hourListText }]}>
          {t('contentsDescription')}
        </Text>
        <Text
          style={[styles.title, { color: colors.primaryText }]}
          accessibilityRole="header">
          {t('personalInfoTitle')}
        </Text>
        <Text style={[styles.body, { color: colors.hourListText }]}>
          {t('personalInfoDescription')}
        </Text>
        <Text
          style={[styles.title, { color: colors.primaryText }]}
          accessibilityRole="header">
          {t('immaterialRightsTitle')}
        </Text>
        <Text style={[styles.body, { color: colors.hourListText }]}>
          {t('immaterialRightsDescription')}
        </Text>
        <Text
          style={[styles.title, { color: colors.primaryText }]}
          accessibilityRole="header">
          {t('liabilityTitle')}
        </Text>
        <Text style={[styles.body, { color: colors.hourListText }]}>
          {t('liabilityDescription')}
        </Text>
        <Text
          style={[styles.title, { color: colors.primaryText }]}
          accessibilityRole="header">
          {t('rightToChangesTitle')}
        </Text>
        <Text style={[styles.body, { color: colors.hourListText }]}>
          {t('rightToChangesDescription')}
        </Text>
        <Text
          style={[styles.title, { color: colors.primaryText }]}
          accessibilityRole="header">
          {t('applicableLawTitle')}
        </Text>
        <Text style={[styles.body, { color: colors.hourListText }]}>
          {t('applicableLawDescription')}
        </Text>
        <Text
          style={[styles.title, { color: colors.primaryText }]}
          accessibilityRole="header">
          {t('contactDetailsTitle')}
        </Text>
        <Text style={[styles.body, { color: colors.hourListText }]}>
          {t('contactDetailsDescription')}
        </Text>
      </ScrollView>
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
            onPress={onClose}
            accessibilityRole="button"
            accessibilityHint={t('closeButtonAccessibilityHint')}>
            <View style={[styles.closeButton, { borderColor: colors.text }]}>
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
});

export default TermsAndConditionsScreen;
