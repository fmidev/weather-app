import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { useTheme } from '@react-navigation/native';

import Icon from './Icon';

type HeaderButtonProps = {
  title?: string;
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
}) => {
  const { width, height } = useWindowDimensions();
  const { colors } = useTheme();
  return (
    <TouchableOpacity onPress={onPress} accessibilityLabel={accessibilityLabel}>
      <View
        style={[
          styles.container,
          right && styles.right,
          !title && styles.right,
          width > height ? styles.row : undefined,
          width > height && right ? styles.rowReverse : undefined,
        ]}>
        <Icon
          name={icon}
          style={{ color: colors.text }}
          width={24}
          height={24}
        />
        {!!title && (
          <Text style={[styles.text, { color: colors.text }]}>{title}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

HeaderButton.defaultProps = {
  title: undefined,
  right: false,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    minWidth: 100,
    justifyContent: 'center',
    paddingVertical: 10,
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
});

export default HeaderButton;
