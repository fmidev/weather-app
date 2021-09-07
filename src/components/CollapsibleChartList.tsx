import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import Icon from './Icon';
import DaySelectorWrapper from './DaySelectorWrapper';
import TemperatureLineChart from './TemperatureLineChart';
import PrecipitationBarChart from './PrecipitationBarChart';
import WindLineChart from './WindLineChart';

import { TimestepData } from '../store/forecast/types';

import { CustomTheme } from '../utils/colors';

type CollapsibleChartListProps = {
  data: TimestepData[] | false;
  selectedDate: string | undefined | false;
  showPreviousDay: () => void;
  showPreviousDisabled: boolean;
  showNextDay: () => void;
  showNextDisabled: boolean;
};

const CollapsibleChartList: React.FC<CollapsibleChartListProps> = ({
  data,
  selectedDate,
  showPreviousDay,
  showPreviousDisabled,
  showNextDay,
  showNextDisabled,
}) => {
  const { colors } = useTheme() as CustomTheme;
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | undefined>(undefined);

  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity
        accessibilityLabel={t('forecast:charts:temperatureAccessibilityLabel')}
        onPress={() =>
          openIndex === 0 ? setOpenIndex(undefined) : setOpenIndex(0)
        }>
        <View
          style={[
            styles.row,
            styles.forecastHeader,
            {
              borderBottomColor: colors.border,
              backgroundColor: colors.inputBackground,
            },
          ]}>
          <Text
            style={[
              styles.headerTitle,
              {
                color: colors.primaryText,
              },
            ]}>
            {t('forecast:charts:temperature')}
          </Text>
          <Icon
            width={24}
            height={24}
            name={openIndex === 0 ? 'arrow-up' : 'arrow-down'}
            style={{ color: colors.primaryText }}
          />
        </View>
      </TouchableOpacity>
      {data && openIndex === 0 && (
        <DaySelectorWrapper
          selectedDate={selectedDate}
          handlePrevious={showPreviousDay}
          previousDisabled={showPreviousDisabled}
          handleNext={showNextDay}
          nextDisabled={showNextDisabled}>
          <TemperatureLineChart data={data} />
        </DaySelectorWrapper>
      )}
      <TouchableOpacity
        accessibilityLabel={t(
          'forecast:charts:precipitationAccessibilityLabel'
        )}
        onPress={() =>
          openIndex === 1 ? setOpenIndex(undefined) : setOpenIndex(1)
        }>
        <View
          style={[
            styles.row,
            styles.forecastHeader,
            {
              borderBottomColor: colors.border,
              backgroundColor: colors.inputBackground,
            },
          ]}>
          <Text
            style={[
              styles.headerTitle,
              {
                color: colors.primaryText,
              },
            ]}>
            {t('forecast:charts:precipitation')}
          </Text>
          <Icon
            width={24}
            height={24}
            name={openIndex === 1 ? 'arrow-up' : 'arrow-down'}
            style={{ color: colors.primaryText }}
          />
        </View>
      </TouchableOpacity>
      {data && openIndex === 1 && (
        <DaySelectorWrapper
          selectedDate={selectedDate}
          handlePrevious={showPreviousDay}
          previousDisabled={showPreviousDisabled}
          handleNext={showNextDay}
          nextDisabled={showNextDisabled}>
          <PrecipitationBarChart data={data} />
        </DaySelectorWrapper>
      )}
      <TouchableOpacity
        accessibilityLabel={t('forecast:charts:windAccessibilityLabel')}
        onPress={() =>
          openIndex === 2 ? setOpenIndex(undefined) : setOpenIndex(2)
        }>
        <View
          style={[
            styles.row,
            styles.forecastHeader,
            {
              borderBottomColor: colors.border,
              backgroundColor: colors.inputBackground,
            },
          ]}>
          <Text
            style={[
              styles.headerTitle,
              {
                color: colors.primaryText,
              },
            ]}>
            {t('forecast:charts:wind')}
          </Text>
          <Icon
            width={24}
            height={24}
            name={openIndex === 2 ? 'arrow-up' : 'arrow-down'}
            style={{ color: colors.primaryText }}
          />
        </View>
      </TouchableOpacity>
      {data && openIndex === 2 && (
        <DaySelectorWrapper
          selectedDate={selectedDate}
          handlePrevious={showPreviousDay}
          previousDisabled={showPreviousDisabled}
          handleNext={showNextDay}
          nextDisabled={showNextDisabled}>
          <WindLineChart data={data} />
        </DaySelectorWrapper>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    marginHorizontal: 8,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  forecastHeader: {
    height: 56,
    borderBottomWidth: 1,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
    textTransform: 'capitalize',
  },
});

export default CollapsibleChartList;
