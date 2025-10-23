import React, { useRef } from 'react';
import { Text, View, StyleSheet } from 'react-native';
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
import moment from 'moment';
import {
  selectCapWarningData,
  selectFetchSuccessTime,
} from '@store/warnings/selectors';
import CapWarningsLegend from './CapWarningsLegend';
import MapView from './MapView';
import TextList from './TextList';

const mapStateToProps = (state: State) => ({
  currentLocation: selectCurrent(state),
  capWarnings: selectCapWarningData(state),
  updated: selectFetchSuccessTime(state),
});

const connector = connect(mapStateToProps, {});

type PropsFromRedux = ConnectedProps<typeof connector>;

type CapWarningsViewProps = PropsFromRedux;

const CapWarningsView: React.FC<CapWarningsViewProps> = ({
  updated,
  currentLocation,
  capWarnings,
}) => {
  const legendSheetRef = useRef<RBSheet>(null);

  const { t, i18n } = useTranslation('warnings');
  const locale = i18n.language;
  const weekdayAbbreviationFormat = locale === 'en' ? 'ddd' : 'dd';
  const dateFormat = locale === 'en' ? 'D MMM' : 'D.M.';

  const { colors } = useTheme() as CustomTheme;

  const capViewSettings = Config.get('warnings')?.capViewSettings;

  let textViewTitle = `${t('warningsForNDays', {
    days: capViewSettings?.numberOfDays,
  })}`;

  if (capViewSettings?.includeAreaInTitle)
    textViewTitle += ` - ${currentLocation?.name}`;

  const getDateIndicatorDates = () => {
    const today = moment(new Date()).hours(12).minutes(0);
    const dates = [
      {
        time: today.toDate().getTime(),
        date: moment(today).locale(locale).format(dateFormat),
        weekday: moment(today).locale(locale).format(weekdayAbbreviationFormat),
      },
    ];
    if (capViewSettings) {
      for (let i = 1; i < capViewSettings?.numberOfDays; i += 1) {
        const momentObject = moment(today).add(i, 'days');
        dates.push({
          time: momentObject.toDate().getTime(),
          date: momentObject.locale(locale).format(dateFormat),
          weekday: momentObject
            .locale(locale)
            .format(weekdayAbbreviationFormat),
        });
      }
    }
    return dates;
  };

  const dates = getDateIndicatorDates();

  return (
    <View>
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
              <Text
                style={[
                  styles.regularFont,
                  {
                    color: colors.hourListText,
                  },
                ]}>
                {`${t('capUpdated')} `}
              </Text>
              <Text
                style={[
                  styles.boldFont,
                  {
                    color: colors.hourListText,
                  },
                ]}>
                {moment(updated)
                  .locale(locale)
                  .format(locale === 'en' ? 'DD MMM' : 'D.M. HH.mm')}
              </Text>
            </View>
            <AccessibleTouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={t('infoAccessibilityLabel')}
              accessibilityHint={t('infoAccessibilityHint')}
              style={styles.infoButton}
              onPress={() => legendSheetRef.current?.open()}>
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
    </View>
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
    fontFamily: 'Roboto-Bold',
  },
  regularFont: {
    fontFamily: 'Roboto-Regular',
  },
  dataSourcePanelContainer: {
    paddingTop: 18,
  },
  dataSourcePanelUpdatedRow: {
    marginLeft: 12,
  },
  infoButton: {
    marginRight: 8,
  },
});

export default connector(CapWarningsView);
