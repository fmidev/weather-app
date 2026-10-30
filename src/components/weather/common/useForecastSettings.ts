import { useCallback, useContext, useLayoutEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import RBSheet from 'react-native-raw-bottom-sheet';

import { ScreenHeaderItemsContext } from '@navigators/ScreenHeaderItemsContext';
import { usesVerticalBarLayout } from '@utils/hooks';
import { trackMatomoEvent } from '@utils/matomo';

const useForecastSettings = (displayFormat: string) => {
  const { t } = useTranslation('forecast');
  const setHeaderItems = useContext(ScreenHeaderItemsContext);
  const verticalBarLayout = usesVerticalBarLayout();
  const showInHeader = verticalBarLayout && setHeaderItems !== null;
  const paramSheetRef = useRef<RBSheet>(null);
  const weatherInfoSheetRef = useRef<RBSheet>(null);
  const disabled = displayFormat === 'chart';

  const openParameters = useCallback(() => {
    trackMatomoEvent('User action', 'Weather', 'Open forecast parameter settings');
    paramSheetRef.current?.open();
  }, []);

  const openInfo = useCallback(() => {
    trackMatomoEvent('User action', 'Weather', 'Open forecast info bottomsheet');
    weatherInfoSheetRef.current?.open();
  }, []);

  useLayoutEffect(() => {
    if (!setHeaderItems) return;

    setHeaderItems(
      showInHeader
        ? [
            {
              type: 'button',
              label: t('paramsAccessibilityLabel'),
              accessibilityLabel: t('paramsAccessibilityLabel'),
              accessibilityHint: t('paramsBottomSheet.subTitle'),
              icon: { type: 'sfSymbol', name: 'slider.horizontal.3' },
              disabled,
              onPress: openParameters,
            },
            {
              type: 'button',
              label: t('infoAccessibilityLabel'),
              accessibilityLabel: t('infoAccessibilityLabel'),
              accessibilityHint: t('infoAccessibilityHint'),
              icon: { type: 'sfSymbol', name: 'info.circle' },
              disabled: false,
              onPress: openInfo,
            },
          ]
        : []
    );

    return () => setHeaderItems([]);
  }, [disabled, openInfo, openParameters, setHeaderItems, showInHeader, t]);

  return {
    paramSheetRef,
    weatherInfoSheetRef,
    openParameters,
    openInfo,
  };
};

export default useForecastSettings;
