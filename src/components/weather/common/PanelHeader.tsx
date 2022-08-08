import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { CustomTheme, RED, WHITE } from '@utils/colors';

type PanelHeaderProps = {
  title: string;
  lastUpdated?: { time?: string; ageCheck?: boolean };
  justifyCenter?: boolean;
};

const PanelHeader: React.FC<PanelHeaderProps> = ({
  title,
  lastUpdated,
  justifyCenter,
}) => {
  const { colors } = useTheme() as CustomTheme;
  const { t } = useTranslation('forecast');
  return (
    <View
      accessible
      accessibilityRole="header"
      accessibilityLabel={title}
      accessibilityHint={
        lastUpdated ? `${t('updated')} ${lastUpdated.time}` : undefined
      }
      style={[
        styles.cardHeader,
        justifyCenter && styles.justifyCenter,
        {
          backgroundColor: colors.cardHeader,
          borderBottomColor: colors.border,
        },
      ]}>
      <Text style={[styles.headerTitle, { color: WHITE }]}>{title}</Text>
      {lastUpdated?.time && (
        <Text
          style={[
            styles.updatedText,
            { color: lastUpdated.ageCheck ? RED : WHITE },
          ]}>
          {t('updated')} <Text style={styles.bold}>{lastUpdated.time}</Text>
        </Text>
      )}
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
  updatedText: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
  },
  bold: {
    fontFamily: 'Roboto-Bold',
  },
});

export default PanelHeader;
