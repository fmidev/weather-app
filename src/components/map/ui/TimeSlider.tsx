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
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import moment from 'moment';
import { useTheme, useIsFocused } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

import Icon from '@assets/Icon';
import AccessibleTouchableOpacity from '@components/common/AccessibleTouchableOpacity';

import { State } from '@store/types';
import {
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
} from '@assets/colors';
import { selectClockType } from '@store/settings/selectors';
import SliderStep from './SliderStep';
import { trackMatomoEvent } from '@utils/matomo';
import { Config } from '@config';

const QUARTER_WIDTH = 15;

const STEP_60 = 3600;
let interval: NodeJS.Timeout;

const mapStateToProps = (state: State) => ({
  activeOverlayId: selectActiveOverlay(state),
  sliderTime: selectSliderTime(state),
  overlay: selectOverlay(state),
  clockType: selectClockType(state),
});

const mapDispatchToProps = {
  updateSliderTime: updateSliderTimeAction,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

type TimeSliderProps = PropsFromRedux & {};

const TimeSlider: React.FC<TimeSliderProps> = ({
  activeOverlayId,
  sliderTime,
  updateSliderTime,
  overlay,
  clockType,
}) => {
  const { t, i18n } = useTranslation();
  const { colors, dark } = useTheme() as CustomTheme;
  const locale = i18n.language;
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [scrollIndex, setScrollIndex] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const { width } = useWindowDimensions();
  const [sliderWidth, setSliderWidth] = useState<number>(width - 24);
  const { layers } = Config.get('map');

  const multiplier = Math.round(width / 400);

  const sliderRef = useRef<ScrollView>(null);

  const observationEndUnix =
    (overlay?.observation &&
      overlay.observation.end &&
      Number(moment(overlay.observation.end).format('X'))) ||
    0;

  const weekdayAbbreviationFormat = locale === 'en' ? 'ddd' : 'dd';

  const currentSliderTime = moment
    .unix(sliderTime)
    .locale(locale)
    .format(
      `${weekdayAbbreviationFormat} ${clockType === 12 ? 'h.mm a' : 'HH.mm'}`
    );

  const currentSliderTimeCapitalized =
    currentSliderTime.charAt(0).toUpperCase() + currentSliderTime.slice(1);

  const { sliderStep, sliderTimes } = useMemo(() => {
    const minUnix = getSliderMinUnix(activeOverlayId, overlay);
    const maxUnix = getSliderMaxUnix(activeOverlayId, overlay);
    const step = getSliderStepSeconds(overlay?.step || 60);

    let times: number[] = [];
    if (maxUnix && minUnix) {
      let curr = Math.floor(minUnix / step) * step;
      while (curr <= maxUnix) {
        times = times.concat(curr);
        curr += step;
      }
    }

    return { sliderStep: step, sliderTimes: times.length > 1 ? times : [] };
  }, [activeOverlayId, overlay]);

  const stepWidth =
    (sliderStep >= STEP_60 ? 4 : 1) * multiplier * QUARTER_WIDTH +
    (clockType === 12 ? 20 : 0);

  const isFocused = useIsFocused();

  /**
   * clear animation if:
   *  user navigates off screen
   *  user changes map layer
   */
  useEffect(() => {
    if ((!isFocused || sliderTime === 0) && isAnimating) {
      clear();
    }
  }, [isFocused, isAnimating, sliderTime]);

  useEffect(() => {
    if (currentIndex >= 0) {
      if (!isAnimating) {
        ReactNativeHapticFeedback.trigger(
          Platform.OS === 'ios' ? 'selection' : 'impactMedium'
        );
      }
      updateSliderTime(sliderTimes[currentIndex] || 0);
    }
  }, [currentIndex, sliderTimes, updateSliderTime, isAnimating]);

  const onLayout = () => {
    const now = moment().format('X');
    const roundedNow = Math.floor(Number(now) / sliderStep) * sliderStep;
    const i = sliderTimes.indexOf(roundedNow);
    if (i > 0 && sliderRef.current) {
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
      if (index >= 0 && index <= sliderTimes.length) {
        if (index === sliderTimes.length) {
          setCurrentIndex(index - 1);
          if (isAnimating) {
            setScrollIndex(0);
          }
        } else {
          setCurrentIndex(index);
        }
      }
    },
    [sliderTimes, isAnimating, stepWidth]
  );

  useEffect(() => {
    if (isAnimating && sliderRef.current) {
      sliderRef.current.scrollTo({
        x: scrollIndex,
        animated: false,
      });
      resolveAndSetCurrentIndex(scrollIndex);
    }
  }, [scrollIndex, isAnimating, resolveAndSetCurrentIndex]);

  const handleSetScrollIndex = () =>
    setScrollIndex((prev) => prev + stepWidth / 12.5);

const getLayerAnimationSpeed = () => {
    if(layers) {
      const layer = layers.find((l) => l.id === activeOverlayId);
      if(layer?.times?.animationSpeed) {
        // return custom value
        return layer.times.animationSpeed;
      }
    }
    // return default value
    return 80;
  }

  const animate = () => {
    setIsAnimating(true);
    interval = setInterval(() => {
      handleSetScrollIndex();
    }, getLayerAnimationSpeed());
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
        <AccessibleTouchableOpacity
          accessibilityRole="button"
          onPress={() => {
            const action = isAnimating ? 'STOP' : 'START';
            trackMatomoEvent('User action', 'Map', `Animation - ${action}`);

            if (isAnimating) {
              clear();
            } else {
              animate();
            }
          }}
          accessibilityLabel={
            !isAnimating ? t('map:playButton') : t('map:pauseButton')
          }
          accessibilityHint={
            !isAnimating
              ? t('map:playButtonAccessibilityHint')
              : t('map:pauseButtonAccessibilityHint')
          }>
          <View
            style={[
              styles.buttonContainer,
              { borderRightColor: colors.border },
            ]}>
            <Icon
              name={isAnimating ? 'pause' : 'play'}
              style={{ color: colors.text }}
              width={50}
              height={50}
            />
          </View>
        </AccessibleTouchableOpacity>

        <View style={styles.sliderWrapper} accessibilityElementsHidden>
          {sliderTimes.length > 0 && (
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
              {sliderTimes.map((item, index) => (
                <SliderStep
                  key={item}
                  item={item}
                  index={index}
                  sliderWidth={sliderWidth}
                  step={sliderStep}
                  stepWidth={stepWidth}
                  isLast={index === sliderTimes.length - 1}
                  isObservation={item <= observationEndUnix}
                  clockType={clockType}
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
                  {
                    color: colors.hourListText,
                  },
                ]}>
                {currentSliderTimeCapitalized}
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
                pointerEvents="none"
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
                pointerEvents="none"
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
    minHeight: 75,
    maxHeight: 78,
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
