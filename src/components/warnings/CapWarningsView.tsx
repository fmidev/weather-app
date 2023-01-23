import React from 'react';
import { View } from 'react-native';
import PanelHeader from '@components/common/PanelHeader';
import { useTranslation } from 'react-i18next';

function CapWarningsView() {
  const { t } = useTranslation('warnings');

  return (
    <View>
      <View>
        <PanelHeader title={t('panelTitle')} justifyCenter />
      </View>
    </View>
  );
}

export default CapWarningsView;
