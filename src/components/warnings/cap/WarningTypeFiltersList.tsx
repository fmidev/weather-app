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
      {warnings?.slice(0).map((warning) => {
        const info = Array.isArray(warning.info) ? warning.info[0] : warning.info;

        return (
          <AccessibleTouchableOpacity
            key={`${info.event}-${info.severity}`}
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
                    info.severity === severity &&
                    info.event === event
                ) && styles.activeFilter,
              ]}>
              <WarningSymbol
                severity={info.severity}
                type={info.event as WarningType}
              />
            </View>
          </AccessibleTouchableOpacity>
        )
      })}
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
