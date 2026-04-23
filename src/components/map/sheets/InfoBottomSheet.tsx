import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Config } from '@config';
import CloseButton from '@components/common/CloseButton';
import LegacyLayerInfo from '../ui/LegacyLayerInfo';
import MarkdownLayerInfo from '../ui/MarkdownLayerInfo';

type InfoBottomSheetProps = {
  onClose: () => void;
};

const InfoBottomSheet: React.FC<InfoBottomSheetProps> = ({ onClose }) => {
  const { t } = useTranslation('map');
  const { infoBottomSheet } = Config.get('map');
  const markdownUrl = infoBottomSheet?.url;

  return (
    <View testID="info_bottom_sheet" style={styles.wrapper}>
      <View style={styles.sheetListContainer}>
        <View style={styles.closeButtonContainer}>
          <CloseButton
            testID="info_bottom_sheet_close_button"
            maxScaleFactor={1.5}
            onPress={onClose}
            accessibilityLabel={t('infoBottomSheet.closeAccessibilityLabel')}
          />
        </View>
        {markdownUrl ? (
          <MarkdownLayerInfo />
        ) : (
          <LegacyLayerInfo />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  sheetListContainer: {
    flex: 1,
    marginTop: -10,
    paddingHorizontal: 20,
  },
  closeButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});

export default InfoBottomSheet;
