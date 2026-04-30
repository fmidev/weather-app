import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import AccessibleTouchableOpacity from '@components/common/AccessibleTouchableOpacity';
import Text from '@components/common/AppText';
import Icon from '@components/common/ScalableIcon';
import { ClockType } from '@store/settings/types';
import { trackMatomoEvent } from '@utils/matomo';

interface Props {
  clockType?: ClockType;
  updateClockType: (clockType: ClockType) => void;
}

const TimeSettings: React.FC<Props> = ({ clockType, updateClockType }) => {
  const { colors } = useTheme();
  const { t } = useTranslation('settings');

  const selectClockType = (selectedClockType: ClockType): void => {
    trackMatomoEvent(
      'User action',
      'Settings',
      `Select clock type - ${selectedClockType}`
    );
    updateClockType(selectedClockType);
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
            accessibilityRole="header">
            {t('settings:clock')}
          </Text>
        </View>
      </View>
      <View
        style={[
          styles.rowWrapper,
          styles.withBorderBottom,
          { borderBottomColor: colors.border },
        ]}>
        <AccessibleTouchableOpacity
          onPress={() => selectClockType(12)}
          delayPressIn={100}
          accessibilityState={{
            selected: clockType === 12,
          }}
          accessibilityRole="button"
          accessibilityHint={`${t('settings:clockSettingHint')} ${t(
            '12-hour-clock'
          )}`}>
          <View style={styles.row}>
            <Text style={[styles.text, { color: colors.text }]}>
              {t('12-hour-clock')}
            </Text>
            {clockType === 12 && (
              <Icon
                name="checkmark"
                size={22}
                style={{ color: colors.text }}
              />
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
          onPress={() => selectClockType(24)}
          delayPressIn={100}
          accessibilityState={{
            selected: clockType === 24,
          }}
          accessibilityRole="button"
          accessibilityHint={`${t('settings:clockSettingHint')} ${t(
            'settings:24-hour-clock'
          )}`}>
          <View style={styles.row}>
            <Text style={[styles.text, { color: colors.text }]}>
              {t('settings:24-hour-clock')}
            </Text>
            {clockType === 24 && (
              <Icon
                name="checkmark"
                size={22}
                style={{ color: colors.text }}
              />
            )}
          </View>
        </AccessibleTouchableOpacity>
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
  },
  withMarginTop: {
    marginTop: 16,
  },
});

export default TimeSettings;
