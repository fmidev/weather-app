import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { View, StyleSheet, useWindowDimensions } from 'react-native';

import { Config } from '@config';
import { State } from '@store/types';
import { selectLoading, selectError, selectNews } from '@store/news/selector';
import Text from '@components/common/AppText';
import Skeleton from '@components/common/Skeleton';
import PanelHeader from '@components/common/PanelHeader';
import { useTranslation } from 'react-i18next';
import NewsView from './NewsView';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const mapStateToProps = (state: State) => ({
  loading: selectLoading(state),
  error: selectError(state),
  news: selectNews(state),
});

const connector = connect(mapStateToProps, {});

type NewsProps = ConnectedProps<typeof connector>;

const News: React.FC<NewsProps> = ({
  loading,
  error,
  news,
}) => {
  const { width} = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation('news');
  const { enabled, numberOfNews, apiUrl } = Config.get('news');
  const isWideDisplay = () => width > 700;

  if (!enabled || !apiUrl[i18n.language]) {
    return null;
  }

  if (loading && (!news || news.length === 0)) {
    return (
      <View style={{
        marginLeft: insets.left + 16,
        marginRight: insets.right + 16
      }}>
        <PanelHeader title={t('title')} news />
        { new Array(numberOfNews).fill(null).map((_, index) => (
          <View style={styles.newsBox} key={index}>
            <Skeleton width="100%" height={200} radius={10} />
          </View>
        ))}
      </View>
    );
  }

  if (error || !news) {
    return (
      <View style={{
        marginLeft: insets.left + 16,
        marginRight: insets.right + 16
      }}>
        <PanelHeader title={t('title')} news />
        <Text>{t('error')}</Text>
      </View>
    )
  }

  if (news) {
    return (
      <View style={{
        marginLeft: insets.left + 16,
        marginRight: insets.right + 16
      }}>
        <PanelHeader title={t('title')} news />
        { !isWideDisplay() ?
          news.map((item) => <NewsView item={item} key={item.id} />)
        : (
          <View style={styles.grid}>
          { news.map((item) => (
            <View style={styles.gridItem} key={item.id}>
            <NewsView item={item} titleNumberOfLines={2} gridLayout />
            </View>
          ))}
          </View>
        )}
      </View>
    )
  }

  return null;
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem: {
    width: '50%',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  newsBox: {
    margin: 16,
    minHeight: 150,
    borderRadius: 10,
  },
});

export default connector(News);
