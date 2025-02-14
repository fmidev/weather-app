import { TimeStepData } from '@store/observation/types';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { getObservationCellValue } from '@utils/helpers';
import { CustomTheme } from '@assets/colors';

type DailyObservationRowProps = {
  parameter: 'daily' | 'snowDepth06';
  epochtime: number;
  data: TimeStepData[];
};

const DailyObservationRow: React.FC<DailyObservationRowProps> = ({
  parameter,
  epochtime,
  data,
}) => {
  const { t, i18n } = useTranslation('observation');
  const locale = i18n.language;
  const decimalSeparator = locale === 'en' ? '.' : ',';

  const { colors } = useTheme() as CustomTheme;
  const currentDay = moment(epochtime * 1000).format('YYYY-MM-DD');

  const getDailyValue = (param: keyof TimeStepData) => {
    return data.find(
      (item) =>
        moment(item.epochtime * 1000).format('YYYY-MM-DD') === currentDay &&
        item[param] !== null
    )?.[param];
  };

  const timeStep = {
    epochtime: epochtime,
    rrday: getDailyValue('rrday'),
    minimumTemperature: getDailyValue('minimumTemperature'),
    maximumTemperature: getDailyValue('maximumTemperature'),
    minimumGroundTemperature06: getDailyValue('minimumGroundTemperature06'),
    snowDepth06: getDailyValue('snowDepth06'),
  } as TimeStepData;

  const formattedObservationValue = (
    param: keyof TimeStepData,
    unit: string,
    secondParam?: keyof TimeStepData,
    translationKey?: string,
    centered: boolean = true
  ) => {
    let cellValue = getObservationCellValue(
      timeStep,
      param,
      !secondParam ? unit : '',
      param.includes('snowDepth') ? 0 : 1,
      undefined,
      true,
      decimalSeparator
    );

    if (secondParam) {
      cellValue = `${cellValue} ... ${getObservationCellValue(
        timeStep,
        secondParam,
        unit,
        1,
        undefined,
        true,
        decimalSeparator
      )}`;
    }

    const accessibilityLabel = `${t(
      `measurements.${translationKey || parameter}`
    )}: ${cellValue.replace(',', '.')} ${
      cellValue === '-' ? t('paramUnits.na') : t(`paramUnits.${unit}`)
    }`;

    return (
      <Text
        style={[
          styles.listText,
          styles.rowItem,
          centered ? styles.centeredText : {},
          { color: colors.hourListText },
        ]}
        accessibilityLabel={accessibilityLabel}>
        {cellValue}
      </Text>
    );
  };

  return (
    <View style={styles.row}>
      {parameter.includes('snowDepth') &&
        formattedObservationValue(
          'snowDepth06',
          'cm',
          undefined,
          undefined,
          false
        )}

      {parameter === 'daily' && (
        <>
          {formattedObservationValue('rrday', 'mm')}
          {formattedObservationValue(
            'minimumTemperature',
            '°C',
            'maximumTemperature',
            'maxAndMinTemperatures'
          )}
          {formattedObservationValue('minimumGroundTemperature06', '°C')}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flex: 2,
    flexDirection: 'row',
  },
  listText: {
    fontSize: 16,
  },
  rowItem: {
    flex: 1,
    flexWrap: 'wrap',
  },
  centeredText: {
    textAlign: 'center',
  },
});

export default DailyObservationRow;
