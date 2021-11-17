/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useRef } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import {
  View,
  SafeAreaView,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import RBSheet from 'react-native-raw-bottom-sheet';
import { useTheme } from '@react-navigation/native';

import Icon from '@components/common/Icon';

import { setItem, LOCALE } from '@utils/async_storage';
import { UNITS } from '@utils/units';
import { State } from '@store/types';
import { selectUnits, selectTheme } from '@store/settings/selectors';
import {
  updateUnits as updateUnitsAction,
  updateTheme as updateThemeAction,
} from '@store/settings/actions';
import { UnitType } from '@store/settings/types';
import { GRAY_1 } from '@utils/colors';

const mapStateToProps = (state: State) => ({
  units: selectUnits(state),
  theme: selectTheme(state),
});

const mapDispatchToProps = {
  updateUnits: updateUnitsAction,
  updateTheme: updateThemeAction,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

type Props = PropsFromRedux;

const SettingsScreen: React.FC<Props> = ({
  theme,
  units,
  updateUnits,
  updateTheme,
}) => {
  const { t, i18n } = useTranslation('settings');
  const { colors } = useTheme();
  const sheetRefs = {
    temperature: useRef(),
    precipitation: useRef(),
    wind: useRef(),
    pressure: useRef(),
  } as { [key: string]: React.MutableRefObject<RBSheet> };

  const onChangeLanguage = async (lang: string): Promise<void> => {
    i18n.changeLanguage(lang);
    try {
      await setItem(LOCALE, lang);
    } catch (error) {
      console.error('error:', error);
    }
  };

  const unitTypesByKey = (key: string): UnitType[] | undefined =>
    UNITS.find((unit) => unit.parameterName === key)?.unitTypes;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}>
        <View style={styles.titleContainer}>
          <Text
            style={[styles.title, { color: colors.text }]}
            testID="settings_language_header">
            {t('settings:language')}
          </Text>
        </View>
        <View>
          <View
            style={[
              styles.rowWrapper,
              styles.withBorderBottom,
              { borderBottomColor: colors.border },
            ]}>
            <TouchableOpacity
              onPress={() => onChangeLanguage('fi')}
              delayPressIn={100}
              disabled={i18n.language === 'fi'}
              testID="settings_set_language_fi">
              <View style={styles.row}>
                <Text style={[styles.text, { color: colors.text }]}>
                  {t('settings:fi')}
                </Text>
                {i18n.language === 'fi' && (
                  <Icon
                    name="checkmark"
                    size={22}
                    style={{ color: colors.text }}
                  />
                )}
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles.rowWrapper}>
            <TouchableOpacity
              onPress={() => onChangeLanguage('en')}
              delayPressIn={100}
              disabled={i18n.language === 'en'}
              testID="settings_set_language_en">
              <View style={styles.row}>
                <Text style={[styles.text, { color: colors.text }]}>
                  {t('settings:en')}
                </Text>
                {i18n.language === 'en' && (
                  <Icon
                    name="checkmark"
                    size={22}
                    style={{ color: colors.text }}
                  />
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.titleContainer}>
          <Text
            style={[styles.title, { color: colors.text }]}
            testID="settings_theme_header">
            {t('settings:appearance')}
          </Text>
        </View>
        <View>
          <View
            style={[
              styles.rowWrapper,
              styles.withBorderBottom,
              { borderBottomColor: colors.border },
            ]}>
            <TouchableOpacity
              onPress={() => updateTheme('light')}
              delayPressIn={100}
              disabled={theme === 'light'}
              testID="settings_set_theme_light">
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
            </TouchableOpacity>
          </View>
          <View
            style={[
              styles.rowWrapper,
              styles.withBorderBottom,
              { borderBottomColor: colors.border },
            ]}>
            <TouchableOpacity
              onPress={() => updateTheme('dark')}
              delayPressIn={100}
              disabled={theme === 'dark'}
              testID="settings_set_theme_dark">
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
            </TouchableOpacity>
          </View>
          <View style={styles.rowWrapper}>
            <TouchableOpacity
              onPress={() => updateTheme('automatic')}
              delayPressIn={100}
              disabled={theme === 'automatic'}
              testID="settings_set_theme_automatic">
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
            </TouchableOpacity>
          </View>
        </View>
        {units && (
          <>
            <View style={styles.titleContainer} testID="settings_units_header">
              <Text style={[styles.title, { color: colors.text }]}>
                {t('settings:units')}
              </Text>
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
                  <TouchableOpacity
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
                          {unitTypesByKey(key)?.map((type, j) => (
                            <View
                              key={type.unitId}
                              style={[
                                styles.rowWrapper,
                                styles.withBorderBottom,
                                { borderBottomColor: colors.border },
                              ]}>
                              <TouchableOpacity
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
                              </TouchableOpacity>
                            </View>
                          ))}
                        </View>
                      </RBSheet>
                    )}
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    minHeight: '100%',
  },
  titleContainer: {
    padding: 20,
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
    paddingVertical: 13,
  },
  text: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
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
