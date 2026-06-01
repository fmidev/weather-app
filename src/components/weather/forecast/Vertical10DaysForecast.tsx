import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  useWindowDimensions,
  GestureResponderEvent,
  PanResponderGestureState,
  AppState, AppStateStatus
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Modal from 'react-native-modal';
import moment from 'moment';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { connect, ConnectedProps } from 'react-redux';

import Text from '@components/common/AppText';
import AccessibleTouchableOpacity from '@components/common/AccessibleTouchableOpacity';

import { CustomTheme, BLACK } from '@assets/colors';
import { weatherSymbolGetter } from '@assets/images';
import { Config } from '@config';
import { converter, getForecastParameterUnitTranslationKey, toPrecision } from '@utils/units';
import PrecipitationStrip from './PrecipitationStrip';
import { selectUnits } from '@store/settings/selectors';
import { State } from '@store/types';
import { selectForecastInvalidData, selectDisplayParams } from '@store/forecast/selectors';

import Icon from '@components/common/ScalableIcon';
import { formatAccessibleDate, formatAccessibleTemperature, uppercaseFirst } from '@utils/helpers';
import ModalContent from './ModalContent';
import { trackMatomoEvent } from '@utils/matomo';

const mapStateToProps = (state: State) => ({
  units: selectUnits(state),
  invalidData: selectForecastInvalidData(state),
  displayParams: selectDisplayParams(state),
});

const connector = connect(mapStateToProps, {});
type PropsFromRedux = ConnectedProps<typeof connector>;

type DaySelectorListProps = PropsFromRedux & {
  dayData: {
    maxTemperature: number;
    minTemperature: number;
    minWindSpeed: number;
    maxWindSpeed: number;
    totalPrecipitation: number;
    precipitationMissing: boolean;
    timeStamp: number;
    smartSymbol: number | undefined;
    precipitationData: {
      precipitation: number | undefined;
      timestamp: number;
    }[];
  }[];
};

