import React from 'react';
import { SafeAreaView, View, StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@react-navigation/native';

import { Config } from '@config';

import CloseButton from '@components/common/CloseButton';

import { CustomTheme } from '@utils/colors';

type InfoBottomSheetProps = {
  onClose: () => void;
};
const InfoBottomSheet: React.FC<InfoBottomSheetProps> = ({ onClose }) => {
  const { t } = useTranslation('map');
  const { colors } = useTheme() as CustomTheme;
  const { layers } = Config.get('map');

  const timeseriesEnabled = layers.some((layer) => layer.type === 'Timeseries');
  return (
    <SafeAreaView style={styles.wrapper}>
      <View style={styles.sheetListContainer}>
        <View style={styles.closeButtonContainer}>
          <CloseButton
            onPress={onClose}
            accessibilityLabel={t('infoBottomSheet.closeAccessibilityLabel')}
          />
        </View>

        <View style={styles.sheetTitle}>
          <Text style={[styles.title, { color: colors.text }]}>
            {t('infoBottomSheet.mapLayersInfoTitle')}
          </Text>
        </View>
        <View>
          <Text style={[styles.text, { color: colors.hourListText }]}>
            {t('infoBottomSheet.rainRadarInfo')}
          </Text>
        </View>
        <View style={styles.rowWrapper}>
          <View style={[styles.row, styles.rainContainer]}>
            <View
              style={[styles.rainBlock, { backgroundColor: colors.rain[1] }]}
            />
            <View
              style={[styles.rainBlock, { backgroundColor: colors.rain[2] }]}
            />
            <View
              style={[styles.rainBlock, { backgroundColor: colors.rain[3] }]}
            />
            <View
              style={[styles.rainBlock, { backgroundColor: colors.rain[4] }]}
            />
            <View
              style={[styles.rainBlock, { backgroundColor: colors.rain[5] }]}
            />
            <View
              style={[styles.rainBlock, { backgroundColor: colors.rain[6] }]}
            />
            <View
              style={[styles.rainBlock, { backgroundColor: colors.rain[7] }]}
            />
            <View
              style={[styles.rainBlock, { backgroundColor: colors.rain[8] }]}
            />
          </View>
          <View style={styles.sheetTitle}>
            <Text style={[styles.text, { color: colors.hourListText }]}>
              {t('map:infoBottomSheet:light')}
            </Text>
            <Text style={[styles.text, { color: colors.hourListText }]}>
              {t('map:infoBottomSheet:moderate')}
            </Text>
            <Text style={[styles.text, { color: colors.hourListText }]}>
              {t('map:infoBottomSheet:strong')}
            </Text>
          </View>
        </View>
        <View style={styles.withMarginBottom}>
          <Text style={[styles.text, { color: colors.hourListText }]}>
            {t('infoBottomSheet.mapLayersInfo')}
          </Text>
        </View>
        {timeseriesEnabled && (
          <View>
            <Text style={[styles.text, { color: colors.hourListText }]}>
              {t('infoBottomSheet.timeseriesLayerInfo')}
            </Text>
          </View>
        )}
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
    paddingHorizontal: 20,
  },
  closeButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
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
  rainBlock: {
    flexGrow: 1,
    height: 8,
    margin: 1,
  },
  withMarginBottom: {
    marginBottom: 28,
  },
});

export default InfoBottomSheet;
