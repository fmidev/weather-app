import React, { useState, useEffect, useRef } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  AppState,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import RBSheet from 'react-native-raw-bottom-sheet';
import { useTheme } from '@react-navigation/native';
import Permissions, { PERMISSIONS, RESULTS } from 'react-native-permissions';

import Icon from '@components/common/Icon';
import AccessibleTouchableOpacity from '@components/common/AccessibleTouchableOpacity';

import { setItem, LOCALE } from '@utils/async_storage';
import { UNITS } from '@utils/units';
import { State } from '@store/types';
import {
  selectUnits,
  selectTheme,
  selectClockType,
} from '@store/settings/selectors';
import {
  updateUnits as updateUnitsAction,
  updateTheme as updateThemeAction,
  updateClockType as updateClockTypeAction,
} from '@store/settings/actions';
import { updateLocationsLocales as updateLocationsLocalesAction } from '@store/location/actions';
import { UnitType } from '@store/settings/types';
import { selectStoredGeoids } from '@store/location/selector';
import { GRAY_1 } from '@utils/colors';

import { Config } from '@config';

const LOCATION_ALWAYS = 'location_always';
const LOCATION_WHEN_IN_USE = 'location_when_in_use';
const LOCATION_NEVER = 'location_never';

const mapStateToProps = (state: State) => ({
  units: selectUnits(state),
  theme: selectTheme(state),
  geoids: selectStoredGeoids(state),
  clockType: selectClockType(state),
});

