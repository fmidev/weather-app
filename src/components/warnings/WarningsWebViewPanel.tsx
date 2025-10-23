import React, { useRef, useState } from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { WebView } from 'react-native-webview';
import { useTheme } from '@react-navigation/native';
import 'react-native-url-polyfill/auto';
import { Config } from '@config';
import PanelHeader from '@components/weather/common/PanelHeader';
import { CustomTheme } from '@assets/colors';

const ALLOWED_HOSTS = ['cdn.fmi.fi'];

type WarningsWebViewPanelProps = {
  updateInterval: number;
};

const InvalidURLView = () => (
  <Text>Invalid webview URL blocked</Text>
)

const WarningsWebViewPanel: React.FC<WarningsWebViewPanelProps> = ({
  updateInterval
}) => {
  const [viewHeight, setViewHeight] = useState<number>(2000);
  const { dark } = useTheme() as CustomTheme;
  const webViewRef = useRef(null);
  const { i18n, t } = useTranslation('warnings');
  const locale = ['en', 'fi', 'sv'].includes(i18n.language)
    ? i18n.language
    : 'en';

  const { webViewUrl } = Config.get('warnings');

  if (!webViewUrl) {
    return null;
  }

  // Check that hostname is allowed

  let hostname: string | null = null;
  try {
    hostname = new URL(webViewUrl).hostname;
  } catch (error) {
    console.error("Invalid webview URL:", error);
    return <InvalidURLView />;
  }

  if (!hostname || !ALLOWED_HOSTS.includes(hostname)) {
    return <InvalidURLView />
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
      <script type="module" src="${webViewUrl}/index.js" refresh-interval="${updateInterval}"></script>
      <script>
        const resizeObserver = new ResizeObserver(entries => {
          const height = entries[0].target.clientHeight;
          window.ReactNativeWebView.postMessage(height.toString());
        });
        resizeObserver.observe(document.body);
      </script>
    </body>
  </html>`;

  return (
    <View>
      <PanelHeader title={`${t('allWarnings')}`} justifyCenter />
      <WebView
        testID="warnings_webview"
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
