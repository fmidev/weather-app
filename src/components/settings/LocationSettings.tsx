import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import AccessibleTouchableOpacity from '@components/common/AccessibleTouchableOpacity';
import Text from '@components/common/AppText';
import Icon from '@components/common/ScalableIcon';
import { trackMatomoEvent } from '@utils/matomo';

interface Props {
  locationPermission?: string;
  locationPermissionsDisplayString: { [key: string]: string };
  onOpenSettings: () => void;
}

const LocationSettings: React.FC<Props> = ({
  locationPermission,
  locationPermissionsDisplayString,
  onOpenSettings,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation('settings');

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
            {t('settings:allowLocation')}
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
            onPress={() => {
              trackMatomoEvent(
                'User action',
                'Settings',
                'Open location settings'
              );
              onOpenSettings();
            }}
            delayPressIn={100}
            accessibilityRole="link"
            accessibilityHint={t('settings:locationSettingHint')}>
            <View style={styles.row}>
              <Text
                style={[styles.text, styles.settingName, { color: colors.text }]}>
                {locationPermission
                  ? locationPermissionsDisplayString[locationPermission]
                  : '-'}
              </Text>
              <View style={styles.editRow}>
                <Text
                  accessibilityLabel=""
                  style={[styles.editText, { color: colors.text }]}>
                  {t('settings:edit')}
                </Text>
                <Icon
                  name="open-in-new"
                  width={22}
                  height={22}
                  style={{ color: colors.text }}
                />
              </View>
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
  editText: {
    fontSize: 16,
    fontFamily: 'Roboto-Medium',
    marginRight: 8,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    maxWidth: '40%',
  },
  settingName: {
    maxWidth: '60%',
  },
});

export default LocationSettings;
