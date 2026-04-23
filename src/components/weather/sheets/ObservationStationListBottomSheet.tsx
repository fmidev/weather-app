import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@react-navigation/native';

import Text from '@components/common/AppText';
import Icon from '@assets/Icon';
import AccessibleTouchableOpacity from '@components/common/AccessibleTouchableOpacity';
import CloseButton from '@components/common/CloseButton';

import { State } from '@store/types';
import {
  selectDataId,
  selectStationList,
  selectStationId,
} from '@store/observation/selector';
import { setStationId as setStationIdAction } from '@store/observation/actions';

import { GRAY_1, CustomTheme } from '@assets/colors';
import { toStringWithDecimal } from '@utils/helpers';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { trackMatomoEvent } from '@utils/matomo';
import { ScrollView } from 'react-native-gesture-handler';

const mapStateToProps = (state: State) => ({
  dataId: selectDataId(state),
  stationList: selectStationList(state),
  stationId: selectStationId(state),
});

const mapDispatchToProps = {
  setStationId: setStationIdAction,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

type ObservationStationListBottomSheetProps = PropsFromRedux & {
  onClose: () => void;
};

const ObservationStationListBottomSheet: React.FC<
  ObservationStationListBottomSheetProps
> = ({ onClose, dataId, stationId, setStationId, stationList }) => {
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const { colors } = useTheme() as CustomTheme;

  const decimalSeparator = locale === 'en' ? '.' : ',';

  return (
    <View style={[styles.wrapper, {
      paddingLeft: insets.left,
      paddingRight: insets.right
    }]}>
      <View style={styles.sheetListContainer}>
        <View style={styles.closeButtonContainer}>
          <CloseButton
            onPress={onClose}
            accessibilityLabel={t(
              'observation:closeSelectStationAcessibilityLabel'
            )}
          />
        </View>

        <View style={styles.sheetTitle}>
          <Text style={[styles.title, { color: colors.text }]}>
            {t('observation:observationStation')}
          </Text>
        </View>
        <ScrollView>
          {stationList.length > 0 && stationList.map((station) => (
            <AccessibleTouchableOpacity
              accessible
              accessibilityRole="checkbox"
              accessibilityState={{ selected: station.id === stationId }}
              accessibilityLabel={`${station.name} – ${t(
                'observation:distance'
              )} ${station.distance} km`}
              accessibilityHint={
                station.id === stationId
                  ? ''
                  : t('observation:selectStationAccessibilityHint')
              }
              key={station.id}
              onPress={() => {
                if (station.id === stationId) return;
                trackMatomoEvent('User action', 'Weather', 'Select observation station');
                setStationId(dataId, station.id);
                onClose();
              }}>
              <View style={styles.row}>
                <Text
                  style={[styles.text, { color: colors.text }]}>
                  {`${station.name} – ${t(
                    'observation:distance'
                  )} ${toStringWithDecimal(
                    station.distance,
                    decimalSeparator
                  )} km`}
                </Text>
                <Icon
                  name={
                    station.id === stationId
                      ? 'radio-button-on'
                      : 'radio-button-off'
                  }
                  style={{
                    color: station.id === stationId ? colors.primary : GRAY_1,
                  }}
                />
              </View>
            </AccessibleTouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
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
    maxHeight: 100,
  },
  row: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    minHeight: 44,
    maxHeight: 150,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
  },
  text: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
    flexShrink: 1,
  },
});

export default connector(ObservationStationListBottomSheet);
