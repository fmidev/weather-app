import React, { useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import {
  View, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@react-navigation/native';
import { SvgProps } from 'react-native-svg';

import { State } from '@store/types';
import { selectUniqueSmartSymbols } from '@store/forecast/selectors';
import { selectUnits } from '@store/settings/selectors';
import constants, {
  TEMPERATURE,
  FEELS_LIKE,
  WIND_SPEED_AND_DIRECTION,
  PRECIPITATION_1H,
  SNOW_FALL,
  PRECIPITATION_PROBABILITY,
  THUNDER_PROBABILITY,
  DEW_POINT,
  RELATIVE_HUMIDITY,
  HUMIDITY,
  PRESSURE,
  UV_CUMULATED,
} from '@store/forecast/constants';
import { DisplayParameters } from '@store/forecast/types';

import Text from '@components/common/AppText';
import Icon from '@assets/Icon';
import AccessibleTouchableOpacity from '@components/common/AccessibleTouchableOpacity';
import CloseButton from '@components/common/CloseButton';

import {
  symbolsLight,
  symbolsDark,
  weatherSymbolKeyParser,
} from '@assets/images';

import { useOrientation } from '@utils/hooks';
import { GRAY_1, CustomTheme } from '@assets/colors';
import { Config } from '@config';

const mapStateToProps = (state: State) => ({
  uniqueSmartSymbols: selectUniqueSmartSymbols(state),
  units: selectUnits(state),
});

const connector = connect(mapStateToProps, {});

type PropsFromRedux = ConnectedProps<typeof connector>;

type WeatherInfoBottomSheetProps = PropsFromRedux & {
  onClose: () => void;
};

const WeatherInfoBottomSheet: React.FC<WeatherInfoBottomSheetProps> = ({
  uniqueSmartSymbols,
  units,
  onClose,
}) => {
  const showAllSymbols =
    Config.get('weather').forecast.infoBottomSheet?.showAllSymbols || false;
  const [symbolsOpen, setSymbolsOpen] = useState<boolean>(showAllSymbols);
  const { t } = useTranslation('forecast');
  const { colors, dark } = useTheme() as CustomTheme;
  const isLandscape = useOrientation();
  const { fontScale } = useWindowDimensions();
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

  const defaultUnits = Config.get('settings').units;
  const {
    data,
    excludeDayLength,
    excludeDayDuration,
    excludePolarNightAndMidnightSun,
  } = Config.get('weather').forecast;
  const forecastParams = data.flatMap(({ parameters }) => parameters);
  const regex = new RegExp([...forecastParams].join('|'));
  const activeConstants = constants.filter((constant) =>
    regex.test(constant)
  ) as DisplayParameters[];

  const windSpeedMap = {
    'm/s': ['1-3', '4-7', '8-13', '14-20', '21-32', '> 32'],
    'km/h': ['1-11', '12-25', '26-47', '48-72', '73-115', '> 115'],
    mph: ['1-7', '8-16', '17-29', '30-45', '46-72', '> 72'],
    bft: ['1-4', '5-9', '10-17', '18-25', '26-41', '> 41'],
    kn: ['1-6', '7-14', '15-26', '27-39', '40-62', '> 62'],
  } as { [key: string]: string[] };

  const temperatureUnit =
    units?.temperature.unitAbb ?? defaultUnits.temperature;
  const windUnit = units?.wind.unitAbb ?? defaultUnits.wind;
  const precipitationUnit =
    units?.precipitation.unitAbb ?? defaultUnits.precipitation;
  const pressureUnit = units?.pressure.unitAbb ?? defaultUnits.pressure;

  const iconSize = Math.min(fontScale * 22, 36);
  const symbolSize = Math.min(fontScale * 40, 64);

  return (
    <View testID="weather_info_bottom_sheet" style={styles.wrapper}>
      <View style={styles.sheetListContainer}>
        <View style={styles.closeButtonContainer}>
          <CloseButton
            testID="weather_info_bottom_sheet_close_button"
            onPress={onClose}
            accessibilityLabel={t(
              'weatherInfoBottomSheet.closeAccessibilityLabel'
            )}
            size={22}
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
                {t('weatherInfoBottomSheet.pastTimeOrMissing')}
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

            {activeConstants.includes(TEMPERATURE) && (
              <View style={styles.row}>
                <View style={styles.iconWrapper}>
                  <Icon
                    width={iconSize}
                    height={iconSize}
                    name="temperature"
                    color={colors.hourListText}
                    style={styles.withMarginRight}
                  />
                </View>
                <Text style={[styles.text, { color: colors.hourListText }]}>
                  {t('weatherInfoBottomSheet.hourlyForecastedTemperature', {
                    unit:
                      t(`unitAbbreviations:${units?.temperature.unitAbb ?? defaultUnits.temperature}`),
                  })}
                </Text>
              </View>
            )}

            {activeConstants.includes(FEELS_LIKE) && (
              <View style={styles.row}>
                <View style={styles.iconWrapper}>
                  <Icon
                    width={iconSize}
                    height={iconSize}
                    name="feels-like"
                    color={colors.hourListText}
                    style={styles.withMarginRight}
                  />
                </View>
                <Text style={[styles.text, { color: colors.hourListText }]}>
                  {t('weatherInfoBottomSheet.feelsLikeTemperature', {
                    unit: t(`unitAbbreviations:${temperatureUnit}`)
                  })}
                </Text>
              </View>
            )}

            {activeConstants.includes(WIND_SPEED_AND_DIRECTION) && (
              <>
                <View style={styles.row}>
                  <View style={styles.iconWrapper}>
                    <Icon
                      width={iconSize}
                      height={iconSize}
                      name="wind"
                      color={colors.hourListText}
                      style={styles.withMarginRight}
                    />
                  </View>
                  <Text style={[styles.text, { color: colors.hourListText }]}>
                    {t('weatherInfoBottomSheet.windSpeedAndDirection', {
                      unit: t(`unitAbbreviations:${windUnit}`)
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
                    {`0 ${windUnit}`}
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
                    {`${windSpeedMap[windUnit][0]} ${t(`unitAbbreviations:${windUnit}`)}`}
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
                    {`${windSpeedMap[windUnit][1]} ${t(`unitAbbreviations:${windUnit}`)}`}
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
                    {`${windSpeedMap[windUnit][2]} ${t(`unitAbbreviations:${windUnit}`)}`}
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
                    {`${windSpeedMap[windUnit][3]} ${t(`unitAbbreviations:${windUnit}`)}`}
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
                    {`${windSpeedMap[windUnit][4]} ${t(`unitAbbreviations:${windUnit}`)}`}
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
                    {`${windSpeedMap[windUnit][5]} ${t(`unitAbbreviations:${windUnit}`)}`}
                  </Text>
                  <Text style={[styles.text, { color: colors.hourListText }]}>
                    {t('weatherInfoBottomSheet.hurricane')}
                  </Text>
                </View>
              </>
            )}

            {activeConstants.includes(PRECIPITATION_1H) && (
              <View style={styles.row}>
                <View style={styles.iconWrapper}>
                  <Icon
                    width={iconSize}
                    height={iconSize}
                    name="precipitation"
                    style={styles.withMarginRight}
                    color={colors.hourListText}
                  />
                </View>
                <Text style={[styles.text, { color: colors.hourListText }]}>
                  {t('weatherInfoBottomSheet.precipitation', {
                    unit: t(`unitAbbreviations:${precipitationUnit}`),
                  })}
                </Text>
              </View>
            )}

            {activeConstants.includes(SNOW_FALL) && (
              <View style={styles.row}>
                <View style={styles.iconWrapper}>
                  <Icon
                    width={iconSize}
                    height={iconSize}
                    name="snow"
                    style={styles.withMarginRight}
                    color={colors.hourListText}
                  />
                </View>
                <Text style={[styles.text, { color: colors.hourListText }]}>
                  {t('weatherInfoBottomSheet.snowfall')}
                </Text>
              </View>
            )}

            {activeConstants.includes(PRECIPITATION_PROBABILITY) && (
              <View style={styles.row}>
                <View style={styles.iconWrapper}>
                  <Icon
                    width={iconSize}
                    height={iconSize}
                    name="precipitation"
                    style={styles.withMarginRight}
                    color={colors.hourListText}
                  />
                </View>
                <Text style={[styles.text, { color: colors.hourListText }]}>
                  {t('weatherInfoBottomSheet.probabilityOfPrecipitation')}
                </Text>
              </View>
            )}

            {activeConstants.includes(THUNDER_PROBABILITY) && (
              <View style={styles.row}>
                <View style={styles.iconWrapper}>
                  <Icon
                    width={iconSize}
                    height={iconSize}
                    name="thunder"
                    style={styles.withMarginRight}
                    color={colors.hourListText}
                  />
                </View>
                <Text style={[styles.text, { color: colors.hourListText }]}>
                  {t('weatherInfoBottomSheet.probabilityOfThunder')}
                </Text>
              </View>
            )}

            {activeConstants.includes(DEW_POINT) && (
              <View style={styles.row}>
                <View style={styles.iconWrapper}>
                  <Icon
                    width={iconSize}
                    height={iconSize}
                    name="dew-point"
                    style={styles.withMarginRight}
                    color={colors.hourListText}
                  />
                </View>
                <Text style={[styles.text, { color: colors.hourListText }]}>
                  {t('weatherInfoBottomSheet.dewPoint', {
                    unit: t(`unitAbbreviations:${temperatureUnit}`),
                  })}
                </Text>
              </View>
            )}

            {(activeConstants.includes(RELATIVE_HUMIDITY)
              || activeConstants.includes(HUMIDITY)) &&  (
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
            )}

            {activeConstants.includes(PRESSURE) && (
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
                    {pressureUnit}
                  </Text>
                </View>
                <Text style={[styles.text, { color: colors.hourListText }]}>
                  {t('weatherInfoBottomSheet.pressure', {
                    unit: t(`unitAbbreviations:${pressureUnit}`),
                  })}
                </Text>
              </View>
            )}

            {activeConstants.includes(UV_CUMULATED) && (
              <>
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
                <View style={[styles.row]}>
                  <Text
                    style={[
                      styles.unitText,
                      { color: colors.hourListText },
                    ]}>
                    0–2
                  </Text>
                  <Text style={[styles.text, { color: colors.hourListText }]}>
                    {t('weatherInfoBottomSheet.uvLight')}
                  </Text>
                </View>
                <View style={[styles.row]}>
                  <Text
                    style={[
                      styles.unitText,
                      { color: colors.hourListText },
                    ]}>
                    3–5
                  </Text>
                  <Text style={[styles.text, { color: colors.hourListText }]}>
                    {t('weatherInfoBottomSheet.uvModerate')}
                  </Text>
                </View>
                <View style={[styles.row]}>
                  <Text
                    style={[
                      styles.unitText,
                      { color: colors.hourListText },
                    ]}>
                    6–7
                  </Text>
                  <Text style={[styles.text, { color: colors.hourListText }]}>
                    {t('weatherInfoBottomSheet.strong')}
                  </Text>
                </View>
                <View style={[styles.row]}>
                  <Text
                    style={[
                      styles.unitText,
                      { color: colors.hourListText },
                    ]}>
                    10–8
                  </Text>
                  <Text style={[styles.text, { color: colors.hourListText }]}>
                    {t('weatherInfoBottomSheet.veryStrong')}
                  </Text>
                </View>
                <View style={[styles.row]}>
                  <Text
                    style={[
                      styles.unitText,
                      { color: colors.hourListText },
                    ]}>
                    ≥11
                  </Text>
                  <Text style={[styles.text, { color: colors.hourListText }]}>
                    {t('weatherInfoBottomSheet.extremelyStrong')}
                  </Text>
                </View>
              </>
            )}
            {!excludeDayLength && (
              <>
                <View style={styles.row}>
                  <View style={styles.iconWrapper}>
                    <Icon
                      name="sun"
                      width={iconSize}
                      height={iconSize}
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
                {(excludePolarNightAndMidnightSun === undefined ||
                  !excludePolarNightAndMidnightSun) && (
                  <>
                    <View style={[styles.row, styles.withMarginLeft]}>
                      <View style={styles.iconWrapper}>
                        <Icon
                          width={iconSize}
                          height={iconSize}
                          name="polar-night"
                          style={styles.withMarginRight}
                          color={colors.hourListText}
                        />
                      </View>
                      <Text
                        style={[styles.text, { color: colors.hourListText }]}>
                        {t('weatherInfoBottomSheet.polarNight')}
                      </Text>
                    </View>
                    <View style={[styles.row, styles.withMarginLeft]}>
                      <View style={styles.iconWrapper}>
                        <Icon
                          width={iconSize}
                          height={iconSize}
                          name="midnight-sun"
                          style={styles.withMarginRight}
                          color={colors.hourListText}
                        />
                      </View>
                      <Text
                        style={[styles.text, { color: colors.hourListText }]}>
                        {t('weatherInfoBottomSheet.nightlessNight')}
                      </Text>
                    </View>
                  </>
                )}
                {(excludeDayDuration === undefined || !excludeDayDuration) && (
                  <>
                    <View style={[styles.row, styles.withMarginLeft]}>
                      <View style={styles.iconWrapper}>
                        <Icon
                          name="time"
                          width={iconSize}
                          height={iconSize}
                          style={[
                            styles.withMarginRight,
                            {
                              color: colors.hourListText,
                            },
                          ]}
                        />
                      </View>
                      <Text
                        style={[styles.text, { color: colors.hourListText }]}>
                        {t('weatherInfoBottomSheet.dayDuration')}
                      </Text>
                    </View>
                  </>
                )}
              </>
            )}

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

            <View style={[styles.headerRow]}>
              <Text
                maxFontSizeMultiplier={1.5}
                style={[
                  styles.unitText,
                  {
                    color: colors.hourListText,
                  },
                ]}>
                {t('weatherInfoBottomSheet.dayTime')}
              </Text>

              <Text
                maxFontSizeMultiplier={1.5}
                style={[
                  styles.unitText,
                  {
                    color: colors.hourListText,
                  },
                ]}>
                {t('weatherInfoBottomSheet.nightTime')}
              </Text>
              <Text
                maxFontSizeMultiplier={1.5}
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
                    <View key={item.key} style={[styles.row, styles.symbolRow]}>
                      <View style={styles.flex1}>
                        <item.day width={symbolSize} height={symbolSize} />
                      </View>
                      <View style={styles.flex1}>
                        <item.night width={symbolSize} height={symbolSize} />
                      </View>
                      <Text
                        maxFontSizeMultiplier={1.5}
                        style={[
                          styles.text,
                          styles.flex1,
                          { color: colors.hourListText },
                        ]}>{`${t(`symbols:${item.key}`)}`}</Text>
                    </View>
                  )
                )}
            </View>
            {!showAllSymbols && (
              <AccessibleTouchableOpacity
                style={[
                  styles.row,
                  styles.buttonContainer,
                  {
                    borderColor: colors.primaryText,
                  },
                ]}
                onPress={() => setSymbolsOpen((prev) => !prev)}>
                <Text
                  style={[styles.buttonText, { color: colors.primaryText }]}>
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
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    width: '100%',
    paddingVertical: 16,
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
  headerRow: {
    flexDirection: 'row',
    height: 30,
  },
  symbolRow: {
    maxHeight: 120,
  },
  iconWrapper: {
    width: 70,
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
