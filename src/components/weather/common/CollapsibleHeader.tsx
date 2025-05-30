import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useTheme } from '@react-navigation/native';

import Icon from '@assets/Icon';
import AccessibleTouchableOpacity from '@components/common/AccessibleTouchableOpacity';

import { CustomTheme } from '@assets/colors';

type CollapsiblePanelHeaderProps = {
  open: boolean;
  title: string;
  accessibilityLabel: string;
  onPress: () => void;
  iconStart?: string;
  rounded?: boolean;
};

const CollapsibleHeader: React.FC<CollapsiblePanelHeaderProps> = ({
  accessibilityLabel,
  onPress,
  open,
  title,
  iconStart,
  rounded,
}) => {
  const { colors } = useTheme() as CustomTheme;

  return (
    <AccessibleTouchableOpacity
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
          rounded && styles.rounded,
        ]}>
        {iconStart && (
          <View style={styles.iconStartContainer}>
            <Icon
              width={12}
              height={12}
              name={iconStart}
              style={{ color: colors.primaryText }}
            />
          </View>
        )}
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
    </AccessibleTouchableOpacity>
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
  rounded: {
    borderRadius: 20,
    borderBottomWidth: 0,
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
  iconStartContainer: {
    paddingRight: 9,
  },
});

export default CollapsibleHeader;
