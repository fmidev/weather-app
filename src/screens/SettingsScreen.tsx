/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useRef } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import {
  View,
  SafeAreaView,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import RBSheet from 'react-native-raw-bottom-sheet';

import Icon from '../components/Icon';

import { setItem, LOCALE } from '../utils/async_storage';
import { UNITS } from '../utils/units';
import { State } from '../store/types';
import { selectUnits } from '../store/settings/selectors';
import { updateUnits as updateUnitsAction } from '../store/settings/actions';
import { UnitType } from '../store/settings/types';

const mapStateToProps = (state: State) => ({
  units: selectUnits(state),
});

const mapDispatchToProps = {
  updateUnits: updateUnitsAction,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

type Props = PropsFromRedux;

const SettingsScreen: React.FC<Props> = ({ units, updateUnits }) => {
  const { t, i18n } = useTranslation('settings');
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
      <View style={styles.titleContainer} testID="settings_language_header">
        <Text style={styles.title}>{t('settings:language')}</Text>
      </View>
      <View>
        <View style={[styles.rowWrapper, styles.withBorderBottom]}>
          <TouchableOpacity
            onPress={() => onChangeLanguage('fi')}
            delayPressIn={100}
            disabled={i18n.language === 'fi'}>
            <View style={styles.row}>
              <Text style={styles.text}>{t('settings:fi')}</Text>
              {i18n.language === 'fi' && <Icon name="checkmark" size={22} />}
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.rowWrapper}>
          <TouchableOpacity
            onPress={() => onChangeLanguage('en')}
            delayPressIn={100}
            disabled={i18n.language === 'en'}>
            <View style={styles.row}>
              <Text style={styles.text}>{t('settings:en')}</Text>
              {i18n.language === 'en' && <Icon name="checkmark" size={22} />}
            </View>
          </TouchableOpacity>
        </View>
      </View>
      {units && (
        <>
          <View style={styles.titleContainer} testID="settings_units_header">
            <Text style={styles.title}>{t('settings:units')}</Text>
          </View>
          <View>
            {Object.keys(units).map((key, i) => (
              <View
                key={key}
                style={[
                  styles.rowWrapper,
                  i < Object.keys(units).length - 1
                    ? styles.withBorderBottom
                    : null,
                ]}>
                <TouchableOpacity onPress={() => sheetRefs[key].current.open()}>
                  <View style={styles.row}>
                    <Text>{t(`settings:${key}`)}</Text>
                    <Text>
                      {key === 'temperature' ? '°' : ''}
                      {units[key].unitAbb}
                    </Text>
                  </View>
                  {unitTypesByKey(key) && (
                    <RBSheet
                      ref={sheetRefs[key]}
                      height={300}
                      closeOnDragDown
                      customStyles={{ container: styles.sheetContainer }}>
                      <View style={styles.sheetListContainer}>
                        <View style={styles.sheetTitle}>
                          <Text style={styles.title}>
                            {t(`settings:${key}`)}
                          </Text>
                        </View>
                        {unitTypesByKey(key)?.map((type, j) => (
                          <View
                            key={type.unitId}
                            style={[
                              styles.rowWrapper,
                              styles.withBorderBottom,
                            ]}>
                            <TouchableOpacity
                              onPress={() => updateUnits(key, type)}>
                              <View style={styles.row}>
                                <Text>
                                  {key === 'temperature' ? '°' : ''}
                                  {type.unitAbb}
                                </Text>
                                {units[key].unitId === type.unitId && (
                                  <Icon name="checkmark" size={22} />
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleContainer: {
    padding: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
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
    fontSize: 15,
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
});

export default connector(SettingsScreen);
