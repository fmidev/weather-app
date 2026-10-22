import React from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { connect, ConnectedProps } from 'react-redux';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import PanelHeader from '@components/common/PanelHeader';
import Text from '@components/common/AppText';
import AccessibleTouchableOpacity from '@components/common/AccessibleTouchableOpacity';
import { WHITE, CustomTheme } from '@assets/colors';
import { BOLD_FONT, REGULAR_FONT } from '@assets/constants';
import { weatherSymbolGetter } from '@assets/images';
import { Config } from '@config';
import { State } from '@store/types';
import { selectFavoriteForecasts } from '@store/forecast/selectors';
import { selectUnits } from '@store/settings/selectors';
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
});

const connector = connect(mapStateToProps);
type Props = ConnectedProps<typeof connector> & {
  onSelectLocation: (location: Location) => void;
};

const WEATHERSYMBOL_SIZE = 40;

const FavoritesPanel: React.FC<Props> = ({
  forecasts,
  units,
  onSelectLocation,
}) => {
  const { t } = useTranslation('weather');
  const { colors } = useTheme() as CustomTheme;
  const { fontScale } = useWindowDimensions();

  if (forecasts.length === 0) return null;

  const scale = Math.max(1, Math.min(fontScale, 2));
  const temperatureUnit =
    units?.temperature?.unitAbb ?? Config.get('settings').units.temperature;

  return (
    <View>
      <PanelHeader title={t('favoriteLocations')} thin />
      <ScrollView horizontal contentContainerStyle={styles.row}>
        {forecasts.map(({ location, forecast }) => {
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
          ]
            .filter(Boolean)
            .join(', ');

          return (
            <AccessibleTouchableOpacity
              key={location.id}
              testID={`favorite-forecast-${location.id}`}
              accessible
              accessibilityRole="button"
              accessibilityLabel={accessibilityLabel}
              accessibilityHint={t('selectFavoriteLocationHint')}
              onPress={() => onSelectLocation(location)}
              style={[
                styles.card,
                {
                  width: 110 * scale,
                  minHeight: 80 * scale,
                  backgroundColor: colors.forecastBackground,
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
            </AccessibleTouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
    padding: 16,
  },
  card: {
    padding: 8,
    borderRadius: 8,
    justifyContent: 'space-between',
    alignItems: 'stretch',
  },
  name: {
    fontSize: 14,
    fontFamily: REGULAR_FONT,
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
