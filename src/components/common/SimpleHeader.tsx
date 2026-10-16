import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { useTheme } from '@react-navigation/native';

import AccessibleView from '@components/common/AccessibleView';
import { CustomTheme } from '@assets/colors';
import { BOLD_FONT } from '@assets/constants';

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
    <AccessibleView
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
    </AccessibleView>
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
    fontFamily: BOLD_FONT,
  },
});

export default SimpleHeader;
