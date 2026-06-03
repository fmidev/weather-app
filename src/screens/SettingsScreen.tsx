import React, { useState, useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import {
  View,
  StyleSheet,
  ScrollView,
  Platform,
  AppState,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Permissions, { PERMISSIONS, RESULTS } from 'react-native-permissions';

import { setItem, LOCALE } from '@utils/async_storage';
import { State } from '@store/types';
import {
  selectUnits,
  selectTheme,
  selectClockType,
  selectMapLibrary,
} from '@store/settings/selectors';
import {
  updateUnits as updateUnitsAction,
  updateTheme as updateThemeAction,
  updateClockType as updateClockTypeAction,
  updateMapLibrary as updateMapLibraryAction,
} from '@store/settings/actions';
import { updateLocationsLocales as updateLocationsLocalesAction } from '@store/location/actions';
import { UnitType } from '@store/settings/types';
import { selectStoredGeoids } from '@store/location/selector';

import { Config } from '@config';
import { initMatomo } from '@utils/matomo';
import LocationSettings from '@components/settings/LocationSettings';
import UnitSettings from '@components/settings/UnitSettings';
import LanguageSettings from '@components/settings/LanguageSettings';
import ThemeSettings from '@components/settings/ThemeSettings';
import TimeSettings from '@components/settings/TimeSettings';
//import MapSettings from '@components/settings/MapSettings';

const LOCATION_ALWAYS = 'location_always';
const LOCATION_WHEN_IN_USE = 'location_when_in_use';
const LOCATION_NEVER = 'location_never';

const mapStateToProps = (state: State) => ({
  units: selectUnits(state),
  theme: selectTheme(state),
  geoids: selectStoredGeoids(state),
  clockType: selectClockType(state),
  mapLibrary: selectMapLibrary(state),
});

const mapDispatchToProps = {
  updateUnits: updateUnitsAction,
  updateTheme: updateThemeAction,
  updateLocationsLocales: updateLocationsLocalesAction,
  updateClockType: updateClockTypeAction,
  updateMapLibrary: updateMapLibraryAction,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

type Props = PropsFromRedux;

const SettingsScreen: React.FC<Props> = ({
  clockType,
  theme,
  geoids,
  units,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  mapLibrary,
  updateUnits,
  updateClockType,
  updateTheme,
  updateLocationsLocales,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  updateMapLibrary
}) => {
  const [locationPermission, setLocationPermission] = useState<
    string | undefined
  >(undefined);
  const { t, i18n } = useTranslation('settings');
  const isAndroid = Platform.OS === 'android';
  const { languages, themes, showUnitSettings } = Config.get('settings');

  useEffect(() => {
    const subscriber = AppState.addEventListener(
      'change',
      handleAppStateChange
    );
    checkLocationPermissions();
    return () => {
      setLocationPermission(undefined);
      subscriber.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkLocationPermissions = () => {
    const permissions = isAndroid
      ? [
          PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
          PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
        ]
      : [PERMISSIONS.IOS.LOCATION_ALWAYS, PERMISSIONS.IOS.LOCATION_WHEN_IN_USE];
    Permissions.checkMultiple(permissions).then((statuses) => {
      if (statuses[PERMISSIONS.IOS.LOCATION_ALWAYS] === RESULTS.GRANTED) {
        setLocationPermission(LOCATION_ALWAYS);
      } else if (
        statuses[PERMISSIONS.IOS.LOCATION_WHEN_IN_USE] === RESULTS.GRANTED
      ) {
        setLocationPermission(LOCATION_WHEN_IN_USE);
      } else if (
        statuses[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION] ===
          RESULTS.GRANTED ||
        statuses[PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION] === RESULTS.GRANTED
      ) {
        setLocationPermission(LOCATION_WHEN_IN_USE);
      } else {
        setLocationPermission(LOCATION_NEVER);
      }
    });
  };

  const handleAppStateChange = (state: string) => {
    if (state === 'active') {
      checkLocationPermissions();
    }
  };

  const onChangeLanguage = async (lang: string): Promise<void> => {
    i18n.changeLanguage(lang);
    // geoid = 0 is non location database location and without name
    updateLocationsLocales(geoids.filter(id => id !== 0));
    initMatomo(); // re-init matomo to use correct siteId
    try {
      await setItem(LOCALE, lang);
    } catch (error) {
      console.error('error:', error);
    }
  };

  const onChangeUnits = (key: string, unit: UnitType): void => {
    updateUnits(key, unit);
  };

  const goToSettings = () => {
    const permission =
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
    if (locationPermission === LOCATION_NEVER) {
      Permissions.request(permission)
        .then((result) => {
          if (result === RESULTS.BLOCKED) {
            Permissions.openSettings().catch((e) =>
              console.warn('cannot open settings', e)
            );
          }
        })
        .catch((e) => console.error(e));
    } else {
      Permissions.openSettings().catch((e) =>
        console.warn('cannot open settings', e)
      );
    }
  };

  const locationPermissionsDisplayString = {
    [LOCATION_ALWAYS]: t('settings:locationAlways'),
    [LOCATION_WHEN_IN_USE]: t('settings:locationWhenInUse'),
    [LOCATION_NEVER]: t('settings:locationNever'),
  } as { [key: string]: string };

  return (
    <View style={styles.container}>
      <ScrollView
        testID="settings_scrollview"
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}>

        <LocationSettings
          locationPermission={locationPermission}
          locationPermissionsDisplayString={locationPermissionsDisplayString}
          onOpenSettings={goToSettings}
        />

        {themes.light && themes.dark && (
          <ThemeSettings theme={theme} updateTheme={updateTheme} />
        )}

        {languages?.length > 1 && (
          <LanguageSettings
            currentLanguage={i18n.language}
            languages={languages}
            onChangeLanguage={onChangeLanguage}
          />
        )}

        <TimeSettings
          clockType={clockType}
          updateClockType={updateClockType}
        />

        {showUnitSettings && units && (
          <UnitSettings units={units} onChangeUnits={onChangeUnits} />
        )}

        { /*
        <MapSettings
          mapLibrary={mapLibrary}
          updateMapLibrary={updateMapLibrary}
        />
        */}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    minHeight: '100%',
  },
});

export default connector(SettingsScreen);
