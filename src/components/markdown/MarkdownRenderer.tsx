import React, { ReactNode } from 'react';
import { View, StyleSheet, type TextStyle, Linking } from 'react-native';
import { Renderer, type RendererInterface } from 'react-native-marked';

import Icon from '@components/common/ScalableIcon';
import Text from '@components/common/AppText';
import { trackMatomoEvent } from '@utils/matomo';
import TemperatureLegend from './TemperatureLegend';
import type { AnalyticActions } from '@config';
import AccessibleTouchableOpacity from '@components/common/AccessibleTouchableOpacity';
import packageJSON from '../../../package.json';

const HEX_RE = /^#[0-9a-fA-F]{6}$/;
const ICON_TOKEN_RE = /\[icon:([a-z0-9-]+)(?:\|(\d+)(?:\|(\d+))?)?\]/g;
const CUSTOM_LEGEND_TOKEN_RE = /\[((?:radar-legend|legend):[^\]]+)\]\(([^)]+)\)/g;
const TEMPERATURE_LEGEND_TOKEN = '[temperature-legend]';
const URL_WITH_SCHEME_RE = /^(https?:\/\/|mailto:|tel:)/i;

type ParsedTrackedLink = {
  url: string;
  action?: string;
};

function parseColors(raw: string): string[] {
  return raw
    .replace(/^(?:radar-legend|legend):/, '')
    .split(',')
    .map((s) => s.trim())
    .filter((c) => HEX_RE.test(c));
}

