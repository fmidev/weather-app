import React, { useState } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import Modal from 'react-native-modal';
import moment from 'moment';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { connect, ConnectedProps } from 'react-redux';

import AccessibleTouchableOpacity from '@components/common/AccessibleTouchableOpacity';

import { CustomTheme, BLACK } from '@assets/colors';
import { weatherSymbolGetter } from '@assets/images';
import { Config } from '@config';
import { converter, getForecastParameterUnitTranslationKey, toPrecision } from '@utils/units';
import PrecipitationStrip from './PrecipitationStrip';
import { selectUnits } from '@store/settings/selectors';
import { State } from '@store/types';
import { selectForecastInvalidData } from '@store/forecast/selectors';
import Icon from '@components/common/Icon';
import { uppercaseFirst } from '@utils/helpers';
import ModalContent from './ModalContent';

const mapStateToProps = (state: State) => ({
  units: selectUnits(state),
  invalidData: selectForecastInvalidData(state),
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
  const { colors, dark } = useTheme() as CustomTheme;
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const decimalSeparator = locale === 'en' ? '.' : ',';

  const { width} = useWindowDimensions();
  const isWideDisplay = () => width > 500;

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
      smartSymbol: number | undefined;
      precipitationData: {
        precipitation: number | undefined;
        timestamp: number;
      }[];
    };
    index: number;
  }) => {
    const { timeStamp, maxTemperature, minTemperature, maxWindSpeed, minWindSpeed, smartSymbol, totalPrecipitation } = item;
    const stepMoment = moment.unix(timeStamp);
    const daySmartSymbol = weatherSymbolGetter(
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
          'windSpeed',
          windUnit,
          converter(windUnit, maxWindSpeed)
        );
    const convertedMinWindSpeed = invalidData
    ? '-'
    : toPrecision(
        'windSpeed',
        windUnit,
        converter(windUnit, minWindSpeed)
      );

    const convertedTotalPrecipitation = invalidData
    ? '-'
    : toPrecision(
        'precipitation',
        precipitationUnit,
        converter(precipitationUnit, totalPrecipitation)
      );

    const weekdayAbbreviationFormat = locale === 'en' ? 'ddd' : 'dd';
    const dateFormat = locale === 'en' ? 'D MMM' : 'D.M.';

    const showModal = (epochtime: number, activeDayIndex: number) => {
      setModalTimeStamp(epochtime*1000);
      setModalActiveDayIndex(activeDayIndex);
      setModalVisible(true);
    }

    return (
      <AccessibleTouchableOpacity
        onPress={() => showModal(timeStamp, index)}
        key={stepMoment.unix()}>
        <View style={styles.container}>
          <View style={[styles.row, { borderColor: colors.border }]} key={stepMoment.unix()}>
            <View style={styles.day}>
              <Text style={[styles.text, styles.bold, { color: colors.primaryText }]}>
                {index === 0 ? "Tänään" : uppercaseFirst(stepMoment.locale(locale).format(weekdayAbbreviationFormat))}
              </Text>
              <Text style={[styles.text, { color: colors.primaryText }]}>
                {stepMoment.locale(locale).format(dateFormat)}
              </Text>
            </View>
            <View accessibilityLabel={t(`symbols:${smartSymbol && smartSymbol > 100 ? smartSymbol - 100 : smartSymbol}`)}>
              {daySmartSymbol?.({
                width: 44,
                height: 44,
              })}
            </View>
            {activeParameters.includes('temperature') && (
              <Text
                style={[styles.text, styles.temperatureWidth, { color: colors.primaryText }]}
                accessibilityLabel={t('forecast:fromTo', {
                  min: convertedMinTemperature,
                  max: convertedMaxTemperature,
                  unit: t(
                    temperatureUnit === 'C'
                      ? 'forecast:celsius'
                      : 'forecast:fahrenheit'
                  ),
                })}>{`${convertedMinTemperature}° ... ${convertedMaxTemperature}°`}</Text>
            )}
            {isWideDisplay() && activeParameters.includes('windSpeedMS') && (
              <View style={styles.flexRow}>
                <Icon name="wind" color={colors.hourListText} />
                <Text
                style={[styles.text, styles.windWidth, { color: colors.primaryText }]}
                accessibilityLabel={t('forecast:fromTo', {
                  min: convertedMinTemperature,
                  max: convertedMaxTemperature,
                  unit: t(
                    windUnit === 'm/s'
                      ? 'forecast:metersPerSecond'
                      : 'forecast:kilometersPerHour'
                  ),
                })}>
                  {`${convertedMinWindSpeed} ... ${convertedMaxWindSpeed} ${windUnit}`}
                </Text>
              </View>
            )}
            {activeParameters.includes('precipitation1h') && (
              <View style={styles.precipitationContainer}>
                <View style={[styles.flex, styles.flexRow, styles.center]}>
                  <Icon name="precipitation" color={colors.hourListText} />
                    <Text
                      style={[styles.text, { color: colors.hourListText }]}
                      accessibilityLabel={`${t('forecast:precipitation')} ${
                        totalPrecipitation
                          ?.toString()
                          .replace('.', decimalSeparator) ||
                        (0).toFixed(1).replace('.', decimalSeparator)
                      } ${t(
                        `forecast:${getForecastParameterUnitTranslationKey(
                          precipitationUnit
                        )}`
                      )}`}>
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
        swipeDirection={['up', 'down']}
        propagateSwipe={true}
        scrollHorizontal={true}
      >
        <View style={styles.centeredView}>
          <View style={[styles.modalView, { backgroundColor: colors.modalBackground }]}>
            <ModalContent
              activeDayIndex={modalActiveDayIndex}
              timeStamp={modalTimeStamp}
              onClose={() => setModalVisible(false) }
              onDayChange={ (forward: boolean) => {
                let newDayIndex = forward ? modalActiveDayIndex + 1 : modalActiveDayIndex - 1;
                if (newDayIndex < 0) newDayIndex = 0;
                if (newDayIndex >= dayData.length) newDayIndex = dayData.length - 1;

                setModalActiveDayIndex(newDayIndex);
                setModalTimeStamp(dayData[newDayIndex].timeStamp*1000);
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
    width: 60,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    margin: 20,
    borderRadius: 20,
    padding: 8,
    alignItems: 'center',
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
    width: 80,
  },
  windWidth: {
    width: 100,
  }
});

export default connector(Vertical10DaysForecast);
