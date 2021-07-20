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

import Icon from './Icon';

import CloseButton from './CloseButton';

import { images, WeatherSymbol } from '../assets/images';
import { PRIMARY_BLUE, SECONDARY_BLUE, LIGHT_BLUE } from '../utils/colors';

type InfoBottomSheetProps = {
  onClose: () => void;
};
const InfoBottomSheet: React.FC<InfoBottomSheetProps> = ({ onClose }) => {
  const { t } = useTranslation('map');
  const [viewAll, setViewAll] = useState(false);

  const symbolsArr = Object.entries(images.symbols).map(([key, value]) => ({
    key,
    ...value,
  }));

  const symbolRowRenderer = ({ item }: { item: WeatherSymbol }) => (
    <View style={styles.listRow}>
      <Image style={styles.image} source={item.day} />
      <Text style={styles.text}>{t(`symbols:${item.key}`)}</Text>
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
        <Text style={styles.title}>
          {t('map:infoBottomSheet:weatherSymbolsTitle')}
        </Text>
      </View>
      <View style={[styles.rowWrapper, styles.withBorderBottom]}>
        <FlatList
          style={styles.list}
          // TODO: sort by real weather observations and then slice
          data={!viewAll ? symbolsArr.slice(0, 3) : symbolsArr}
          keyExtractor={({ key }) => key}
          renderItem={symbolRowRenderer}
        />
        <TouchableOpacity onPress={() => setViewAll(!viewAll)}>
          {viewAll ? (
            <View style={[styles.row, styles.showMoreText]}>
              <Icon
                name="arrow-up"
                style={{ color: SECONDARY_BLUE }}
                width={22}
                height={22}
              />
              <Text style={[styles.title, styles.showMoreText]}>
                {t('map:infoBottomSheet:showLess')}
              </Text>
            </View>
          ) : (
            <View style={[styles.row, styles.showMoreText]}>
              <Icon
                name="arrow-down"
                style={{ color: SECONDARY_BLUE }}
                width={22}
                height={22}
              />
              <Text style={[styles.title, styles.showMoreText]}>
                {t('map:infoBottomSheet:showMore')}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      <View style={styles.sheetTitle}>
        <Text style={styles.title}>
          {t('map:infoBottomSheet:rainRadarTitle')}
        </Text>
      </View>
      <View style={styles.rowWrapper}>
        <View style={[styles.row, styles.rainContainer]}>
          <View style={styles.rainBlock} />
          <View style={styles.rainBlock} />
          <View style={styles.rainBlock} />
          <View style={styles.rainBlock} />
          <View style={styles.rainBlock} />
        </View>
        <View style={styles.sheetTitle}>
          <Text style={styles.rainTitle}>{t('map:infoBottomSheet:light')}</Text>
          <Text style={styles.rainTitle}>
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
    borderColor: LIGHT_BLUE,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  showMoreText: {
    color: SECONDARY_BLUE,
    alignSelf: 'center',
  },
  text: {
    fontSize: 16,
    color: PRIMARY_BLUE,
    maxWidth: '88%',
  },
  title: {
    fontSize: 16,
    color: PRIMARY_BLUE,
    fontWeight: 'bold',
  },
  image: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    margin: 8,
  },
  rainContainer: {
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  rainBlock: {
    width: '19%',
    height: 8,
    backgroundColor: SECONDARY_BLUE,
    marginRight: 2,
  },
  rainTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: PRIMARY_BLUE,
  },
});

export default InfoBottomSheet;
