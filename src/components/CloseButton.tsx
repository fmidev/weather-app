import React from 'react';
import {
  TouchableOpacity,
  StyleProp,
  View,
  ViewStyle,
  StyleSheet,
} from 'react-native';
import Icon from './Icon';

import { VERY_LIGHT_BLUE, PRIMARY_BLUE } from '../utils/colors';

type CloseButtonProps = {
  onPress: () => void;
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
};

const CloseButton: React.FC<CloseButtonProps> = ({
  onPress,
  accessibilityLabel,
}) => (
  <View style={styles.button}>
    <TouchableOpacity onPress={onPress} accessibilityLabel={accessibilityLabel}>
      <View>
        <Icon name="close-outline" style={{ color: PRIMARY_BLUE }} size={24} />
      </View>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  button: {
    width: 28,
    height: 28,
    borderRadius: 20,
    padding: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: VERY_LIGHT_BLUE,
  },
});

export default CloseButton;
