import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';

import Text from '@components/common/AppText';
import { CustomTheme } from '@assets/colors';

type PanelHeaderProps = {
  title: string;
  justifyCenter?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  additionalContent?: React.ReactNode;
  thin?: boolean;
  news?: boolean;
  background?: string;
};

const PanelHeader: React.FC<PanelHeaderProps> = ({
  title,
  justifyCenter,
  accessibilityLabel,
  accessibilityHint,
  additionalContent,
  thin,
  news,
  background
}) => {
  const { colors } = useTheme() as CustomTheme;
  return (
    <View
      accessible
      accessibilityRole="header"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint || ''}
      style={[
        styles.cardHeader,
        justifyCenter && styles.justifyCenter,
        thin === true && styles.thin,
        news === true && styles.news,
        {
          backgroundColor: background ? background : colors.cardHeader,
          borderBottomColor: colors.border,
        },
      ]}>
      <Text style={[styles.headerTitle, { color: colors.primaryText }]}>{title}</Text>
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
  thin : {
    paddingVertical: 6,
    marginHorizontal: 16,
    marginVertical: 16,
    borderBottomWidth: 0,
  },
  news: {
    paddingVertical: 6,
    marginVertical: 16,
    borderBottomWidth: 0,
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
