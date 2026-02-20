import React from 'react';
import { StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import Text from '@components/common/AppText';
import { CustomTheme, RED } from '@assets/colors';
import CommonPanelHeader from '@components/common/PanelHeader';
import { useTheme } from '@react-navigation/native';

type PanelHeaderProps = {
  title: string;
  accessibleTitle?: string;
  lastUpdated?: { time?: string; ageCheck?: boolean };
  accessibleLastUpdated?: string;
  justifyCenter?: boolean;
  thin?: boolean;
  background?: string;
};

const PanelHeader: React.FC<PanelHeaderProps> = ({
  title,
  accessibleTitle,
  lastUpdated,
  accessibleLastUpdated,
  justifyCenter,
  thin,
  background,
}) => {
  const { t } = useTranslation('forecast');
  const { colors } = useTheme() as CustomTheme;
  const accessibilityLabel = accessibleLastUpdated || lastUpdated?.time
    ? `${accessibleTitle || title}, ${t('updated')} ${accessibleLastUpdated || lastUpdated?.time}`
    : title;

  const lastUpdatedComponent = lastUpdated?.time && (
    <Text
      accessibilityLabel={accessibilityLabel}
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
      accessibilityLabel={accessibilityLabel}
      additionalContent={lastUpdatedComponent}
      justifyCenter={justifyCenter}
      thin={thin}
      background={background}
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
