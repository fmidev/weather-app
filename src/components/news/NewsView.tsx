import React from 'react';
import { View, Text, StyleSheet, Linking, useWindowDimensions } from 'react-native';
import FastImage from '@d11/react-native-fast-image';
import moment from 'moment';
import SimpleButton from '@components/common/SimpleButton';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@react-navigation/native';
import { CustomTheme } from '@assets/colors';
import AccessibleTouchableOpacity from '@components/common/AccessibleTouchableOpacity';
import type { NewsItem } from '@store/news/types';

type NewsProps = {
  item: NewsItem;
  titleNumberOfLines?: number;
  gridLayout?: boolean;
}

const MAX_IMAGE_WIDTH = 512;
const DEFAULT_IMAGE = require('@assets/images/press-release-default.webp');

const NewsView: React.FC<NewsProps> = ({ item, titleNumberOfLines, gridLayout }) => {
  const { colors } = useTheme() as CustomTheme;
  const { t, i18n } = useTranslation('news');
  const { width } = useWindowDimensions();
  const dateFormat = 'D.M.YYYY';
  const dateAndTimeFormat = 'D.M.YYYY HH:mm';
  const titleHeight = titleNumberOfLines ? titleNumberOfLines * 20 : null;

  const openLink = async (type: string, id: string) => {
    const urlPrefix = i18n.language === 'fi' ? 'www' : i18n.language;
    let url = `https://${urlPrefix}.ilmatieteenlaitos.fi/${t(type).toLowerCase()}/${id}?referrer=fmi-mobile-app`;
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    } else {
      console.log(`Don't know how to open URI: ${url}`);
    }
  };

  // some devices may have float values as width => round value
  const imageWidth = Math.min(Math.round(width), MAX_IMAGE_WIDTH);

  return (
    // eslint-disable-next-line react-native/no-inline-styles
    <View style={[styles.container, gridLayout ? { paddingHorizontal: 4 } : {}]}>
      <Text style={
        [styles.meta, {color: colors.primaryText }]
      }>
        {`${t(item.type)} ${moment(item.createdAt).format(dateFormat)}`}
        { item.createdAt.substring(0, 10) !== item.updatedAt.substring(0,10) && item.showEditedDateTime &&
        ` (${t('updated')} ${moment(item.updatedAt).format(dateAndTimeFormat)})`}
      </Text>
      <Text
        numberOfLines={titleNumberOfLines}
        style={[styles.title, {color: colors.primaryText }, titleHeight ? { height: titleHeight } : {}]}
        accessibilityRole="header">
        {item.title}
      </Text>
      <AccessibleTouchableOpacity
        accessibilityRole="imagebutton"
        accessibilityLabel={item.imageAlt}
        accessibilityHint={t('readMore')}
        onPress={() => { openLink(item.type, item.id) }}
      >
        <FastImage
          style={styles.image}
          source={
            item.imageUrl
              ? {
                  uri: `${item.imageUrl}?w=${imageWidth}`,
                  cache: FastImage.cacheControl.immutable,
                }
              : DEFAULT_IMAGE
          }
        />
      </AccessibleTouchableOpacity>
      <SimpleButton
        accessibilityHint={t('readMore')}
        onPress={() => { openLink(item.type, item.id) }}
        text={t('readMore')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 8,
  },
  meta: {
    fontSize: 15,
    fontFamily: 'Roboto-Medium',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
    marginBottom: 8,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 8,
  }
});

export default NewsView;
