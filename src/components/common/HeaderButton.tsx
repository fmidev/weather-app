import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';

import Icon from './Icon';

type HeaderButtonProps = {
  title: string;
  onPress: () => void;
  accessibilityLabel: string;
  icon: string;
  right?: boolean;
};

const HeaderButton: React.FC<HeaderButtonProps> = ({
  accessibilityLabel,
  icon,
  title,
  onPress,
  right,
}) => {
  const { colors } = useTheme();
  return (
    <TouchableOpacity onPress={onPress} accessibilityLabel={accessibilityLabel}>
      <View style={[styles.container, right && styles.right]}>
        <Icon
          name={icon}
          style={{ color: colors.text }}
          width={22}
          height={22}
        />
        <Text style={[styles.text, { color: colors.text }]}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};
const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  right: {
    alignItems: 'flex-end',
    paddingLeft: 60,
  },
  text: {
    fontSize: 14,
    fontFamily: 'Roboto-Medium',
  },
});

export default HeaderButton;
