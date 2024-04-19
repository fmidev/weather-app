import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { CustomTheme, TRANSPARENT } from '@utils/colors';

import Icon from '@components/common/Icon';
import { Config } from '@config';
import { ChartType } from './types';
import { selectDailyObservationParametersWithData } from '@store/observation/selector';
import { useSelector } from 'react-redux';

type ChartLegendProps = {
  chartType: ChartType;
  observation: boolean | undefined;
};

const ChartLegend: React.FC<ChartLegendProps> = ({
  chartType,
  observation,
}) => {
  const { colors } = useTheme() as CustomTheme;
  const { t } = useTranslation();

  const { units } = Config.get('settings');

  const obsParameters = Config.get('weather').observation.parameters;
  const forParameters = Config.get('weather').forecast.data.flatMap(
    ({ parameters }) => parameters
  );

  const dailyParametersWithData = useSelector(
    selectDailyObservationParametersWithData
  );

  type LineProps = { color?: string; height?: number };

  // eslint-disable-next-line react/no-unstable-nested-components
  const Line = ({ color = colors.primaryText, height = 2 }: LineProps) => (
    <View
      style={[
        styles.legendLine,
        {
          backgroundColor: color,
          height,
        },
      ]}
    />
  );

  // eslint-disable-next-line react/no-unstable-nested-components
  const DashLine = () => {
    const length = 3;
    return (
      <View style={styles.legendRowNoMargin}>
        {[...Array(length)].map((_, index) => (
          <View
            key={`dash-${index.toString()}`}
            style={[
              styles.legendLineBlock,
              styles.withMarginRight,
              { backgroundColor: colors.chartSecondaryLine },
            ]}
          />
        ))}
      </View>
    );
  };

  // eslint-disable-next-line react/no-unstable-nested-components
  const DotLine = () => {
    const length = 6;
    return (
      <View style={styles.legendRowNoMargin}>
        {[...Array(length)].map((_, index) => (
          <View
            key={`dot-${index.toString()}`}
            style={[
              styles.legendDot,
              index !== length - 1 ? styles.dotMarginRight : {},
              { backgroundColor: colors.chartPrimaryLine },
            ]}
          />
        ))}
      </View>
    );
  };

  // eslint-disable-next-line react/no-unstable-nested-components
  const Bar = ({ color }: { color: string }) => (
    <View
      style={[
        styles.legendBlock,
        {
          backgroundColor: color,
        },
      ]}
    />
  );

  // eslint-disable-next-line react/no-unstable-nested-components
  const Arrow = () => (
    <Icon
      name="wind-arrow"
      width={20}
      height={20}
      style={[
        styles.iconMargin,
        {
          color: colors.primaryText,
        },
      ]}
    />
  );

  // eslint-disable-next-line react/no-unstable-nested-components
  const ScatterPoint = ({ color }: { color: string }) => (
    <View
      style={[
        styles.legendScatterPoint,
        {
          backgroundColor: color,
        },
      ]}
    />
  );

  return (
    <View style={styles.legendContainer}>
      {(chartType === 'temperature' || chartType === 'weather') && (
        <View style={styles.row}>
          <View>
            {(observation
              ? obsParameters?.includes('temperature')
              : forParameters.includes('temperature')) && (
              <View style={styles.legendRow}>
                <Line color={colors.chartPrimaryLine} />
                <Text
                  style={[styles.legendText, { color: colors.hourListText }]}>
                  {t('weather:charts:temperature').toLocaleLowerCase()} (°
                  {units.temperature})
                </Text>
              </View>
            )}
            {!observation && forParameters.includes('feelsLike') && (
              <View style={styles.legendRow}>
                <DashLine />
                <Text
                  style={[styles.legendText, { color: colors.hourListText }]}>
                  {t(`weather:charts:feelsLike`).toLocaleLowerCase()} (°
                  {units.temperature})
                </Text>
              </View>
            )}
            {(observation
              ? obsParameters?.includes('dewPoint')
              : forParameters.includes('dewPoint')) && (
              <View style={styles.legendRow}>
                <DotLine />
                <Text
                  style={[styles.legendText, { color: colors.hourListText }]}>
                  {t(`weather:charts:dewPoint`).toLocaleLowerCase()} (°
                  {units.temperature})
                </Text>
              </View>
            )}
          </View>
          <View style={styles.marginLeft}>
            <View style={styles.legendRow}>
              <Line color={colors.secondaryBorder} height={1} />
              <Text style={[styles.legendText, { color: colors.hourListText }]}>
                {t(`weather:charts:zeroLine`).toLocaleLowerCase()}
              </Text>
            </View>
          </View>
        </View>
      )}
      {(chartType === 'precipitation' || chartType === 'weather') && (
        <>
          <View style={styles.legendRow}>
            <Bar color={colors.rain[1]} />
            <Bar color={colors.rain[2]} />
            <Bar color={colors.rain[3]} />
            <Text style={[styles.legendText, { color: colors.hourListText }]}>
              {t('weather:charts:precipitationLight', {
                unit: units.precipitation,
              }).toLocaleLowerCase()}
            </Text>
          </View>
          <View style={styles.legendRow}>
            <Bar color={colors.rain[4]} />
            <Bar color={colors.rain[5]} />
            <Bar color={TRANSPARENT} />
            <Text style={[styles.legendText, { color: colors.hourListText }]}>
              {t('weather:charts:precipitationModerate', {
                unit: units.precipitation,
              }).toLocaleLowerCase()}
            </Text>
          </View>
          <View style={styles.legendRow}>
            <Bar color={colors.rain[6]} />
            <Bar color={colors.rain[7]} />
            <Bar color={colors.rain[8]} />
            <Text style={[styles.legendText, { color: colors.hourListText }]}>
              {t('weather:charts:precipitationHeavy', {
                unit: units.precipitation,
              }).toLocaleLowerCase()}
            </Text>
          </View>
          {!observation && forParameters.includes('pop') && (
            <View style={styles.legendRow}>
              <DotLine />
              <Text
                style={[
                  styles.legendText,
                  styles.paddingLeft,
                  { color: colors.hourListText },
                ]}>
                {t(`weather:charts:pop`).toLocaleLowerCase()}
              </Text>
            </View>
          )}
        </>
      )}
      {chartType === 'wind' && (
        <>
          {(observation
            ? obsParameters?.includes('windSpeedMS')
            : forParameters.includes('windSpeedMS')) && (
            <View style={styles.legendRow}>
              <Line />
              <Text style={[styles.legendText, { color: colors.hourListText }]}>
                {t('weather:charts:windSpeed').toLocaleLowerCase()} (
                {units.wind})
              </Text>
            </View>
          )}
          {(observation
            ? obsParameters?.includes('windGust')
            : forParameters.includes('hourlymaximumgust')) && (
            <View style={styles.legendRow}>
              <DashLine />
              <Text style={[styles.legendText, { color: colors.hourListText }]}>
                {t('weather:charts:windGust').toLocaleLowerCase()} ({units.wind}
                )
              </Text>
            </View>
          )}
          {(observation
            ? obsParameters?.includes('windDirection')
            : forParameters.includes('windDirection')) && (
            <View style={styles.legendRow}>
              <Arrow />
              <Text style={[styles.legendText, { color: colors.hourListText }]}>
                {t('weather:charts:windDirection').toLocaleLowerCase()}
              </Text>
            </View>
          )}
        </>
      )}
      {chartType === 'cloud' && (
        <View style={styles.legendRow}>
          <Line />
          <Text style={[styles.legendText, { color: colors.hourListText }]}>
            {t('weather:charts:cloud').toLocaleLowerCase()} (m)
          </Text>
        </View>
      )}
      {chartType === 'pressure' && (
        <View style={styles.legendRow}>
          <Line />
          <Text style={[styles.legendText, { color: colors.hourListText }]}>
            {t('weather:charts:pressure').toLocaleLowerCase()} ({units.pressure}
            )
          </Text>
        </View>
      )}
      {chartType === 'humidity' && (
        <View style={styles.legendRow}>
          <Line />
          <Text style={[styles.legendText, { color: colors.hourListText }]}>
            {observation
              ? t('weather:charts:humidity').toLocaleLowerCase()
              : t('weather:charts:relativeHumidity').toLocaleLowerCase()}{' '}
            (%)
          </Text>
        </View>
      )}
      {chartType === 'visCloud' && (
        <>
          {obsParameters?.includes('visibility') && (
            <View style={styles.legendRow}>
              <View style={styles.rowFirstHalf}>
                <DashLine />
              </View>
              <Text style={[styles.legendText, { color: colors.hourListText }]}>
                {t('weather:charts:visibility').toLocaleLowerCase()} (m)
              </Text>
            </View>
          )}
          {obsParameters?.includes('totalCloudCover') && (
            <>
              <View style={styles.legendRow}>
                <View style={styles.rowFirstHalf}>
                  <Bar color={colors.primaryText} />
                </View>
                <Text
                  style={[styles.legendText, { color: colors.hourListText }]}>
                  {t('weather:charts:totalCloudCover').toLocaleLowerCase()}
                </Text>
              </View>
              <View style={styles.legendRowNoMargin}>
                <Text
                  style={[
                    styles.rowFirstHalfText,
                    { color: colors.hourListText },
                  ]}>
                  0/8 - 1/8
                </Text>
                <Text
                  style={[styles.legendText, { color: colors.hourListText }]}>
                  {t('weather:charts:cloudCover01').toLocaleLowerCase()}
                </Text>
              </View>
              <View style={styles.legendRowNoMargin}>
                <Text
                  style={[
                    styles.rowFirstHalfText,
                    { color: colors.hourListText },
                  ]}>
                  2/8 - 4/8
                </Text>
                <Text
                  style={[styles.legendText, { color: colors.hourListText }]}>
                  {t('weather:charts:cloudCover24').toLocaleLowerCase()}
                </Text>
              </View>
              <View style={styles.legendRowNoMargin}>
                <Text
                  style={[
                    styles.rowFirstHalfText,
                    { color: colors.hourListText },
                  ]}>
                  3/8 - 6/8
                </Text>
                <Text
                  style={[styles.legendText, { color: colors.hourListText }]}>
                  {t('weather:charts:cloudCover36').toLocaleLowerCase()}
                </Text>
              </View>
              <View style={styles.legendRowNoMargin}>
                <Text
                  style={[
                    styles.rowFirstHalfText,
                    { color: colors.hourListText },
                  ]}>
                  5/8 - 7/8
                </Text>
                <Text
                  style={[styles.legendText, { color: colors.hourListText }]}>
                  {t('weather:charts:cloudCover57').toLocaleLowerCase()}
                </Text>
              </View>
              <View style={styles.legendRowNoMargin}>
                <Text
                  style={[
                    styles.rowFirstHalfText,
                    { color: colors.hourListText },
                  ]}>
                  7/8 - 8/8
                </Text>
                <Text
                  style={[styles.legendText, { color: colors.hourListText }]}>
                  {t('weather:charts:cloudCover78').toLocaleLowerCase()}
                </Text>
              </View>
            </>
          )}
        </>
      )}
      {chartType === 'snowDepth' && (
        <View style={styles.legendRow}>
          <Bar color={colors.primaryText} />
          <Text style={[styles.legendText, { color: colors.hourListText }]}>
            {t('weather:charts:snowDepth').toLocaleLowerCase()} (cm)
          </Text>
        </View>
      )}
      {chartType === 'uv' && (
        <View style={styles.legendRow}>
          <Line />
          <Text style={[styles.legendText, { color: colors.hourListText }]}>
            {t('weather:charts:uvIndex').toLocaleLowerCase()}
          </Text>
        </View>
      )}
      {chartType === 'daily' && (
        <>
          {dailyParametersWithData.includes('rrday') && (
            <View style={styles.legendRow}>
              <Bar color="rgb(30, 110, 214)" />
              <Text style={[styles.legendText, { color: colors.hourListText }]}>
                {t('weather:charts:rrday')}
              </Text>
            </View>
          )}
          {dailyParametersWithData.includes('minimumGroundTemperature06') && (
            <View style={styles.legendRow}>
              <ScatterPoint color="rgb(176, 176, 0)" />
              <Text style={[styles.legendText, { color: colors.hourListText }]}>
                {t('weather:charts:minimumGroundTemperature06')}
              </Text>
            </View>
          )}
          {(dailyParametersWithData.includes('minimumTemperature') ||
            dailyParametersWithData.includes('maximumTemperature')) && (
            <View style={styles.legendRow}>
              <Bar color="rgb(145, 0, 0)" />
              <Text style={[styles.legendText, { color: colors.hourListText }]}>
                {t('weather:charts:maxAndMinTemperatures')}
              </Text>
            </View>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  legendContainer: {
    flex: 1,
    alignSelf: 'flex-start',
    marginLeft: 16,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 5,
  },
  rowFirstHalf: {
    width: 60,
  },
  rowFirstHalfText: {
    width: 65,
  },
  legendRowNoMargin: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendLine: {
    width: 17,
    height: 2,
  },
  legendText: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
    marginLeft: 16,
  },
  legendLineBlock: {
    width: 4,
    height: 2,
  },
  legendDot: {
    width: 2,
    height: 2,
  },
  withMarginRight: {
    marginRight: 2,
  },
  dotMarginRight: {
    marginRight: 1,
  },
  legendBlock: {
    width: 8,
    height: 4,
    marginRight: 2,
  },
  legendScatterPoint: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  iconMargin: {
    marginLeft: -4,
  },
  row: {
    flexDirection: 'row',
  },
  marginLeft: {
    marginLeft: 20,
  },
  paddingLeft: {
    paddingLeft: 13,
  },
});

export default ChartLegend;
