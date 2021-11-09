import React, { useCallback, useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import Icon from '@components/common/Icon';

import { CustomTheme } from '@utils/colors';
import { ChartDomain } from './types';

type TimeSelectorProps = {
  domain: ChartDomain;
  setDomain: any;
  tickValues: number[];
};

const TimeSelector: React.FC<TimeSelectorProps> = ({
  domain,
  setDomain,
  tickValues,
}) => {
  const { colors } = useTheme() as CustomTheme;
  const { t } = useTranslation();
  const [previousDisabled, setPreviousDisabled] = useState(false);
  const [nextDisabled, setNextDisabled] = useState(false);

  const timeView = 24 * 60 * 60 * 1000; // 86400000;

  const checkButtonStatus = useCallback(() => {
    if (!domain || !domain.x) {
      return;
    }
    if (!previousDisabled && domain.x[0] === tickValues[0]) {
      setPreviousDisabled(true);
    } else if (previousDisabled && domain.x[0] > tickValues[0]) {
      setPreviousDisabled(false);
    } else if (
      !nextDisabled &&
      domain.x[1] === tickValues[tickValues.length - 1]
    ) {
      setNextDisabled(true);
    } else if (
      nextDisabled &&
      domain.x[1] < tickValues[tickValues.length - 1]
    ) {
      setNextDisabled(false);
    }
  }, [previousDisabled, nextDisabled, domain, tickValues]);

  useEffect(() => {
    checkButtonStatus();
  }, [domain, checkButtonStatus]);

  const handlePrevious = () => {
    if (!domain || !domain.x) {
      return;
    }
    const max = domain.x[0];
    const min = max - timeView;
    const firstStep = tickValues[0];
    if (min < firstStep) {
      setDomain({ x: [firstStep, firstStep + timeView] });
    } else {
      setDomain({ x: [min, max] });
    }
  };

  const handleNext = () => {
    if (!domain || !domain.x) {
      return;
    }
    const min = domain.x[1];
    const max = min + timeView;
    const lastStep = tickValues[tickValues.length - 1];
    if (max > lastStep) {
      setDomain({ x: [lastStep - timeView, lastStep] });
    } else {
      setDomain({ x: [min, max] });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <TouchableOpacity
          accessibilityLabel={t('weather:charts:previous24hAccessibilityLabel')}
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
              {t('weather:charts:previous24h')}
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
          accessibilityLabel={t('weather:charts:next24hAccessibilityLabel')}
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
              {t('weather:charts:next24h')}
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
  container: {
    flex: 1,
    alignSelf: 'stretch',
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
  separator: {
    height: 44,
    width: 1,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default TimeSelector;
