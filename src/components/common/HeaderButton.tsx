import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';

import { useOrientation } from '@utils/hooks';
import Text from '@components/common/AppText';
import Icon from '@components/common/ScalableIcon';
import AccessibleTouchableOpacity from './AccessibleTouchableOpacity';

type HeaderButtonProps = {
  title?: string;
  onPress: () => void;
  accessibilityLabel: string;
  accessibilityHint: string;
  icon: string;
  right?: boolean;
  testID?: string;
};

const HeaderButton: React.FC<HeaderButtonProps> = ({
  accessibilityLabel,
  accessibilityHint,
  icon,
  title,
  onPress,
  right,
  testID,
}) => {
  const isLandscape = useOrientation();
  const { colors } = useTheme();
  return (
    <AccessibleTouchableOpacity
      testID={testID || undefined}
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
          maxScaleFactor={1}
          style={{ color: colors.text }}
          width={24}
          height={24}
        />
        {!!title && (
          <Text
            maxFontSizeMultiplier={1.2}
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
    minWidth: 105,
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
