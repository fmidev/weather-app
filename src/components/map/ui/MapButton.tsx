import React from 'react';
import { StyleProp, View, ViewStyle, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';

import Icon from '@components/common/Icon';
import AccessibleTouchableOpacity from '@components/common/AccessibleTouchableOpacity';

import { CustomTheme } from '@utils/colors';

type MapButtonProps = {
  onPress: () => void;
  accessibilityLabel: string;
  icon: string;
  iconSize?: number;
  style: StyleProp<ViewStyle>;
  testID?: string;
};

const MapButton: React.FC<MapButtonProps> = ({
  onPress,
  accessibilityLabel,
  icon,
  iconSize,
  style,
  testID,
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
        <View style={styles.iconWrapper}>
          <Icon
            name={icon}
            width={iconSize}
            height={iconSize}
            style={{ color: colors.text }}
          />
        </View>
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
});

export default MapButton;
