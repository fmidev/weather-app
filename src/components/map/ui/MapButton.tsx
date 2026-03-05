import React from 'react';
import { StyleProp, View, ViewStyle, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';

import Text from '@components/common/AppText';
import Icon from '@assets/Icon';
import AccessibleTouchableOpacity from '@components/common/AccessibleTouchableOpacity';

import { CustomTheme } from '@assets/colors';

type MapButtonProps = {
  onPress: () => void;
  accessibilityLabel: string;
  icon: string;
  iconSize?: number;
  style: StyleProp<ViewStyle>;
  testID?: string;
  label?: string;
  labelPosition?: 'left' | 'right';
};

const MapButton: React.FC<MapButtonProps> = ({
  onPress,
  accessibilityLabel,
  icon,
  iconSize,
  style,
  testID,
  label,
  labelPosition = 'left',
}) => {
  const { colors } = useTheme() as CustomTheme;

  return (
    <View
      testID={testID}
      style={[
        styles.border,
        styles.shadow,
        styles.center,
        style,
        {
          backgroundColor: colors.mapButtonBackground,
          borderColor: colors.mapButtonBorder,
          shadowColor: colors.shadow,
        },
      ]}>
      <AccessibleTouchableOpacity
        onPress={onPress}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button">
        { label ? (
          <View style={styles.row}>
            { labelPosition === 'left' &&
              <Text style={[styles.label, { color: colors.text }]}>{label}</Text> }
            <Icon
              name={icon}
              width={iconSize}
              height={iconSize}
              style={{ color: colors.text }}
            />
            { labelPosition === 'right' &&
              <Text style={[styles.label, { color: colors.text }]}>{label}</Text> }
          </View>
        ) : (
          <View style={styles.iconWrapper}>
            <Icon
              name={icon}
              width={iconSize}
              height={iconSize}
              style={{ color: colors.text }}
            />
          </View>
        )}
      </AccessibleTouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapper: {
    padding: 12,
  },
  border: {
    borderWidth: 1,
  },
  shadow: {
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowRadius: 10,
    shadowOpacity: 1,
    elevation: 5,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    padding: 12,
  },
  label: {
    flexGrow: 1,
    textAlign: 'right',
    paddingHorizontal: 8,
    lineHeight: 20,
    fontSize: 16,
  },
});

export default MapButton;
