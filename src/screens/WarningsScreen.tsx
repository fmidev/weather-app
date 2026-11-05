import React, { useCallback, useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused, useTheme } from '@react-navigation/native';
import { CustomTheme } from '@assets/colors';

import {
  fetchWarnings as fetchWarningsAction,
  fetchCapWarnings as fetchCapWarningsAction,
} from '@store/warnings/actions';
import { Config } from '@config';
import { useReloader } from '@utils/reloader';
import WarningsWebViewPanel from '@components/warnings/WarningsWebViewPanel';
import WarningsPanel from '@components/warnings/WarningsPanel';
import { State } from '@store/types';
import { connect, ConnectedProps } from 'react-redux';
import { selectCurrent } from '@store/location/selector';
import CapWarningsView from '@components/warnings/cap/CapWarningsView';

const mapStateToProps = (state: State) => ({
  location: selectCurrent(state),
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
}) => {
  const { colors } = useTheme() as CustomTheme;
  const isFocused = useIsFocused();
  const { shouldReload } = useReloader();
  const [warningsUpdated, setWarningsUpdated] = useState<number>(Date.now());

  const warningsConfig = Config.get('warnings');
  const { useCapView, apiUrl } = warningsConfig;
  const showWarningsPanel =
    apiUrl && Object.keys(apiUrl).includes(location.country);

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
        style={[styles.container, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}>
        {useCapView ? (
          <CapWarningsView />
        ) : (
          <SafeAreaView edges={['left', 'right']}>
            {showWarningsPanel && <WarningsPanel />}
            <WarningsWebViewPanel
              updateInterval={(warningsConfig.updateInterval ?? 5) * 60 * 1000}
            />
          </SafeAreaView>
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
});

export default connector(WarningsScreen);
