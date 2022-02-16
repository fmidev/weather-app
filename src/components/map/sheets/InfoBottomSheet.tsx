import React from 'react';
import { SafeAreaView, View, StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@react-navigation/native';

import CloseButton from '@components/common/CloseButton';

import {
  CustomTheme,
  RAIN_1,
  RAIN_2,
  RAIN_3,
  RAIN_4,
  RAIN_5,
  RAIN_6,
  RAIN_7,
} from '@utils/colors';

type InfoBottomSheetProps = {
  onClose: () => void;
};
const InfoBottomSheet: React.FC<InfoBottomSheetProps> = ({ onClose }) => {
  const { t } = useTranslation('map');
  const { colors } = useTheme() as CustomTheme;
  return (
    <SafeAreaView style={styles.wrapper}>
      <View style={styles.sheetListContainer}>
        <View style={styles.closeButtonContainer}>
          <CloseButton
            onPress={onClose}
            accessibilityLabel={t(
              'map:infoBottomSheet:closeAccessibilityLabel'
            )}
          />
        </View>

        <View style={styles.sheetTitle}>
          <Text style={[styles.title, { color: colors.text }]}>
            {t('map:infoBottomSheet:rainRadarTitle')}
          </Text>
        </View>
        <View style={styles.rowWrapper}>
          <View style={[styles.row, styles.rainContainer]}>
            <View style={[styles.rainBlock, { backgroundColor: RAIN_1 }]} />
            <View style={[styles.rainBlock, { backgroundColor: RAIN_2 }]} />
            <View style={[styles.rainBlock, { backgroundColor: RAIN_3 }]} />
            <View style={[styles.rainBlock, { backgroundColor: RAIN_4 }]} />
            <View style={[styles.rainBlock, { backgroundColor: RAIN_5 }]} />
            <View style={[styles.rainBlock, { backgroundColor: RAIN_6 }]} />
            <View style={[styles.rainBlock, { backgroundColor: RAIN_7 }]} />
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
        <View>
          <Text style={[styles.text, { color: colors.hourListText }]}>
            {t('infoBottomSheet.rainRadarInfo')}
          </Text>
        </View>
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
    marginBottom: 14,
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
});

export default InfoBottomSheet;
