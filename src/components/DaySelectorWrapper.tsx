import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import Icon from './Icon';

import { CustomTheme } from '../utils/colors';

type DaySelectorWrapperProps = {
  selectedDate: string | false | undefined;
  handlePrevious: () => void;
  previousDisabled: boolean;
  handleNext: () => void;
  nextDisabled: boolean;
  children: React.ReactNode;
};

const DaySelectorWrapper: React.FC<DaySelectorWrapperProps> = ({
  selectedDate,
  handlePrevious,
  previousDisabled,
  handleNext,
  nextDisabled,
  children,
}) => {
  const { colors } = useTheme() as CustomTheme;
  const { t } = useTranslation();

  return (
    <View style={styles.constainer}>
      <Text
        style={[
          styles.headerTitle,
          {
            color: colors.primaryText,
          },
        ]}>
        {selectedDate}
      </Text>
      {children}
      <View style={styles.row}>
        <TouchableOpacity
          accessibilityLabel={t(
            'forecast:charts:previous24hAccessibilityLabel'
          )}
          style={previousDisabled && styles.disabled}
          disabled={previousDisabled}
          onPress={() => handlePrevious()}>
          <View style={[styles.row, styles.rowColumn]}>
            <Icon
              width={24}
              height={24}
              name="arrow-left"
              style={{ color: colors.primaryText }}
            />

            <Text
              style={[
                styles.forecastText,
                styles.medium,
                { color: colors.primaryText },
              ]}>
              {t('forecast:charts:previous24h')}
            </Text>
          </View>
        </TouchableOpacity>
        <View
          style={[
            styles.separator,
            {
              backgroundColor: colors.border,
            },
          ]}
        />
        <TouchableOpacity
          accessibilityLabel={t('forecast:charts:next24hAccessibilityLabel')}
          style={nextDisabled && styles.disabled}
          disabled={nextDisabled}
          onPress={() => handleNext()}>
          <View style={[styles.row, styles.rowColumn]}>
            <Text
              style={[
                styles.forecastText,
                styles.medium,
                { color: colors.primaryText },
              ]}>
              {t('forecast:charts:next24h')}
            </Text>
            <Icon
              width={24}
              height={24}
              name="arrow-right"
              style={{ color: colors.primaryText }}
            />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  constainer: {
    paddingVertical: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  rowColumn: {
    flex: 1,
    alignItems: 'center',
    height: 45,
  },
  forecastText: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
  },
  medium: {
    fontFamily: 'Roboto-Medium',
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
    textTransform: 'capitalize',
  },
  separator: {
    height: 44,
    width: 1,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default DaySelectorWrapper;
