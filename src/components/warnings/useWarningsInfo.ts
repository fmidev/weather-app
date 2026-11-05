import { useCallback, useContext, useLayoutEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import RBSheet from 'react-native-raw-bottom-sheet';

import { ScreenHeaderItemsContext } from '@navigators/ScreenHeaderItemsContext';
import { usesVerticalBarLayout } from '@utils/hooks';
import { trackMatomoEvent } from '@utils/matomo';

const useWarningsInfo = (enabled = true) => {
  const { t } = useTranslation('warnings');
  const setHeaderItems = useContext(ScreenHeaderItemsContext);
  const verticalBarLayout = usesVerticalBarLayout();
  const infoSheetRef = useRef<RBSheet>(null);
  const openInfo = useCallback(() => {
    trackMatomoEvent('User action', 'Warnings', 'Open warnings info panel');
    infoSheetRef.current?.open();
  }, []);

  useLayoutEffect(() => {
    if (!setHeaderItems) return;

    setHeaderItems(
      verticalBarLayout && enabled
        ? [
            {
              type: 'button',
              label: t('infoAccessibilityLabel'),
              accessibilityLabel: t('infoAccessibilityLabel'),
              icon: { type: 'sfSymbol', name: 'info.circle' },
              onPress: openInfo,
            },
          ]
        : []
    );

    return () => setHeaderItems([]);
  }, [enabled, openInfo, setHeaderItems, t, verticalBarLayout]);

  return { infoSheetRef, openInfo };
};

export default useWarningsInfo;
