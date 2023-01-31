import React, { useRef } from 'react';
import { Text, View, ScrollView, StyleSheet } from 'react-native';
import PanelHeader from '@components/common/PanelHeader';
import { useTranslation } from 'react-i18next';
import SelectorButton from '@components/common/SelectorButton';
import { useTheme } from '@react-navigation/native';
import { CustomTheme, GRAY_8, WHITE } from '@utils/colors';
import AccessibleTouchableOpacity from '@components/common/AccessibleTouchableOpacity';
import Icon from '@components/common/Icon';
import { State } from '@store/types';
import { selectCurrent } from '@store/location/selector';
import { connect, ConnectedProps } from 'react-redux';
import RBSheet from 'react-native-raw-bottom-sheet';
import WarningBlock from './WarningBlock';
import CapWarningsLegend from './CapWarningsLegend';
import DaySelectorList from './DaySelectorList';

const mapStateToProps = (state: State) => ({
  currentLocation: selectCurrent(state),
});

function DateIndicator({ weekDay, date }: { weekDay: string; date: string }) {
  const { colors } = useTheme() as CustomTheme;
  return (
    <View style={styles.dateIndicatorEntry}>
      <Text style={{ color: colors.hourListText }}>{weekDay}</Text>
      <Text style={{ color: colors.hourListText }}>{date}</Text>
    </View>
  );
}

const connector = connect(mapStateToProps, {});

type PropsFromRedux = ConnectedProps<typeof connector>;

type CapWarningsViewProps = PropsFromRedux;

const CapWarningsView: React.FC<CapWarningsViewProps> = ({
  currentLocation,
}) => {
  const legendSheetRef = useRef() as React.MutableRefObject<RBSheet>;
  const { t } = useTranslation('warnings');
  const { colors } = useTheme() as CustomTheme;

  return (
    <View>
      <View>
        <PanelHeader title={t('panelTitleCap')} justifyCenter />
        <View style={styles.dataSourcePanelContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.dataSourcePanel}>
            <SelectorButton active text={currentLocation?.name} />
            <SelectorButton text="Koko Suomi" />
            <SelectorButton text="Merialueet" />
          </ScrollView>
          <View style={[styles.flex, styles.row, styles.spaceBetween]}>
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
                23.11. klo 22:00
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
        <View style={styles.mapContainer}>
          <Text>KARTTA</Text>
          <DaySelectorList />
        </View>
        <PanelHeader
          title={`Varoitukset 5 vrk - ${currentLocation?.name}`}
          justifyCenter
        />
        <View style={styles.dateIndicatorPanel}>
          <View style={styles.dateIndicatorRow}>
            <DateIndicator weekDay="Ma" date="23.1." />
            <DateIndicator weekDay="Ti" date="24.1." />
            <DateIndicator weekDay="Ke" date="25.1." />
            <DateIndicator weekDay="To" date="26.1." />
            <DateIndicator weekDay="Pe" date="27.1." />
          </View>
        </View>
        <WarningBlock
          title="Pakkasvaroitus maa-alueille"
          text="voimassa to 24.11. - la 26.11."
          warningSymbolType="coldWeather"
          severity="Extreme"
        />
        <WarningBlock
          title="Liikenteen säävaroitus"
          text="voimassa to 24.11. - la 26.11."
          warningSymbolType="trafficWeather"
          severity="Severe"
        />
        <WarningBlock
          title="Tuulivaroitus maa-alueille"
          text="voimassa to 24.11. - la 26.11."
          warningSymbolType="wind"
          severity="Moderate"
        />
      </View>
      <RBSheet
        ref={legendSheetRef}
        height={600}
        closeOnDragDown
        customStyles={{
          container: { borderTopRightRadius: 10, borderTopLeftRadius: 10 },
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
    backgroundColor: WHITE,
    paddingTop: 18,
  },
  dataSourcePanel: {
    flexDirection: 'row',
    marginBottom: 16,
    marginLeft: 12,
  },
  dataSourcePanelUpdatedRow: {
    marginLeft: 12,
  },
  dateIndicatorPanel: {
    backgroundColor: WHITE,
    paddingVertical: 12,
  },
  dateIndicatorRow: {
    display: 'flex',
    flexDirection: 'row',
    marginLeft: 64,
    // justifyContent: 'center',
  },
  dateIndicatorEntry: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginRight: 7,
    width: 45,
  },
  infoButton: {
    marginRight: 8,
  },
  mapContainer: {
    backgroundColor: GRAY_8,
    height: 400,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default connector(CapWarningsView);
