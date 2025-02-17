import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { CustomTheme } from '@assets/colors';
import AccessibleTouchableOpacity from './AccessibleTouchableOpacity';

function SelectorButton({
  accessibilityHint,
  onPress,
  active,
  text,
}: {
  accessibilityHint?: string;
  onPress?: () => void;
  active?: boolean;
  text: string;
}) {
  const { colors } = useTheme() as CustomTheme;

  return (
    <AccessibleTouchableOpacity
      accessibilityRole="button"
      accessibilityHint={accessibilityHint}
      activeOpacity={1}
      onPress={onPress}
      style={styles.withMarginRight}>
      <View
        style={[
          styles.contentSelectionContainer,
          {
            backgroundColor: active
              ? colors.timeStepBackground
              : colors.inputButtonBackground,
            borderColor: active
              ? colors.chartSecondaryLine
              : colors.secondaryBorder,
          },
        ]}>
        <Text
          style={[
            styles.forecastText,
            active && styles.selectedText,
            {
              color: active ? colors.primaryText : colors.hourListText,
            },
          ]}>
          {text}
        </Text>
      </View>
    </AccessibleTouchableOpacity>
  );
}

const styles = StyleSheet.create({
  forecastText: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
  },
  selectedText: {
    fontFamily: 'Roboto-Bold',
  },
  withMarginRight: {
    marginRight: 16,
  },
  contentSelectionContainer: {
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
});

export default SelectorButton;
