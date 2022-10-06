import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import moment from 'moment';
import { useTheme } from '@react-navigation/native';

import { CustomTheme } from '@utils/colors';
import { ClockType } from '@store/settings/types';

type SliderStepProps = {
  clockType: ClockType;
  index: number;
  isLast: boolean;
  isObservation: boolean;
  item: number;
  sliderWidth: number;
  step: number;
  stepWidth: number;
};

const STEP_60 = 3600;

const SliderStep: React.FC<SliderStepProps> = ({
  clockType,
  index,
  isLast,
  isObservation,
  item,
  sliderWidth,
  step,
  stepWidth,
}) => {
  const { colors } = useTheme() as CustomTheme;
  const hour =
    item % STEP_60 === 0 &&
    moment.unix(item).format(clockType === 12 ? 'h a' : 'HH');
  if (isLast)
    return (
      <View
        style={[
          styles.lastQuarterContainer,
          {
            marginRight: sliderWidth / 2 - 1,
          },
        ]}>
        {hour && (
          <Text
            style={[
              styles.text,
              styles.lastBlockText,
              {
                color: colors.hourListText,
              },
            ]}>
            {hour}
          </Text>
        )}
        <View
          style={[
            hour ? styles.fullHourQuarterBottom : styles.quarterBottom,
            step < STEP_60 ? styles.withBorderLeft : undefined,
            { borderLeftColor: colors.timeSliderTick },
          ]}
        />
      </View>
    );
  return (
    <View
      key={`${item}`}
      style={[
        styles.quarterContainer,
        {
          width: stepWidth,
          marginLeft: index === 0 ? sliderWidth / 2 - 80 : undefined,
        },
      ]}>
      {hour && (
        <Text
          style={[
            styles.text,
            styles.textBlock,
            clockType === 12 && styles.twelveHourClockTextBlock,
            {
              color: colors.hourListText,
            },
          ]}>
          {hour}
        </Text>
      )}
      <View
        style={[
          hour ? styles.fullHourQuarterBottom : styles.quarterBottom,
          styles.withBorderBottom,
          step < STEP_60 ? styles.withBorderLeft : undefined,
          {
            borderLeftColor: colors.timeSliderTick,
            borderBottomColor: isObservation
              ? colors.timeSliderTick
              : colors.primary,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 14,
    fontFamily: 'Roboto-Medium',
  },
  quarterContainer: {
    height: 32,
    justifyContent: 'flex-end',
  },
  textBlock: {
    marginRight: '25%',
    marginLeft: '-75%',
    textAlign: 'center',
  },
  twelveHourClockTextBlock: {
    width: '350%', // make 12-hour clock time fully visible on the screen
  },
  lastQuarterContainer: {
    height: 32,
    justifyContent: 'flex-end',
  },
  lastBlockText: {
    marginRight: '35%',
    marginLeft: '-35%',
    textAlign: 'center',
  },
  quarterBottom: {
    minHeight: 10,
    paddingTop: 6,
  },
  withBorderLeft: {
    borderLeftWidth: 1,
  },
  fullHourQuarterBottom: {
    borderLeftWidth: 1,
    minHeight: 16,
  },
  withBorderBottom: {
    borderBottomWidth: 4,
  },
});

export default memo(SliderStep);