const parseLabels = (raw: string) => {
  const normalized = raw.replace(/^\//, ''); // remove leading "/" added by markdown link normalization

  let decoded = normalized;
  try {
    decoded = decodeURIComponent(normalized);
  } catch {
    decoded = normalized;
  }

  return decoded
    .split('|')
    .map((s) => s.trim())
    .filter(Boolean);
};

const parseTrackedLink = (rawHref: string): ParsedTrackedLink | null => {
  if (!rawHref) return null;

  const parts = rawHref.split('|').map((s) => s.trim());
  const [rawUrl, ...actionParts] = parts;
  if (!rawUrl) return null;

  const normalizedUrl = rawUrl.startsWith('/') && URL_WITH_SCHEME_RE.test(rawUrl.slice(1))
    ? rawUrl.slice(1)
    : rawUrl;

  return {
    url: normalizedUrl,
    action: actionParts.join('|') || undefined,
  };
};

function RadarScaleLegend(props: Readonly<{
  colors: string[];
  labels: string[];
  accessibilityLabel: string;
  textStyle?: TextStyle;
}>) {
  const { colors, labels, accessibilityLabel, textStyle } = props;

  const left = labels[0] ?? '';
  const center =
    labels.length >= 2
      ? labels[Math.floor((labels.length - 1) / 2)]
      : '';
  const right = labels.length >= 3 ? labels[labels.length - 1] : '';

  return (
    <View style={styles.legendRoot} accessible accessibilityRole="text">
      <View
        style={styles.scaleRow}
        accessibilityLabel={accessibilityLabel}
      >
        {colors.map((c, i) => (
          <View
            key={`${c}-${i}`}
            style={[styles.scaleSegment, { backgroundColor: c }]}
          />
        ))}
      </View>

      <View style={styles.labelsRow}>
        <Text style={[styles.labelText, textStyle]} numberOfLines={1}>
          {left}
        </Text>
        <Text style={[styles.labelText, textStyle]} numberOfLines={1}>
          {center}
        </Text>
        <Text style={[styles.labelText, textStyle]} numberOfLines={1}>
          {right}
        </Text>
      </View>
    </View>
  );
}

function IconInline(props: Readonly<{
  name: string;
  width?: number;
  height?: number;
  textStyle?: TextStyle;
}>) {
  const { name, width = 16, height = 16, textStyle } = props;

  if (!Icon) {
    // Fallback: show the token name as text (or return null if you prefer)
    return (
      <Text style={[styles.text, textStyle]}>
        [{name}]
      </Text>
    );
  }

  return (
    <View style={styles.iconInlineRow} accessible accessibilityRole="text">
      <View style={styles.iconWrap}>
        <Icon name={name} width={width} height={height} />
      </View>
    </View>
  );
}

export class MarkdownRenderer extends Renderer implements RendererInterface {
  private readonly textStyle?: TextStyle;

  private textColor?: string;

  private headingColor?: string;

  private keyCounter = 0;

  private t?: (text: string) => string;

  constructor(options?: { textStyle?: TextStyle }) {
    super();
    this.textStyle = options?.textStyle;
  }

  private nextKey() {
    this.keyCounter += 1;
    return `md-custom-${this.keyCounter}`;
  }

  setTextColor(color: string) {
    this.textColor = color;
  }

  setHeadingColor(color: string) {
    this.headingColor = color;
  }

  setTranslationFunction(t: (text: string) => string) {
    this.t = t;
  }

  heading = (children: string | ReactNode[], stylesOverride?: TextStyle, level?: number) => {
    const size =
      level === 1 ? 24 :
      level === 2 ? 22 :
      level === 3 ? 20 :
      level === 4 ? 18 :
      level === 5 ? 16 : 15;

    return (
      <Text
        key={this.nextKey()}
        style={[
          styles.heading,
          { fontSize: size },
          this.headingColor ? { color: this.headingColor } : null,
          this.textStyle,
        ]}
        accessibilityRole="header"
      >
        {React.Children.toArray(children)}
      </Text>
    );
  };

  text = (text: string) => {
    if (
      !text.includes('[icon:')
      && !text.includes(TEMPERATURE_LEGEND_TOKEN)
      && !text.includes('[radar-legend:')
      && !text.includes('[legend:')
    ) {
      return <Text
        key={this.nextKey()}
        style={[styles.text, this.textStyle, this.textColor ? { color: this.textColor } : null]}>
          {text}
        </Text>;
    }

    const nodes: React.ReactNode[] = [];
    let rest = text;
    let tokenIndex = 0;

    while (rest.length > 0) {
      ICON_TOKEN_RE.lastIndex = 0;
      CUSTOM_LEGEND_TOKEN_RE.lastIndex = 0;
      const iconMatch = ICON_TOKEN_RE.exec(rest);
      const radarLegendMatch = CUSTOM_LEGEND_TOKEN_RE.exec(rest);
      const legendIndex = rest.indexOf(TEMPERATURE_LEGEND_TOKEN);

      const nextIconIndex = iconMatch ? iconMatch.index : -1;
      const nextRadarLegendIndex = radarLegendMatch ? radarLegendMatch.index : -1;
      const nextLegendIndex = legendIndex;

      if (nextIconIndex === -1 && nextLegendIndex === -1 && nextRadarLegendIndex === -1) {
        nodes.push(
          <Text
            key={`txt-end-${tokenIndex}`}
            style={[styles.text, this.textStyle, this.textColor ? { color: this.textColor } : null]}
          >
            {rest}
          </Text>
        );
        break;
      }

      const nextTokenIndex = [nextIconIndex, nextLegendIndex, nextRadarLegendIndex]
        .filter((index) => index !== -1)
        .sort((a, b) => a - b)[0];

      const useLegend = nextTokenIndex === nextLegendIndex;
      const useRadarLegend = nextTokenIndex === nextRadarLegendIndex;

      if (nextTokenIndex > 0) {
        nodes.push(
          <Text
            key={`txt-${tokenIndex}`}
            style={[styles.text, this.textStyle, this.textColor ? { color: this.textColor } : null]}
          >
            {rest.slice(0, nextTokenIndex)}
          </Text>
        );
      }

      if (useLegend) {
        nodes.push(
          <View key={`temperature-legend-${tokenIndex}`} style={styles.blockToken}>
            <TemperatureLegend />
          </View>
        );
        rest = rest.slice(nextTokenIndex + TEMPERATURE_LEGEND_TOKEN.length);
      } else if (useRadarLegend && radarLegendMatch) {
        const [, rawColors, rawLabels] = radarLegendMatch;
        const colors = parseColors(rawColors);
        const labels = parseLabels(rawLabels);

        if (colors.length >= 2) {
          const textStyle = this.textColor ? {
            ...this.textStyle,
            color: this.textColor,
          } : this.textStyle;

          nodes.push(
            <RadarScaleLegend
              key={`radar-legend-${tokenIndex}`}
              colors={colors}
              labels={labels}
              accessibilityLabel={this.t ? this.t('markdownRenderer.radarLegendDescription') : ''}
              textStyle={textStyle}
            />
          );
        } else {
          nodes.push(
            <Text
              key={`radar-legend-fallback-${tokenIndex}`}
              style={[styles.text, this.textStyle, this.textColor ? { color: this.textColor } : null]}
            >
              {radarLegendMatch[0]}
            </Text>
          );
        }

        rest = rest.slice(nextTokenIndex + radarLegendMatch[0].length);
      } else if (iconMatch) {
        const [, name, widthRaw, heightRaw] = iconMatch;
        const width = widthRaw ? Number(widthRaw) : undefined;
        const height = heightRaw ? Number(heightRaw) : width;

        nodes.push(
          <IconInline
            key={`icon-${tokenIndex}`}
            name={String(name)}
            width={width}
            height={height}
            textStyle={this.textStyle}
          />
        );
        rest = rest.slice(nextTokenIndex + iconMatch[0].length);
      }

      tokenIndex += 1;
    }

    return <View key={this.nextKey()} style={styles.inlineContainer}>{nodes}</View>;
  };

  link = (children: string | ReactNode[], href: string) => {
    const contentText =
      typeof children === 'string' ? children : undefined;

    if (contentText?.startsWith('radar-legend:') || contentText?.startsWith('legend:')) {
      const colors = parseColors(contentText);
      const labels = parseLabels(href);

      const textStyle = this.textColor ? {
        ...this.textStyle,
        color: this.textColor,
      } : this.textStyle;

      if (colors.length >= 2) {
        return (
          <RadarScaleLegend
            key={this.nextKey()}
            colors={colors}
            labels={labels}
            accessibilityLabel={this.t ? this.t('markdownRenderer.radarLegendDescription') : ''}
            textStyle={textStyle}
          />
        );
      }
    }

    const trackedLink = parseTrackedLink(href);
    const linkChildren = React.Children.toArray(children);

    const onPress = () => {
      if (!trackedLink?.url) {
        return;
      }

      let { url } = trackedLink;

      if (url.startsWith('mailto:')) {
        url = url.replace('{version}', packageJSON.version);
      }

      if (trackedLink.action) {
        trackMatomoEvent(
          'User action',
          trackedLink.action as AnalyticActions,
          `Open URL - ${url}`
        );
      }

      Linking.openURL(url).catch(() => {});
    };

    return (
      <AccessibleTouchableOpacity
        key={trackedLink?.url || this.nextKey()}
        accessibilityRole="link"
        accessibilityHint={this.t ? this.t('markdonwRenderer.openInBrowser') : undefined}
        onPress={onPress}
      >
        <View
          style={[styles.link, { borderBottomColor: this.headingColor }]}>
          <Text
            maxFontSizeMultiplier={1.5}
            style={[
              styles.linkText,
              {
                color: this.textColor,
              },
            ]}>
            {linkChildren}
          </Text>
          { !trackedLink?.url.startsWith('mailto:') && (
            <Icon
              name="open-in-new"
              color={this.textColor}
              width={18}
              height={18}
              maxFontSizeMultiplier={1.5}
            />
          )}
        </View>
      </AccessibleTouchableOpacity>
    );
  };
}

const styles = StyleSheet.create({
  text: {
    fontFamily: 'Roboto-Regular',
    fontSize: 15,
    lineHeight: 20
  },
  heading: {
    fontFamily: 'Roboto-Bold',
    marginVertical: 8,
  },
  legendRoot: {
    marginVertical: 6
  },
  scaleRow: {
    flexDirection: 'row',
    width: '100%',
    height: 10,
    borderRadius: 4,
    overflow: 'hidden',
  },
  scaleSegment: {
    flex: 1
  },
  labelsRow: {
    width: '100%',
    marginTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  labelText: {
    fontSize: 13,
    lineHeight: 18
  },
  inlineContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    rowGap: 6,
    columnGap: 0,
  },
  iconInlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    marginHorizontal: 4,
  },
  blockToken: {
    width: '100%',
  },
  link: {
    padding: 4,
    borderBottomWidth: 2,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkText: {
    fontFamily: 'Roboto-Bold',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
