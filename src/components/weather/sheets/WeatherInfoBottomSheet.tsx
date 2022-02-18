import React, { useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import {
  SafeAreaView,
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@react-navigation/native';
import { SvgProps } from 'react-native-svg';

import { State } from '@store/types';
import { selectUniqueSmartSymbols } from '@store/forecast/selectors';

import Icon from '@components/common/Icon';
import CloseButton from '@components/common/CloseButton';

import {
  symbolsLight,
  symbolsDark,
  weatherSymbolKeyParser,
} from '@assets/images';
import {
  GRAY_1,
  RAIN_1,
  RAIN_2,
  RAIN_3,
  RAIN_4,
  RAIN_5,
  RAIN_6,
  RAIN_7,
  CustomTheme,
} from '@utils/colors';

const mapStateToProps = (state: State) => ({
  uniqueSmartSymbols: selectUniqueSmartSymbols(state),
});

const connector = connect(mapStateToProps, {});

type PropsFromRedux = ConnectedProps<typeof connector>;

type WeatherInfoBottomSheetProps = PropsFromRedux & {
  onClose: () => void;
};

const WeatherInfoBottomSheet: React.FC<WeatherInfoBottomSheetProps> = ({
  uniqueSmartSymbols,
  onClose,
}) => {
  const [symbolsOpen, setSymbolsOpen] = useState<boolean>(false);
  const { t } = useTranslation('forecast');
  const { colors, dark } = useTheme() as CustomTheme;
  const uniqueSymbolKeys = [
    ...new Set(
      uniqueSmartSymbols.map((s) => weatherSymbolKeyParser(s.toString()))
    ),
  ];
  const symbols = dark ? symbolsDark : symbolsLight;
  const symbolsArr = Object.entries(symbols).map(([key, value]) => ({
    key,
    ...value,
  }));
  const filteredSymbolsArr = symbolsArr.filter((el) =>
    uniqueSymbolKeys.includes(el.key)
  );
  return (
    <SafeAreaView style={styles.wrapper}>
      <View style={styles.sheetListContainer}>
        <View style={styles.closeButtonContainer}>
          <CloseButton
            onPress={onClose}
            accessibilityLabel={t(
              'weatherInfoBottomSheet.closeAccessibilityLabel'
            )}
          />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <TouchableOpacity activeOpacity={1}>
            <View style={styles.sheetTitle}>
              <Text style={[styles.title, { color: colors.primaryText }]}>
                {t('weatherInfoBottomSheet.dayForecastInfoTitle')}
              </Text>
            </View>

            <View style={styles.row}>
              <View style={styles.iconWrapper}>
                <Icon
                  width={27}
                  height={27}
                  name={
                    dark
                      ? 'temperature-highest-dark'
                      : 'temperature-highest-light'
                  }
                  style={styles.withMarginRight}
                />
              </View>

              <Text style={[styles.text, { color: colors.hourListText }]}>
                {t('weatherInfoBottomSheet.dayHighestTemperature')}
              </Text>
            </View>
            <View style={styles.row}>
              <View style={styles.iconWrapper}>
                <Icon
                  width={27}
                  height={27}
                  name={
                    dark
                      ? 'temperature-lowest-dark'
                      : 'temperature-lowest-light'
                  }
                  style={styles.withMarginRight}
                />
              </View>
              <Text style={[styles.text, { color: colors.hourListText }]}>
                {t('weatherInfoBottomSheet.dayLowestTemperature')}
              </Text>
            </View>
            <View style={styles.row}>
              <View style={styles.iconWrapper}>
                <Icon
                  width={27}
                  height={27}
                  name={dark ? 'rain-dark' : 'rain-white'}
                  style={styles.withMarginRight}
                />
              </View>
              <Text style={[styles.text, { color: colors.hourListText }]}>
                {t('weatherInfoBottomSheet.daySumOfPrecipitation')}
              </Text>
            </View>
            <View style={styles.row}>
              <View style={[styles.iconWrapper, styles.withMarginRight]}>
                <View
                  style={[
                    styles.timeBlock,
                    {
                      borderBottomColor: colors.primaryText,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.timeText,
                      {
                        color: colors.primaryText,
                      },
                    ]}>
                    03
                  </Text>
                  <View
                    style={[
                      styles.timeTick,
                      { backgroundColor: colors.primaryText },
                    ]}
                  />
                </View>
              </View>
              <Text style={[styles.text, { color: colors.hourListText }]}>
                {t('weatherInfoBottomSheet.time')}
              </Text>
            </View>
            <View style={styles.row}>
              <View style={[styles.iconWrapper, styles.withMarginRight]}>
                <View style={styles.pastTimeBlock} />
              </View>
              <Text style={[styles.text, { color: colors.hourListText }]}>
                {t('weatherInfoBottomSheet.pastTime')}
              </Text>
            </View>
            <View style={styles.row}>
              <View style={[styles.iconWrapper, styles.withMarginRight]}>
                <View style={styles.row}>
                  <View
                    style={[
                      styles.rainIntensityBlock,
                      styles.withSmallMarginRight,
                      {
                        backgroundColor: RAIN_1,
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.rainIntensityBlock,
                      { backgroundColor: RAIN_2 },
                    ]}
                  />
                </View>
              </View>
              <Text style={[styles.text, { color: colors.hourListText }]}>
                {t('weatherInfoBottomSheet.lightRainInHour')}
              </Text>
            </View>
            <View style={styles.row}>
              <View style={[styles.iconWrapper, styles.withMarginRight]}>
                <View style={styles.row}>
                  <View
                    style={[
                      styles.rainIntensityBlock,
                      styles.withSmallMarginRight,
                      {
                        backgroundColor: RAIN_3,
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.rainIntensityBlock,
                      styles.withSmallMarginRight,
                      {
                        backgroundColor: RAIN_4,
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.rainIntensityBlock,
                      { backgroundColor: RAIN_5 },
                    ]}
                  />
                </View>
              </View>
              <Text style={[styles.text, { color: colors.hourListText }]}>
                {t('weatherInfoBottomSheet.moderateRainInHour')}
              </Text>
            </View>
            <View style={styles.row}>
              <View style={[styles.iconWrapper, styles.withMarginRight]}>
                <View style={styles.row}>
                  <View
                    style={[
                      styles.rainIntensityBlock,
                      styles.withSmallMarginRight,
                      {
                        backgroundColor: RAIN_6,
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.rainIntensityBlock,
                      { backgroundColor: RAIN_7 },
                    ]}
                  />
                </View>
              </View>
              <Text style={[styles.text, { color: colors.hourListText }]}>
                {t('weatherInfoBottomSheet.heavyRainInHour')}
              </Text>
            </View>

            <View
              style={[styles.separator, { backgroundColor: colors.border }]}
            />

            <View style={styles.sheetTitle}>
              <Text style={[styles.title, { color: colors.primaryText }]}>
                {t('weatherInfoBottomSheet.hourlyForecastInfoTitle')}
              </Text>
            </View>

            <View style={styles.row}>
              <View style={styles.iconWrapper}>
                <Icon
                  width={22}
                  height={22}
                  name="temperature"
                  color={colors.hourListText}
                  style={styles.withMarginRight}
                />
              </View>
              <Text style={[styles.text, { color: colors.hourListText }]}>
                {t('weatherInfoBottomSheet.hourlyForecastedTemperature')}
              </Text>
            </View>
            <View style={styles.row}>
              <View style={styles.iconWrapper}>
                <Icon
                  width={22}
                  height={22}
                  name="feels-like"
                  color={colors.hourListText}
                  style={styles.withMarginRight}
                />
              </View>
              <Text style={[styles.text, { color: colors.hourListText }]}>
                {t('weatherInfoBottomSheet.feelsLikeTemperature')}
              </Text>
            </View>
            {/* <View style={[styles.row, styles.withMarginLeft]}>
            <View style={styles.iconWrapper}>
              <Icon
                width={27}
                height={27}
                name="feels-like-colder"
                style={styles.withMarginRight}
              />
            </View>
            <Text style={[styles.text, { color: colors.hourListText }]}>
              {t('weatherInfoBottomSheet.feelsLikeColder')}
            </Text>
          </View>
          <View style={[styles.row, styles.withMarginLeft]}>
            <View style={styles.iconWrapper}>
              <Icon
                width={27}
                height={27}
                name="feels-like-warmer"
                style={styles.withMarginRight}
              />
            </View>
            <Text style={[styles.text, { color: colors.hourListText }]}>
              {t('weatherInfoBottomSheet.feelsLikeWarmer')}
            </Text>
          </View> */}

            <View style={styles.row}>
              <View style={styles.iconWrapper}>
                <Icon
                  width={22}
                  height={22}
                  name="wind"
                  color={colors.hourListText}
                  style={styles.withMarginRight}
                />
              </View>
              <Text style={[styles.text, { color: colors.hourListText }]}>
                {t('weatherInfoBottomSheet.windSpeedAndDirection')}
              </Text>
            </View>
            <View style={[styles.row, styles.withMarginLeft]}>
              <View style={styles.iconWrapper}>
                <Icon
                  name={dark ? 'wind-dark' : 'wind-light'}
                  width={27}
                  height={27}
                  style={[
                    styles.withMarginRight,
                    {
                      transform: [
                        {
                          rotate: `135deg`,
                        },
                      ],
                    },
                  ]}
                />
              </View>
              <Text style={[styles.text, { color: colors.hourListText }]}>
                {t('weatherInfoBottomSheet.westWind')}
              </Text>
            </View>
            <View style={[styles.row, styles.withMarginLeft]}>
              <Text
                style={[
                  styles.withMarginRight,
                  styles.unitText,
                  { color: colors.hourListText },
                ]}>
                21–32 m/s
              </Text>
              <Text style={[styles.text, { color: colors.hourListText }]}>
                {t('weatherInfoBottomSheet.storm')}
              </Text>
            </View>
            <View style={[styles.row, styles.withMarginLeft]}>
              <Text
                style={[
                  styles.withMarginRight,
                  styles.unitText,
                  { color: colors.hourListText },
                ]}>
                14–20 m/s
              </Text>
              <Text style={[styles.text, { color: colors.hourListText }]}>
                {t('weatherInfoBottomSheet.heavyWind')}
              </Text>
            </View>
            <View style={[styles.row, styles.withMarginLeft]}>
              <Text
                style={[
                  styles.withMarginRight,
                  styles.unitText,
                  { color: colors.hourListText },
                ]}>
                8–13 m/s
              </Text>
              <Text style={[styles.text, { color: colors.hourListText }]}>
                {t('weatherInfoBottomSheet.gale')}
              </Text>
            </View>
            <View style={[styles.row, styles.withMarginLeft]}>
              <Text
                style={[
                  styles.withMarginRight,
                  styles.unitText,
                  { color: colors.hourListText },
                ]}>
                4–7 m/s
              </Text>
              <Text style={[styles.text, { color: colors.hourListText }]}>
                {t('weatherInfoBottomSheet.moderate')}
              </Text>
            </View>
            <View style={[styles.row, styles.withMarginLeft]}>
              <Text
                style={[
                  styles.withMarginRight,
                  styles.unitText,
                  { color: colors.hourListText },
                ]}>
                1–3 m/s
              </Text>
              <Text style={[styles.text, { color: colors.hourListText }]}>
                {t('weatherInfoBottomSheet.light')}
              </Text>
            </View>
            <View style={[styles.row, styles.withMarginLeft]}>
              <Text
                style={[
                  styles.withMarginRight,
                  styles.unitText,
                  { color: colors.hourListText },
                ]}>
                0 m/s
              </Text>
              <Text style={[styles.text, { color: colors.hourListText }]}>
                {t('weatherInfoBottomSheet.calm')}
              </Text>
            </View>

            <View style={styles.row}>
              <View style={styles.iconWrapper}>
                <Icon
                  width={22}
                  height={22}
                  name="precipitation"
                  style={styles.withMarginRight}
                  color={colors.hourListText}
                />
              </View>
              <Text style={[styles.text, { color: colors.hourListText }]}>
                {t('weatherInfoBottomSheet.precipitation')}
              </Text>
            </View>
            <View style={styles.row}>
              <View style={styles.iconWrapper}>
                <Icon
                  width={22}
                  height={22}
                  name="snow"
                  style={styles.withMarginRight}
                  color={colors.hourListText}
                />
              </View>
              <Text style={[styles.text, { color: colors.hourListText }]}>
                {t('weatherInfoBottomSheet.snowfall')}
              </Text>
            </View>
            <View style={styles.row}>
              <View style={styles.iconWrapper}>
                <Icon
                  width={22}
                  height={22}
                  name="precipitation"
                  style={styles.withMarginRight}
                  color={colors.hourListText}
                />
              </View>
              <Text style={[styles.text, { color: colors.hourListText }]}>
                {t('weatherInfoBottomSheet.probabilityOfPrecipitation')}
              </Text>
            </View>
            <View style={styles.row}>
              <View style={styles.iconWrapper}>
                <Icon
                  width={22}
                  height={22}
                  name="thunder"
                  style={styles.withMarginRight}
                  color={colors.hourListText}
                />
              </View>
              <Text style={[styles.text, { color: colors.hourListText }]}>
                {t('weatherInfoBottomSheet.probabilityOfThunder')}
              </Text>
            </View>
            <View style={styles.row}>
              <View style={styles.iconWrapper}>
                <Icon
                  width={22}
                  height={22}
                  name="dew-point"
                  style={styles.withMarginRight}
                  color={colors.hourListText}
                />
              </View>
              <Text style={[styles.text, { color: colors.hourListText }]}>
                {t('weatherInfoBottomSheet.dewPoint')}
              </Text>
            </View>
            <View style={styles.row}>
              <View style={styles.iconWrapper}>
                <Text
                  style={[
                    styles.iconText,
                    styles.withMarginRight,
                    {
                      color: colors.hourListText,
                    },
                  ]}>
                  hPa
                </Text>
              </View>
              <Text style={[styles.text, { color: colors.hourListText }]}>
                {t('weatherInfoBottomSheet.pressure')}
              </Text>
            </View>
            <View style={styles.row}>
              <View style={styles.iconWrapper}>
                <Text
                  style={[
                    styles.iconText,
                    styles.withMarginRight,
                    {
                      color: colors.hourListText,
                    },
                  ]}>
                  UV
                </Text>
              </View>
              <Text style={[styles.text, { color: colors.hourListText }]}>
                {t('weatherInfoBottomSheet.uvIndex')}
              </Text>
            </View>
            <View style={[styles.row, styles.withMarginLeft]}>
              <Text
                style={[
                  styles.withMarginRight,
                  styles.unitText,
                  { color: colors.hourListText },
                ]}>
                0–2
              </Text>
              <Text style={[styles.text, { color: colors.hourListText }]}>
                {t('weatherInfoBottomSheet.light')}
              </Text>
            </View>
            <View style={[styles.row, styles.withMarginLeft]}>
              <Text
                style={[
                  styles.withMarginRight,
                  styles.unitText,
                  { color: colors.hourListText },
                ]}>
                3–5
              </Text>
              <Text style={[styles.text, { color: colors.hourListText }]}>
                {t('weatherInfoBottomSheet.uvModerate')}
              </Text>
            </View>
            <View style={[styles.row, styles.withMarginLeft]}>
              <Text
                style={[
                  styles.withMarginRight,
                  styles.unitText,
                  { color: colors.hourListText },
                ]}>
                6–7
              </Text>
              <Text style={[styles.text, { color: colors.hourListText }]}>
                {t('weatherInfoBottomSheet.strong')}
              </Text>
            </View>
            <View style={[styles.row, styles.withMarginLeft]}>
              <Text
                style={[
                  styles.withMarginRight,
                  styles.unitText,
                  { color: colors.hourListText },
                ]}>
                10–8
              </Text>
              <Text style={[styles.text, { color: colors.hourListText }]}>
                {t('weatherInfoBottomSheet.veryStrong')}
              </Text>
            </View>
            <View style={[styles.row, styles.withMarginLeft]}>
              <Text
                style={[
                  styles.withMarginRight,
                  styles.unitText,
                  { color: colors.hourListText },
                ]}>
                ≥11
              </Text>
              <Text style={[styles.text, { color: colors.hourListText }]}>
                {t('weatherInfoBottomSheet.extremelyStrong')}
              </Text>
            </View>
            <View style={styles.row}>
              <View style={styles.iconWrapper}>
                <Icon
                  name="sunrise"
                  width={22}
                  height={22}
                  style={[
                    styles.withMarginRight,
                    { color: colors.hourListText },
                  ]}
                />
              </View>
              <Text style={[styles.text, { color: colors.hourListText }]}>
                {t('weatherInfoBottomSheet.sunrise')}
              </Text>
            </View>
            <View style={styles.row}>
              <View style={styles.iconWrapper}>
                <Icon
                  name="sunset"
                  width={22}
                  height={22}
                  style={[
                    styles.withMarginRight,
                    { color: colors.hourListText },
                  ]}
                />
              </View>
              <Text style={[styles.text, { color: colors.hourListText }]}>
                {t('weatherInfoBottomSheet.sunset')}
              </Text>
            </View>
            <View style={styles.row}>
              <View style={styles.iconWrapper}>
                <Icon
                  name="time"
                  width={22}
                  height={22}
                  style={[
                    styles.withMarginRight,
                    {
                      color: colors.hourListText,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.text, { color: colors.hourListText }]}>
                {t('weatherInfoBottomSheet.dayDuration')}
              </Text>
            </View>
            <View style={styles.row}>
              <View style={styles.iconWrapper}>
                <Icon
                  width={22}
                  height={22}
                  name="polar-night"
                  style={styles.withMarginRight}
                  color={colors.hourListText}
                />
              </View>
              <Text style={[styles.text, { color: colors.hourListText }]}>
                {t('weatherInfoBottomSheet.polarNight')}
              </Text>
            </View>
            <View style={styles.row}>
              <View style={styles.iconWrapper}>
                <Icon
                  width={22}
                  height={22}
                  name="midnight-sun"
                  style={styles.withMarginRight}
                  color={colors.hourListText}
                />
              </View>
              <Text style={[styles.text, { color: colors.hourListText }]}>
                {t('weatherInfoBottomSheet.nightlessNight')}
              </Text>
            </View>

            <View
              style={[styles.separator, { backgroundColor: colors.border }]}
            />

            <View style={styles.sheetTitle}>
              <Text style={[styles.title, { color: colors.primaryText }]}>
                {t('weatherInfoBottomSheet.currentWeatherSymbolsTitle')}
              </Text>
            </View>

            <View style={[styles.row]}>
              <Text
                style={[
                  styles.unitText,
                  {
                    color: colors.hourListText,
                  },
                ]}>
                {t('weatherInfoBottomSheet.dayTime')}
              </Text>
              <Text
                style={[
                  styles.unitText,
                  {
                    color: colors.hourListText,
                  },
                ]}>
                {t('weatherInfoBottomSheet.nightTime')}
              </Text>
              <Text
                style={[
                  styles.unitText,
                  {
                    color: colors.hourListText,
                  },
                ]}>
                {t('weatherInfoBottomSheet.description')}
              </Text>
            </View>
            <View>
              {filteredSymbolsArr
                .slice(0, symbolsOpen ? undefined : 4)
                .map(
                  (item: {
                    key: string;
                    day: React.FC<SvgProps>;
                    night: React.FC<SvgProps>;
                  }) => (
                    <View key={item.key} style={styles.row}>
                      <View style={styles.flex1}>
                        {item.day({ width: 40, height: 40 })}
                      </View>
                      <View style={styles.flex1}>
                        {item.night({ width: 40, height: 40 })}
                      </View>
                      <Text
                        style={[
                          styles.text,
                          styles.flex1,
                          { color: colors.hourListText },
                        ]}>{`${t(`symbols:${item.key}`)}`}</Text>
                    </View>
                  )
                )}
            </View>
            <TouchableOpacity
              style={[
                styles.row,
                styles.buttonContainer,
                {
                  borderColor: colors.primaryText,
                },
              ]}
              onPress={() => setSymbolsOpen((prev) => !prev)}>
              <Text style={[styles.buttonText, { color: colors.primaryText }]}>
                {!symbolsOpen
                  ? `${t('weatherInfoBottomSheet.showRest')} (${
                      filteredSymbolsArr.length - 4
                    })`
                  : t('weatherInfoBottomSheet.showLess')}
              </Text>
              <Icon
                name={symbolsOpen ? 'arrow-up' : 'arrow-down'}
                width={24}
                height={24}
                style={[
                  styles.withSmallMarginLeft,
                  { color: colors.primaryText },
                ]}
              />
            </TouchableOpacity>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  sheetListContainer: {
    flex: 1,
    marginTop: -10,
    paddingHorizontal: 24,
  },
  closeButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginRight: -2,
  },
  sheetTitle: {
    flexDirection: 'row',
    paddingBottom: 10,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  iconWrapper: {
    minWidth: 28,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
  },
  text: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
    flex: 2,
    flexWrap: 'wrap',
  },
  iconText: {
    fontFamily: 'Roboto-Medium',
    fontSize: 14,
  },
  flex1: {
    flex: 1,
  },
  withMarginRight: {
    marginRight: 16,
  },
  withSmallMarginRight: {
    marginRight: 2,
  },
  withMarginLeft: {
    marginLeft: 20,
  },
  withSmallMarginLeft: {
    marginLeft: 2,
  },
  rainIntensityBlock: {
    width: 8,
    height: 4,
  },
  pastTimeBlock: {
    width: 24,
    height: 4,
    backgroundColor: GRAY_1,
    opacity: 0.5,
  },
  timeBlock: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  timeTick: {
    width: 1,
    height: 4,
  },
  timeText: {
    fontSize: 14,
    fontFamily: 'Roboto-Medium',
  },
  separator: {
    width: '100%',
    height: 1,
    marginTop: 14,
    marginBottom: 24,
  },
  unitText: {
    fontSize: 16,
    fontFamily: 'Roboto-Medium',
    flex: 1,
    flexWrap: 'wrap',
  },
  buttonContainer: {
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 24,
    alignSelf: 'center',
    marginBottom: 50,
    marginTop: 30,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Roboto-Medium',
  },
});

export default connector(WeatherInfoBottomSheet);
