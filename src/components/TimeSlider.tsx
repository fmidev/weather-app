import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';

import { State } from '../store/types';
import { selectSliderStep } from '../store/map/selectors';

import {
  WHITE,
  VERY_LIGHT_BLUE,
  PRIMARY_BLUE,
  SECONDARY_BLUE,
} from '../utils/colors';

const mapStateToProps = (state: State) => ({
  sliderStep: selectSliderStep(state),
});

const mapDispatchToProps = {};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

type TimeSliderProps = PropsFromRedux & {
  onTimeStepPressed: () => void;
};

const TimeSlider: React.FC<TimeSliderProps> = ({
  onTimeStepPressed,
  sliderStep,
}) => {
  const { t } = useTranslation();

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={() => console.log('play button pressed')}
            accessibilityLabel={t('map:playButtonAccessibilityLabel')}>
            <Icon name="play-circle-outline" color={PRIMARY_BLUE} size={50} />
          </TouchableOpacity>
        </View>
        <View style={styles.sliderWrapper}>
          <View style={styles.value}>
            <Text style={styles.text}>9:15</Text>
          </View>
          <Slider
            onValueChange={(v) => console.log(v)}
            onSlidingComplete={(v) => console.log(v)}
            thumbTintColor={WHITE}
            minimumTrackTintColor={SECONDARY_BLUE}
          />
        </View>
        <TouchableOpacity
          onPress={onTimeStepPressed}
          accessibilityLabel={t('map:selectionButtonAccessibilityLabel')}>
          <View style={styles.stepSelector}>
            <Text style={styles.text}>{`${sliderStep} min`}</Text>
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
    backgroundColor: WHITE,
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
    backgroundColor: VERY_LIGHT_BLUE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: PRIMARY_BLUE,
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default connector(TimeSlider);
