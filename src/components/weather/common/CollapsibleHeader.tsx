import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useTheme } from '@react-navigation/native';

import Icon from '@components/common/Icon';
import { CustomTheme } from '@utils/colors';

type CollapsiblePanelHeaderProps = {
  open: boolean;
  title: string;
  accessibilityLabel: string;
  onPress: () => void;
};

const CollapsibleHeader: React.FC<CollapsiblePanelHeaderProps> = ({
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
        <View style={[styles.rowColumn, styles.alignStart]}>
          <Text
            style={[styles.title, { color: colors.primaryText }]}
            numberOfLines={1}>
            {title}
          </Text>
        </View>

        <View
          style={[styles.iconContainer, { borderLeftColor: colors.border }]}>
          <Icon
            width={24}
            height={24}
            name={open ? 'arrow-up' : 'arrow-down'}
            style={{ color: colors.primaryText }}
          />
        </View>
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
    height: 40,
    borderBottomWidth: 1,
    paddingHorizontal: 12,
    paddingTop: 2,
    borderRadius: 5,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
  },
  alignStart: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  rowColumn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    paddingLeft: 10,
    height: '100%',
    justifyContent: 'center',
  },
});

export default CollapsibleHeader;
