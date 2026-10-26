import './screenTestMocks';

import React from 'react';
import type { Text as RNText } from 'react-native';
import { act, render } from '@testing-library/react-native';

import AccessibilityScreen from '../../src/screens/AccessibilityScreen';
import { MarkdownRenderer } from '@components/markdown/MarkdownRenderer';
import { mockState, mockNavigation, mockUseFocusEffect, mockConfigGet, resetScreenMocks } from './screenTestMocks';

type RendererOptions = NonNullable<ConstructorParameters<typeof MarkdownRenderer>[0]>;
const ReactNative = require('react-native') as typeof import('react-native');
const mockTransitionListeners = new Map<string, (event: { data: { closing: boolean } }) => void>();
const mockFrames = new Map<number, FrameRequestCallback>();
let mockNextFrame = 0;
const getRendererOptions = (): RendererOptions => jest.mocked(MarkdownRenderer).mock.calls[0][0]!;
const getRenderer = (): jest.Mocked<MarkdownRenderer> => jest.mocked(MarkdownRenderer).mock.results[0].value;
const accessibilityFeedback = {
  fi: { email: 'saavutettavuus@example.test', subject: 'Saavutettavuuspalaute' },
  sv: { email: 'tillganglighet@example.test', subject: 'Tillgänglighetsrespons' },
  en: { email: 'accessibility@example.test', subject: 'Accessibility feedback' },
};
const configureFeedback = (accessibility: Partial<typeof accessibilityFeedback> | undefined) => {
  mockConfigGet.mockImplementation((key: string) => (key === 'feedback' ? {
    email: 'general-feedback@example.test',
    subject: { fi: 'General feedback fi', sv: 'General feedback sv', en: 'General feedback en' },
    accessibility,
  } : {}));
};
const layoutHeading = () => {
  const options = getRendererOptions();
  options.headingRef!.current = {} as RNText;
  act(() => options.onHeadingLayout!());
};
const finishTransition = (closing = false) => act(() => {
  mockTransitionListeners.get('transitionEnd')?.({ data: { closing } });
});
const flushFrames = () => act(() => {
  const callbacks = [...mockFrames.values()];
  mockFrames.clear();
  callbacks.forEach((callback) => callback(0));
});

