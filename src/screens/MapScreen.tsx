import React, { useRef } from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { connect, ConnectedProps } from 'react-redux';
import { TrueSheet } from '@lodev09/react-native-true-sheet';

import MlMapView from '@components/map/maps/MlMapView';
import RnMapview from '@components/map/maps/RnMapView';
import Announcements from '@components/announcements/Announcements';
import InfoBottomSheet from '@components/map/sheets/InfoBottomSheet';
import MapLayersBottomSheet from '@components/map/sheets/MapLayersBottomSheet';
import { State } from '@store/types';

import { selectMapLibrary } from '@store/settings/selectors';

const mapStateToProps = (state: State) => ({
  mapLibrary: selectMapLibrary(state),
});

const connector = connect(mapStateToProps);

type MapScreenProps = ConnectedProps<typeof connector>;

const MapScreen: React.FC<MapScreenProps> = ({mapLibrary}) => {
  const { colors } = useTheme();
  const mapLayersSheetRef = useRef<TrueSheet>(null);
  const infoSheetRef = useRef<TrueSheet>(null);

  return (
    <>
      { mapLibrary === 'maplibre' ?
        <MlMapView infoSheetRef={infoSheetRef} mapLayersSheetRef={mapLayersSheetRef} />
        :
        <RnMapview infoSheetRef={infoSheetRef} mapLayersSheetRef={mapLayersSheetRef} />
      }

      <Announcements style={styles.announcements} />

      <TrueSheet
        ref={infoSheetRef}
        detents={[0.75]}
        maxContentHeight={600}
        backgroundColor={colors.background}
        scrollable
      >
        <InfoBottomSheet onClose={() => infoSheetRef.current?.dismiss()} />
      </TrueSheet>

      <TrueSheet
        ref={mapLayersSheetRef}
        detents={[0.75]}
        maxContentHeight={600}
        backgroundColor={colors.background}
        scrollable
      >
        <MapLayersBottomSheet onClose={() => mapLayersSheetRef.current?.dismiss()} />
      </TrueSheet>
    </>
  )
};

const styles = StyleSheet.create({
  announcements: {
    width: '100%',
    marginTop: 30,
  },
});

export default connector(MapScreen);
