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
import { MarkdownRenderer } from '@components/markdown/MarkdownRenderer';
import { CustomTheme } from '@assets/colors';
import { Config } from '@config';
import { termsOfUseDocuments } from '@assets/markdown';

const renderer = new MarkdownRenderer();

type TermsAndConditionsScreenProps = {
  showActions?: boolean;
  onAccept?: () => void;
};

const TermsAndConditionsScreen: React.FC<TermsAndConditionsScreenProps> = ({
  showActions,
  onAccept,
}) => {
  const [errorMessage, setErrorMessage] = React.useState<string>('');
  const { t, i18n } = useTranslation('termsAndConditions');
  const { colors } = useTheme() as CustomTheme;
  const titleRef = useRef<RNText>(null);
  const insets = useSafeAreaInsets();
  const { markdown } = Config.get('settings');

  const closeButtonMarginBottom = Math.round(insets.bottom);

  renderer.setHeadingColor(colors.text);
  renderer.setTextColor(colors.primaryText);

  const errorColor = 'red';

  useFocusEffect(() => {
    if (titleRef && titleRef.current) {
      const reactTag = findNodeHandle(titleRef.current);
      if (reactTag) {
        AccessibilityInfo.setAccessibilityFocus(reactTag);
      }
    }
  });

  return (
    <View
      testID="terms_and_conditions_view"
      style={[styles.container, { backgroundColor: colors.background }]}>
      { markdown?.termsOfUse ?
          <View style={styles.markdown}>
            <Markdown
              value={termsOfUseDocuments[i18n.language as keyof typeof termsOfUseDocuments] || termsOfUseDocuments.en}
              renderer={renderer}
              flatListProps={{
                style: {
                  backgroundColor: colors.background,
                },
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
      {showActions && (
        <View
          style={[
            styles.bottomContainer,
            {
              shadowColor: colors.shadow,
              backgroundColor: colors.background,
            },
          ]}>
          { errorMessage !== '' && (
            <Text style={[styles.error, { color: errorColor }]}>
              {t(errorMessage)}
            </Text>
          )}
          <View style={styles.buttonContainer}>
            <AccessibleTouchableOpacity
              testID="terms_accept_button"
              onPress={onAccept}
              accessibilityRole="button"
              accessibilityHint={t('acceptButtonAccessibilityHint')}>
              <View style={[styles.button, { borderColor: colors.text, marginBottom: closeButtonMarginBottom }]}>
                <Text style={[styles.buttonText, { color: colors.text }]}>
                  {t('accept')}
                </Text>
              </View>
            </AccessibleTouchableOpacity>
            <AccessibleTouchableOpacity
              testID="terms_close_button"
              onPress={() => {
                setErrorMessage('acceptTermsError');
              }}
              accessibilityRole="button"
              accessibilityHint={t('declineButtonAccessibilityHint')}>
              <View style={[styles.button, { borderColor: colors.text, marginBottom: closeButtonMarginBottom }]}>
                <Text style={[styles.buttonText, { color: colors.text }]}>
                  {t('decline')}
                </Text>
              </View>
            </AccessibleTouchableOpacity>
          </View>
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
  bottomContainer: {
    width: '100%',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowRadius: 4,
    shadowOpacity: 1,
    elevation: 11,
    alignItems: 'center',
    paddingTop: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  button: {
    width: 120,
    height: 44,
    borderRadius: 24,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
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
  error: {
    width: '100%',
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'Roboto-Medium',
    paddingHorizontal: 16,
    paddingBottom: 8,
  }
});

export default TermsAndConditionsScreen;
