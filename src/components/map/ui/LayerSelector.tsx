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
  const { layers } = Config.get('map');

  const { colors } = useTheme() as CustomTheme;
  return (
    <View testID="map_layer_selector">
      {layers.length > 0 && layers.map((layer) => (
        <AccessibleTouchableOpacity
          key={layer.id}
          accessibilityRole="button"
          accessibilityLabel={
            layer.id === activeOverlay
              ? `${layer?.name && layer?.name[locale]}`
              : `${layer?.name && layer?.name[locale]}, ${t(
                  'map:layersBottomSheet:notSelected'
                )}`
          }
          accessibilityState={{ selected: layer.id === activeOverlay }}
          accessibilityHint={
            layer.id === activeOverlay
              ? ''
              : t('map:layersBottomSheet:selectLayerAccessibilityHint')
          }
          onPress={() => {
            if (layer.id === activeOverlay) return;
            trackMatomoEvent('User action', 'Map', 'Layer selected - '+layer?.name[locale]);
            onClose();
            updateActiveOverlay(Number(layer.id));
          }}>
          <View style={styles.row}>
            <Text
              maxFontSizeMultiplier={1.5}
              style={[styles.text, { color: colors.hourListText }]}
            >
              {(layer?.name && layer?.name[locale]) || ''}
            </Text>
            <Icon
              name={
                activeOverlay === layer.id
                  ? 'radio-button-on'
                  : 'radio-button-off'
              }
              style={{
                color: activeOverlay === layer.id ? colors.primary : GRAY_1,
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
});

export default connector(LayerSelector);
