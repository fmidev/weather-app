import React, { useState } from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { useTheme } from '@react-navigation/native';

import AppText from './AppText';
import {
  CustomTheme,
  GRAY_2,
  SECONDARY_BLUE,
  TRANSPARENT,
  WHITE,
} from '@assets/colors';
import { REGULAR_FONT } from '@assets/constants';

type AccessibleSwitchProps = {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  accessibilityHint?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

const AccessibleSwitch: React.FC<AccessibleSwitchProps> = ({
  label,
  value,
  onValueChange,
  accessibilityHint,
  disabled = false,
  style,
  testID,
}) => {
  const { colors } = useTheme() as CustomTheme;
  const [focused, setFocused] = useState(false);

  return (
    <Pressable
      testID={testID}
      accessible
      focusable={!disabled}
      importantForAccessibility="yes"
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ checked: value, disabled }}
      disabled={disabled}
      onPress={() => onValueChange(!value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={[
        styles.control,
        { borderColor: focused ? colors.text : TRANSPARENT },
        disabled && styles.disabled,
        style,
      ]}>
      {/* The label and indicator belong to the single accessible control. */}
      <View
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={styles.content}>
        <AppText style={[styles.label, { color: colors.hourListText }]}>
          {label}
        </AppText>
        <View
          style={[
            styles.track,
            { backgroundColor: value ? SECONDARY_BLUE : GRAY_2 },
          ]}>
          <View style={[styles.thumb, value && styles.checkedThumb]} />
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  control: {
    minHeight: 44,
    minWidth: 44,
    padding: 6,
    borderWidth: 2,
    borderRadius: 6,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    flexShrink: 1,
    marginRight: 12,
    fontSize: 16,
    fontFamily: REGULAR_FONT,
  },
  track: {
    width: 48,
    height: 28,
    padding: 3,
    borderRadius: 14,
    flexShrink: 0,
  },
  thumb: {
    alignSelf: 'flex-start',
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: WHITE,
  },
  checkedThumb: {
    alignSelf: 'flex-end',
  },
});

export default AccessibleSwitch;
