import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useTheme } from '@react-navigation/native';

import Text from '@components/common/AppText';
import { CustomTheme, WHITE, BLACK } from '@assets/colors';
import AccessibleTouchableOpacity from './AccessibleTouchableOpacity';

function HourSelectorButton({
  accessibilityHint,
  onPress,
  active,
  disabled,
  separator,
  text,
}: {
  accessibilityHint?: string;
  onPress?: () => void;
  active?: boolean;
  disabled?: boolean;
  separator?: boolean;
  text: string;
}) {
  const { colors } = useTheme() as CustomTheme;

  return (
    <AccessibleTouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={accessibilityHint}
      accessibilityHint={accessibilityHint}
      activeOpacity={1}
      onPress={onPress}
      style={styles.smallButton}
    >
      <View
        style={[
          styles.button,
          active && styles.active,
          disabled && styles.disabled,
          separator && styles.separator,
          active && { backgroundColor: colors.selectedButton },
        ]}>
        <Text
          maxFontSizeMultiplier={1.5}
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
  button: {
    width: 70,
    height: 32,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // eslint-disable-next-line react-native/no-color-literals
  active: {
    borderRadius: 7,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.04)',
    backgroundColor: WHITE,
    ...Platform.select({
      ios: {
        shadowColor: BLACK,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  disabled: {
    opacity: 0.5,
  },
  separator : {
    borderRightWidth: 1,
    borderRightColor: BLACK,
  },
  smallButton: {
    minHeight: 32,
  },
});

export default HourSelectorButton;