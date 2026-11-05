import React, { useCallback, useRef, useState } from 'react';
import {
  StyleSheet,
  AccessibilityInfo,
  findNodeHandle,
  type TextInstance,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useTheme,
  useNavigation,
  useFocusEffect,
} from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import Markdown from 'react-native-marked';

import { MarkdownRenderer } from '@components/markdown/MarkdownRenderer';
import { CustomTheme } from '@assets/colors';
import { Config } from '@config';
import { accessibilityDocuments } from '@assets/markdown';
import type { OthersStackParamList } from '@navigators/stacks/types';

const AccessibilityScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme() as CustomTheme;
  const navigation =
    useNavigation<StackNavigationProp<OthersStackParamList, 'Accessibility'>>();
  const headingRef = useRef<TextInstance>(null);
  const focusState = useRef({
    active: false,
    laidOut: false,
    transitionComplete: false,
    focused: false,
  });
  const focusFrame = useRef<number | null>(null);

  const focusHeading = useCallback(() => {
    const state = focusState.current;
    if (
      !state.active ||
      !state.laidOut ||
      !state.transitionComplete ||
      state.focused ||
      focusFrame.current !== null
    )
      return;
    focusFrame.current = requestAnimationFrame(() => {
      focusFrame.current = null;
      if (
        !state.active ||
        !state.transitionComplete ||
        state.focused ||
        !headingRef.current
      )
        return;
      const reactTag = findNodeHandle(headingRef.current);
      if (reactTag != null) {
        state.focused = true;
        AccessibilityInfo.setAccessibilityFocus(reactTag);
      }
    });
  }, []);

  const [renderer] = useState(
    () =>
      new MarkdownRenderer({
        headingRef,
        onHeadingLayout: () => {
          focusState.current.laidOut = true;
          focusHeading();
        },
      })
  );

  useFocusEffect(
    useCallback(() => {
      const state = focusState.current;
      state.active = true;
      state.focused = false;
      const unsubscribeStart = navigation.addListener('transitionStart', () => {
        state.transitionComplete = false;
      });
      const unsubscribeEnd = navigation.addListener(
        'transitionEnd',
        ({ data }) => {
          if (!data.closing) {
            state.transitionComplete = true;
            focusHeading();
          }
        }
      );
      // Returning from another tab may not start a new stack transition.
      focusHeading();
      return () => {
        state.active = false;
        unsubscribeStart();
        unsubscribeEnd();
        if (focusFrame.current !== null) {
          cancelAnimationFrame(focusFrame.current);
          focusFrame.current = null;
        }
      };
    }, [navigation, focusHeading])
  );
  const accessibilityFeedback = Config.get('feedback')?.accessibility;
  const feedbackEmail = accessibilityFeedback?.[i18n.language];

  renderer.setHeadingColor(colors.text);
  renderer.setTextColor(colors.primaryText);
  renderer.setTranslationFunction(t);

  renderer.setAccessibilityEmail(feedbackEmail?.email ?? '');
  renderer.setAccessibilitySubject(feedbackEmail?.subject ?? '');

  return (
    <SafeAreaView
      testID="accessibility_view"
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['left', 'right']}>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default AccessibilityScreen;
