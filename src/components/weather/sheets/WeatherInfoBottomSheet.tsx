import React, { useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import {
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
import AccessibleTouchableOpacity from '@components/common/AccessibleTouchableOpacity';
import CloseButton from '@components/common/CloseButton';

import {
  symbolsLight,
  symbolsDark,
  weatherSymbolKeyParser,
} from '@assets/images';

import { useOrientation } from '@utils/hooks';
import { GRAY_1, CustomTheme } from '@utils/colors';
import { Config } from '@config';

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
  const isLandscape = useOrientation();
  const uniqueSymbolKeys = [
    ...new Set(
      uniqueSmartSymbols.map((s) => weatherSymbolKeyParser((s || 0).toString()))
    ),
  ];
  const symbols = dark ? symbolsDark : symbolsLight;
  const symbolsArr = Object.entries(symbols).map(([key, value]) => ({
    key,
    ...value,
  }));
  const filteredSymbolsArr = symbolsArr.sort((el) =>
    uniqueSymbolKeys.includes(el.key) ? 1 : 0
  );

  const currentSymbols = symbolsArr.filter((el) =>
    uniqueSymbolKeys.includes(el.key)
  ).length;

  const { units } = Config.get('settings');

  const windSpeedMap = {
    'm/s': ['1-3', '4-7', '8-13', '14-20', '21-32', '> 32'],
    'km/h': ['1-11', '12-25', '26-47', '48-72', '73-115', '> 115'],
    mph: ['1-7', '8-16', '17-29', '30-45', '46-72', '> 72'],
    bft: ['1-4', '5-9', '10-17', '18-25', '26-41', '> 41'],
  } as { [key: string]: string[] };

  return (
    <View style={styles.wrapper}>
      <View style={styles.sheetListContainer}>
        <View style={styles.closeButtonContainer}>
          <CloseButton
            onPress={onClose}
            accessibilityLabel={t(
              'weatherInfoBottomSheet.closeAccessibilityLabel'
            )}
          />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={isLandscape && styles.landscape}>
          <TouchableOpacity activeOpacity={1} accessible={false}>
            <View style={styles.sheetTitle}>
              <Text style={[styles.title, { color: colors.primaryText }]}>
                {t('weatherInfoBottomSheet.precipitationStripTitle')}
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
                        backgroundColor: colors.rain[1],
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.rainIntensityBlock,
                      styles.withSmallMarginRight,
                      { backgroundColor: colors.rain[2] },
                    ]}
                  />
                  <View
                    style={[
                      styles.rainIntensityBlock,
                      { backgroundColor: colors.rain[3] },
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
                        backgroundColor: colors.rain[4],
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.rainIntensityBlock,
                      { backgroundColor: colors.rain[5] },
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
                        backgroundColor: colors.rain[6],
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.withSmallMarginRight,
                      styles.rainIntensityBlock,
                      { backgroundColor: colors.rain[7] },
                    ]}
                  />
                  <View
                    style={[
                      styles.rainIntensityBlock,
                      { backgroundColor: colors.rain[8] },
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
                {t('weatherInfoBottomSheet.hourlyForecastedTemperature', {
                  unit: units.temperature,
                })}
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
                {t('weatherInfoBottomSheet.feelsLikeTemperature', {
                  unit: units.temperature,
                })}
              </Text>
            </View>
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
                {t('weatherInfoBottomSheet.windSpeedAndDirection', {
                  unit: units.wind,
                })}
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
                {t('weatherInfoBottomSheet.windDirectionArrow')}
              </Text>
            </View>

            <View style={[styles.row, styles.withMarginLeft]}>
              <Text
                style={[
                  styles.withMarginRight,
                  styles.unitText,
                  { color: colors.hourListText },
                ]}>
                {`0 ${units.wind}`}
              </Text>
              <Text style={[styles.text, { color: colors.hourListText }]}>
                {t('weatherInfoBottomSheet.calm')}
              </Text>
            </View>
            <View style={[styles.row, styles.withMarginLeft]}>
              <Text
                style={[
                  styles.withMarginRight,
                  styles.unitText,
                  { color: colors.hourListText },
                ]}>
                {`${windSpeedMap[units.wind][0]} ${units.wind}`}
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
                {`${windSpeedMap[units.wind][1]} ${units.wind}`}
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
                {`${windSpeedMap[units.wind][2]} ${units.wind}`}
              </Text>
              <Text style={[styles.text, { color: colors.hourListText }]}>
                {t('weatherInfoBottomSheet.strongBreeze')}
              </Text>
            </View>
            <View style={[styles.row, styles.withMarginLeft]}>
              <Text
                style={[
                  styles.withMarginRight,
                  styles.unitText,
                  { color: colors.hourListText },
                ]}>
                {`${windSpeedMap[units.wind][3]} ${units.wind}`}
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
                {`${windSpeedMap[units.wind][4]} ${units.wind}`}
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
                {`${windSpeedMap[units.wind][5]} ${units.wind}`}
              </Text>
              <Text style={[styles.text, { color: colors.hourListText }]}>
                {t('weatherInfoBottomSheet.hurricane')}
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
                {t('weatherInfoBottomSheet.precipitation', {
                  unit: units.precipitation,
                })}
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
                {t('weatherInfoBottomSheet.dewPoint', {
                  unit: units.temperature,
                })}
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
                  RH%
                </Text>
              </View>
              <Text style={[styles.text, { color: colors.hourListText }]}>
                {t('weatherInfoBottomSheet.relativeHumidity')}
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
                  {units.pressure}
                </Text>
              </View>
              <Text style={[styles.text, { color: colors.hourListText }]}>
                {t('weatherInfoBottomSheet.pressure', { unit: units.pressure })}
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
                {t('weatherInfoBottomSheet.uvLight')}
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
                  name="sun"
                  width={22}
                  height={22}
                  style={[
                    styles.withMarginRight,
                    { color: colors.hourListText },
                  ]}
                />
              </View>
              <Text style={[styles.text, { color: colors.hourListText }]}>
                {t('weatherInfoBottomSheet.sunriseAndSunset')}
              </Text>
            </View>
            <View style={[styles.row, styles.withMarginLeft]}>
              <View style={styles.iconWrapper}>
                <Icon
                  name="sun-arrow-up"
                  size={14}
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
            <View style={[styles.row, styles.withMarginLeft]}>
              <View style={styles.iconWrapper}>
                <Icon
                  name="sun-arrow-down"
                  size={14}
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
            <View style={[styles.row, styles.withMarginLeft]}>
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
            <View style={[styles.row, styles.withMarginLeft]}>
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
            <View style={[styles.row, styles.withMarginLeft]}>
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

            <View
              style={[styles.separator, { backgroundColor: colors.border }]}
            />

            <View style={styles.sheetTitle}>
              <Text style={[styles.title, { color: colors.primaryText }]}>
                {t('weatherInfoBottomSheet.timezone')}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={[styles.text, { color: colors.hourListText }]}>
                {t('weatherInfoBottomSheet.timezoneDescription')}
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
                .slice(0, symbolsOpen ? undefined : currentSymbols)
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
            <AccessibleTouchableOpacity
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
                      filteredSymbolsArr.length - currentSymbols
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
            </AccessibleTouchableOpacity>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
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
    marginRight: 1.2,
  },
  withMarginLeft: {
    marginLeft: 20,
  },
  withSmallMarginLeft: {
    marginLeft: 2,
  },
  rainIntensityBlock: {
    width: 8,
    height: 12,
  },
  pastTimeBlock: {
    width: 18,
    height: 12,
    backgroundColor: GRAY_1,
    opacity: 0.5,
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
    maxWidth: '100%',
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Roboto-Medium',
  },
  landscape: {
    paddingBottom: 200,
  },
});

export default connector(WeatherInfoBottomSheet);
