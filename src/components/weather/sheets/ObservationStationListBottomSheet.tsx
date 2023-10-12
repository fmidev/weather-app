import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { View, StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@react-navigation/native';

import Icon from '@components/common/Icon';
import AccessibleTouchableOpacity from '@components/common/AccessibleTouchableOpacity';
import CloseButton from '@components/common/CloseButton';

import { State } from '@store/types';
import {
  selectDataId,
  selectStationList,
  selectStationId,
} from '@store/observation/selector';
import { setStationId as setStationIdAction } from '@store/observation/actions';

import { GRAY_1, CustomTheme } from '@utils/colors';
import { toStringWithDecimal } from '@utils/helpers';

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
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const { colors } = useTheme() as CustomTheme;

  const decimalSeparator = locale === 'en' ? '.' : ',';

  return (
    <View style={styles.wrapper}>
      <View style={styles.sheetListContainer}>
        <View style={styles.closeButtonContainer}>
          <CloseButton
            onPress={onClose}
            accessibilityLabel={t(
              'forecast:paramsBottomSheet:closeAccessibilityLabel'
            )}
          />
        </View>

        <View style={styles.sheetTitle}>
          <Text style={[styles.title, { color: colors.text }]}>
            {t('observation:observationStation')}
          </Text>
        </View>
        {stationList.length > 0 &&
          stationList.map((station) => (
            <AccessibleTouchableOpacity
              accessible
              accessibilityState={{ selected: station.id === stationId }}
              accessibilityLabel={`${station.name} ${t(
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
                setStationId(dataId, station.id);
                onClose();
              }}>
              <View style={styles.row}>
                <View style={styles.column}>
                  <View>
                    <Text style={[styles.textBold, { color: colors.text }]}>
                      {`${station.name}`}
                    </Text>
                  </View>
                  <View>
                    <Text style={[styles.text, { color: colors.text }]}>
                      {t('observation:distance')}{' '}
                      {toStringWithDecimal(station.distance, decimalSeparator)}{' '}
                      km
                    </Text>
                  </View>
                </View>
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
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    marginLeft: 20,
    marginRight: 10,
  },
  column: {
    width: '100%',
    flexDirection: 'column',
  },
  title: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
  },
  textBold: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
  },
  text: {
    fontSize: 16,
    fontFamily: 'Roboto-Thin',
    flexShrink: 1,
  },
});

export default connector(ObservationStationListBottomSheet);
