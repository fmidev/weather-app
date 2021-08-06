import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@react-navigation/native';

import Icon from './Icon';

import CloseButton from './CloseButton';

import { images, WeatherSymbol } from '../assets/images';
import {
  RAIN_1,
  RAIN_2,
  RAIN_3,
  RAIN_4,
  RAIN_5,
  RAIN_6,
  RAIN_7,
} from '../utils/colors';

type InfoBottomSheetProps = {
  onClose: () => void;
};
const InfoBottomSheet: React.FC<InfoBottomSheetProps> = ({ onClose }) => {
  const { t } = useTranslation('map');
  const { colors } = useTheme();
  const [viewAll, setViewAll] = useState(false);

  const symbolsArr = Object.entries(images.symbols).map(([key, value]) => ({
    key,
    ...value,
  }));

  const symbolRowRenderer = ({ item }: { item: WeatherSymbol }) => (
    <View style={styles.listRow}>
      <Image style={styles.image} source={item.day} />
      <Text style={[styles.text, { color: colors.text }]}>
        {t(`symbols:${item.key}`)}
      </Text>
    </View>
  );

  return (
    <View style={styles.sheetListContainer}>
      <View style={styles.closeButtonContainer}>
        <CloseButton
          onPress={onClose}
          accessibilityLabel={t('map:infoBottomSheet:closeAccessibilityLabel')}
        />
      </View>
      <View style={styles.sheetTitle}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t('map:infoBottomSheet:weatherSymbolsTitle')}
        </Text>
      </View>
      <View
        style={[
          styles.rowWrapper,
          styles.withBorderBottom,
          { borderBottomColor: colors.border },
        ]}>
        <FlatList
          style={styles.list}
          // TODO: sort by real weather observations and then slice
          data={!viewAll ? symbolsArr.slice(0, 3) : symbolsArr}
          keyExtractor={({ key }) => key}
          renderItem={symbolRowRenderer}
          showsVerticalScrollIndicator={false}
        />
        <TouchableOpacity onPress={() => setViewAll(!viewAll)}>
          {viewAll ? (
            <View style={[styles.row, styles.showMoreText]}>
              <Text
                style={[
                  styles.title,
                  styles.showMoreText,
                  { color: colors.text },
                ]}>
                {t('map:infoBottomSheet:showLess')}
              </Text>
              <Icon
                name="arrow-up"
                style={{ color: colors.text }}
                width={22}
                height={22}
              />
            </View>
          ) : (
            <View style={[styles.row, styles.showMoreText]}>
              <Text
                style={[
                  styles.title,
                  styles.showMoreText,
                  { color: colors.text },
                ]}>
                {t('map:infoBottomSheet:showMore')}
              </Text>
              <Icon
                name="arrow-down"
                style={{ color: colors.text }}
                width={22}
                height={22}
              />
            </View>
          )}
        </TouchableOpacity>
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
          <View
            style={[
              styles.rainBlock,
              styles.lastBlock,
              { backgroundColor: RAIN_7 },
            ]}
          />
        </View>
        <View style={styles.sheetTitle}>
          <Text style={[styles.rainTitle, { color: colors.text }]}>
            {t('map:infoBottomSheet:light')}
          </Text>
          <Text style={[styles.rainTitle, { color: colors.text }]}>
            {t('map:infoBottomSheet:moderate')}
          </Text>
          <Text style={[styles.rainTitle, { color: colors.text }]}>
            {t('map:infoBottomSheet:strong')}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sheetListContainer: {
    flex: 1,
    marginTop: -10,
    paddingHorizontal: 20,
  },
  list: {
    paddingHorizontal: 12,
    maxHeight: 460,
  },
  listRow: {
    flexDirection: 'row',
    paddingBottom: 10,
    alignItems: 'center',
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
  withBorderBottom: {
    borderBottomWidth: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  showMoreText: {
    alignSelf: 'center',
  },
  text: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
    maxWidth: '88%',
  },
  title: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
  },
  image: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    margin: 8,
  },
  rainContainer: {
    justifyContent: 'space-around',
    marginBottom: 5,
  },
  rainBlock: {
    flexGrow: 1,
    height: 8,
    borderWidth: 1,
    borderRightWidth: 0,
  },
  lastBlock: {
    borderRightWidth: 1,
  },
  rainTitle: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
  },
});

export default InfoBottomSheet;
