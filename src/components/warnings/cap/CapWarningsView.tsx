import React, { useRef, useState } from 'react';
import {
  Text,
  View,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import PanelHeader from '@components/common/PanelHeader';
import { useTranslation } from 'react-i18next';
import SelectorButton from '@components/common/SelectorButton';
import { useTheme } from '@react-navigation/native';
import { CustomTheme, GRAYISH_BLUE } from '@utils/colors';
import AccessibleTouchableOpacity from '@components/common/AccessibleTouchableOpacity';
import Icon from '@components/common/Icon';
import { State } from '@store/types';
import { selectCurrent } from '@store/location/selector';
import { connect, ConnectedProps } from 'react-redux';
import RBSheet from 'react-native-raw-bottom-sheet';
import WarningBlock from './WarningBlock';
import CapWarningsLegend from './CapWarningsLegend';
import MapView from './MapView';

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

  const [xOffset, setXOffset] = useState<number>(0);
  const { width } = useWindowDimensions();
  return (
    <View>
      <View>
        <PanelHeader title={t('panelTitleCap')} justifyCenter />
        <View
          style={[
            styles.dataSourcePanelContainer,
            { backgroundColor: colors.background },
          ]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.dataSourcePanel}>
            <SelectorButton active text={currentLocation?.name} />
            <SelectorButton text="Koko Suomi" />
            <SelectorButton text="Merialueet" />
          </ScrollView>
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
        <MapView />
        <PanelHeader
          title={`Varoitukset 5 vrk - ${currentLocation?.name}`}
          justifyCenter
        />
        <View
          style={[
            styles.dateIndicatorPanel,
            { backgroundColor: colors.background },
          ]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={[styles.dateIndicatorRow, { width: width - 136 }]}
            onScroll={(e) => setXOffset(e.nativeEvent.contentOffset.x)}>
            <DateIndicator weekDay="Ma" date="23.1." />
            <DateIndicator weekDay="Ti" date="24.1." />
            <DateIndicator weekDay="Ke" date="25.1." />
            <DateIndicator weekDay="To" date="26.1." />
            <DateIndicator weekDay="Pe" date="27.1." />
            {true && <DateIndicator weekDay="La" date="28.1." />}
            {true && <DateIndicator weekDay="Su" date="29.1." />}
          </ScrollView>
        </View>
        <WarningBlock
          title="Pakkasvaroitus maa-alueille"
          text="voimassa to 24.11. - la 26.11."
          warningSymbolType="coldWeather"
          severity="Extreme"
          xOffset={xOffset}
        />
        <WarningBlock
          title="Liikenteen säävaroitus"
          text="voimassa to 24.11. - la 26.11."
          warningSymbolType="trafficWeather"
          severity="Severe"
          xOffset={xOffset}
        />
        <WarningBlock
          title="Tuulivaroitus maa-alueille"
          text="voimassa to 24.11. - la 26.11."
          warningSymbolType="wind"
          severity="Moderate"
          xOffset={xOffset}
        />
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
  dataSourcePanel: {
    flexDirection: 'row',
    marginBottom: 16,
    marginLeft: 12,
  },
  dataSourcePanelUpdatedRow: {
    marginLeft: 12,
  },
  dateIndicatorPanel: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: GRAYISH_BLUE,
  },
  dateIndicatorRow: {
    display: 'flex',
    flexDirection: 'row',
    marginLeft: 64,
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
});

export default connector(CapWarningsView);
