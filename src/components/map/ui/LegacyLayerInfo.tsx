import React from 'react';
import Icon from '@assets/Icon';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@react-navigation/native';
import { useSelector } from 'react-redux';

import { Config } from '@config';
import Text from '@components/common/AppText';

import { CustomTheme } from '@assets/colors';

import { State } from '@store/types';
import { selectActiveOverlay } from '@store/map/selectors';
import { ScrollView } from 'react-native-gesture-handler';

import TemperatureLegend from './TemperatureLegend';

const LegacyInfo: React.FC = () => {
  const { t } = useTranslation('map');
  const { colors, dark } = useTheme() as CustomTheme;
  const { layers } = Config.get('map');

  const timeseriesEnabled = layers.some((layer) => layer.type === 'Timeseries');

  // get selected layer
  const layerId = useSelector((state: State) => selectActiveOverlay(state));
  const layer = layers.find((l) => l.id === layerId);

  return (
    <View testID="legacy_layer_info" style={styles.wrapper}>
      <View style={styles.sheetTitle}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t('infoBottomSheet.mapLayersInfoTitle')}
        </Text>
      </View>
      <ScrollView>
        {layer?.legend?.hasPrecipitationFin && (
          <View style={styles.withMarginBottom}>
            <Text style={[styles.text, { color: colors.hourListText }]}>
              {t(
                'infoBottomSheet.precipitation.precipitationFin.description'
              )}
            </Text>
          </View>
        )}
        {layer?.legend?.hasPrecipitationScan && (
          <View style={styles.withMarginBottom}>
            <Text style={[styles.text, { color: colors.hourListText }]}>
              {t(
                'infoBottomSheet.precipitation.precipitationScan.description'
              )}
            </Text>
          </View>
        )}
        {(layer?.legend?.hasPrecipitationFin ||
          layer?.legend?.hasPrecipitationScan) && (
          <View>
            <View style={styles.sheetTitle}>
              <Text style={[styles.title, { color: colors.text }]}>
                {t('infoBottomSheet.precipitation.title')}
              </Text>
            </View>
          </View>
        )}
        {layer?.legend?.hasPrecipitationFin && (
          <View>
            <View style={styles.withMarginBottom}>
              <Text style={[styles.text, { color: colors.hourListText }]}>
                {t(
                  'infoBottomSheet.precipitation.precipitationFin.observation'
                )}
              </Text>
            </View>
            <View style={styles.withMarginBottom}>
              <Text style={[styles.text, { color: colors.hourListText }]}>
                {t('infoBottomSheet.precipitation.precipitationFin.forecast')}
              </Text>
            </View>
          </View>
        )}
        {layer?.legend?.hasPrecipitationScan && (
          <View>
            <View style={styles.withMarginBottom}>
              <Text style={[styles.text, { color: colors.hourListText }]}>
                {t(
                  'infoBottomSheet.precipitation.precipitationScan.observation'
                )}
              </Text>
            </View>
            <View style={styles.withMarginBottom}>
              <Text style={[styles.text, { color: colors.hourListText }]}>
                {t(
                  'infoBottomSheet.precipitation.precipitationScan.forecast'
                )}
              </Text>
            </View>
          </View>
        )}
        {(layer?.legend?.hasPrecipitationFin ||
          layer?.legend?.hasPrecipitationScan) && (
          <View>
            <View>
              <Text style={[styles.text, { color: colors.hourListText }]}>
                {t('infoBottomSheet.precipitation.rainRadarInfo')}
              </Text>
            </View>
            <View style={styles.rowWrapper}>
              <View style={[styles.row, styles.rainContainer]}>
                <View
                  style={[
                    styles.rainBlock,
                    { backgroundColor: colors.rain[1] },
                  ]}
                />
                <View
                  style={[
                    styles.rainBlock,
                    { backgroundColor: colors.rain[2] },
                  ]}
                />
                <View
                  style={[
                    styles.rainBlock,
                    { backgroundColor: colors.rain[3] },
                  ]}
                />
                <View
                  style={[
                    styles.rainBlock,
                    { backgroundColor: colors.rain[4] },
                  ]}
                />
                <View
                  style={[
                    styles.rainBlock,
                    { backgroundColor: colors.rain[5] },
                  ]}
                />
                <View
                  style={[
                    styles.rainBlock,
                    { backgroundColor: colors.rain[6] },
                  ]}
                />
                <View
                  style={[
                    styles.rainBlock,
                    { backgroundColor: colors.rain[7] },
                  ]}
                />
                <View
                  style={[
                    styles.rainBlock,
                    { backgroundColor: colors.rain[8] },
                  ]}
                />
              </View>
              <View style={styles.sheetTitle}>
                <Text
                  maxFontSizeMultiplier={1.5}
                  style={[styles.text, { color: colors.hourListText }]}
                >
                  {t('map:infoBottomSheet:precipitation:light')}
                </Text>
                <Text
                  maxFontSizeMultiplier={1.5}
                  style={[styles.text, { color: colors.hourListText }]}
                >
                  {t('map:infoBottomSheet:precipitation:moderate')}
                </Text>
                <Text
                  maxFontSizeMultiplier={1.5}
                  style={[styles.text, { color: colors.hourListText }]}
                >
                  {t('map:infoBottomSheet:precipitation:strong')}
                </Text>
              </View>
            </View>
          </View>
        )}

        {layer?.legend?.hasLightning15 && (
          <View>
            <View style={styles.sheetTitle}>
              <Text style={[styles.title, { color: colors.text }]}>
                {t('infoBottomSheet.lightnings15.title')}
              </Text>
            </View>
            <View>
              <Text style={[styles.text, { color: colors.hourListText }]}>
                {t('infoBottomSheet.lightnings15.description')}
              </Text>
            </View>
            <View style={styles.rowWrapper}>
              <View style={styles.column}>
                <View style={[styles.row, styles.lightningsContainer]}>
                  <Icon
                    name={dark ? 'flash1-dark' : 'flash1'}
                    style={styles.lightningIcon}
                  />
                  <Text style={[styles.text, { color: colors.hourListText }]}>
                    {t('infoBottomSheet.lightnings15.age1')}
                  </Text>
                </View>
                <View style={[styles.row, styles.lightningsContainer]}>
                  <Icon
                    name={dark ? 'flash2-dark' : 'flash2'}
                    style={styles.lightningIcon}
                  />
                  <Text style={[styles.text, { color: colors.hourListText }]}>
                    {t('infoBottomSheet.lightnings15.age2')}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}
        {layer?.legend?.hasLightning60 && (
          <View>
            <View style={styles.sheetTitle}>
              <Text style={[styles.title, { color: colors.text }]}>
                {t('infoBottomSheet.lightnings60.title')}
              </Text>
            </View>
            <View>
              <Text style={[styles.text, { color: colors.hourListText }]}>
                {t('infoBottomSheet.lightnings60.description')}
              </Text>
            </View>
            <View style={styles.rowWrapper}>
              <View style={styles.column}>
                <View style={[styles.row, styles.lightningsContainer]}>
                  <Icon
                    name={dark ? 'flash1-dark' : 'flash1'}
                    style={styles.lightningIcon}
                  />
                  <Text style={[styles.text, { color: colors.hourListText }]}>
                    {t('infoBottomSheet.lightnings60.age1')}
                  </Text>
                </View>
                <View style={[styles.row, styles.lightningsContainer]}>
                  <Icon
                    name={dark ? 'flash2-dark' : 'flash2'}
                    style={styles.lightningIcon}
                  />
                  <Text style={[styles.text, { color: colors.hourListText }]}>
                    {t('infoBottomSheet.lightnings60.age2')}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {layer?.legend?.hasWindArrowsShort && (
          <View style={styles.withMarginBottom}>
            <View>
              <Text style={[styles.text, { color: colors.hourListText }]}>
                {t('infoBottomSheet.windArrows.layerInfo.short')}
              </Text>
            </View>
          </View>
        )}
        {layer?.legend?.hasWindArrowsLong && (
          <View style={styles.withMarginBottom}>
            <View>
              <Text style={[styles.text, { color: colors.hourListText }]}>
                {t('infoBottomSheet.windArrows.layerInfo.long')}
              </Text>
            </View>
          </View>
        )}
        {(layer?.legend?.hasWindArrowsShort ||
          layer?.legend?.hasWindArrowsLong) && (
          <View>
            <View style={styles.sheetTitle}>
              <Text style={[styles.title, { color: colors.text }]}>
                {t('infoBottomSheet.windArrows.title')}
              </Text>
            </View>
            <View style={styles.sheetTitle}>
              <Text style={[styles.text, { color: colors.text }]}>
                {t('infoBottomSheet.windArrows.description')}
              </Text>
            </View>
          </View>
        )}
        {(layer?.legend?.hasWindArrowsShort ||
          layer?.legend?.hasWindArrowsLong) && (
          <View>
            <View style={styles.rowWrapper}>
              <View style={styles.column}>
                <View style={[styles.row, styles.windArrowContainer]}>
                  <Icon
                    name="wind-arrow-0"
                    style={styles.windArrowIcon}
                  />
                  <Text style={[styles.text, { color: colors.hourListText }]}>
                    {t('infoBottomSheet.windArrows.arrow0')}
                  </Text>
                </View>
                <View style={[styles.row, styles.windArrowContainer]}>
                  <Icon
                    name="wind-arrow-1"
                    style={styles.windArrowIcon}
                  />
                  <Text style={[styles.text, { color: colors.hourListText }]}>
                    {t('infoBottomSheet.windArrows.arrow1')}
                  </Text>
                </View>
                <View style={[styles.row, styles.windArrowContainer]}>
                  <Icon
                    name="wind-arrow-2"
                    style={styles.windArrowIcon}
                  />
                  <Text style={[styles.text, { color: colors.hourListText }]}>
                    {t('infoBottomSheet.windArrows.arrow2')}
                  </Text>
                </View>
                <View style={[styles.row, styles.windArrowContainer]}>
                  <Icon
                    name="wind-arrow-3"
                    style={styles.windArrowIcon}
                  />
                  <Text style={[styles.text, { color: colors.hourListText }]}>
                    {t('infoBottomSheet.windArrows.arrow3')}
                  </Text>
                </View>
                <View style={[styles.row, styles.windArrowContainer]}>
                  <Icon
                    name="wind-arrow-4"
                    style={styles.windArrowIcon}
                  />
                  <Text style={[styles.text, { color: colors.hourListText }]}>
                    {t('infoBottomSheet.windArrows.arrow4')}
                  </Text>
                </View>
                <View style={[styles.row, styles.windArrowContainer]}>
                  <Icon
                    name="wind-arrow-5"
                    style={styles.windArrowIcon}
                  />
                  <Text style={[styles.text, { color: colors.hourListText }]}>
                    {t('infoBottomSheet.windArrows.arrow5')}
                  </Text>
                </View>
                <View style={[styles.row, styles.windArrowContainer]}>
                  <Icon
                    name="wind-arrow-6"
                    style={styles.windArrowIcon}
                  />
                  <Text style={[styles.text, { color: colors.hourListText }]}>
                    {t('infoBottomSheet.windArrows.arrow6')}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {layer?.legend?.hasTemperatureShort && (
          <View style={styles.withMarginBottom}>
            <View>
              <Text style={[styles.text, { color: colors.hourListText }]}>
                {t('infoBottomSheet.temperature.layerInfo.short')}
              </Text>
            </View>
          </View>
        )}
        {layer?.legend?.hasTemperatureLong && (
          <View style={styles.withMarginBottom}>
            <View>
              <Text style={[styles.text, { color: colors.hourListText }]}>
                {t('infoBottomSheet.temperature.layerInfo.long')}
              </Text>
            </View>
          </View>
        )}
        {(layer?.legend?.hasTemperatureShort ||
          layer?.legend?.hasTemperatureLong) && (
          <View>
            <View style={styles.sheetTitle}>
              <Text style={[styles.title, { color: colors.text }]}>
                {t('infoBottomSheet.temperature.title')}
              </Text>
            </View>
            <View>
              <Text style={[styles.text, { color: colors.hourListText }]}>
                {t('infoBottomSheet.temperature.description')}
              </Text>
            </View>
            <View style={styles.rowWrapper}>
              <TemperatureLegend />
            </View>
          </View>
        )}

        {layerId === 7 && timeseriesEnabled && (
          <View>
            <Text style={[styles.text, { color: colors.hourListText }]}>
              {t('infoBottomSheet.timeseriesLayerInfo')}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  sheetTitle: {
    flexDirection: 'row',
    paddingBottom: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowWrapper: {
    paddingBottom: 28,
    paddingTop: 15,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  column: {
    flexDirection: 'column',
  },
  text: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
  },
  title: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
  },
  rainContainer: {
    justifyContent: 'space-around',
    marginBottom: 5,
  },
  lightningsContainer: {
    marginBottom: 5,
  },
  lightningIcon: {
    marginRight: 10,
  },
  windArrowContainer: {
    marginBottom: 5,
  },
  windArrowIcon: {
    alignContent: 'center',
    marginRight: 10,
    minWidth: 30,
  },
  rainBlock: {
    flexGrow: 1,
    height: 8,
    margin: 1,
  },
  withMarginBottom: {
    marginBottom: 28,
  },
});

export default LegacyInfo;
