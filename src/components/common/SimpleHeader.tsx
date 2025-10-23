import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useTheme } from '@react-navigation/native';

import { CustomTheme } from '@assets/colors';

type SimpleHeaderProps = {
  title: string;
  justifyCenter?: boolean;
  accessibilityHint?: string;
  additionalContent?: React.ReactNode;
  thin?: boolean;
};

const SimpleHeader: React.FC<SimpleHeaderProps> = ({
  title,
  justifyCenter,
  accessibilityHint,
  additionalContent,
  thin,
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
        thin === true && styles.thin,
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  thin : {
    paddingVertical: 6,
    marginHorizontal: 16,
    marginVertical: 16,
  },
  justifyCenter: {
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Roboto-Bold',
  },
});

export default SimpleHeader;