const mapDispatchToProps = {
  updateUnits: updateUnitsAction,
  updateTheme: updateThemeAction,
  updateLocationsLocales: updateLocationsLocalesAction,
  updateClockType: updateClockTypeAction,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

type Props = PropsFromRedux;

const SettingsScreen: React.FC<Props> = ({
  clockType,
  theme,
  geoids,
  units,
  updateUnits,
  updateClockType,
  updateTheme,
  updateLocationsLocales,
}) => {
  const [locationPermission, setLocationPermission] = useState<
    string | undefined
  >(undefined);
  const { t, i18n } = useTranslation('settings');
  const { colors } = useTheme();
  const isAndroid = Platform.OS === 'android';
  const sheetRefs = {
    temperature: useRef(),
    precipitation: useRef(),
    wind: useRef(),
    pressure: useRef(),
  } as { [key: string]: React.MutableRefObject<RBSheet> };
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
    updateLocationsLocales(geoids);
    try {
      await setItem(LOCALE, lang);
    } catch (error) {
      console.error('error:', error);
    }
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

  const unitTypesByKey = (key: string): UnitType[] | undefined =>
    UNITS.find((unit) => unit.parameterName === key)?.unitTypes;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}>
        <View
          style={[
            styles.rowWrapper,
            styles.withBorderBottom,
            styles.withMarginTop,
            { borderBottomColor: colors.border },
          ]}>
          <View style={styles.row}>
            <Text
              style={[styles.title, { color: colors.text }]}
              accessibilityRole="header">
              {t('settings:allowLocation')}
            </Text>
          </View>
        </View>
        <View>
          <View
            style={[
              styles.rowWrapper,
              styles.withBorderBottom,
              { borderBottomColor: colors.border },
            ]}>
            <AccessibleTouchableOpacity
              onPress={goToSettings}
              delayPressIn={100}
              accessibilityRole="link"
              accessibilityHint={t('settings:locationSettingHint')}>
              <View style={styles.row}>
                <Text style={[styles.text, { color: colors.text }]}>
                  {locationPermission
                    ? locationPermissionsDisplayString[locationPermission]
                    : '-'}
                </Text>
                <View style={styles.editRow}>
                  <Text
                    accessibilityLabel=""
                    style={[styles.editText, { color: colors.text }]}>
                    {t('settings:edit')}
                  </Text>
                  <Icon
                    name="open-in-new"
                    width={22}
                    height={22}
                    style={{ color: colors.text }}
                  />
                </View>
              </View>
            </AccessibleTouchableOpacity>
          </View>
        </View>

        {showUnitSettings && units && (
          <>
            <View
              style={[
                styles.rowWrapper,
                styles.withBorderBottom,
                { borderBottomColor: colors.border },
              ]}
              testID="settings_units_header">
              <View style={styles.row}>
                <Text style={[styles.title, { color: colors.text }]}>
                  {t('settings:units')}
                </Text>
              </View>
            </View>
            <View>
              {Object.keys(units).map((key, i) => (
                <View
                  key={key}
                  style={[
                    styles.rowWrapper,
                    i < Object.keys(units).length - 1
                      ? {
                          ...styles.withBorderBottom,
                          borderBottomColor: colors.border,
                        }
                      : null,
                  ]}>
                  <AccessibleTouchableOpacity
                    onPress={() => sheetRefs[key].current.open()}
                    testID={`settings_set_${key}`}>
                    <View style={styles.row}>
                      <Text style={[styles.text, { color: colors.text }]}>
                        {t(`settings:${key}`)}
                      </Text>
                      <Text
                        style={[styles.text, { color: colors.text }]}
                        testID={`${key}_unitAbb`}>
                        {key === 'temperature' ? '°' : ''}
                        {units[key].unitAbb}
                      </Text>
                    </View>
                    {unitTypesByKey(key) && (
                      <RBSheet
                        ref={sheetRefs[key]}
                        height={400}
                        closeOnDragDown
                        customStyles={{
                          container: {
                            ...styles.sheetContainer,
                            backgroundColor: colors.background,
                          },
                          draggableIcon: styles.draggableIcon,
                        }}>
                        <View
                          style={styles.sheetListContainer}
                          testID="unit_sheet_container">
                          <View
                            style={styles.sheetTitle}
                            testID={`${key}_unit_sheet_title`}>
                            <Text
                              style={[styles.title, { color: colors.text }]}>
                              {t(`settings:${key}`)}
                            </Text>
                          </View>
                          {unitTypesByKey(key)?.map((type) => (
                            <View
                              key={type.unitId}
                              style={[
                                styles.rowWrapper,
                                styles.withBorderBottom,
                                { borderBottomColor: colors.border },
                              ]}>
                              <AccessibleTouchableOpacity
                                onPress={() => updateUnits(key, type)}
                                testID={`settings_units_${key}_${type.unit}`}>
                                <View style={styles.row}>
                                  <Text
                                    style={[
                                      styles.text,
                                      { color: colors.text },
                                    ]}>
                                    {key === 'temperature' ? '°' : ''}
                                    {type.unitAbb}
                                  </Text>
                                  {units[key].unitId === type.unitId && (
                                    <Icon
                                      name="checkmark"
                                      size={22}
                                      style={{ color: colors.text }}
                                    />
                                  )}
                                </View>
                              </AccessibleTouchableOpacity>
                            </View>
                          ))}
                        </View>
                      </RBSheet>
                    )}
                  </AccessibleTouchableOpacity>
                </View>
              ))}
            </View>
          </>
        )}

        {languages?.length > 1 && (
          <>
            <View
              style={[
                styles.rowWrapper,
                styles.withBorderBottom,
                styles.withMarginTop,
                { borderBottomColor: colors.border },
              ]}>
              <View style={styles.row}>
                <Text
                  style={[styles.title, { color: colors.text }]}
                  testID="settings_language_header"
                  accessibilityRole="header">
                  {t('settings:language')}
                </Text>
              </View>
            </View>
            <View>
              {languages &&
                languages.map((language) => (
                  <View
                    key={language}
                    style={[
                      styles.rowWrapper,
                      styles.withBorderBottom,
                      { borderBottomColor: colors.border },
                    ]}>
                    <AccessibleTouchableOpacity
                      onPress={() =>
                        i18n.language === language
                          ? {}
                          : onChangeLanguage(language)
                      }
                      delayPressIn={100}
                      accessibilityState={{
                        selected: i18n.language === language,
                      }}
                      accessibilityRole="button"
                      accessibilityHint={`${t('settings:languageHint')} ${t(
                        `settings:${language}`
                      )}`}>
                      <View style={styles.row}>
                        <Text style={[styles.text, { color: colors.text }]}>
                          {t(`settings:${language}`)}
                        </Text>
                        {i18n.language === language && (
                          <Icon
                            name="checkmark"
                            size={22}
                            style={{ color: colors.text }}
                          />
                        )}
                      </View>
                    </AccessibleTouchableOpacity>
                  </View>
                ))}
              {/* <View
            style={[
              styles.rowWrapper,
              styles.withBorderBottom,
              { borderBottomColor: colors.border },
            ]}>
            <AccessibleTouchableOpacity
              onPress={() => onChangeLanguage('fi')}
              delayPressIn={100}
              disabled={i18n.language === 'fi'}
              testID="settings_set_language_fi">
              <View style={styles.row}>
                <Text style={[styles.text, { color: colors.text }]}>suomi</Text>
                {i18n.language === 'fi' && (
                  <Icon
                    name="checkmark"
                    size={22}
                    style={{ color: colors.text }}
                  />
                )}
              </View>
            </AccessibleTouchableOpacity>
          </View>
          <View
            style={[
              styles.rowWrapper,
              styles.withBorderBottom,
              { borderBottomColor: colors.border },
            ]}>
            <AccessibleTouchableOpacity
              onPress={() => onChangeLanguage('en')}
              delayPressIn={100}
              disabled={i18n.language === 'en'}
              testID="settings_set_language_en">
              <View style={styles.row}>
                <Text style={[styles.text, { color: colors.text }]}>
                  in English
                </Text>
                {i18n.language === 'en' && (
                  <Icon
                    name="checkmark"
                    size={22}
                    style={{ color: colors.text }}
                  />
                )}
              </View>
            </AccessibleTouchableOpacity>
          </View> */}
            </View>
          </>
        )}
        {themes.light && themes.dark && (
          <>
            <View
              style={[
                styles.rowWrapper,
                styles.withBorderBottom,
                styles.withMarginTop,
                { borderBottomColor: colors.border },
              ]}>
              <View style={styles.row}>
                <Text
                  style={[styles.title, { color: colors.text }]}
                  testID="settings_theme_header"
                  accessibilityRole="header">
                  {t('settings:appearance')}
                </Text>
              </View>
            </View>
          </>
        )}
        <View>
          {themes.light && themes.dark && (
            <>
              <View
                style={[
                  styles.rowWrapper,
                  styles.withBorderBottom,
                  { borderBottomColor: colors.border },
                ]}>
                <AccessibleTouchableOpacity
                  onPress={() =>
                    theme === 'light' ? {} : updateTheme('light')
                  }
                  delayPressIn={100}
                  testID="settings_set_theme_light"
                  accessibilityState={{ selected: theme === 'light' }}
                  accessibilityRole="button"
                  accessibilityHint={`${t('settings:appearanceHint')} ${t(
                    'settings:appearanceLight'
                  )}`}>
                  <View style={styles.row}>
                    <Text style={[styles.text, { color: colors.text }]}>
                      {t('settings:appearanceLight')}
                    </Text>
                    {theme === 'light' && (
                      <View testID="settings_theme_light">
                        <Icon
                          name="checkmark"
                          size={22}
                          style={{ color: colors.text }}
                        />
                      </View>
                    )}
                  </View>
                </AccessibleTouchableOpacity>
              </View>
              <View
                style={[
                  styles.rowWrapper,
                  styles.withBorderBottom,
                  { borderBottomColor: colors.border },
                ]}>
                <AccessibleTouchableOpacity
                  onPress={() => (theme === 'dark' ? {} : updateTheme('dark'))}
                  delayPressIn={100}
                  testID="settings_set_theme_dark"
                  accessibilityState={{ selected: theme === 'dark' }}
                  accessibilityRole="button"
                  accessibilityHint={`${t('settings:appearanceHint')} ${t(
                    'settings:appearanceDark'
                  )}`}>
                  <View style={styles.row}>
                    <Text style={[styles.text, { color: colors.text }]}>
                      {t('settings:appearanceDark')}
                    </Text>
                    {theme === 'dark' && (
                      <View testID="settings_theme_dark">
                        <Icon
                          name="checkmark"
                          size={22}
                          style={{ color: colors.text }}
                        />
                      </View>
                    )}
                  </View>
                </AccessibleTouchableOpacity>
              </View>
              <View
                style={[
                  styles.rowWrapper,
                  styles.withBorderBottom,
                  { borderBottomColor: colors.border },
                ]}>
                <AccessibleTouchableOpacity
                  onPress={() =>
                    theme === 'automatic' ? {} : updateTheme('automatic')
                  }
                  delayPressIn={100}
                  testID="settings_set_theme_automatic"
                  accessibilityState={{ selected: theme === 'automatic' }}
                  accessibilityRole="button"
                  accessibilityHint={
                    theme === 'automatic'
                      ? ''
                      : `${t('settings:appearanceHint')} ${t(
                          'settings:appearanceAutomatic'
                        )}`
                  }>
                  <View style={styles.row}>
                    <Text style={[styles.text, { color: colors.text }]}>
                      {t('settings:appearanceAutomatic')}
                    </Text>
                    {theme === 'automatic' && (
                      <View testID="settings_theme_automatic">
                        <Icon
                          name="checkmark"
                          size={22}
                          style={{ color: colors.text }}
                        />
                      </View>
                    )}
                  </View>
                </AccessibleTouchableOpacity>
              </View>
            </>
          )}
          <View
            style={[
              styles.rowWrapper,
              styles.withBorderBottom,
              styles.withMarginTop,
              { borderBottomColor: colors.border },
            ]}>
            <View style={styles.row}>
              <Text
                style={[styles.title, { color: colors.text }]}
                accessibilityRole="header">
                {t('settings:clock')}
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.rowWrapper,
              styles.withBorderBottom,
              { borderBottomColor: colors.border },
            ]}>
            <AccessibleTouchableOpacity
              onPress={() => updateClockType(12)}
              delayPressIn={100}
              accessibilityState={{
                selected: clockType === 12,
              }}
              accessibilityRole="button"
              accessibilityHint={`${t('settings:clockSettingHint')} ${t(
                '12-hour-clock'
              )}`}>
              <View style={styles.row}>
                <Text style={[styles.text, { color: colors.text }]}>
                  {t('12-hour-clock')}
                </Text>
                {clockType === 12 && (
                  <Icon
                    name="checkmark"
                    size={22}
                    style={{ color: colors.text }}
                  />
                )}
              </View>
            </AccessibleTouchableOpacity>
          </View>
          <View
            style={[
              styles.rowWrapper,
              styles.withBorderBottom,
              styles.withMarginTop,
              { borderBottomColor: colors.border },
            ]}>
            <AccessibleTouchableOpacity
              onPress={() => updateClockType(24)}
              delayPressIn={100}
              accessibilityState={{
                selected: clockType === 24,
              }}
              accessibilityRole="button"
              accessibilityHint={`${t('settings:clockSettingHint')} ${t(
                'settings:24-hour-clock'
              )}`}>
              <View style={styles.row}>
                <Text style={[styles.text, { color: colors.text }]}>
                  {t('settings:24-hour-clock')}
                </Text>
                {clockType === 24 && (
                  <Icon
                    name="checkmark"
                    size={22}
                    style={{ color: colors.text }}
                  />
                )}
              </View>
            </AccessibleTouchableOpacity>
          </View>
        </View>
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
  title: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
  },
  rowWrapper: {
    marginHorizontal: 20,
  },
  withBorderBottom: {
    borderBottomWidth: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    width: '100%',
    height: 48,
  },
  text: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
  },
  withMarginTop: {
    marginTop: 16,
  },
  editText: {
    fontSize: 16,
    fontFamily: 'Roboto-Medium',
    marginRight: 8,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sheetContainer: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  sheetListContainer: {
    flex: 1,
    paddingTop: 20,
  },
  sheetTitle: {
    flexDirection: 'row',
    paddingLeft: 20,
    paddingBottom: 10,
  },
  draggableIcon: {
    width: 65,
    backgroundColor: GRAY_1,
  },
});

export default connector(SettingsScreen);
