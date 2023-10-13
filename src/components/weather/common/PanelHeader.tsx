import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

import { RED, WHITE } from '@utils/colors';
import CommonPanelHeader from '@components/common/PanelHeader';

type PanelHeaderProps = {
  title: string;
  lastUpdated?: { time?: string; ageCheck?: boolean };
  justifyCenter?: boolean;
};

const PanelHeader: React.FC<PanelHeaderProps> = ({
  title,
  lastUpdated,
  justifyCenter,
}) => {
  const { t } = useTranslation('forecast');

  const lastUpdatedComponent = lastUpdated?.time && (
    <Text
      style={[
        styles.updatedText,
        { color: lastUpdated.ageCheck ? RED : WHITE },
      ]}>
      {t('updated')} <Text style={styles.bold}>{lastUpdated.time}</Text>
    </Text>
  );

  return (
    <CommonPanelHeader
      title={title}
      additionalContent={lastUpdatedComponent}
      justifyCenter={justifyCenter}
    />
  );
};

const styles = StyleSheet.create({
  updatedText: {
    fontSize: 14,
    fontFamily: 'Roboto-Light',
  },
  bold: {
    fontFamily: 'Roboto-Light',
  },
});

export default PanelHeader;
