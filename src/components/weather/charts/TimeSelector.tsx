import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import Icon from '@components/common/Icon';

import { CustomTheme } from '@utils/colors';

type TimeSelectorProps = {
  scrollRef: React.MutableRefObject<ScrollView>;
  scrollIndex: number;
  setScrollIndex: (index: number) => void;
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
    <View
      style={[
        styles.container,
        {
          borderTopColor: colors.border,
        },
      ]}>
      <View style={styles.row}>
        <TouchableOpacity
          accessibilityLabel={t('weather:charts:previous24hAccessibilityLabel')}
          style={previousDisabled && styles.disabled}
          disabled={previousDisabled}
          onPress={() => handlePrevious()}>
          <View style={styles.button}>
            <Icon
              width={24}
              height={24}
              name="arrow-left"
              style={{ color: colors.primaryText }}
            />
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
          <View style={styles.button}>
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
    borderTopWidth: 1,
    marginTop: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    flex: 1,
    paddingTop: 8,
  },
  button: {
    minWidth: '50%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
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
