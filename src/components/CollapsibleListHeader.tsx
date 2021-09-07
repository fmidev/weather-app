import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useTheme } from '@react-navigation/native';

import Icon from './Icon';

import { CustomTheme } from '../utils/colors';

type CollapsiblePanelHeaderProps = {
  open: boolean;
  title: string;
  accessibilityLabel: string;
  onPress: () => void;
};

const CollapsibleListHeader: React.FC<CollapsiblePanelHeaderProps> = ({
  accessibilityLabel,
  onPress,
  open,
  title,
}) => {
  const { colors } = useTheme() as CustomTheme;
  return (
    <TouchableOpacity
      activeOpacity={1}
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}>
      <View
        style={[
          styles.row,
          {
            borderBottomColor: colors.border,
            backgroundColor: colors.inputBackground,
          },
        ]}>
        <Text style={[styles.title, { color: colors.primaryText }]}>
          {title}
        </Text>
        <Icon
          width={24}
          height={24}
          name={open ? 'arrow-up' : 'arrow-down'}
          style={{ color: colors.primaryText }}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
    height: 56,
    borderBottomWidth: 1,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
    textTransform: 'capitalize',
  },
});

export default CollapsibleListHeader;
