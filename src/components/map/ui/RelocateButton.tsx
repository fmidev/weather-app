import React from 'react';
import {
  TouchableOpacity,
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
  Text,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@react-navigation/native';

import { WHITE, CustomTheme } from '@utils/colors';

type RelocateButtonProps = {
  onPress: () => void;
  style: StyleProp<ViewStyle>;
};

const RelocateButton: React.FC<RelocateButtonProps> = ({ onPress, style }) => {
  const { t } = useTranslation();
  const { colors } = useTheme() as CustomTheme;
  return (
    <View
      style={[
        style,
        styles.button,
        styles.shadow,
        {
          shadowColor: colors.shadow,
          backgroundColor: colors.relocateButtonBackground,
        },
      ]}>
      <TouchableOpacity
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={t('map:relocateButtonAccessibilityLabel')}>
        <View style={styles.textContainer}>
          <Text style={styles.text}>{t('map:relocateButtonText')}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 132,
    height: 44,
    borderRadius: 25,
  },
  shadow: {
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowRadius: 10,
    shadowOpacity: 1,

    elevation: 5,
  },
  textContainer: {
    height: '100%',
    justifyContent: 'center',
  },
  text: {
    fontSize: 14,
    fontFamily: 'Roboto-Medium',
    color: WHITE,
    textAlign: 'center',
  },
});

export default RelocateButton;
