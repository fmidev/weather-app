import React, { memo } from 'react';
import HeaderButton from '@components/common/HeaderButton';
import CommonHeaderTitle from '@components/common/CommonHeaderTitle';

type TFn = (key: string) => string;

export const LocationHeaderLeft = memo(function LocateHeaderLeft({
  t,
  onPress,
}: {
  t: TFn;
  onPress: () => void;
}) {
  return (
    <HeaderButton
      title={t('navigation:locate')}
      accessibilityLabel={t('navigation:locate')}
      accessibilityHint={t('navigation:locateAccessibilityLabel')}
      icon="locate"
      onPress={onPress}
    />
  );
});

export const LocationHeaderTitle = memo(function LocationHeaderTitle({
  onPress,
}: {
  onPress: () => void;
}) {
  return <CommonHeaderTitle onPress={onPress} />;
});

export const LocationHeaderRight = memo(function LocateHeaderRight({
  t,
  onPress,
}: {
  t: TFn;
  onPress: () => void;
}) {
  return (
    <HeaderButton
      testID="search_header_button"
      title={t('navigation:search')}
      accessibilityLabel={t('navigation:search')}
      accessibilityHint={t('navigation:searchAccessibilityLabel')}
      icon="search"
      onPress={onPress}
      right
    />
  );
});