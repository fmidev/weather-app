import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import Markdown from 'react-native-marked';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import Text from '@components/common/AppText';
import { MarkdownRenderer } from '@components/markdown/MarkdownRenderer';
import { Config } from '@config';
import { aboutTheApplicationDocuments } from '@assets/markdown';
import packageJSON from '../../package.json';
import type { CustomTheme } from '@assets/colors';

const renderer = new MarkdownRenderer();

const AboutScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme() as CustomTheme;
  const { markdown } = Config.get('settings');

  renderer.setHeadingColor(colors.text);
  renderer.setTextColor(colors.primaryText);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      { markdown?.aboutTheApplication ? (
        <View style={styles.markdownContainer}>
         <Markdown
            value={
              aboutTheApplicationDocuments[i18n.language as keyof typeof aboutTheApplicationDocuments]
              || aboutTheApplicationDocuments.en
            }
            renderer={renderer}
            flatListProps={{
              style: {
                backgroundColor: colors.background,
              },
            }}
          />
          <Text
            style={[styles.text, styles.versionInfo, { color: colors.text }]}
            testID="about_version_info">
            {`${t('about:versionInfo')}: ${packageJSON.version}`}
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}>
          <Text
            accessibilityRole="header"
            style={[styles.title, { color: colors.text }]}
          >
            {t('about:title')}
          </Text>
          <Text style={[styles.text, { color: colors.text }]}>
            {t('about:body')}
          </Text>
          <Text
            style={[styles.text, { color: colors.text }]}
            testID="about_version_info">
            {`${t('about:versionInfo')}: ${packageJSON.version}`}
          </Text>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  markdownContainer: {
    padding: 16,
  },
  versionInfo: {
    marginTop: 16,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
    marginTop: 32,
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
    marginBottom: 16,
  },
});

export default AboutScreen;
