import React, { Fragment, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@react-navigation/native';
import { Text } from 'react-native';
import { connect, ConnectedProps } from 'react-redux';
import { MotiView, View } from 'moti';
import { Skeleton } from 'moti/skeleton';
import Markdown from 'react-native-marked';

import { State } from '@store/types';
import { selectActiveOverlay } from '@store/map/selectors';
import { getLayerDocumentation } from '@network/MarkdownApi';
import { useTranslation } from 'react-i18next';
import { Config } from '@config';
import { MarkdownRenderer } from './MarkdownRenderer';
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

  const { dark, colors } = useTheme() as CustomTheme;
  const colorMode = dark ? 'dark' : 'light';

  renderer.setHeadingColor(colors.text);
  renderer.setTextColor(colors.primaryText);

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
      <MotiView style={styles.moti}>
        {[...Array(3)].map((_, i) => (
          <Fragment key={i}>
            <Skeleton colorMode={colorMode} width={'100%'} height={20} radius={10} />
            <View style={styles.motiSpacer} />
            <Skeleton colorMode={colorMode} width={'100%'} height={160} radius={10} />
            <View style={styles.motiSpacer} />
          </Fragment>
        ))}
      </MotiView>
    );
  }

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.container}>
      { markdown ? (
        <Markdown value={markdown} renderer={renderer} />
      ) : (
        <Text>{t('infoBottomSheet.markdownLoadingFailed')}</Text>
      )}
    </SafeAreaView>
  );
}

export default connector(MarkdownLayerInfo);

const styles = StyleSheet.create({
  moti: {
    margin: 8,
  },
  motiSpacer: {
    height: 8,
  },
  container: {
    flex: 1,
  }
});