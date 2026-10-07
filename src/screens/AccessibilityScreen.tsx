import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Markdown from 'react-native-marked';

import { MarkdownRenderer } from '@components/markdown/MarkdownRenderer';
import { CustomTheme } from '@assets/colors';
import { Config } from '@config';
import { accessibilityDocuments } from '@assets/markdown';

const renderer = new MarkdownRenderer();

const AccessibilityScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme() as CustomTheme;
  const accessibilityFeedback = Config.get('feedback')?.accessibility;
  const feedbackEmail = accessibilityFeedback?.[i18n.language];

  renderer.setHeadingColor(colors.text);
  renderer.setTextColor(colors.primaryText);
  renderer.setTranslationFunction(t);

  if (feedbackEmail?.email && feedbackEmail?.subject) {
    renderer.setAccessibilityEmail(feedbackEmail.email);
    renderer.setAccessibilitySubject(feedbackEmail.subject);
  }

  return (
    <View
      testID="accessibility_view"
      style={[styles.container, { backgroundColor: colors.background }]}>
      <Markdown
        value={
          accessibilityDocuments[
            i18n.language as keyof typeof accessibilityDocuments
          ] || accessibilityDocuments.en
        }
        renderer={renderer}
        flatListProps={{
          style: {
            backgroundColor: colors.background,
            padding: 16,
          },
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default AccessibilityScreen;
