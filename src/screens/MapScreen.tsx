import React, { useRef } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import BottomSheet, { type BottomSheetRef } from '@components/common/BottomSheet';
import { useTheme } from '@react-navigation/native';
import { connect, ConnectedProps } from 'react-redux';

import MlMapView from '@components/map/maps/MlMapView';
import RnMapview from '@components/map/maps/RnMapView';
import InfoBottomSheet from '@components/map/sheets/InfoBottomSheet';
import MapLayersBottomSheet from '@components/map/sheets/MapLayersBottomSheet';
import { GRAY_1 } from '@assets/colors';
import { State } from '@store/types';

import { selectMapLibrary } from '@store/settings/selectors';

const mapStateToProps = (state: State) => ({
  mapLibrary: selectMapLibrary(state),
});

const connector = connect(mapStateToProps);

type MapScreenProps = ConnectedProps<typeof connector>;

const MapScreen: React.FC<MapScreenProps> = ({ mapLibrary }) => {
  const { colors } = useTheme();
  const { fontScale } = useWindowDimensions();
  const mapLayersSheetRef = useRef<BottomSheetRef>(null);
  const infoSheetRef = useRef<BottomSheetRef>(null);

  const largeFonts = fontScale > 1.5;

  return (
    <>
      {mapLibrary === 'maplibre' ? (
        <MlMapView
          infoSheetRef={infoSheetRef}
          mapLayersSheetRef={mapLayersSheetRef}
        />
      ) : (
        <RnMapview
          infoSheetRef={infoSheetRef}
          mapLayersSheetRef={mapLayersSheetRef}
        />
      )}

      <BottomSheet
        ref={infoSheetRef}
        height={600}
        scrollableNegotiation="none"
        backgroundStyle={{
          ...styles.sheetContainer,
          backgroundColor: colors.background,
        }}
        handleIndicatorStyle={styles.draggableIcon}>
        <InfoBottomSheet onClose={() => infoSheetRef.current?.close()} />
      </BottomSheet>

      <BottomSheet
        ref={mapLayersSheetRef}
        height={largeFonts ? 530 : 500}
        backgroundStyle={{
          ...styles.sheetContainer,
          backgroundColor: colors.background,
        }}
        handleIndicatorStyle={styles.draggableIcon}>
        <MapLayersBottomSheet
          onClose={() => mapLayersSheetRef.current?.close()}
        />
      </BottomSheet>
    </>
  );
};

const styles = StyleSheet.create({
  sheetContainer: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  draggableIcon: {
    backgroundColor: GRAY_1,
    width: 65,
  },
});

export default connector(MapScreen);
