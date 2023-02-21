import AccessibleTouchableOpacity from '@components/common/AccessibleTouchableOpacity';
import { useTheme } from '@react-navigation/native';
import { CapWarning } from '@store/warnings/types';
import { CustomTheme, GRAYISH_BLUE } from '@utils/colors';
import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import WarningSymbol from '../WarningsSymbol';

const WarningTypeFiltersList = ({
  warnings,
  onWarningTypePress,
}: {
  warnings?: CapWarning[];
  onWarningTypePress: (arg0: CapWarning) => void;
}) => {
  const { colors } = useTheme() as CustomTheme;
  return (
    <ScrollView
      style={styles.row}
      horizontal
      showsHorizontalScrollIndicator={false}>
      {warnings?.slice(0).map((warning) => (
        <AccessibleTouchableOpacity onPress={() => onWarningTypePress(warning)}>
          <View
            style={[
              styles.filterButton,
              { backgroundColor: colors.background },
            ]}>
            <WarningSymbol
              severity={warning.info.severity}
              type="coldWeather"
            />
          </View>
        </AccessibleTouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
  },
  filterButton: {
    padding: 8,
    borderRadius: 7,
    marginRight: 12,
    borderWidth: 1,
    borderColor: GRAYISH_BLUE,
  },
});

export default WarningTypeFiltersList;
