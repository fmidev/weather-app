import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@react-navigation/native';

import Text from '@components/common/AppText';
import Icon from '@assets/Icon';
import AccessibleTouchableOpacity from '@components/common/AccessibleTouchableOpacity';

import { State } from '@store/types';
import {selectAnimationSpeed } from '@store/map/selectors';
import {
  updateAnimationSpeed as updateAnimationSpeedAction,
} from '@store/map/actions';

import { GRAY_1, CustomTheme } from '@assets/colors';
import { trackMatomoEvent } from '@utils/matomo';

const mapStateToProps = (state: State) => ({
  animationSpeed: selectAnimationSpeed(state)
});

const mapDispatchToProps = {
  updateAnimationSpeed: updateAnimationSpeedAction,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

type SpeedSelectorProps = PropsFromRedux;

const animationSpeedOptions  = [
  { label: 'Slow', value: 80 },
  { label: 'Normal', value: 50 },
  { label: 'Fast', value: 30 },
];

const SpeedSelector: React.FC<SpeedSelectorProps> = ({
  animationSpeed,
  updateAnimationSpeed,
}) => {
  const { t } = useTranslation();

  const { colors } = useTheme() as CustomTheme;
  return (
    <View testID="map_speed_selector" style={[
      styles.rowWrapper,
      styles.row,
      styles.centered,
      styles.withBorderBottom,
      { borderBottomColor: colors.border },
    ]}>
      { animationSpeedOptions.map((option) => (
        <AccessibleTouchableOpacity
          key={option.label}
          accessibilityRole="button"
          accessibilityLabel={t(`map:layersBottomSheet:${option.label}`)}
          accessibilityState={{ selected: option.value === animationSpeed }}
          accessibilityHint={
            option.value === animationSpeed
              ? ''
              : t('map:layersBottomSheet:selectSpeedAccessibilityHint')
          }
          onPress={() => {
            if (option.value === animationSpeed) return;
            trackMatomoEvent('User action', 'Map', `Animation speed ${option.label} selected`);
            updateAnimationSpeed(option.value);
          }}>
          <View style={styles.column}>
            <Text
              maxFontSizeMultiplier={1.5}
              style={[styles.text, { color: colors.hourListText }]}
            >
              {t(`map:layersBottomSheet:${option.label}`)}
            </Text>
            <Icon
              name={
                option.value === animationSpeed
                  ? 'radio-button-on'
                  : 'radio-button-off'
              }
              style={{
                color: option.value === animationSpeed ? colors.primary : GRAY_1,
              }}
            />
          </View>
        </AccessibleTouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
    flexShrink: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    width: '100%',
  },
  rowWrapper: {
    marginBottom: 14,
  },
  column: {
    alignItems: 'center',
  },
  withBorderBottom: {
    borderBottomWidth: 1,
  },
  centered: {
    justifyContent: 'space-around',
  },
});

export default connector(SpeedSelector);
