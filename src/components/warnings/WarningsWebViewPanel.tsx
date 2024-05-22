import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { WebView } from 'react-native-webview';
import { useIsFocused, useTheme } from '@react-navigation/native';
import { Config } from '@config';
import { useReloader } from '@utils/reloader';
import PanelHeader from '@components/weather/common/PanelHeader';
import { CustomTheme } from '@utils/colors';

const WarningsWebViewPanel: React.FC = () => {
  const { shouldReload } = useReloader();
  const [updated, setUpdated] = useState<number>(Date.now());
  const [viewHeight, setViewHeight] = useState<number>(2000);
  const { dark } = useTheme() as CustomTheme;
  const webViewRef = useRef(null);
  const isFocused = useIsFocused();
  const { i18n, t } = useTranslation('warnings');
  const locale = ['en', 'fi', 'sv'].includes(i18n.language)
    ? i18n.language
    : 'en';

  const { webViewUrl, updateInterval } = Config.get('warnings');

  useEffect(() => {
    const now = Date.now();
    const timeToUpdate = updated + (updateInterval ?? 5) * 60 * 1000;
    if (isFocused && (now > timeToUpdate || shouldReload > timeToUpdate)) {
      const script = `
      document.getElementById('fmi-warnings').__vue__.update();
      true;
      `;
      // @ts-ignore
      webViewRef?.current?.injectJavaScript(script);
      setUpdated(now);
    }
  }, [isFocused, updated, shouldReload, updateInterval]);

  if (!webViewUrl) {
    return null;
  }

  const html = `<!doctype html>
  <html lang="${locale}">
    <head>
      <meta charset="UTF-8" />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
      <title>SmartMet Alert Client</title>
    </head>

    <body>
      <smartmet-alert-client language="${locale}" theme="${
    dark ? 'dark' : 'light'
  }" gray-scale-selector="true"></smartmet-alert-client>
      <script type="module" src="${webViewUrl}/index.js"></script>
      <script>
        const resizeObserver = new ResizeObserver(entries => window.ReactNativeWebView.postMessage(entries[0].target.clientHeight));
        resizeObserver.observe(document.body);
      </script>
    </body>
  </html>`;

  return (
    <View>
      <PanelHeader title={`${t('allWarnings')}`} justifyCenter />
      <WebView
        ref={webViewRef}
        style={{ height: viewHeight, backgroundColor: `transparent` }}
        source={{ html }}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
        onMessage={(event) => {
          setViewHeight(Number(event.nativeEvent.data) || 2000);
        }}
      />
    </View>
  );
};

export default WarningsWebViewPanel;
