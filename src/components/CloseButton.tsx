import React from 'react';
import {
  TouchableOpacity,
  StyleProp,
  View,
  ViewStyle,
  StyleSheet,
} from 'react-native';
import { useTheme } from '@react-navigation/native';

import Icon from './Icon';

import { CustomTheme } from '../utils/colors';

type CloseButtonProps = {
  onPress: () => void;
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
};

const CloseButton: React.FC<CloseButtonProps> = ({
  onPress,
  accessibilityLabel,
}) => {
  const { colors } = useTheme() as CustomTheme;
  return (
    <View style={[styles.button, { backgroundColor: colors.inputBackground }]}>
      <TouchableOpacity
        onPress={onPress}
        accessibilityLabel={accessibilityLabel}>
        <View>
          <Icon name="close-outline" style={{ color: colors.text }} size={24} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 28,
    height: 28,
    borderRadius: 20,
    padding: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CloseButton;
