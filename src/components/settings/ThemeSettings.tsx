import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import AccessibleTouchableOpacity from '@components/common/AccessibleTouchableOpacity';
import Text from '@components/common/AppText';
import Icon from '@components/common/ScalableIcon';
import { Theme } from '@store/settings/types';
import { trackMatomoEvent } from '@utils/matomo';
import { REGULAR_FONT, BOLD_FONT } from '@assets/constants';

interface Props {
  theme?: string;
  updateTheme: (theme: Theme) => void;
}

const ThemeSettings: React.FC<Props> = ({ theme, updateTheme }) => {
  const { colors } = useTheme();
  const { t } = useTranslation('settings');

  const selectTheme = (selectedTheme: Theme): void => {
    if (theme !== selectedTheme) {
      trackMatomoEvent(
        'User action',
        'Settings',
        `Select theme - ${selectedTheme}`
      );
      updateTheme(selectedTheme);
    }
  };

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
            testID="settings_theme_header"
            accessibilityRole="header">
            {t('settings:appearance')}
          </Text>
        </View>
      </View>
      <View>
        <View
          style={[
            styles.rowWrapper,
            styles.withBorderBottom,
            { borderBottomColor: colors.border },
          ]}>
          <AccessibleTouchableOpacity
            onPress={() => selectTheme('light')}
            delayPressIn={100}
            testID="settings_set_theme_light"
            accessibilityState={{ selected: theme === 'light' }}
            accessibilityRole="button"
            accessibilityHint={`${t('settings:appearanceHint')} ${t(
              'settings:appearanceLight'
            )}`}>
            <View style={styles.row}>
              <Text style={[styles.text, { color: colors.text }]}>
                {t('settings:appearanceLight')}
              </Text>
              {theme === 'light' && (
                <View testID="settings_theme_light">
                  <Icon
                    name="checkmark"
                    size={22}
                    style={{ color: colors.text }}
                  />
                </View>
              )}
            </View>
          </AccessibleTouchableOpacity>
        </View>
        <View
          style={[
            styles.rowWrapper,
            styles.withBorderBottom,
            { borderBottomColor: colors.border },
          ]}>
          <AccessibleTouchableOpacity
            onPress={() => selectTheme('dark')}
            delayPressIn={100}
            testID="settings_set_theme_dark"
            accessibilityState={{ selected: theme === 'dark' }}
            accessibilityRole="button"
            accessibilityHint={`${t('settings:appearanceHint')} ${t(
              'settings:appearanceDark'
            )}`}>
            <View style={styles.row}>
              <Text style={[styles.text, { color: colors.text }]}>
                {t('settings:appearanceDark')}
              </Text>
              {theme === 'dark' && (
                <View testID="settings_theme_dark">
                  <Icon
                    name="checkmark"
                    size={22}
                    style={{ color: colors.text }}
                  />
                </View>
              )}
            </View>
          </AccessibleTouchableOpacity>
        </View>
        <View
          style={[
            styles.rowWrapper,
            styles.withBorderBottom,
            { borderBottomColor: colors.border },
          ]}>
          <AccessibleTouchableOpacity
            onPress={() => selectTheme('automatic')}
            delayPressIn={100}
            testID="settings_set_theme_automatic"
            accessibilityState={{ selected: theme === 'automatic' }}
            accessibilityRole="button"
            accessibilityHint={
              theme === 'automatic'
                ? ''
                : `${t('settings:appearanceHint')} ${t(
                    'settings:appearanceAutomatic'
                  )}`
            }>
            <View style={styles.row}>
              <Text style={[styles.text, { color: colors.text }]}>
                {t('settings:appearanceAutomatic')}
              </Text>
              {theme === 'automatic' && (
                <View testID="settings_theme_automatic">
                  <Icon
                    name="checkmark"
                    size={22}
                    style={{ color: colors.text }}
                  />
                </View>
              )}
            </View>
          </AccessibleTouchableOpacity>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    fontFamily: BOLD_FONT,
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
    fontFamily: REGULAR_FONT,
    marginLeft: 20,
  },
  withMarginTop: {
    marginTop: 16,
  },
});

export default ThemeSettings;
