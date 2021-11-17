import React from 'react';
import {
  TouchableOpacity,
  StyleProp,
  View,
  ViewStyle,
  StyleSheet,
} from 'react-native';
import { useTheme } from '@react-navigation/native';

import Icon from '@components/common/Icon';

import { CustomTheme } from '@utils/colors';

type MapButtonProps = {
  onPress: () => void;
  accessibilityLabel: string;
  icon: string;
  iconSize?: number;
  style: StyleProp<ViewStyle>;
};

const MapButton: React.FC<MapButtonProps> = ({
  onPress,
  accessibilityLabel,
  icon,
  iconSize,
  style,
}) => {
  const { colors } = useTheme() as CustomTheme;
  return (
    <View
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
      <TouchableOpacity
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
      </TouchableOpacity>
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
