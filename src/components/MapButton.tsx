import React from 'react';
import {
  TouchableOpacity,
  StyleProp,
  View,
  ViewStyle,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

type MapButtonProps = {
  onPress: () => void;
  accessibilityLabel: string;
  icon: string;
  iconSize?: number;
  iconColor?: string;
  style: StyleProp<ViewStyle>;
};

const MapButton: React.FC<MapButtonProps> = ({
  onPress,
  accessibilityLabel,
  icon,
  iconSize,
  iconColor,
  style,
}) => (
  <View style={style}>
    <TouchableOpacity
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button">
      <View style={styles.iconWrapper}>
        <Icon name={icon} size={iconSize} color={iconColor} />
      </View>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  iconWrapper: {
    padding: 12,
  },
});

export default MapButton;
