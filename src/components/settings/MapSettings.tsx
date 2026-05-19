import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import AccessibleTouchableOpacity from '@components/common/AccessibleTouchableOpacity';
import Text from '@components/common/AppText';
import Icon from '@components/common/ScalableIcon';
import { MapLibrary } from '@store/settings/types';
import { trackMatomoEvent } from '@utils/matomo';

interface Props {
  mapLibrary: MapLibrary;
  updateMapLibrary: (library: MapLibrary) => void;
}

const MapSettings: React.FC<Props> = ({ mapLibrary, updateMapLibrary }) => {
  const { colors } = useTheme();
  const { t } = useTranslation('settings');
  const nativeMapLabel =
    Platform.OS === 'ios' ? t('settings:appleMaps') : t('settings:googleMaps');

  const selectMapLibrary = (library: MapLibrary): void => {
    trackMatomoEvent(
      'User action',
      'Settings',
      `Select map library - ${
        library === 'react-native-maps' ? 'react-native-maps' : 'Maplibre'
      }`
    );
    updateMapLibrary(library);
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
            {t('settings:mapLibrary')}
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
          onPress={() => selectMapLibrary('react-native-maps')}
          delayPressIn={100}
          accessibilityState={{
            selected: mapLibrary === 'react-native-maps',
          }}
          accessibilityRole="button"
          accessibilityHint={`${t(
            'settings:mapLibrarySettingHint'
          )} ${nativeMapLabel}`}>
          <View style={styles.row}>
            <Text style={[styles.text, { color: colors.text }]}>
              {nativeMapLabel}
            </Text>
            {mapLibrary === 'react-native-maps' && (
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
          onPress={() => selectMapLibrary('maplibre')}
          delayPressIn={100}
          accessibilityState={{
            selected: mapLibrary === 'maplibre',
          }}
          accessibilityRole="button"
          accessibilityHint={`${t('settings:mapLibrarySettingHint')} ${t(
            'settings:maplibre'
          )}`}>
          <View style={styles.row}>
            <Text style={[styles.text, { color: colors.text }]}>
              {t('settings:maplibre')}
            </Text>
            {mapLibrary === 'maplibre' && (
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
    marginLeft: 20,
  },
  withMarginTop: {
    marginTop: 16,
  },
});

export default MapSettings;
