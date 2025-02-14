import AccessibleTouchableOpacity from '@components/common/AccessibleTouchableOpacity';
import { useTheme } from '@react-navigation/native';
import { CapWarning, Severity, WarningType } from '@store/warnings/types';
import { CustomTheme, SECONDARY_BLUE } from '@assets/colors';
import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import WarningSymbol from '../WarningsSymbol';

const WarningTypeFiltersList = ({
  warnings,
  onWarningTypePress,
  activeWarnings,
}: {
  warnings?: CapWarning[];
  onWarningTypePress: (arg0: CapWarning) => void;
  activeWarnings: { severity: Severity; event: string }[];
}) => {
  const { colors } = useTheme() as CustomTheme;
  return (
    <ScrollView
      style={styles.row}
      horizontal
      showsHorizontalScrollIndicator={false}>
      {warnings?.slice(0).map((warning) => (
        <AccessibleTouchableOpacity
          key={`${warning.info.event}-${warning.info.severity}`}
          onPress={() => onWarningTypePress(warning)}>
          <View
            style={[
              styles.filterButton,

              {
                backgroundColor: colors.background,
                borderColor: colors.background,
              },
              !activeWarnings.find(
                ({ severity, event }) =>
                  warning.info.severity === severity &&
                  warning.info.event === event
              ) && styles.activeFilter,
            ]}>
            <WarningSymbol
              severity={warning.info.severity}
              type={warning.info.event as WarningType}
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
    borderWidth: 2,
  },
  activeFilter: {
    borderColor: SECONDARY_BLUE,
  },
});

export default WarningTypeFiltersList;
