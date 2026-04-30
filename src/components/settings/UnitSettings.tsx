import React, { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import RBSheet from 'react-native-raw-bottom-sheet';

import AccessibleTouchableOpacity from '@components/common/AccessibleTouchableOpacity';
import CloseButton from '@components/common/CloseButton';
import Text from '@components/common/AppText';
import Icon from '@components/common/ScalableIcon';
import { GRAY_1 } from '@assets/colors';
import { Config, type MeasurementUnit } from '@config';
import { UnitMap, UnitType } from '@store/settings/types';
import { getUnitsHiddenInSettings, UNITS } from '@utils/units';
import { trackMatomoEvent } from '@utils/matomo';

interface Props {
  units: UnitMap;
  onChangeUnits: (key: string, unit: UnitType) => void;
}

const UnitSettings: React.FC<Props> = ({ units, onChangeUnits }) => {
  const { colors } = useTheme();
  const { t } = useTranslation('settings');
  const { excludeUnits } = Config.get('settings');
  const hiddenUnits = getUnitsHiddenInSettings();
  const sheetRefs = {
    temperature: useRef<RBSheet>(null),
    precipitation: useRef<RBSheet>(null),
    wind: useRef<RBSheet>(null),
    pressure: useRef<RBSheet>(null),
  } as { [key: string]: React.RefObject<RBSheet> };

  const unitKeys = Object.keys(units);
  const unitTypesByKey = (key: string): UnitType[] | undefined =>
    UNITS.find((unit) => unit.parameterName === key)?.unitTypes;

  const handleUnitChange = (key: string, unit: UnitType): void => {
    trackMatomoEvent(
      'User action',
      'Settings',
      `Select unit - ${key} (${unit.unitAbb})`
    );
    onChangeUnits(key, unit);
    sheetRefs[key].current.close();
  };

  return (
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
        {unitKeys.map((key, i) =>
          hiddenUnits.includes(key) ? null : (
            <View
              key={key}
              style={[
                styles.rowWrapper,
                i < unitKeys.length - 1
                  ? {
                      ...styles.withBorderBottom,
                      borderBottomColor: colors.border,
                    }
                  : null,
              ]}>
              <AccessibleTouchableOpacity
                onPress={() => {
                  sheetRefs[key].current.open();
                }}
                testID={`settings_set_${key}`}>
                <View style={styles.row}>
                  <Text style={[styles.text, { color: colors.text }]}>
                    {t(`settings:${key}`)}
                  </Text>
                  <Text
                    style={[styles.text, { color: colors.text }]}
                    accessibilityLabel={t(
                      `observation:paramUnits.${
                        key === 'temperature' ? '°' : ''
                      }${units[key].unitAbb}`
                    )}
                    testID={`${key}_unitAbb`}>
                    {key === 'temperature' ? '°' : ''}
                    {t(`unitAbbreviations:${units[key].unitAbb}`)}
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
                      <View style={styles.sheetCloseButtonContainer}>
                        <CloseButton
                          onPress={() => sheetRefs[key].current.close()}
                          accessibilityLabel={t(
                            'settings.closeUnitBottomSheetAccessibilityLabel'
                          )}
                        />
                      </View>
                      <View
                        style={styles.sheetTitle}
                        testID={`${key}_unit_sheet_title`}>
                        <Text style={[styles.title, { color: colors.text }]}>
                          {t(`settings:${key}`)}
                        </Text>
                      </View>
                      {unitTypesByKey(key)?.map((type) =>
                        excludeUnits?.includes(
                          type.unitAbb as MeasurementUnit
                        ) ? null : (
                          <View
                            key={type.unitId}
                            style={[
                              styles.rowWrapper,
                              styles.withBorderBottom,
                              { borderBottomColor: colors.border },
                            ]}>
                            <AccessibleTouchableOpacity
                              onPress={() => handleUnitChange(key, type)}
                              testID={`settings_units_${key}_${type.unit}`}>
                              <View style={styles.row}>
                                <Text
                                  accessibilityLabel={t(
                                    `observation:paramUnits.${
                                      key === 'temperature' ? '°' : ''
                                    }${type.unitAbb}`
                                  )}
                                  style={[styles.text, { color: colors.text }]}>
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
                        )
                      )}
                    </View>
                  </RBSheet>
                )}
              </AccessibleTouchableOpacity>
            </View>
          )
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
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
    minHeight: 48,
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
    marginTop: -10,
  },
  sheetCloseButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginRight: 20,
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

export default UnitSettings;
