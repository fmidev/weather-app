import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { useTheme } from '@react-navigation/native';

import Icon from './Icon';

import { State } from '../store/types';
import { selectSliderStep, selectSliderTime } from '../store/map/selectors';
import { updateSliderTime as updateSliderTimeAction } from '../store/map/actions';

import {
  getSliderMaxUnix,
  getSliderMinUnix,
  getSliderStepSeconds,
} from '../utils/helpers';

import { WHITE, SECONDARY_BLUE, CustomTheme } from '../utils/colors';

const mapStateToProps = (state: State) => ({
  sliderStep: selectSliderStep(state),
  sliderTime: selectSliderTime(state),
});

const mapDispatchToProps = {
  updateSliderTime: updateSliderTimeAction,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

type TimeSliderProps = PropsFromRedux & {
  onTimeStepPressed: () => void;
};

const TimeSlider: React.FC<TimeSliderProps> = ({
  onTimeStepPressed,
  sliderStep,
  sliderTime,
  updateSliderTime,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme() as CustomTheme;

  const currentSliderTime = moment.unix(sliderTime).format('HH:mm');

  const min = getSliderMinUnix(sliderStep);
  const max = getSliderMaxUnix(sliderStep);
  const step = getSliderStepSeconds(sliderStep);

  const roundStep = (v: number): number => Math.round(v / step) * step;

  return (
    <View
      style={[
        styles.wrapper,
        { backgroundColor: colors.inputButtonBackground },
      ]}>
      <View style={styles.container}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={() => console.log('play button pressed')}
            accessibilityLabel={t('map:playButtonAccessibilityLabel')}>
            <Icon
              name="play"
              style={{ color: colors.text }}
              width={50}
              height={50}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.sliderWrapper}>
          <View style={styles.value}>
            <Text style={[styles.currentText, { color: colors.text }]}>
              {currentSliderTime}
            </Text>
          </View>
          <Slider
            onValueChange={(v) => updateSliderTime(roundStep(v))}
            thumbTintColor={WHITE}
            minimumTrackTintColor={SECONDARY_BLUE}
            step={step}
            minimumValue={min}
            maximumValue={max}
            value={sliderTime}
          />
        </View>
        <TouchableOpacity
          onPress={onTimeStepPressed}
          accessibilityLabel={t('map:selectionButtonAccessibilityLabel')}>
          <View
            style={[
              styles.stepSelector,
              { backgroundColor: colors.timeStepBackground },
            ]}>
            <Text
              style={[
                styles.stepText,
                { color: colors.text },
              ]}>{`${sliderStep} min`}</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 38,
    right: 12,
    left: 12,
    height: 72,
    borderRadius: 8,
  },
  container: {
    flex: 1,
    borderRadius: 8,
    flexDirection: 'row',
    paddingLeft: 12,
  },
  buttonContainer: {
    marginRight: 5,
    height: '100%',
    justifyContent: 'center',
  },
  sliderWrapper: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingTop: 2,
    paddingRight: 24,
    paddingBottom: 14,
  },
  value: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  stepSelector: {
    width: 72,
    height: '100%',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentText: {
    fontFamily: 'Roboto-Bold',
    fontSize: 14,
  },
  stepText: {
    fontSize: 14,
    fontFamily: 'Roboto-Medium',
  },
});

export default connector(TimeSlider);
