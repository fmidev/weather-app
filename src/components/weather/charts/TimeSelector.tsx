import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import Icon from '@components/common/Icon';

import { CustomTheme } from '@utils/colors';

type TimeSelectorProps = {
  scrollRef: any;
  scrollIndex: number;
  setScrollIndex: any;
  stepLength: number;
  buttonStatus: [boolean, boolean];
};

const TimeSelector: React.FC<TimeSelectorProps> = ({
  scrollRef,
  setScrollIndex,
  scrollIndex,
  stepLength,
  buttonStatus,
}) => {
  const { colors } = useTheme() as CustomTheme;
  const { t } = useTranslation();
  const [previousDisabled, nextDisabled] = buttonStatus;

  const step = 24 * stepLength;

  const handlePrevious = () => {
    const x = scrollIndex - step > 0 ? scrollIndex - step : 0;
    setScrollIndex(x);
    scrollRef.current.scrollTo({ x, animated: true });
  };

  const handleNext = () => {
    const x = scrollIndex + step;
    setScrollIndex(x);
    scrollRef.current.scrollTo({ x, animated: true });
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
                styles.buttonText,
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
                styles.buttonText,
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
  buttonText: {
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
