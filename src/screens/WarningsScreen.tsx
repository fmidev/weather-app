import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { WebView } from 'react-native-webview';
import { useTheme, useIsFocused } from '@react-navigation/native';
import { CustomTheme } from '@utils/colors';
import { Config } from '@config';

const WarningsScreen: React.FC = () => {
  const { colors } = useTheme() as CustomTheme;
  const [updated, setUpdated] = useState<number>(Date.now());
  const webViewRef = useRef(null);
  const isFocused = useIsFocused();
  const { i18n } = useTranslation('forecast');
  const locale = ['en', 'fi', 'sv'].includes(i18n.language)
    ? i18n.language
    : 'en';

  const { webViewUrl } = Config.get('warnings');

  useEffect(() => {
    const now = Date.now();
    if (isFocused && now > updated + 5 * 60 * 1000) {
      const script = `
      document.getElementById('fmi-warnings').__vue__.update();
      true;
      `;
      // @ts-ignore
      webViewRef?.current?.injectJavaScript(script);
      setUpdated(now);
    }
  }, [isFocused, updated]);

  if (!webViewUrl) {
    return null;
  }

  const injectedJavaScript = `(function() {
    const meta = document.createElement('meta');
    meta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1');
    meta.setAttribute('name', 'viewport');
    document.getElementsByTagName('head')[0].appendChild(meta);

    const style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = '\
      body { background-color: ${colors.screenBackground} !important; margin: 0px !important; margin-top: 12px !important; } \
      #fmi-warnings { padding: 0px !important; margin:  0px !important; } \
      @media (max-width: 575px) {.date-selector-cell-header { background-color: ${colors.screenBackground} !important; } } \
      .nav-tabs > .nav-item:first-of-type .date-selector-text { border-top-left-radius: 10px !important; } \
      .nav-tabs > .nav-item:last-of-type .date-selector-text { border-top-right-radius: 10px !important; } \
      .header-region, .symbol-list { padding-left: 5px !important} \
      .data-providers > span { font-size: 12px !important } \
    ';
    document.getElementsByTagName('head')[0].appendChild(style);
    })();`;

  const uri = `${webViewUrl}/index.${locale}.html`;

  return (
    <View
      style={[styles.container, { backgroundColor: colors.screenBackground }]}>
      <WebView
        ref={webViewRef}
        source={{ uri }}
        showsVerticalScrollIndicator={false}
        injectedJavaScript={injectedJavaScript}
        onMessage={() => {}}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
  },
});

export default WarningsScreen;
