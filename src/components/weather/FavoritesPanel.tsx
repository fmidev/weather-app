import React from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { connect, ConnectedProps } from 'react-redux';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import PanelHeader from '@components/common/PanelHeader';
import Text from '@components/common/AppText';
import AccessibleTouchableOpacity from '@components/common/AccessibleTouchableOpacity';
import {
  WHITE,
  GREEN,
  YELLOW,
  ORANGE,
  RED,
  TRANSPARENT,
  CustomTheme,
} from '@assets/colors';
import { BOLD_FONT, REGULAR_FONT } from '@assets/constants';
import { weatherSymbolGetter } from '@assets/images';
import { Config } from '@config';
import { State } from '@store/types';
import { selectFavoriteForecasts } from '@store/forecast/selectors';
import { selectUnits } from '@store/settings/selectors';
import { selectGeoid } from '@store/location/selector';
import { selectLocationWarnings } from '@store/warnings/selectors';
import { severityList } from '@store/warnings/constants';
import type { Location } from '@store/location/types';
import {
  converter,
  getForecastParameterUnitTranslationKey,
  toPrecision,
} from '@utils/units';
import { formatAccessibleTemperature } from '@utils/accessibility';

const mapStateToProps = (state: State) => ({
  forecasts: selectFavoriteForecasts(state),
  units: selectUnits(state),
  locationWarnings: selectLocationWarnings(state),
  selectedLocationId: selectGeoid(state),
});

const connector = connect(mapStateToProps);
type Props = ConnectedProps<typeof connector> & {
  onSelectLocation: (location: Location, scrollToTop: boolean) => void;
  scrollToTop?: boolean;
};

const WEATHERSYMBOL_SIZE = 40;
const WARNING_COLORS = [GREEN, YELLOW, ORANGE, RED];

const FavoritesPanel: React.FC<Props> = ({
  forecasts,
  units,
  locationWarnings,
  selectedLocationId,
  onSelectLocation,
  scrollToTop = true,
}) => {
  const { t } = useTranslation('weather');
  const { colors } = useTheme() as CustomTheme;
  const { fontScale } = useWindowDimensions();

  if (forecasts.length === 0) return null;

  const scale = Math.max(1, Math.min(fontScale, 2));
  const temperatureUnit =
    units?.temperature?.unitAbb ?? Config.get('settings').units.temperature;

  return (
    <SafeAreaView edges={['left', 'right']}>
      <PanelHeader title={t('favoriteLocations')} thin />
      <ScrollView horizontal contentContainerStyle={styles.row}>
        {forecasts.map(({ location, forecast }) => {
          const selected = String(location.id) === String(selectedLocationId);
          const forecastTime = forecast
            ? forecast.epochtime * 1000
            : Date.now();
          const warningSeverity = locationWarnings[
            location.id
          ]?.warnings.reduce(
            (highest, { severity, duration: { startTime, endTime } }) =>
              Date.parse(startTime) <= forecastTime &&
              forecastTime < Date.parse(endTime)
                ? Math.max(highest, severityList.indexOf(severity))
                : highest,
            0
          );
          const temperature = forecast?.temperature;
          const convertedTemperature =
            typeof temperature === 'number' && Number.isFinite(temperature)
              ? toPrecision(
                  'temperature',
                  temperatureUnit,
                  converter(temperatureUnit, temperature)
                )
              : undefined;
          const SmartSymbol =
            typeof forecast?.smartSymbol === 'number' &&
            Number.isFinite(forecast.smartSymbol)
              ? weatherSymbolGetter(String(forecast.smartSymbol), true)
              : null;
          const temperatureLabel =
            convertedTemperature !== undefined
              ? t('forecast:params.temperature', {
                  value: formatAccessibleTemperature(convertedTemperature, t),
                  unit: t(
                    `forecast:${getForecastParameterUnitTranslationKey(temperatureUnit)}`
                  ),
                })
              : t('forecastUnavailable');
          const accessibilityLabel = [
            location.name,
            SmartSymbol && t(`symbols:${forecast?.smartSymbol}`),
            temperatureLabel,
            warningSeverity !== undefined &&
              (warningSeverity === 0
                ? t('warnings:noWarningsText')
                : `${t('warnings:panelTitleSlim')}: ${t(`warnings:severities:${warningSeverity}`)}`),
          ]
            .filter(Boolean)
            .join(', ');

          return (
            <AccessibleTouchableOpacity
              key={location.id}
              testID={`favorite-forecast-${location.id}`}
              accessible
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={accessibilityLabel}
              accessibilityHint={t(
                scrollToTop
                  ? 'selectFavoriteLocationHint'
                  : 'selectFavoriteLocationWithoutScrollHint'
              )}
              onPress={() => onSelectLocation(location, scrollToTop)}
              style={[
                styles.card,
                selected && styles.selectedCard,
                {
                  width: 110 * scale,
                  minHeight: 80 * scale,
                  backgroundColor: colors.forecastBackground,
                  borderColor: selected
                    ? colors.selectedFavoriteBorder
                    : TRANSPARENT,
                },
              ]}>
              <Text numberOfLines={1} style={[styles.name, { color: WHITE }]}>
                {location.name}
              </Text>
              <View style={styles.weather}>
                <View
                  style={{
                    width: WEATHERSYMBOL_SIZE,
                    height: WEATHERSYMBOL_SIZE,
                  }}>
                  {SmartSymbol && (
                    <SmartSymbol
                      width={WEATHERSYMBOL_SIZE}
                      height={WEATHERSYMBOL_SIZE}
                    />
                  )}
                </View>
                <Text style={[styles.temperature, { color: WHITE }]}>
                  {convertedTemperature !== undefined
                    ? `${convertedTemperature}°${t(`unitAbbreviations:${temperatureUnit}`)}`
                    : '-'}
                </Text>
              </View>
              {warningSeverity !== undefined && (
                <View
                  testID={`favorite-warning-${location.id}`}
                  accessible={false}
                  accessibilityElementsHidden
                  importantForAccessibility="no"
                  pointerEvents="none"
                  style={[
                    styles.warningBand,
                    { backgroundColor: WARNING_COLORS[warningSeverity] },
                  ]}
                />
              )}
            </AccessibleTouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
  },
  card: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 0,
    overflow: 'hidden',
    justifyContent: 'space-between',
    alignItems: 'stretch',
  },
  selectedCard: {
    borderWidth: 2,
  },
  name: {
    fontSize: 14,
    fontFamily: REGULAR_FONT,
  },
  warningBand: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 6,
  },
  weather: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
    marginTop: 4,
  },
  temperature: {
    fontSize: 18,
    fontFamily: BOLD_FONT,
    flexShrink: 1,
  },
});

export default connector(FavoritesPanel);