describe('AccessibilityScreen', () => {
  beforeEach(() => {
    resetScreenMocks();
    mockTransitionListeners.clear();
    mockFrames.clear();
    mockUseFocusEffect.mockImplementation((callback) => {
      const focused = mockState.focused;
      React.useEffect(() => (focused ? callback() : undefined), [callback, focused]);
    });
    mockNavigation.addListener.mockImplementation((event: string, callback: any) => {
      mockTransitionListeners.set(event, callback);
      return () => mockTransitionListeners.delete(event);
    });
    jest.spyOn(ReactNative, 'findNodeHandle').mockReturnValue(42);
    jest.spyOn(ReactNative.AccessibilityInfo, 'setAccessibilityFocus').mockImplementation(() => {});
    jest.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((callback) => {
      mockNextFrame += 1;
      mockFrames.set(mockNextFrame, callback);
      return mockNextFrame;
    });
    jest.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation((id) => {
      if (id != null) mockFrames.delete(id);
    });
  });

  afterEach(() => jest.restoreAllMocks());

  it('renders markdown accessibility content by default', () => {
    const { getByTestId } = render(<AccessibilityScreen />);

    expect(getByTestId('accessibility_view')).toBeTruthy();
    expect(getByTestId('markdown').props.children).toBe('accessibility markdown en');
  });

  it.each(['fi', 'sv', 'en'])('renders localized accessibility markdown (%s)', (language) => {
    mockState.language = language;
    const { getByTestId } = render(<AccessibilityScreen />);

    expect(getByTestId('markdown').props.children).toBe(`accessibility markdown ${language}`);
  });

  it('falls back to English when the current language has no document', () => {
    mockState.language = 'unknown';

    const { getByTestId } = render(<AccessibilityScreen />);

    expect(getByTestId('markdown').props.children).toBe(
      'accessibility markdown en'
    );
  });

  it.each([
    ['fi', 'saavutettavuus@example.test', 'Saavutettavuuspalaute'],
    ['sv', 'tillganglighet@example.test', 'Tillgänglighetsrespons'],
    ['en', 'accessibility@example.test', 'Accessibility feedback'],
  ])('passes the configured accessibility email and subject to the renderer (%s)', (language, email, subject) => {
    configureFeedback(accessibilityFeedback);
    mockState.language = language;
    render(<AccessibilityScreen />);

    expect(mockConfigGet).toHaveBeenCalledWith('feedback');
    expect(getRenderer().setAccessibilityEmail).toHaveBeenCalledWith(email);
    expect(getRenderer().setAccessibilitySubject).toHaveBeenCalledWith(subject);
  });

  it.each(['missing locale', 'missing accessibility configuration'])(
    'passes empty accessibility values without using general feedback or another locale (%s)', (missing) => {
      configureFeedback(missing === 'missing locale' ? { en: accessibilityFeedback.en } : undefined);
      mockState.language = 'sv';
      render(<AccessibilityScreen />);

      expect(getRenderer().setAccessibilityEmail).toHaveBeenCalledWith('');
      expect(getRenderer().setAccessibilitySubject).toHaveBeenCalledWith('');
    }
  );

  it('updates localized accessibility values on language change and clears them for a missing locale', () => {
    configureFeedback(accessibilityFeedback);
    mockState.language = 'fi';
    const screen = render(<AccessibilityScreen />);
    const renderer = getRenderer();
    expect(renderer.setAccessibilityEmail).toHaveBeenLastCalledWith('saavutettavuus@example.test');
    expect(renderer.setAccessibilitySubject).toHaveBeenLastCalledWith('Saavutettavuuspalaute');

    mockState.language = 'sv';
    screen.rerender(<AccessibilityScreen />);
    expect(renderer.setAccessibilityEmail).toHaveBeenLastCalledWith('tillganglighet@example.test');
    expect(renderer.setAccessibilitySubject).toHaveBeenLastCalledWith('Tillgänglighetsrespons');

    mockState.language = 'unknown';
    screen.rerender(<AccessibilityScreen />);
    expect(MarkdownRenderer).toHaveBeenCalledTimes(1);
    expect(renderer.setAccessibilityEmail).toHaveBeenLastCalledWith('');
    expect(renderer.setAccessibilitySubject).toHaveBeenLastCalledWith('');
  });

  it.each(['layout first', 'transition first'])('focuses the title only after layout and opening transition (%s)', (order) => {
    render(<AccessibilityScreen />);
    if (order === 'layout first') layoutHeading();
    else finishTransition();
    flushFrames();
    expect(ReactNative.AccessibilityInfo.setAccessibilityFocus).not.toHaveBeenCalled();

    if (order === 'layout first') finishTransition();
    else layoutHeading();
    flushFrames();
    expect(ReactNative.findNodeHandle).toHaveBeenCalledWith(getRendererOptions().headingRef!.current);
    expect(ReactNative.AccessibilityInfo.setAccessibilityFocus).toHaveBeenCalledWith(42);
  });

  it('does not refocus or replace the renderer on rerenders or repeated layout', () => {
    const screen = render(<AccessibilityScreen />);
    layoutHeading();
    finishTransition();
    flushFrames();
    screen.rerender(<AccessibilityScreen />);
    layoutHeading();
    finishTransition();
    flushFrames();
    expect(MarkdownRenderer).toHaveBeenCalledTimes(1);
    expect(ReactNative.AccessibilityInfo.setAccessibilityFocus).toHaveBeenCalledTimes(1);
  });

  it('cancels pending focus on blur and focuses again when returning without a stack transition', () => {
    const screen = render(<AccessibilityScreen />);
    layoutHeading();
    finishTransition();
    mockState.focused = false;
    screen.rerender(<AccessibilityScreen />);
    flushFrames();
    expect(ReactNative.AccessibilityInfo.setAccessibilityFocus).not.toHaveBeenCalled();
    expect(mockTransitionListeners.size).toBe(0);

    mockState.focused = true;
    screen.rerender(<AccessibilityScreen />);
    flushFrames();
    expect(ReactNative.AccessibilityInfo.setAccessibilityFocus).toHaveBeenCalledTimes(1);
  });

  it('cancels pending focus and removes listeners on unmount', () => {
    const screen = render(<AccessibilityScreen />);
    layoutHeading();
    finishTransition();
    screen.unmount();
    flushFrames();
    expect(ReactNative.AccessibilityInfo.setAccessibilityFocus).not.toHaveBeenCalled();
    expect(mockTransitionListeners.size).toBe(0);
  });

  it('does not focus after a closing transition or without a native heading', () => {
    render(<AccessibilityScreen />);
    layoutHeading();
    finishTransition(true);
    flushFrames();
    expect(ReactNative.AccessibilityInfo.setAccessibilityFocus).not.toHaveBeenCalled();
    finishTransition();
    getRendererOptions().headingRef!.current = null;
    flushFrames();
    expect(ReactNative.AccessibilityInfo.setAccessibilityFocus).not.toHaveBeenCalled();
  });
});
