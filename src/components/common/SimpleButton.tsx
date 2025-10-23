import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { CustomTheme } from '@assets/colors';
import AccessibleTouchableOpacity from './AccessibleTouchableOpacity';

function SimpleButton({
  accessibilityHint,
  onPress,
  text,
}: Readonly<{
  accessibilityHint?: string;
  onPress?: () => void;
  text: string;
}>) {
  const { colors } = useTheme() as CustomTheme;

  return (
    <AccessibleTouchableOpacity
      accessibilityRole="button"
      accessibilityHint={accessibilityHint}
      activeOpacity={0.6}
      onPress={onPress}
      style={styles.withMarginRight}>
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.inputButtonBackground,
            borderColor: colors.text,
          },
        ]}>
        <Text style={[styles.text, { color: colors.text}]}>
          {text}
        </Text>
      </View>
    </AccessibleTouchableOpacity>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 15,
    fontFamily: 'Roboto-Bold',
  },
  withMarginRight: {
    marginRight: 16,
  },
  container: {
    borderWidth: 3,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
});

export default SimpleButton;
