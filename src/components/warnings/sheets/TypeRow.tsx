import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@react-navigation/native';

import Text from '@components/common/AppText';
import { CustomTheme } from '@assets/colors';
import type { WarningType } from '@store/warnings/types';
import WarningIcon from '../WarningIcon';

type TypeRowProps = {
  type: WarningType
};

const showPhysical = (type: WarningType): boolean => {
  return type.toLowerCase().includes('wind');
}

const TypeRow: React.FC<TypeRowProps> = ({ type }) => {
  const { t } = useTranslation('map');
  const { colors } = useTheme() as CustomTheme;
  const physical = {
    windIntensity: 21,
    windDirection: 225,
  };

  return (
    <View style={styles.row}>
      <View style={[styles.iconWrapper]}>
        <WarningIcon
          maxScaleFactor={1.5}
          type={type}
          severity={1}
          physical={ showPhysical(type) ? physical : undefined }
        />
      </View>
      <Text style={[styles.text, { color: colors.hourListText }]}>
        {t(`warnings:types:${type}`).toLocaleLowerCase()}
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
});

export default TypeRow;