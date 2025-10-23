import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { CustomTheme } from '@assets/colors';
import { Warning } from '@store/warnings/types';
import { useTranslation } from 'react-i18next';

type DayDetailsDescriptionProps = {
  warnings: Warning[];
};

const DayDetailsDescription: React.FC<DayDetailsDescriptionProps> = ({ warnings }) => {
  const { t } = useTranslation('warnings');
  const { colors } = useTheme() as CustomTheme;

  const firstWarning = warnings.length > 0 && warnings[0]

  return (
    <View style={styles.container}>
      {warnings.length === 0 && (
        <View>
          <Text style={[styles.description, { color: colors.hourListText }]}>
            {t('warnings:noWarningsText')}
          </Text>
        </View>
      )}
      {firstWarning && (
        <View
          style={styles.container}
          key={`${firstWarning.type}-${firstWarning.duration.startTime}-${firstWarning.duration.endTime}-${firstWarning.severity}`}>
          <View style={styles.flex}>
            <Text numberOfLines={3} style={[styles.description, { color: colors.hourListText }]}>
              {firstWarning.description}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 18,
    maxHeight: 50,
  },
  flex: {
    flex: 1,
  },
  description: {
    fontFamily: 'Roboto',
    fontSize: 14,
  },
});
export default DayDetailsDescription;
