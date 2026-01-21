import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@react-navigation/native';

import Text from '@components/common/AppText';
import { CustomTheme } from '@assets/colors';
import SeverityBar from '../SeverityBar';

type SeverityBarRowProps = {
  severity: number;
};

const SeverityBarRow: React.FC<SeverityBarRowProps> = ({ severity }) => {
  const { t } = useTranslation('map');
  const { colors } = useTheme() as CustomTheme;

  return (
    <View style={styles.row}>
      <View style={[styles.iconWrapper, styles.severity]}>
        <SeverityBar severity={severity} />
      </View>
      <Text style={[styles.text, { color: colors.hourListText }]}>
        {t(`warnings:severities:${severity}`).toLocaleLowerCase()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
    flex: 2,
    flexWrap: 'wrap',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  iconWrapper: {
    minWidth: 40,
    marginRight: 8,
  },
  severity: {
    paddingRight: 16,
  },
});

export default SeverityBarRow;