import { useTheme } from '@react-navigation/native';
import { CustomTheme } from '@utils/colors';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View, StyleSheet } from 'react-native';

const TypeColorRow = ({
  severity,
  severityColors,
}: {
  severity: number;
  severityColors: string[];
}) => {
  const { t } = useTranslation('map');
  const { colors } = useTheme() as CustomTheme;
  return (
    <View style={styles.row}>
      <View style={styles.iconWrapper}>
        <View
          accessibilityElementsHidden
          style={[
            styles.ball,
            {
              borderColor: severityColors[severity],
              backgroundColor: severityColors[severity],
            },
          ]}
        />
      </View>
      <Text style={[styles.text, { color: colors.hourListText }]}>
        {t(`warnings:severities:${severity}`).toLocaleLowerCase()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  ball: {
    position: 'absolute',
    elevation: 5,
    zIndex: 5,
    flex: 1,
    right: 16,
    top: -14,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    justifyContent: 'center',
  },
  iconWrapper: {
    minWidth: 40,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  text: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
    flex: 2,
    flexWrap: 'wrap',
  },
});

export default TypeColorRow;
