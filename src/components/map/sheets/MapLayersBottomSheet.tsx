import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { View, StyleSheet, Text, Switch } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@react-navigation/native';

import CloseButton from '@components/common/CloseButton';

import { State } from '@store/types';
import { selectMapLayers, selectActiveOverlay } from '@store/map/selectors';
import {
  updateMapLayers as updateMapLayersAction,
  updateActiveOverlay as updateActiveOverlayAction,
  updateSliderStep as updateSliderStepAction,
} from '@store/map/actions';

import { WHITE, SECONDARY_BLUE, GRAYISH_BLUE } from '@utils/colors';
import configJSON from '@utils/config.json';

const mapStateToProps = (state: State) => ({
  activeOverlay: selectActiveOverlay(state),
  mapLayers: selectMapLayers(state),
});

const mapDispatchToProps = {
  updateMapLayers: updateMapLayersAction,
  updateActiveOverlay: updateActiveOverlayAction,
  updateSliderStep: updateSliderStepAction,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

type MapLayersBottomSheetProps = PropsFromRedux & {
  onClose: () => void;
};

const MapLayersBottomSheet: React.FC<MapLayersBottomSheetProps> = ({
  activeOverlay,
  onClose,
  mapLayers,
  updateMapLayers,
  updateActiveOverlay,
  updateSliderStep,
}) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;

  const { colors } = useTheme();
  return (
    <View style={styles.sheetListContainer}>
      <View style={styles.closeButtonContainer}>
        <CloseButton
          onPress={onClose}
          accessibilityLabel={t(
            'map:layersBottomSheet:closeAccessibilityLabel'
          )}
        />
      </View>

      <View style={styles.sheetTitle}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t('map:layersBottomSheet:locationTitle')}
        </Text>
      </View>
      <View
        style={[
          styles.rowWrapper,
          styles.withBorderBottom,
          { borderBottomColor: colors.border },
        ]}>
        <View style={styles.row}>
          <Text style={[styles.text, { color: colors.text }]}>
            {t('map:layersBottomSheet:locationHint')}
          </Text>
          <Switch
            trackColor={{ false: GRAYISH_BLUE, true: SECONDARY_BLUE }}
            thumbColor={WHITE}
            ios_backgroundColor={GRAYISH_BLUE}
            value={mapLayers.location}
            onValueChange={() =>
              updateMapLayers({
                ...mapLayers,
                location: !mapLayers.location,
              })
            }
          />
        </View>
      </View>

      <View style={styles.sheetTitle}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t('map:layersBottomSheet:mapLayersTitle')}
        </Text>
      </View>
      {configJSON &&
        configJSON.map.layers.length > 0 &&
        configJSON.map.layers.map(
          (layer: {
            id: number;
            type: string;
            name: { [lang: string]: string };
            times: {
              timeStep: number;
              observation?: number;
              forecast?: number;
            };
          }) => (
            <View key={layer.id} style={styles.row}>
              <Text style={[styles.text, { color: colors.text }]}>
                {(layer?.name && layer?.name[locale]) || ''}
              </Text>
              <Switch
                trackColor={{ false: GRAYISH_BLUE, true: SECONDARY_BLUE }}
                thumbColor={WHITE}
                ios_backgroundColor={GRAYISH_BLUE}
                value={activeOverlay === layer.id}
                onValueChange={() => {
                  updateActiveOverlay(layer.id);
                  const step = layer.times.timeStep;
                  updateSliderStep(step);
                }}
              />
            </View>
          )
        )}
    </View>
  );
};

const styles = StyleSheet.create({
  sheetListContainer: {
    flex: 1,
    marginTop: -10,
    paddingHorizontal: 20,
  },
  closeButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  sheetTitle: {
    flexDirection: 'row',
    paddingBottom: 10,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  rowWrapper: {
    paddingBottom: 28,
    paddingTop: 15,
    marginBottom: 14,
  },
  withBorderBottom: {
    borderBottomWidth: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
  },
  text: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
  },
});

export default connector(MapLayersBottomSheet);
