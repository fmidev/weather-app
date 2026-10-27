import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import AccessibleTouchableOpacity from '@components/common/AccessibleTouchableOpacity';
import Text from '@components/common/AppText';
import Icon from '@components/common/ScalableIcon';
import { REGULAR_FONT, BOLD_FONT } from '@assets/constants';
import { trackMatomoEvent } from '@utils/matomo';

interface Props {
  forecastBackgroundImages: boolean;
  updateForecastBackgroundImages: (enabled: boolean) => void;
}

const OPTIONS = [
  { enabled: true, key: 'image', label: 'settings:forecastBackgroundImage' },
  {
    enabled: false,
    key: 'gradient',
    label: 'settings:forecastBackgroundGradient',
  },
];

const ForecastBackgroundSettings: React.FC<Props> = ({
  forecastBackgroundImages,
  updateForecastBackgroundImages,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation('settings');

  const selectBackground = (enabled: boolean) => {
    if (enabled === forecastBackgroundImages) return;

    trackMatomoEvent(
      'User action',
      'Settings',
      `Select forecast background - ${enabled ? 'image' : 'gradient'}`
    );
    updateForecastBackgroundImages(enabled);
  };

  return (
    <>
      <View
        style={[
          styles.rowWrapper,
          styles.withMarginTop,
          { borderBottomColor: colors.border },
        ]}>
        <View style={styles.row}>
          <Text
            style={[styles.title, { color: colors.text }]}
            accessibilityRole="header"
            testID="settings_forecast_background_header">
            {t('settings:forecastBackground')}
          </Text>
        </View>
      </View>
      {OPTIONS.map(({ enabled, key, label }) => (
        <View
          key={key}
          style={[styles.rowWrapper, { borderBottomColor: colors.border }]}>
          <AccessibleTouchableOpacity
            onPress={() => selectBackground(enabled)}
            delayPressIn={100}
            testID={`settings_set_forecast_background_${key}`}
            accessibilityState={{
              selected: forecastBackgroundImages === enabled,
            }}
            accessibilityRole="button"
            accessibilityHint={`${t('settings:forecastBackgroundHint')} ${t(label)}`}>
            <View style={styles.row}>
              <Text style={[styles.text, { color: colors.text }]}>
                {t(label)}
              </Text>
              {forecastBackgroundImages === enabled && (
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
    </>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    fontFamily: BOLD_FONT,
    fontWeight: 'bold',
  },
  rowWrapper: {
    marginHorizontal: 20,
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
    flexShrink: 1,
  },
  withMarginTop: {
    marginTop: 16,
  },
});

export default ForecastBackgroundSettings;
