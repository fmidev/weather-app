import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from 'react';
import { connect, ConnectedProps } from 'react-redux';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import moment from 'moment';
import { useTheme, useIsFocused } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import Icon from '@components/common/Icon';

import { State } from '@store/types';
import {
  selectSliderStep,
  selectSliderTime,
  selectActiveOverlay,
  selectOverlay,
} from '@store/map/selectors';
import { updateSliderTime as updateSliderTimeAction } from '@store/map/actions';

import {
  getSliderMaxUnix,
  getSliderMinUnix,
  getSliderStepSeconds,
} from '@utils/map';

import {
  CustomTheme,
  WHITE,
  WHITE_TRANSPARENT,
  GRAY_6,
  GRAY_6_TRANSPARENT,
  TRANSPARENT,
} from '@utils/colors';
import SliderStep from './SliderStep';

const QUARTER_WIDTH = 12;

const STEP_60 = 3600;
let interval: NodeJS.Timeout;

const mapStateToProps = (state: State) => ({
  activeOverlayId: selectActiveOverlay(state),
  sliderStep: selectSliderStep(state),
  sliderTime: selectSliderTime(state),
  overlay: selectOverlay(state),
});

const mapDispatchToProps = {
  updateSliderTime: updateSliderTimeAction,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

type TimeSliderProps = PropsFromRedux & {};

const TimeSlider: React.FC<TimeSliderProps> = ({
  activeOverlayId,
  sliderStep,
  sliderTime,
  updateSliderTime,
  overlay,
}) => {
  const { t, i18n } = useTranslation();
  const { colors, dark } = useTheme() as CustomTheme;
  const locale = i18n.language;
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [scrollIndex, setScrollIndex] = useState<number>(0);
  const [times, setTimes] = useState<number[]>([]);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const { width } = useWindowDimensions();
  const [sliderWidth, setSliderWidth] = useState<number>(width - 24);

  const multiplier = Math.round(width / 400);

  const sliderRef = useRef() as React.MutableRefObject<ScrollView>;

  const observationEndUnix =
    (overlay?.observation &&
      overlay.observation.end &&
      Number(moment(overlay.observation.end).format('X'))) ||
    0;

  const currentSliderTime = moment
    .unix(sliderTime)
    .locale(locale)
    .format('ddd HH:mm');

  const sliderMinUnix = useMemo(
    () => getSliderMinUnix(activeOverlayId, overlay),
    [activeOverlayId, overlay]
  );
  const sliderMaxUnix = useMemo(
    () => getSliderMaxUnix(activeOverlayId, overlay),
    [activeOverlayId, overlay]
  );

  const step = getSliderStepSeconds(sliderStep);

  const stepWidth = (step >= STEP_60 ? 4 : 1) * multiplier * QUARTER_WIDTH;

  const isFocused = useIsFocused();

  // clear animation if user navigates off screen while animating
  useEffect(() => {
    if (!isFocused && isAnimating) {
      clear();
    }
  }, [isFocused, isAnimating]);

  useEffect(() => {
    if (sliderMaxUnix && sliderMinUnix) {
      let newTimes: number[] = [];
      let curr = Math.floor(sliderMinUnix / step) * step;
      while (curr <= sliderMaxUnix) {
        newTimes = newTimes.concat(curr);
        curr += step;
      }
      setTimes(newTimes);
    }
  }, [sliderMinUnix, sliderMaxUnix, step]);

  useEffect(() => {
    updateSliderTime(times[currentIndex] || 0);
  }, [currentIndex, times, updateSliderTime]);

  const onLayout = () => {
    const now = moment().format('X');
    const roundedNow = Math.floor(Number(now) / step) * step;
    const i = times.indexOf(roundedNow);

    if (i > 0) {
      sliderRef.current.scrollTo({
        x: Math.floor(i * stepWidth),
        animated: false,
      });
    } else {
      setCurrentIndex(0);
    }
  };

  const handleMomentumScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const {
      contentOffset: { x },
    } = e.nativeEvent;
    setScrollIndex(x);
  };

  const handleMomentumStart = () => {
    if (isAnimating) {
      setIsAnimating(false);
      clear();
    }
  };

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isAnimating) {
      return;
    }

    const {
      contentOffset: { x },
    } = e.nativeEvent;
    setScrollIndex(x);
    resolveAndSetCurrentIndex(x);
  };

  const resolveAndSetCurrentIndex = useCallback(
    (x: number) => {
      const index = Math.floor(x / stepWidth);
      if (index >= 0 && index <= times.length) {
        if (index === times.length) {
          setCurrentIndex(index - 1);
          if (isAnimating) {
            setScrollIndex(0);
          }
        } else {
          setCurrentIndex(index);
        }
      }
    },
    [times, isAnimating, stepWidth]
  );

  useEffect(() => {
    if (isAnimating) {
      sliderRef.current.scrollTo({
        x: scrollIndex,
        animated: false,
      });
      resolveAndSetCurrentIndex(scrollIndex);
    }
  }, [scrollIndex, isAnimating, resolveAndSetCurrentIndex]);

  const handleSetScrollIndex = () =>
    setScrollIndex((prev) => prev + stepWidth / 12.5);

  const animate = () => {
    setIsAnimating(true);
    interval = setInterval(() => {
      handleSetScrollIndex();
    }, 80);
  };

  const clear = () => {
    setIsAnimating(false);
    clearInterval(interval);
  };

  return (
    <View
      style={[
        styles.wrapper,
        styles.shadow,
        {
          backgroundColor: colors.mapButtonBackground,
          borderColor: colors.mapButtonBorder,
          shadowColor: colors.shadow,
        },
      ]}
      onLayout={({ nativeEvent }) => {
        const {
          layout: { width: layoutWidth },
        } = nativeEvent;
        if (layoutWidth !== sliderWidth) setSliderWidth(layoutWidth);
      }}>
      <View style={styles.container}>
        <View
          style={[styles.buttonContainer, { borderRightColor: colors.border }]}>
          <TouchableOpacity
            onPress={() => (isAnimating ? clear() : animate())}
            accessibilityLabel={t('map:playButtonAccessibilityLabel')}>
            <Icon
              name={isAnimating ? 'pause' : 'play'}
              style={{ color: colors.text }}
              width={50}
              height={50}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.sliderWrapper}>
          {times.length > 0 && (
            <ScrollView
              key={activeOverlayId}
              ref={sliderRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              decelerationRate="fast"
              style={styles.sliderContainer}
              onLayout={onLayout}
              onScroll={handleScroll}
              onMomentumScrollEnd={handleMomentumScroll}
              onScrollBeginDrag={handleMomentumStart}
              scrollEventThrottle={20}>
              {times.map((item, index) => (
                <SliderStep
                  key={item}
                  item={item}
                  index={index}
                  sliderWidth={sliderWidth}
                  step={step}
                  stepWidth={stepWidth}
                  isLast={index === times.length - 1}
                  isObservation={item <= observationEndUnix}
                />
              ))}
            </ScrollView>
          )}
          {sliderTime === 0 && (
            <ActivityIndicator size="small" style={styles.sliderWrapper} />
          )}
          {sliderTime > 0 && (
            <>
              <Text
                style={[
                  styles.currentTimeText,
                  styles.textCapitalize,
                  {
                    color: colors.hourListText,
                  },
                ]}>
                {currentSliderTime}
              </Text>
              <Text
                style={[
                  styles.currentTimeText,
                  styles.textRight,
                  {
                    color:
                      sliderTime > observationEndUnix
                        ? colors.primary
                        : colors.timeSliderObservationText,
                  },
                ]}>
                {sliderTime > observationEndUnix
                  ? t('map:timeSlider:forecast')
                  : t('map:timeSlider:observation')}
              </Text>
              <LinearGradient
                style={[styles.gradient, styles.gradientLeft]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                colors={
                  dark
                    ? [GRAY_6, GRAY_6_TRANSPARENT]
                    : [WHITE, WHITE_TRANSPARENT]
                }
              />
              <LinearGradient
                style={[styles.gradient, styles.gradientRight]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                colors={
                  dark
                    ? [GRAY_6_TRANSPARENT, GRAY_6]
                    : [WHITE_TRANSPARENT, WHITE]
                }
              />
              <View
                style={[
                  styles.tick,
                  {
                    left: sliderWidth / 2 - 86,
                    borderBottomColor:
                      sliderTime > observationEndUnix
                        ? colors.primary
                        : colors.timeSliderTick,
                  },
                ]}
              />
            </>
          )}
        </View>
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
    height: 75,
    borderRadius: 8,
    borderWidth: 1,
  },
  shadow: {
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
  },
  currentTimeText: {
    fontSize: 14,
    fontFamily: 'Roboto-Bold',
    position: 'absolute',
    bottom: 0,
    zIndex: 5,
    padding: 8,
  },
  textCapitalize: {
    textTransform: 'capitalize',
  },
  container: {
    flex: 1,
    borderRadius: 8,
    flexDirection: 'row',
    paddingLeft: 12,
  },
  buttonContainer: {
    width: 65,
    marginRight: 2,
    height: '100%',
    justifyContent: 'center',
    borderRightWidth: 1,
  },
  sliderWrapper: {
    flex: 1,
  },
  sliderContainer: {
    paddingVertical: 8,
    minHeight: 75,
    zIndex: 2,
  },
  tick: {
    position: 'absolute',
    bottom: 22,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderLeftColor: TRANSPARENT,
    borderRightWidth: 6,
    borderRightColor: TRANSPARENT,
    borderBottomWidth: 10,
  },
  gradient: {
    position: 'absolute',
    width: 20,
    height: '100%',
    zIndex: 3,
  },
  gradientLeft: {
    left: 0,
  },
  gradientRight: {
    right: 0,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  textRight: {
    right: 0,
  },
});

export default connector(TimeSlider);
