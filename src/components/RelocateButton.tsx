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

import { SHADOW, SECONDARY_BLUE, WHITE } from '../utils/colors';

type RelocateButtonProps = {
  onPress: () => void;
  style: StyleProp<ViewStyle>;
};

const RelocateButton: React.FC<RelocateButtonProps> = ({ onPress, style }) => {
  const { t } = useTranslation();
  return (
    <View style={[style, styles.button, styles.shadow]}>
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
    backgroundColor: SECONDARY_BLUE,
    width: 158,
    height: 50,
    borderRadius: 25,
  },
  shadow: {
    shadowColor: SHADOW,
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
