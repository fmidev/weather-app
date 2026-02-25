import React, { ReactNode } from 'react';
import { View, StyleSheet, type TextStyle } from 'react-native';
import { Renderer, type RendererInterface } from 'react-native-marked';

import Icon from '@components/common/ScalableIcon';
import Text from '@components/common/AppText';
import TemperatureLegend from './TemperatureLegend';

const HEX_RE = /^#[0-9a-fA-F]{6}$/;
const ICON_TOKEN_RE = /\[icon:([a-z0-9-]+)(?:\|(\d+)(?:\|(\d+))?)?\]/g;
const TEMPERATURE_LEGEND_TOKEN = '[temperature-legend]';

function parseColors(raw: string): string[] {
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter((c) => HEX_RE.test(c));
}

const parseLabels = (raw: string) =>
  raw
    .replace(/^\//, '') // remove leading "/" added by markdown link normalization
    .split('|')
    .map((s) => s.trim())
    .filter(Boolean);

function RadarScaleLegend(props: Readonly<{
  colors: string[];
  labels: string[];
  textStyle?: TextStyle;
}>) {
  const { colors, labels, textStyle } = props;

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
        accessibilityLabel="Sateen voimakkuuden asteikko"
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
      <View style={styles.iconWrap} accessibilityLabel={`Ikoni: ${name}`}>
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
    if (!text.includes('[icon:') && !text.includes(TEMPERATURE_LEGEND_TOKEN)) {
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
      const iconMatch = ICON_TOKEN_RE.exec(rest);
      const legendIndex = rest.indexOf(TEMPERATURE_LEGEND_TOKEN);

      const nextIconIndex = iconMatch ? iconMatch.index : -1;
      const nextLegendIndex = legendIndex;

      if (nextIconIndex === -1 && nextLegendIndex === -1) {
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

      const useLegend =
        nextLegendIndex !== -1 &&
        (nextIconIndex === -1 || nextLegendIndex < nextIconIndex);
      const nextTokenIndex = useLegend ? nextLegendIndex : nextIconIndex;

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

  link = (children: string | ReactNode[], href: string, stylesOverride?: TextStyle) => {
    const contentText =
      typeof children === 'string' ? children : undefined;

    if (contentText?.startsWith('radar-legend:')) {
      const colors = parseColors(contentText);
      const labels = parseLabels(href);

      const textStyle = this.textColor ? { ...this.textStyle, color: this.textColor } : this.textStyle;

      if (colors.length >= 2) {
        return (
          <RadarScaleLegend
            key={this.nextKey()}
            colors={colors}
            labels={labels}
            textStyle={textStyle}
          />
        );
      }
    }

    // Fallback: keep normal "link" appearance
    const mergedStyle: TextStyle | undefined = stylesOverride;

    const fallbackText =
      typeof children === 'string'
        ? children
        : ''; // If children is ReactNode[], you can render it differently if needed.

    return (
      <Text key={this.nextKey()} style={[styles.text, this.textStyle, mergedStyle]}>
        {fallbackText}
      </Text>
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
});
