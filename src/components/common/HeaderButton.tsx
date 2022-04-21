import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';

import { useOrientation } from '@utils/hooks';
import Icon from './Icon';
import AccessibleTouchableOpacity from './AccessibleTouchableOpacity';

type HeaderButtonProps = {
  title?: string;
  onPress: () => void;
  accessibilityLabel: string;
  accessibilityHint: string;
  icon: string;
  right?: boolean;
};

const HeaderButton: React.FC<HeaderButtonProps> = ({
  accessibilityLabel,
  accessibilityHint,
  icon,
  title,
  onPress,
  right,
}) => {
  const isLandscape = useOrientation();
  const { colors } = useTheme();
  return (
    <AccessibleTouchableOpacity
      onPress={onPress}
      accessible
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}>
      <View
        style={[
          styles.container,
          right && styles.right,
          !title && styles.right,
          !isLandscape && styles.marginBottom,
          isLandscape ? styles.row : undefined,
          isLandscape && right ? styles.rowReverse : undefined,
        ]}>
        <Icon
          name={icon}
          style={{ color: colors.text }}
          width={24}
          height={24}
        />
        {!!title && (
          <Text
            style={[
              styles.text,
              isLandscape && right ? styles.marginRight : undefined,
              isLandscape && !right ? styles.marginLeft : undefined,
              { color: colors.text },
            ]}>
            {title}
          </Text>
        )}
      </View>
    </AccessibleTouchableOpacity>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    minWidth: 100,
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowReverse: {
    flexDirection: 'row-reverse',
  },
  right: {
    alignItems: 'flex-end',
  },
  text: {
    fontSize: 14,
    fontFamily: 'Roboto-Medium',
  },
  marginBottom: {
    marginBottom: 10,
  },
  marginRight: {
    marginRight: 6,
  },
  marginLeft: {
    marginLeft: 6,
  },
});

export default HeaderButton;
