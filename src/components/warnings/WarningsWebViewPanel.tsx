import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { WebView } from 'react-native-webview';
import { useIsFocused } from '@react-navigation/native';
import { Config } from '@config';
import { useReloader } from '@utils/reloader';
import PanelHeader from '@components/weather/common/PanelHeader';

const WarningsWebViewPanel: React.FC = () => {
  const { shouldReload } = useReloader();
  const [updated, setUpdated] = useState<number>(Date.now());
  const [viewHeight, setViewHeight] = useState<number>(2000);
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

  const injectedJavaScript = `(function() {
    const meta = document.createElement('meta');
    meta.setAttribute('content', 'width=device-width, user-scalable=no, initial-scale=1, maximum-scale=1');
    meta.setAttribute('name', 'viewport');
    document.getElementsByTagName('head')[0].appendChild(meta);

    const style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = '\
      body { margin: 0 !important } \
      .container-fluid { margin-top: 0 !important } \
      .day-region-views > h3 { display: none } \
      .header-region, .symbol-list { padding-left: 5px !important} \
      ';
    document.getElementsByTagName('head')[0].appendChild(style);
    const resizeObserver = new ResizeObserver(entries => window.ReactNativeWebView.postMessage(entries[0].target.clientHeight));
    resizeObserver.observe(document.body);
  })();`;

  const uri = `${webViewUrl}/index.${locale}.html`;

  return (
    <View style={{ height: viewHeight }}>
      <PanelHeader title={`${t('allWarnings')}`} />
      <WebView
        ref={webViewRef}
        source={{ uri }}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
        injectedJavaScript={injectedJavaScript}
        onMessage={(event) => {
          setViewHeight(Number(event.nativeEvent.data) || 2000);
        }}
      />
    </View>
  );
};

export default WarningsWebViewPanel;
