import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

import { CustomTheme, RED } from '@assets/colors';
import CommonPanelHeader from '@components/common/PanelHeader';
import { useTheme } from '@react-navigation/native';

type PanelHeaderProps = {
  title: string;
  lastUpdated?: { time?: string; ageCheck?: boolean };
  justifyCenter?: boolean;
  thin?: boolean;
};

const PanelHeader: React.FC<PanelHeaderProps> = ({
  title,
  lastUpdated,
  justifyCenter,
  thin,
}) => {
  const { t } = useTranslation('forecast');
  const { colors } = useTheme() as CustomTheme;

  const lastUpdatedComponent = lastUpdated?.time && (
    <Text
      style={[
        styles.updatedText,
        { color: lastUpdated.ageCheck ? RED : colors.primaryText },
      ]}>
      {t('updated')} <Text style={styles.bold}>{lastUpdated.time}</Text>
    </Text>
  );

  return (
    <CommonPanelHeader
      title={title}
      additionalContent={lastUpdatedComponent}
      justifyCenter={justifyCenter}
      thin={thin}
    />
  );
};

const styles = StyleSheet.create({
  updatedText: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
  },
  bold: {
    fontFamily: 'Roboto-Bold',
  },
});

export default PanelHeader;
