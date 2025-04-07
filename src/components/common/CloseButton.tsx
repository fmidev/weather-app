import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '@react-navigation/native';

import { CustomTheme } from '@assets/colors';
import AccessibleTouchableOpacity from './AccessibleTouchableOpacity';

import Icon from '../../assets/Icon';

type CloseButtonProps = {
  onPress: () => void;
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
  backgroundColor?: string;
  testID?: string;
};

const CloseButton: React.FC<CloseButtonProps> = ({
  onPress,
  accessibilityLabel,
  backgroundColor,
  style,
  testID,
}) => {
  const { colors } = useTheme() as CustomTheme;

  return (
    <AccessibleTouchableOpacity
      testID={testID}
      onPress={onPress}
      accessible
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}>
      <View
        style={[
          style,
          styles.button,
          { backgroundColor: backgroundColor || colors.inputBackground },
        ]}>
        <View>
          <Icon name="close-outline" style={{ color: colors.text }} size={24} />
        </View>
      </View>
    </AccessibleTouchableOpacity>
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
