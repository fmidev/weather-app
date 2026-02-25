import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Markdown from 'react-native-marked';

import { MarkdownRenderer } from '@components/markdown/MarkdownRenderer';
import { CustomTheme } from '@assets/colors';
import AccessibilityStatement from '@components/others/AccessibilityStatement';
import { Config } from '@config';
import { accessibilityDocuments } from '@assets/markdown';

const renderer = new MarkdownRenderer();

const AccessibilityScreen: React.FC = () => {
  const { i18n } = useTranslation();
  const { colors } = useTheme() as CustomTheme;
  const { markdown } = Config.get('settings');

  renderer.setHeadingColor(colors.text);
  renderer.setTextColor(colors.primaryText);

  return (
    <View
      testID="accessibility_view"
      style={[styles.container, { backgroundColor: colors.background }]}>
      { markdown?.accessibility ? (
        <Markdown
          value={
            accessibilityDocuments[i18n.language as keyof typeof accessibilityDocuments]
            || accessibilityDocuments.en
          }
          renderer={renderer}
          flatListProps={{
            style: {
              backgroundColor: colors.background,
              padding: 16,
            },
          }}
        />
      ) :
        <AccessibilityStatement />
      }
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default AccessibilityScreen;
