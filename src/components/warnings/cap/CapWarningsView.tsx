import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAccessibilityLanguage } from '@utils/hooks';
import PanelHeader from '@components/common/PanelHeader';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@react-navigation/native';
import { CustomTheme } from '@assets/colors';
import AccessibleTouchableOpacity from '@components/common/AccessibleTouchableOpacity';
import Icon from '@assets/Icon';
import { State } from '@store/types';
import { selectCurrent } from '@store/location/selector';
import { connect, ConnectedProps } from 'react-redux';
import RBSheet from 'react-native-raw-bottom-sheet';
import { Config } from '@config';
import moment from 'moment-timezone';
import {
  selectCapWarningData,
  selectFetchSuccessTime,
  selectLoading,
} from '@store/warnings/selectors';
import CapWarningsLegend from './CapWarningsLegend';
import useWarningsInfo from '../useWarningsInfo';
import MapView from './MapView';
import TextList from './TextList';
import LocalWarningsBar from './LocalWarningsBar';
import { REGULAR_FONT, BOLD_FONT } from '@assets/constants';

const mapStateToProps = (state: State) => ({
  loading: selectLoading(state),
  currentLocation: selectCurrent(state),
  capWarnings: selectCapWarningData(state),
  updated: selectFetchSuccessTime(state),
});

const connector = connect(mapStateToProps, {});

type CapWarningsViewProps = ConnectedProps<typeof connector>;

const CapWarningsView: React.FC<CapWarningsViewProps> = ({
  updated,
  currentLocation,
  capWarnings,
  loading,
}) => {
  const accessibilityLanguage = useAccessibilityLanguage();
  const { infoSheetRef: legendSheetRef, openInfo } = useWarningsInfo();

  const { t, i18n } = useTranslation('warnings');
  const locale = i18n.language;

  const { colors } = useTheme() as CustomTheme;

  const capViewSettings = Config.get('warnings')?.capViewSettings;
  const { default: defaultLocation } = Config.get('location');

  let textViewTitle = `${t('warningsForNDays', {
    days: capViewSettings?.numberOfDays,
  })}`;

  if (capViewSettings?.includeAreaInTitle)
    textViewTitle += ` - ${currentLocation?.name}`;

  const getDateIndicatorDates = () => {
    const today = moment().tz(defaultLocation.timezone).hours(12).minutes(0);
    const dates = [
      {
        time: today.toDate().getTime(),
        date: today.formatDateTime('date', locale),
        weekday: today.formatDateTime('weekdayAbbreviation', locale),
        relativeDay: t('today'),
      },
    ];
    if (capViewSettings) {
      for (let i = 1; i < capViewSettings?.numberOfDays; i += 1) {
        const momentObject = moment(today).add(i, 'days');
        let relativeDay = '';

        if (i === 1) relativeDay = t('tomorrow');
        if (i === 2) relativeDay = t('dayAfterTomorrow');

        dates.push({
          time: momentObject.toDate().getTime(),
          date: momentObject.formatDateTime('date', locale),
          weekday: momentObject.formatDateTime('weekdayAbbreviation', locale),
          relativeDay,
        });
      }
    }
    return dates;
  };

  const dates = getDateIndicatorDates();

  return (
    <SafeAreaView edges={['left', 'right']}>
      {capViewSettings?.localWarningsEnabled &&
        defaultLocation?.country === currentLocation.country &&
        capViewSettings?.localWarningsAfterCountry !== true && (
          <LocalWarningsBar legendSheetRef={legendSheetRef} />
        )}
      <View>
        <PanelHeader title={t('panelTitleCap')} justifyCenter />
        <View
          style={[
            styles.dataSourcePanelContainer,
            { backgroundColor: colors.background },
          ]}>
          <View
            style={[
              styles.flex,
              styles.row,
              styles.spaceBetween,
              { backgroundColor: colors.background },
            ]}>
            <View
              style={[
                styles.row,
                styles.centeredContent,
                styles.dataSourcePanelUpdatedRow,
              ]}>
              {!loading && (
                <>
                  <Text
                    accessibilityLanguage={accessibilityLanguage}
                    style={[
                      styles.regularFont,
                      {
                        color: colors.hourListText,
                      },
                    ]}>
                    {`${t('capUpdated')} `}
                  </Text>
                  <Text
                    accessibilityLanguage={accessibilityLanguage}
                    style={[
                      styles.boldFont,
                      {
                        color: colors.hourListText,
                      },
                    ]}>
                    {moment(updated)
                      .tz(defaultLocation.timezone)
                      .formatDateTime('dateTime', locale)}
                  </Text>
                </>
              )}
            </View>
            <AccessibleTouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={t('infoAccessibilityLabel')}
              accessibilityHint={t('infoAccessibilityHint')}
              style={styles.infoButton}
              onPress={openInfo}>
              <Icon
                name="info"
                color={colors.primaryText}
                height={24}
                width={24}
              />
            </AccessibleTouchableOpacity>
          </View>
        </View>
        <MapView dates={dates} capData={capWarnings} />
        <PanelHeader title={textViewTitle} justifyCenter />
        <TextList capData={capWarnings} dates={dates} />
      </View>
      {capViewSettings?.localWarningsEnabled &&
        defaultLocation?.country === currentLocation.country &&
        capViewSettings?.localWarningsAfterCountry && (
          <LocalWarningsBar legendSheetRef={legendSheetRef} />
        )}
      <RBSheet
        ref={legendSheetRef}
        height={600}
        closeOnDragDown
        customStyles={{
          container: {
            borderTopRightRadius: 10,
            borderTopLeftRadius: 10,
            backgroundColor: colors.background,
          },
        }}>
        <CapWarningsLegend onClose={() => legendSheetRef.current?.close()} />
      </RBSheet>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: {
    display: 'flex',
  },
  row: {
    flexDirection: 'row',
  },
  spaceBetween: {
    justifyContent: 'space-between',
  },
  centeredContent: {
    alignItems: 'center',
  },
  boldFont: {
    fontFamily: BOLD_FONT,
  },
  regularFont: {
    fontFamily: REGULAR_FONT,
  },
  dataSourcePanelContainer: {
    paddingTop: 18,
    height: 100,
  },
  dataSourcePanelUpdatedRow: {
    marginLeft: 12,
  },
  infoButton: {
    marginRight: 8,
  },
});

export default connector(CapWarningsView);
