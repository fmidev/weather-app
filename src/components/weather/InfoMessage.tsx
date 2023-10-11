import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { CustomTheme, GRAY_1_OPACITY_15, GRAY_4, WHITE } from '@utils/colors';

const InfoMessage: React.FC<{ translationKey: string }> = ({
  translationKey,
}) => {
  const { dark } = useTheme() as CustomTheme;
  const { t } = useTranslation('observation');

  return (
    <View style={[styles.infoView]}>
      <Text style={[styles.infoText, { color: dark ? WHITE : GRAY_4 }]}>
        {t(translationKey)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  infoText: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
  },
  infoView: {
    backgroundColor: GRAY_1_OPACITY_15,
    padding: 14,
    marginTop: 8,
    marginHorizontal: -6,
  },
});

export default InfoMessage;
