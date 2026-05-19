import React, { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import AccessibleTouchableOpacity from '@components/common/AccessibleTouchableOpacity';
import Text from '@components/common/AppText';
import Icon from '@components/common/ScalableIcon';
import { trackMatomoEvent } from '@utils/matomo';

interface Props {
  currentLanguage: string;
  languages: string[];
  onChangeLanguage: (language: string) => void;
}

const LanguageSettings: React.FC<Props> = ({
  currentLanguage,
  languages,
  onChangeLanguage,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation('settings');

  const changeLanguage = useCallback((language: string) => {
    if (currentLanguage !== language) {
      onChangeLanguage(language);
      setTimeout(() => {
        trackMatomoEvent(
          'User action',
          'Settings',
          `Select language - ${language}`
        );
      }, 50);
    }
  }, [currentLanguage, onChangeLanguage]);

  return (
    <>
      <View
        style={[
          styles.rowWrapper,
          styles.withBorderBottom,
          styles.withMarginTop,
          { borderBottomColor: colors.border },
        ]}>
        <View style={styles.row}>
          <Text
            style={[styles.title, { color: colors.text }]}
            testID="settings_language_header"
            accessibilityRole="header">
            {t('settings:language')}
          </Text>
        </View>
      </View>
      <View>
        {languages.map((language) => (
          <View
            key={language}
            style={[
              styles.rowWrapper,
              styles.withBorderBottom,
              { borderBottomColor: colors.border },
            ]}>
            <AccessibleTouchableOpacity
              onPress={() => changeLanguage(language)}
              testID={`settings_set_language_${language}`}
              delayPressIn={100}
              accessibilityState={{
                selected: currentLanguage === language,
              }}
              accessibilityRole="button"
              accessibilityHint={`${t('settings:languageHint')} ${t(
                `settings:${language}`
              )}`}>
              <View style={styles.row}>
                <Text style={[styles.text, { color: colors.text }]}>
                  {t(`settings:${language}`)}
                </Text>
                {currentLanguage === language && (
                  <Icon
                    name="checkmark"
                    size={22}
                    style={{ color: colors.text }}
                  />
                )}
              </View>
            </AccessibleTouchableOpacity>
          </View>
        ))}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
  },
  rowWrapper: {
    marginHorizontal: 20,
  },
  withBorderBottom: {
    borderBottomWidth: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    width: '100%',
    minHeight: 48,
  },
  text: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
    marginLeft: 20,
  },
  withMarginTop: {
    marginTop: 16,
  },
});

export default LanguageSettings;
