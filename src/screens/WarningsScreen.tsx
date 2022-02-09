import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import { useIsFocused, useTheme } from '@react-navigation/native';
import { CustomTheme } from '@utils/colors';

import { fetchWarnings as fetchWarningsAction } from '@store/warnings/actions';
import { Config } from '@config';
import { useReloader } from '@utils/reloader';
import WarningsWebViewPanel from '@components/warnings/WarningsWebViewPanel';
import WarningsPanel from '@components/warnings/WarningsPanel';
import { State } from '@store/types';
import { connect, ConnectedProps } from 'react-redux';
import { selectCurrent } from '@store/location/selector';

const mapStateToProps = (state: State) => ({
  location: selectCurrent(state),
});

const mapDispatchToProps = {
  fetchWarnings: fetchWarningsAction,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

type WarningsScreenProps = PropsFromRedux;
const WarningsScreen: React.FC<WarningsScreenProps> = ({
  fetchWarnings,
  location,
}) => {
  const { colors } = useTheme() as CustomTheme;
  const isFocused = useIsFocused();
  const { shouldReload } = useReloader();
  const [warningsUpdated, setWarningsUpdated] = useState<number>(Date.now());

  const warningsConfig = Config.get('warnings');

  const updateWarnings = useCallback(() => {
    if (warningsConfig.enabled && warningsConfig.apiUrl[location.country]) {
      fetchWarnings(location);
      setWarningsUpdated(Date.now());
    }
  }, [fetchWarnings, location, warningsConfig]);

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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.screenBackground }]}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        <WarningsPanel />
        <WarningsWebViewPanel />
      </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    minHeight: '100%',
    paddingHorizontal: 12,
  },
  contentContainer: {
    paddingTop: 12,
    paddingBottom: 20,
  },
});

export default connector(WarningsScreen);
