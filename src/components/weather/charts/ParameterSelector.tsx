import React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { CustomTheme } from '@utils/colors';
import { ChartType } from './types';

type ParameterSelectorProps = {
  chartTypes: ChartType[];
  parameter: ChartType;
  setParameter: (chartType: ChartType) => void;
};

const ParameterSelector: React.FC<ParameterSelectorProps> = ({
  chartTypes,
  parameter,
  setParameter,
}) => {
  const { colors } = useTheme() as CustomTheme;
  const { t } = useTranslation();

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {chartTypes.map((chartType) => (
        <TouchableOpacity
          key={`chart-${chartType}`}
          activeOpacity={1}
          onPress={() => {
            setParameter(chartType);
          }}
          style={[
            styles.contentSelectionContainer,
            {
              backgroundColor:
                parameter === chartType
                  ? colors.timeStepBackground
                  : colors.inputButtonBackground,
              borderColor:
                parameter === chartType
                  ? colors.chartSecondaryLine
                  : colors.secondaryBorder,
            },
          ]}>
          <Text>{t(`weather:charts:${chartType}`)}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  contentSelectionContainer: {
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
});

export default ParameterSelector;
