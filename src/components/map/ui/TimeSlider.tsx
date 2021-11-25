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
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
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

const QUARTER_WIDTH = 12;
const HOUR_WIDTH = QUARTER_WIDTH * 4;

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

  const sliderRef = useRef() as React.MutableRefObject<FlatList>;

  const observationEndUnix =
    (overlay?.observation &&
      overlay.observation.end &&
      Number(moment(overlay.observation.end).format('X'))) ||
    0;

  const currentSliderTime = moment
    .unix(sliderTime)
    .locale(locale)
    .format('ddd HH:mm');
  const sliderWidth = width - 24;

  const sliderMinUnix = useMemo(
    () => getSliderMinUnix(activeOverlayId, overlay),
    [activeOverlayId, overlay]
  );
  const sliderMaxUnix = useMemo(
    () => getSliderMaxUnix(activeOverlayId, overlay),
    [activeOverlayId, overlay]
  );

  const step = getSliderStepSeconds(sliderStep);

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
    if (times && times.length > 0) {
      // try scroll closest to current time
      const now = moment().format('X');
      const roundedNow = Math.floor(Number(now) / step) * step;
      const i = times.indexOf(roundedNow);
      if (i >= 0) sliderRef.current.scrollToIndex({ index: i, animated: true });
    }
  }, [times, step]);

  useEffect(() => {
    const time = times[currentIndex];
    if (time % step === 0) {
      if (sliderTime !== time) {
        updateSliderTime(time);
      }
    }
  }, [currentIndex, sliderTime, updateSliderTime, step, times]);
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
    resolveAndSetCurrentIndex(x);
  };

  const resolveAndSetCurrentIndex = useCallback(
    (x: number) => {
      const divider = step === STEP_60 ? HOUR_WIDTH : QUARTER_WIDTH;
      const index = Math.floor(x / divider);
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
    [times, isAnimating, step]
  );

  useEffect(() => {
    if (isAnimating) {
      sliderRef.current.scrollToOffset({
        offset: scrollIndex,
        animated: false,
      });
      resolveAndSetCurrentIndex(scrollIndex);
    }
  }, [scrollIndex, isAnimating, resolveAndSetCurrentIndex]);

  const handleSetScrollIndex = () => setScrollIndex((prev) => prev + 1);

  const animate = () => {
    setIsAnimating(true);
    interval = setInterval(() => {
      handleSetScrollIndex();
    }, 50);
  };

  const clear = () => {
    setIsAnimating(false);
    clearInterval(interval);
  };

  const renderStep = ({ item, index }: { item: number; index: number }) => {
    const hour = item % STEP_60 === 0 && moment.unix(item).format('HH');
    if (index === times.length - 1)
      return (
        <View
          style={[
            styles.lastQuarterContainer,
            {
              marginRight:
                index === times.length - 1 ? sliderWidth / 2 - 1 : undefined,
            },
          ]}>
          {hour && (
            <Text
              style={[
                styles.text,
                step === STEP_60 ? styles.lastHourText : styles.lastQuarterText,
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
              step !== STEP_60 ? styles.withBorderLeft : undefined,
              { borderLeftColor: colors.secondaryBorder },
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
            width: step === STEP_60 ? HOUR_WIDTH : QUARTER_WIDTH,
            marginLeft: index === 0 ? sliderWidth / 2 - 80 : undefined,
          },
        ]}>
        {hour && (
          <Text
            style={[
              styles.text,
              step === STEP_60 ? styles.hourText : styles.quarterText,
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
            step !== STEP_60 ? styles.withBorderLeft : undefined,
            {
              borderLeftColor: colors.secondaryBorder,
              borderBottomColor:
                item <= observationEndUnix
                  ? colors.secondaryBorder
                  : colors.primary,
            },
          ]}
        />
      </View>
    );
  };

  return (
    <>
      <View
        style={[
          styles.wrapper,
          styles.shadow,
          {
            backgroundColor: colors.mapButtonBackground,
            borderColor: colors.mapButtonBorder,
            shadowColor: colors.shadow,
          },
        ]}>
        <View style={styles.container}>
          <View
            style={[
              styles.buttonContainer,
              { borderRightColor: colors.border },
            ]}>
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
            <FlatList
              decelerationRate="fast"
              ref={sliderRef}
              data={times}
              keyExtractor={(item) => `${item}`}
              renderItem={renderStep}
              horizontal
              style={styles.sliderContainer}
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              onMomentumScrollEnd={handleMomentumScroll}
              onScrollBeginDrag={handleMomentumStart}
              getItemLayout={(data, index: number) => ({
                length: step === STEP_60 ? HOUR_WIDTH : QUARTER_WIDTH,
                offset: index * (step === STEP_60 ? HOUR_WIDTH : QUARTER_WIDTH),
                index,
              })}
            />
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
                      : colors.hourListText,
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
                dark ? [GRAY_6, GRAY_6_TRANSPARENT] : [WHITE, WHITE_TRANSPARENT]
              }
            />
            <LinearGradient
              style={[styles.gradient, styles.gradientRight]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              colors={
                dark ? [GRAY_6_TRANSPARENT, GRAY_6] : [WHITE_TRANSPARENT, WHITE]
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
                      : colors.secondaryBorder,
                },
              ]}
            />
          </View>
        </View>
      </View>
    </>
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
  text: {
    fontSize: 14,
    fontFamily: 'Roboto-Medium',
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
  quarterContainer: {
    height: 32,
    justifyContent: 'flex-end',
  },
  quarterText: {
    marginRight: '20%',
    marginLeft: '-65%',
  },
  hourText: {
    marginRight: '20%',
    marginLeft: '-15%',
  },
  lastQuarterContainer: {
    height: 32,
    justifyContent: 'flex-end',
  },
  lastQuarterText: {
    marginRight: '50%',
    marginLeft: '-35%',
  },
  lastHourText: {
    marginRight: '35%',
    marginLeft: '-20%',
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
