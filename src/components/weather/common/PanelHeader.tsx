import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useTheme } from '@react-navigation/native';

import { WHITE, CustomTheme } from '@utils/colors';

type PanelHeaderProps = {
  title: string;
};

const PanelHeader: React.FC<PanelHeaderProps> = ({ title }) => {
  const { colors } = useTheme() as CustomTheme;
  return (
    <View style={[styles.cardHeader, { backgroundColor: colors.cardHeader }]}>
      <Text style={[styles.headerTitle, { color: WHITE }]}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  cardHeader: {
    height: 44,
    borderTopRightRadius: 8,
    borderTopLeftRadius: 8,
    paddingVertical: 12,
    paddingLeft: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
    textTransform: 'capitalize',
  },
});

export default PanelHeader;
