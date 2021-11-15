import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import {
  View,
  StyleSheet,
  Text,
  Switch,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@react-navigation/native';

import Icon from '@components/common/Icon';
import CloseButton from '@components/common/CloseButton';

import { State } from '@store/types';
import { selectDisplayParams } from '@store/forecast/selectors';
import {
  updateDisplayParams as updateDisplayParamsAction,
  restoreDefaultDisplayParams as restoreDefaultDisplayParamsAction,
} from '@store/forecast/actions';
import constants, {
  SMART_SYMBOL,
  RELATIVE_HUMIDITY,
  PRESSURE,
  PARAMS_TO_ICONS,
} from '@store/forecast/constants';

import {
  WHITE,
  SECONDARY_BLUE,
  GRAYISH_BLUE,
  CustomTheme,
} from '@utils/colors';

const mapStateToProps = (state: State) => ({
  displayParams: selectDisplayParams(state),
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

const ParamsBottomSheet: React.FC<ParamsBottomSheetProps> = ({
  displayParams,
  updateDisplayParams,
  restoreDefaultDisplayParams,
  onClose,
}) => {
  const { t } = useTranslation('forecast');
  const { colors } = useTheme() as CustomTheme;

  const rowRenderer = (param: string, index: number) => (
    <View
      key={param}
      style={[styles.row, { borderBottomColor: colors.border }]}>
      <View style={styles.innerRow}>
        {param !== RELATIVE_HUMIDITY && param !== PRESSURE && (
          <Icon
            name={PARAMS_TO_ICONS[param]}
            style={styles.withMarginRight}
            color={colors.hourListText}
          />
        )}
        {param === RELATIVE_HUMIDITY && (
          <Text
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
            style={[
              styles.iconText,
              styles.withMarginRight,
              { color: colors.hourListText },
            ]}>
            hPa
          </Text>
        )}
        <Text style={[styles.text, { color: colors.hourListText }]}>
          {t(`paramsBottomSheet.${param}`)}
        </Text>
      </View>

      <Switch
        trackColor={{ false: GRAYISH_BLUE, true: SECONDARY_BLUE }}
        thumbColor={WHITE}
        ios_backgroundColor={GRAYISH_BLUE}
        value={displayParams.some((arr) => arr.includes(param))}
        onValueChange={() => updateDisplayParams([index, param])}
        disabled={param === SMART_SYMBOL}
      />
    </View>
  );

  return (
    <View style={styles.sheetListContainer}>
      <View style={styles.closeButtonContainer}>
        <CloseButton
          onPress={onClose}
          accessibilityLabel={t('paramsBottomSheet.closeAccessibilityLabel')}
        />
      </View>

      <View style={styles.sheetTitle}>
        <Text style={[styles.title, { color: colors.primaryText }]}>
          {t('paramsBottomSheet.title')}
        </Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <TouchableOpacity activeOpacity={1}>
          <View style={styles.descriptionContainer}>
            <Text style={(styles.title, { color: colors.hourListText })}>
              {t('paramsBottomSheet.subTitle')}
            </Text>
          </View>

          {constants.map(rowRenderer)}
          <View style={styles.lastRow}>
            <TouchableOpacity onPress={() => restoreDefaultDisplayParams()}>
              <Text
                style={[
                  styles.restoreText,
                  {
                    color: colors.primaryText,
                  },
                ]}>
                {t('paramsBottomSheet.restoreButtonText')}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
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
    marginTop: 24,
  },
});

export default connector(ParamsBottomSheet);
