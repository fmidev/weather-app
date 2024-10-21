import React, { useCallback, useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useIsFocused, useTheme } from '@react-navigation/native';
import { CustomTheme } from '@utils/colors';

import {
  fetchWarnings as fetchWarningsAction,
  fetchCapWarnings as fetchCapWarningsAction,
} from '@store/warnings/actions';
import { Config } from '@config';
import { useReloader } from '@utils/reloader';
import WarningsWebViewPanel from '@components/warnings/WarningsWebViewPanel';
import WarningsPanel from '@components/warnings/WarningsPanel';
import Announcements from '@components/announcements/Announcements';
import { State } from '@store/types';
import { connect, ConnectedProps } from 'react-redux';
import { selectCurrent } from '@store/location/selector';
import { selectAnnouncements } from '@store/announcements/selectors';
import CapWarningsView from '@components/warnings/cap/CapWarningsView';

const mapStateToProps = (state: State) => ({
  location: selectCurrent(state),
  announcements: selectAnnouncements(state),
});

const mapDispatchToProps = {
  fetchWarnings: fetchWarningsAction,
  fetchCapWarnings: fetchCapWarningsAction,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

type WarningsScreenProps = PropsFromRedux;
const WarningsScreen: React.FC<WarningsScreenProps> = ({
  fetchWarnings,
  fetchCapWarnings,
  location,
  announcements,
}) => {
  const { colors } = useTheme() as CustomTheme;
  const isFocused = useIsFocused();
  const { shouldReload } = useReloader();
  const [warningsUpdated, setWarningsUpdated] = useState<number>(Date.now());

  const warningsConfig = Config.get('warnings');
  const { useCapView } = warningsConfig;

  const updateWarnings = useCallback(() => {
    if (warningsConfig.enabled) {
      if (warningsConfig.useCapView) {
        fetchCapWarnings();
      } else if (warningsConfig.apiUrl[location.country]) {
        fetchWarnings(location);
      }
      setWarningsUpdated(Date.now());
    }
  }, [fetchWarnings, fetchCapWarnings, location, warningsConfig]);

  useEffect(() => {
    const now = Date.now();
    const warningsUpdateTime =
      warningsUpdated + (warningsConfig.updateInterval ?? 5) * 60 * 1000;

    if (isFocused) {
      if (now > warningsUpdateTime || shouldReload > warningsUpdateTime) {
        updateWarnings();
      }
    }
  }, [
    isFocused,
    warningsUpdated,
    shouldReload,
    warningsConfig,
    updateWarnings,
  ]);

  useEffect(() => {
    updateWarnings();
  }, [location, updateWarnings]);

  return (
    <View testID="warnings_view" style={styles.safeArea}>
      <ScrollView
        testID="warnings_scrollview"
        style={[styles.container, { backgroundColor: colors.screenBackground }]}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={announcements && [0]}>
        <Announcements style={styles.announcements} />
        {useCapView ? (
          <CapWarningsView />
        ) : (
          <>
            <WarningsPanel />
            <WarningsWebViewPanel
              updateInterval={(warningsConfig.updateInterval ?? 5) * 60 * 1000}
            />
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    minHeight: '100%',
  },
  announcements: {
    elevation: 10,
  },
});

export default connector(WarningsScreen);
