import React, { useRef } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import { useTheme } from '@react-navigation/native';
import { connect, ConnectedProps } from 'react-redux';

import MlMapView from '@components/map/maps/MlMapView';
import RnMapview from '@components/map/maps/RnMapView';
import Announcements from '@components/announcements/Announcements';
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

const MapScreen: React.FC<MapScreenProps> = ({mapLibrary}) => {
  const { colors } = useTheme();
  const { fontScale } = useWindowDimensions();
  const mapLayersSheetRef = useRef<RBSheet>(null);
  const infoSheetRef = useRef<RBSheet>(null);

    const largeFonts = fontScale > 1.5;

  return (
    <>
      { mapLibrary === 'maplibre' ?
        <MlMapView infoSheetRef={infoSheetRef} mapLayersSheetRef={mapLayersSheetRef} />
        :
        <RnMapview infoSheetRef={infoSheetRef} mapLayersSheetRef={mapLayersSheetRef} />
      }

      <Announcements style={styles.announcements} />

      <RBSheet
        ref={infoSheetRef}
        height={600}
        closeOnDragDown
        dragFromTopOnly
        customStyles={{
          container: {
            ...styles.sheetContainer,
            backgroundColor: colors.background,
          },
          draggableIcon: styles.draggableIcon,
        }}>
        <InfoBottomSheet onClose={() => infoSheetRef.current?.close()} />
      </RBSheet>

      <RBSheet
        ref={mapLayersSheetRef}
        height={largeFonts ? 650 : 620}
        closeOnDragDown
        customStyles={{
          container: {
            ...styles.sheetContainer,
            backgroundColor: colors.background,
          },
          draggableIcon: styles.draggableIcon,
        }}>
        <MapLayersBottomSheet
          onClose={() => mapLayersSheetRef.current?.close()}
        />
      </RBSheet>
    </>
  )
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
  announcements: {
    width: '100%',
    marginTop: 30,
  },
});

export default connector(MapScreen);