const Vertical10DaysForecast: React.FC<DaySelectorListProps> = ({
  dayData,
  units,
  invalidData,
}) => {
  const insets = useSafeAreaInsets();
  const { width, height, fontScale} = useWindowDimensions();
  const { colors, dark } = useTheme() as CustomTheme;
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const decimalSeparator = locale === 'en' ? '.' : ',';
  const isWideDisplay = () => width > 500;
  const largeFonts = fontScale >= 1.5;
  const modalMaxHeight = height - insets.top - insets.bottom - 20;

  const activeParameters = Config.get('weather').forecast.data.flatMap(
    ({ parameters }) => parameters
  );

  const defaultUnits = Config.get('settings').units;
  const temperatureUnit = units?.temperature.unitAbb ?? defaultUnits.temperature;
  const windUnit = units?.wind.unitAbb ?? defaultUnits.wind;
  const precipitationUnit = units?.precipitation.unitAbb ?? defaultUnits.precipitation;

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTimeStamp, setModalTimeStamp] = useState(0);
  const [modalActiveDayIndex, setModalActiveDayIndex] = useState(0);
  const [initialPosition, setInitialPosition] = useState<'start' | 'end'>('start');
  const [modalScrollOffset, setModalScrollOffset] = useState(0);
  const [modalScrollOffsetMax, setModalScrollOffsetMax] = useState(0);

  const shouldPropagateModalSwipe = useCallback(
    (_: GestureResponderEvent, gestureState: PanResponderGestureState) => {
      const { dx, dy } = gestureState;
      const edgeTolerance = 2;
      const isAtTop = modalScrollOffset <= edgeTolerance;
      const isAtBottom =
        modalScrollOffsetMax <= edgeTolerance ||
        modalScrollOffset >= modalScrollOffsetMax - edgeTolerance;

      if (Math.abs(dx) > Math.abs(dy)) {
        return true;
      }
      if (dy > 0 && isAtTop) {
        return false;
      }
      if (dy < 0 && isAtBottom) {
        return false;
      }

      return true;
    },
    [modalScrollOffset, modalScrollOffsetMax]
  );

  const appState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      // Close the modal if the day has changed and there is no forecast for selected day
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        if (modalTimeStamp < Date.now() && modalActiveDayIndex === 0
          && !moment().isSame(moment(modalTimeStamp), 'day')) {
          setModalVisible(false);
        }
      }

      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [modalActiveDayIndex, modalTimeStamp]);

  const rowRenderer = ({
    item,
    index,
  }: {
    item: {
      timeStamp: number;
      maxTemperature: number;
      minTemperature: number;
      minWindSpeed: number;
      maxWindSpeed: number;
      totalPrecipitation: number;
      precipitationMissing: boolean;
      smartSymbol: number | undefined;
      precipitationData: {
        precipitation: number | undefined;
        timestamp: number;
      }[];
    };
    index: number;
  }) => {
    const {
      timeStamp, maxTemperature, minTemperature, maxWindSpeed, minWindSpeed,
      smartSymbol, totalPrecipitation, precipitationMissing
    } = item;
    const stepMoment = moment.unix(timeStamp).locale(locale);
    const DaySmartSymbol = weatherSymbolGetter(
      (smartSymbol || 0).toString(),
      dark
    );

    const convertedMaxTemperature = invalidData
      ? '-'
      : toPrecision(
          'temperature',
          temperatureUnit,
          converter(temperatureUnit, maxTemperature)
        );
    const convertedMinTemperature = invalidData
      ? '-'
      : toPrecision(
          'temperature',
          temperatureUnit,
          converter(temperatureUnit, minTemperature)
        );
    const convertedMaxWindSpeed = invalidData
      ? '-'
      : toPrecision(
          'wind',
          windUnit,
          converter(windUnit, maxWindSpeed)
        );
    const convertedMinWindSpeed = invalidData
    ? '-'
    : toPrecision(
        'wind',
        windUnit,
        converter(windUnit, minWindSpeed)
      );

    const convertedTotalPrecipitation = invalidData || precipitationMissing
    ? '-'
    : toPrecision(
        'precipitation',
        precipitationUnit,
        converter(precipitationUnit, totalPrecipitation)
      );

    const weekdayAbbreviationFormat = locale === 'en' ? 'ddd' : 'dd';
    const dateFormat = locale === 'en' ? 'D MMM' : 'D.M.';
    const symbolSize = Math.min(64, fontScale * 44);
    const rowHeight = fontScale ? 80 : 70;

    const showModal = (epochtime: number, activeDayIndex: number) => {
      setModalTimeStamp(epochtime*1000);
      setModalActiveDayIndex(activeDayIndex);
      setInitialPosition('start');
      setModalVisible(true);
    }

    return (
      <AccessibleTouchableOpacity
        accessibilityRole="button"
        accessibilityHint={t('forecast:showHourlyForecast')}
        onPress={() => {
          trackMatomoEvent('User action','Weather', 'Show hourly forecast - day '+ (index+1));
          showModal(timeStamp, index)
        }}
        key={stepMoment.unix()}>
        <View style={[styles.container, { height: rowHeight }]}>
          <View style={[styles.row, { borderColor: colors.border }]} key={stepMoment.unix()}>
            <View
              accessible
              accessibilityLabel={formatAccessibleDate(stepMoment, false)}
              style={styles.day}>
              <Text style={[styles.text, styles.bold, { color: colors.primaryText }]}>
                { uppercaseFirst(stepMoment.format(weekdayAbbreviationFormat)) }
              </Text>
              <Text maxFontSizeMultiplier={1.3} style={[styles.text, { color: colors.primaryText }]}>
                {stepMoment.format(dateFormat)}
              </Text>
            </View>
            <View accessible accessibilityLabel={t(`symbols:${smartSymbol}`)}>
              {DaySmartSymbol ? <DaySmartSymbol width={symbolSize} height={symbolSize} /> : null}
            </View>
            {activeParameters.includes('temperature') && (
              <Text
                style={[styles.text, styles.temperatureWidth, { color: colors.primaryText }]}
                accessibilityLabel={`${t('forecast:temperature')} ${t('forecast:fromTo', {
                  min: formatAccessibleTemperature(convertedMinTemperature, t),
                  max: formatAccessibleTemperature(convertedMaxTemperature, t),
                  unit: t(
                    temperatureUnit === 'C'
                      ? 'forecast:celsius'
                      : 'forecast:fahrenheit'
                  ),
                })}`}>{`${convertedMinTemperature}°`}<Text maxFontSizeMultiplier={1.5}> ... </Text>{`${convertedMaxTemperature}°`}</Text>
            )}
            {isWideDisplay() && activeParameters.includes('windSpeedMS') && (
              <View style={styles.flexRow}>
                <Icon
                  name="wind"
                  height={28}
                  width={20}
                  color={colors.hourListText}
                />
                <Text
                style={[styles.text, styles.windWidth, { color: colors.primaryText }]}
                accessibilityLabel={`${t('forecast:windSpeed')} ${t('forecast:fromTo', {
                  min: convertedMinWindSpeed,
                  max: convertedMaxWindSpeed,
                  unit: t(
                    windUnit === 'm/s'
                      ? 'forecast:metersPerSecond'
                      : 'forecast:kilometersPerHour'
                  ),
                })}`}>
                  {`${convertedMinWindSpeed}`}<Text maxFontSizeMultiplier={1.5}> ... </Text>{`${convertedMaxWindSpeed} ${windUnit}`}
                </Text>
              </View>
            )}
            {activeParameters.includes('precipitation1h') && (
              <View style={styles.precipitationContainer}>
                <View style={[styles.flex, styles.flexRow, styles.center]}>
                  { !largeFonts && <Icon width={18} height={18} name="precipitation" color={colors.hourListText} /> }
                  <Text
                    style={[styles.text, { color: colors.hourListText }]}
                    maxFontSizeMultiplier={1.2}
                    accessibilityLabel={
                      precipitationMissing ? t('forecast:precipitationMissing') :
                        `${t('forecast:precipitation')} ${
                        totalPrecipitation
                          ?.toString()
                          .replace('.', decimalSeparator) ||
                        (0).toFixed(1).replace('.', decimalSeparator)
                        } ${t(
                          `forecast:${getForecastParameterUnitTranslationKey(
                            precipitationUnit
                          )}`
                        )}`
                      }
                    >
                    <Text style={styles.text}>{`${
                      convertedTotalPrecipitation?.replace('.', decimalSeparator) ||
                      (0).toFixed(1).replace('.', decimalSeparator)
                    }`}</Text>
                    {` ${precipitationUnit}`}
                  </Text>
                </View>
                <PrecipitationStrip
                  precipitationData={item.precipitationData}
                  border
                />
              </View>
            )}
          </View>
        </View>
      </AccessibleTouchableOpacity>
    );
  };

  return (
    <>
      { dayData.map((item, index) => rowRenderer({ item, index })) }
      <Modal
        isVisible={modalVisible}
        backdropOpacity={0.5}
        onSwipeComplete={ () => setModalVisible(false ) }
        onBackButtonPress={ () => setModalVisible(false ) }
        onBackdropPress={ () => setModalVisible(false ) }
        swipeDirection={['down', 'up']}
        scrollOffset={modalScrollOffset}
        scrollOffsetMax={modalScrollOffsetMax}
        propagateSwipe={shouldPropagateModalSwipe}
      >
        <View style={styles.centeredView}>
          <View style={
            [styles.modalView, { backgroundColor: colors.modalBackground, maxHeight: modalMaxHeight }]
          }>
            <ModalContent
              activeDayIndex={modalActiveDayIndex}
              timeStamp={modalTimeStamp}
              onClose={() => setModalVisible(false) }
              initialPosition={initialPosition}
              modalMaxHeight={modalMaxHeight}
              onScrollOffsetChange={setModalScrollOffset}
              onScrollOffsetMaxChange={setModalScrollOffsetMax}
              onDayChange={ (forward: boolean) => {
                let newDayIndex = forward ? modalActiveDayIndex + 1 : modalActiveDayIndex - 1;
                if (newDayIndex < 0) newDayIndex = 0;
                if (newDayIndex >= dayData.length) newDayIndex = dayData.length - 1;

                setModalActiveDayIndex(newDayIndex);
                setModalTimeStamp(dayData[newDayIndex].timeStamp*1000);
                if (forward) {
                  setInitialPosition('start');
                } else {
                  setInitialPosition('end');
                }
              }}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 70,
  },
  flex: {
    flex: 1,
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  center: {
    alignItems: 'center',
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    marginHorizontal: 16,
    borderBottomWidth: 1,
  },
  bold: {
    fontFamily: 'Roboto-Bold',
  },
  text: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
  },
  precipitationContainer: {
    width: 80,
  },
  day: {
    width: 58,
  },
  centeredView: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    margin: 20,
    borderRadius: 20,
    padding: 8,
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: BLACK,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '100%',
  },
  temperatureWidth: {
    width: 130,
    textAlign: 'center',
  },
  windWidth: {
    width: 150,
  }
});

export default connector(Vertical10DaysForecast);
