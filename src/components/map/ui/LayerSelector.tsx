import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@react-navigation/native';

import Text from '@components/common/AppText';
import Icon from '@assets/Icon';
import AccessibleTouchableOpacity from '@components/common/AccessibleTouchableOpacity';

import { State } from '@store/types';
import { selectActiveOverlay, selectMapLayers } from '@store/map/selectors';
import { updateActiveOverlay as updateActiveOverlayAction } from '@store/map/actions';

import { GRAY_1, CustomTheme } from '@assets/colors';
import { trackMatomoEvent } from '@utils/matomo';
import { Config } from '@config';
import { REGULAR_FONT } from '@assets/constants';

const mapStateToProps = (state: State) => ({
  activeOverlay: selectActiveOverlay(state),
  mapLayers: selectMapLayers(state),
});

const mapDispatchToProps = {
  updateActiveOverlay: updateActiveOverlayAction,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

type LayerSelectorProps = PropsFromRedux & {
  onClose: () => void;
};

const LayerSelector: React.FC<LayerSelectorProps> = ({
  activeOverlay,
  updateActiveOverlay,
  onClose,
}) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const { layers, layerGroups = [] } = Config.get('map');

  const groupedLayerIds = new Set(
    layerGroups.flatMap((group) => group.layers)
  );
  const layerOptions = [
    ...layerGroups.flatMap((group) => {
      const defaultLayer = layers.find(
        (layer) => layer.id === group.layers[0]
      );

      return defaultLayer
        ? [
          {
            key: `group-${group.id}`,
            layerId: defaultLayer.id,
            layerIds: group.layers,
            name: group.name,
          },
        ]
        : [];
    }),
    ...layers
      .filter((layer) => !groupedLayerIds.has(layer.id))
      .map((layer) => ({
        key: `layer-${layer.id}`,
        layerId: layer.id,
        layerIds: [layer.id],
        name: layer.name,
      })),
  ];

  const { colors } = useTheme() as CustomTheme;
  return (
    <View testID="map_layer_selector">
      {layerOptions.map((option) => {
        const isSelected = option.layerIds.includes(activeOverlay);
        const optionName = option.name?.[locale] ?? '';

        return (
          <AccessibleTouchableOpacity
            key={option.key}
            accessibilityRole="button"
            accessibilityLabel={
              isSelected
                ? optionName
                : `${optionName}, ${t(
                    'map:layersBottomSheet:notSelected'
                  )}`
            }
            accessibilityState={{ selected: isSelected }}
            accessibilityHint={
              isSelected
                ? ''
                : t('map:layersBottomSheet:selectLayerAccessibilityHint')
            }
            onPress={() => {
              if (isSelected) return;
              trackMatomoEvent(
                'User action',
                'Map',
                'Layer selected - '+optionName
              );
              onClose();
              updateActiveOverlay(Number(option.layerId));
            }}>
            <View style={styles.row}>
              <Text
                maxFontSizeMultiplier={1.5}
                style={[styles.text, { color: colors.hourListText }]}
              >
                {optionName}
              </Text>
              <Icon
                name={
                  isSelected
                    ? 'radio-button-on'
                    : 'radio-button-off'
                }
                style={{
                  color: isSelected ? colors.primary : GRAY_1,
                }}
              />
            </View>
          </AccessibleTouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 16,
    fontFamily: REGULAR_FONT,
    flexShrink: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    width: '100%',
  },
});

export default connector(LayerSelector);
