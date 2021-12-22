import React from 'react';
import {
  TouchableOpacity,
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { useTheme } from '@react-navigation/native';

import { CustomTheme } from '@utils/colors';

import Icon from './Icon';

type CloseButtonProps = {
  onPress: () => void;
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
  backgroundColor?: string;
};

const CloseButton: React.FC<CloseButtonProps> = ({
  onPress,
  accessibilityLabel,
  backgroundColor,
  style,
}) => {
  const { colors } = useTheme() as CustomTheme;

  return (
    <View
      style={[
        style,
        styles.button,
        { backgroundColor: backgroundColor || colors.inputBackground },
      ]}>
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

CloseButton.defaultProps = {
  style: {},
  backgroundColor: undefined,
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
