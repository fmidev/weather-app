import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import { PRIMARY_BLUE } from '../utils/colors';

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
}) => (
  <TouchableOpacity onPress={onPress} accessibilityLabel={accessibilityLabel}>
    <View style={[styles.container, right && styles.right]}>
      <Icon name={icon} color={PRIMARY_BLUE} size={22} />
      <Text style={styles.text}>{title}</Text>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  right: {
    alignItems: 'flex-end',
  },
  text: {
    color: PRIMARY_BLUE,
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default HeaderButton;
