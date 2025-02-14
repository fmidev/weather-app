import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useTheme } from '@react-navigation/native';

import { CustomTheme, WHITE } from '@assets/colors';

type PanelHeaderProps = {
  title: string;
  justifyCenter?: boolean;
  accessibilityHint?: string;
  additionalContent?: React.ReactChild;
};

const PanelHeader: React.FC<PanelHeaderProps> = ({
  title,
  justifyCenter,
  accessibilityHint,
  additionalContent,
}) => {
  const { colors } = useTheme() as CustomTheme;
  return (
    <View
      accessible
      accessibilityRole="header"
      accessibilityLabel={title}
      accessibilityHint={accessibilityHint || ''}
      style={[
        styles.cardHeader,
        justifyCenter && styles.justifyCenter,
        {
          backgroundColor: colors.cardHeader,
          borderBottomColor: colors.border,
        },
      ]}>
      <Text style={[styles.headerTitle, { color: WHITE }]}>{title}</Text>
      {additionalContent}
    </View>
  );
};

const styles = StyleSheet.create({
  cardHeader: {
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderBottomWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  justifyCenter: {
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Roboto-Bold',
  },
});

export default PanelHeader;
