import React, { Fragment, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@react-navigation/native';
import { connect, ConnectedProps } from 'react-redux';
import Markdown from 'react-native-marked';

import { State } from '@store/types';
import { selectActiveOverlay } from '@store/map/selectors';
import { getLayerDocumentation } from '@network/MarkdownApi';
import { useTranslation } from 'react-i18next';
import { Config } from '@config';
import { MarkdownRenderer } from '@components/markdown/MarkdownRenderer';
import Skeleton from '@components/common/Skeleton';
import type { WMSSource } from '@config';
import type { CustomTheme } from '@assets/colors';

const mapStateToProps = (state: State) => ({
  activeOverlay: selectActiveOverlay(state),
});

const connector = connect(mapStateToProps);

type MarkdownLayerInfoProps = ConnectedProps<typeof connector>;

const renderer = new MarkdownRenderer();

const MarkdownLayerInfo: React.FC<MarkdownLayerInfoProps> = ({activeOverlay}) => {
  const { t, i18n } = useTranslation('map');
  const locale = i18n.language;
  const { layers } = Config.get('map');

  const [loading, setLoading] = useState(true);
  const [markdown, setMarkdown] = useState('');

  const { colors } = useTheme() as CustomTheme;

  renderer.setHeadingColor(colors.text);
  renderer.setTextColor(colors.primaryText);
  renderer.setTranslationFunction(t);

  useEffect(() => {
    const fetchMarkdown = async (layer: string) => {
      setLoading(true);
      try {
        const doc = await getLayerDocumentation(layer, locale);
        setMarkdown(doc);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching markdown documentation:', error);
        setMarkdown('');
        setLoading(false);
      }
    }

    for (const layer of layers) {
      if (layer.id === activeOverlay) {
        const source = layer.sources[0] as WMSSource;
        if (source.layer) fetchMarkdown(source.layer);
        if (layer.type === 'Timeseries') fetchMarkdown('timeseries');
        break;
      }
    }
  }, [activeOverlay, layers, locale]);

  if (loading) {
    return (
      <View style={styles.skeletonContainer}>
        {[...Array(3)].map((_, i) => (
          <Fragment key={i}>
            <Skeleton width="100%" height={20} radius={10} />
            <View style={styles.skeletonSpacer} />
            <Skeleton width="100%" height={160} radius={10} />
            <View style={styles.skeletonSpacer} />
          </Fragment>
        ))}
      </View>
    );
  }

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.container}>
      { markdown ? (
        <Markdown
          value={markdown}
          renderer={renderer}
          flatListProps={{
            style: {
              backgroundColor: colors.background,
            },
          }}
        />
      ) : (
        <Text>{t('infoBottomSheet.markdownLoadingFailed')}</Text>
      )}
    </SafeAreaView>
  );
}

export default connector(MarkdownLayerInfo);

const styles = StyleSheet.create({
  skeletonContainer: {
    margin: 8,
  },
  skeletonSpacer: {
    height: 8,
  },
  container: {
    flex: 1,
  }
});
