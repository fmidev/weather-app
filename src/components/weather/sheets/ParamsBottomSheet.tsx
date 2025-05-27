import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import {
  View,
  StyleSheet,
  Text,
  Switch,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@react-navigation/native';

import Icon from '@assets/Icon';
import AccessibleTouchableOpacity from '@components/common/AccessibleTouchableOpacity';
import CloseButton from '@components/common/CloseButton';

import { State } from '@store/types';
import { selectDisplayParams } from '@store/forecast/selectors';
import { selectUnits } from '@store/settings/selectors';
import {
  updateDisplayParams as updateDisplayParamsAction,
  restoreDefaultDisplayParams as restoreDefaultDisplayParamsAction,
} from '@store/forecast/actions';
import constants, {
  RELATIVE_HUMIDITY,
  PRESSURE,
  UV_CUMULATED,
  PARAMS_TO_ICONS,
  DAY_LENGTH,
} from '@store/forecast/constants';

import { useOrientation } from '@utils/hooks';
import {
  WHITE,
  SECONDARY_BLUE,
  GRAYISH_BLUE,
  CustomTheme,
} from '@assets/colors';
import { Config } from '@config';
import { DisplayParameters } from '@store/forecast/types';

const mapStateToProps = (state: State) => ({
  displayParams: selectDisplayParams(state),
  units: selectUnits(state),
});

const mapDispatchToProps = {
  updateDisplayParams: updateDisplayParamsAction,
  restoreDefaultDisplayParams: restoreDefaultDisplayParamsAction,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

type ParamsBottomSheetProps = PropsFromRedux & {
  onClose: () => void;
};

const disabledStyle = Platform.OS === 'android' ? { opacity: 0.5 } : {};

const ParamsBottomSheet: React.FC<ParamsBottomSheetProps> = ({
  displayParams,
  updateDisplayParams,
  restoreDefaultDisplayParams,
  onClose,
  units,
}) => {
  const { t } = useTranslation('forecast');
  const { colors } = useTheme() as CustomTheme;
  const isLandscape = useOrientation();
  const { data, excludeDayLength } = Config.get('weather').forecast;
  const activeParameters = data.flatMap(({ parameters }) => parameters);

  const regex = new RegExp(
    (excludeDayLength
      ? [...activeParameters]
      : [...activeParameters, DAY_LENGTH]
    ).join('|')
  );
  const activeConstants = constants.filter((constant) =>
    regex.test(constant)
  ) as DisplayParameters[];

  const defaultUnits = Config.get('settings').units;

  const getUnitForParameter = (parameter: DisplayParameters) => {
    switch (parameter) {
      case 'temperature':
      case 'feelsLike':
      case 'dewPoint':
        return units?.temperature.unitAbb ?? defaultUnits.temperature;
      case 'windSpeedMSwindDirection':
      case 'hourlymaximumgust':
        return units?.wind.unitAbb ?? defaultUnits.wind;
      case 'precipitation1h':
        return units?.precipitation.unitAbb ?? defaultUnits.precipitation;
      case 'pressure':
        return units?.pressure.unitAbb ?? defaultUnits.pressure;
      default:
        return null;
    }
  };

  const rowRenderer = (param: DisplayParameters, index: number) => (
    <View
      accessible
      accessibilityState={{
        selected: displayParams.some((arr) => arr.includes(param)),
      }}
      accessibilityHint={
        displayParams.some((arr) => arr.includes(param))
          ? t('paramsBottomSheet.unSelectAccessibilityHint')
          : t('paramsBottomSheet.selectAccessibilityHint')
      }
      onAccessibilityTap={() => updateDisplayParams([index, param])}
      key={String(param)}
      style={[styles.row, { borderBottomColor: colors.border }]}>
      <View style={styles.innerRow}>
        {param !== RELATIVE_HUMIDITY &&
          param !== PRESSURE &&
          param !== UV_CUMULATED && (
            <Icon
              name={PARAMS_TO_ICONS[String(param)]}
              style={styles.withMarginRight}
              color={colors.hourListText}
            />
          )}
        {param === RELATIVE_HUMIDITY && (
          <Text
            accessibilityLabel=""
            style={[
              styles.iconText,
              styles.withMarginRight,
              { color: colors.hourListText },
            ]}>
            RH%
          </Text>
        )}
        {param === PRESSURE && (
          <Text
            accessibilityLabel=""
            style={[
              styles.iconText,
              styles.withMarginRight,
              { color: colors.hourListText },
            ]}>
            {t(`unitAbbreviations:${getUnitForParameter(param)}`)}
          </Text>
        )}
        {param === UV_CUMULATED && (
          <Text
            accessibilityLabel=""
            style={[
              styles.iconText,
              styles.withMarginRight,
              { color: colors.hourListText },
            ]}>
            UV
          </Text>
        )}
        <Text style={[styles.text, { color: colors.hourListText }]}>
          {t(`paramsBottomSheet.${param}`, {
            unit: t(`unitAbbreviations:${getUnitForParameter(param)}`),
          })}
        </Text>
      </View>

      <Switch
        testID={`weather_params_switch_${param}`}
        style={
          displayParams.length === 1 && displayParams[0][1] === param
            ? disabledStyle
            : {}
        }
        trackColor={{ false: GRAYISH_BLUE, true: SECONDARY_BLUE }}
        thumbColor={WHITE}
        ios_backgroundColor={GRAYISH_BLUE}
        value={displayParams.some((arr) => arr.includes(param))}
        onValueChange={() => updateDisplayParams([index, param])}
        disabled={displayParams.length === 1 && displayParams[0][1] === param}
      />
    </View>
  );

  return (
    <View testID="weather_params_bottom_sheet" style={styles.wrapper}>
      <View style={styles.sheetListContainer}>
        <View style={styles.closeButtonContainer}>
          <CloseButton
            testID="weather_params_bottom_sheet_close_button"
            onPress={onClose}
            accessibilityLabel={t('paramsBottomSheet.closeAccessibilityLabel')}
          />
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={isLandscape && styles.landscape}>
          <TouchableOpacity activeOpacity={1} accessible={false}>
            <View style={styles.sheetTitle}>
              <Text
                accessibilityRole="header"
                style={[styles.title, { color: colors.primaryText }]}>
                {t('paramsBottomSheet.title')}
              </Text>
            </View>
            <View style={styles.descriptionContainer} accessible>
              <Text style={[styles.text, { color: colors.hourListText }]}>
                {t('paramsBottomSheet.subTitle')}
              </Text>
            </View>

            {activeConstants.map(rowRenderer)}
            <View style={styles.lastRow}>
              <AccessibleTouchableOpacity
                testID="weather_params_restore_button"
                accessible
                accessibilityRole="button"
                accessibilityHint={t('paramsBottomSheet.restoreDefaultHint')}
                onPress={() => restoreDefaultDisplayParams()}>
                <Text
                  style={[
                    styles.restoreText,
                    {
                      color: colors.primaryText,
                    },
                  ]}>
                  {t('paramsBottomSheet.restoreButtonText')}
                </Text>
              </AccessibleTouchableOpacity>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  sheetListContainer: {
    flex: 1,
    marginTop: -10,
    paddingHorizontal: 20,
  },
  closeButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  sheetTitle: {
    flexDirection: 'row',
    paddingBottom: 10,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  descriptionContainer: {
    marginTop: 24,
    marginBottom: 16,
  },
  innerRow: {
    flexDirection: 'row',
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
  },
  text: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
  },
  withMarginRight: {
    marginRight: 10,
  },
  restoreText: {
    fontSize: 16,
    fontFamily: 'Roboto-Medium',
  },
  iconText: {
    fontSize: 14,
    fontFamily: 'Roboto-Medium',
  },
  lastRow: {
    flex: 1,
    alignItems: 'flex-end',
    minHeight: 60,
    marginTop: 14,
  },
  landscape: {
    paddingBottom: 200,
  },
});

export default connector(ParamsBottomSheet);
