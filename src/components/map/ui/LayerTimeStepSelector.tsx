import React from 'react';
import { StyleSheet, View } from 'react-native';
import { connect, ConnectedProps } from 'react-redux';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AccessibleTouchableOpacity from '@components/common/AccessibleTouchableOpacity';
import Text from '@components/common/AppText';
import { Config } from '@config';
import { CustomTheme } from '@assets/colors';
import { BOLD_FONT } from '@assets/constants';
import { State } from '@store/types';
import { selectActiveOverlay } from '@store/map/selectors';
import { updateActiveOverlay as updateActiveOverlayAction } from '@store/map/actions';
import { trackMatomoEvent } from '@utils/matomo';

const mapStateToProps = (state: State) => ({
  activeOverlay: selectActiveOverlay(state),
});

const mapDispatchToProps = {
  updateActiveOverlay: updateActiveOverlayAction,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type Props = ConnectedProps<typeof connector>;

const LayerTimeStepSelector: React.FC<Props> = ({
  activeOverlay,
  updateActiveOverlay,
}) => {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme() as CustomTheme;
  const insets = useSafeAreaInsets();
  const { layers, layerGroups = [] } = Config.get('map');
  const activeGroup = layerGroups.find((group) =>
    group.layers.includes(activeOverlay)
  );
  const groupLayers = (
    activeGroup?.layers.flatMap((layerId) => {
      const layer = layers.find((item) => item.id === layerId);
      return layer ? [layer] : [];
    }) ?? []
  ).sort((a, b) => a.times.timeStep - b.times.timeStep);

  if (groupLayers.length < 2) return null;

  const numberFormatter = new Intl.NumberFormat(i18n.language, {
    maximumFractionDigits: 2,
  });

  return (
    <View
      testID="map_layer_time_step_selector"
      pointerEvents="box-none"
      style={[styles.wrapper, { left: insets.left + 12 }]}>
      {groupLayers.map((layer, index) => {
        const { timeStep } = layer.times;
        const timeButton = layer.timeButton?.[i18n.language];
        const label = timeButton?.label ?? numberFormatter.format(timeStep);
        const accessibilityLabel =
          timeButton?.accessibilityLabel ??
          t('map:timeStepSelector:minutesAccessibilityLabel', {
            count: timeStep,
          });
        const isSelected = layer.id === activeOverlay;

        return (
          <AccessibleTouchableOpacity
            key={layer.id}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel}
            accessibilityState={{ selected: isSelected }}
            accessibilityHint={
              isSelected
                ? ''
                : t('map:timeStepSelector:selectAccessibilityHint')
            }
            style={[
              styles.button,
              index === 0 && styles.firstButton,
              isSelected && styles.selectedButton,
              {
                backgroundColor: colors.mapButtonBackground,
                borderColor: isSelected
                  ? colors.primary
                  : colors.mapButtonBorder,
              },
            ]}
            onPress={() => {
              if (isSelected) return;
              trackMatomoEvent(
                'User action',
                'Map',
                `Layer ${layer.id} time step ${timeStep} selected`
              );
              updateActiveOverlay(layer.id);
            }}>
            <Text
              maxFontSizeMultiplier={1.5}
              style={[
                styles.text,
                {
                  color: isSelected ? colors.primary : colors.hourListText,
                },
              ]}>
              {label}
            </Text>
          </AccessibleTouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 124,
    flexDirection: 'row',
  },
  button: {
    minWidth: 52,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 3,
  },
  firstButton: {
    marginLeft: 0,
  },
  selectedButton: {
    borderWidth: 2,
  },
  text: {
    fontSize: 16,
    fontFamily: BOLD_FONT,
  },
});

export default connector(LayerTimeStepSelector);
