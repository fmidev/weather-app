import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@react-navigation/native';

import Icon from '@components/common/Icon';
import CloseButton from '@components/common/CloseButton';

import { State } from '@store/types';
import { selectSliderStep } from '@store/map/selectors';
import { updateSliderStep as updateSliderStepAction } from '@store/map/actions';

import { SECONDARY_BLUE, GRAY_1 } from '@utils/colors';

const mapStateToProps = (state: State) => ({
  sliderStep: selectSliderStep(state),
});

const mapDispatchToProps = {
  updateSliderStep: updateSliderStepAction,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

type TimeStepBottomSheetProps = PropsFromRedux & {
  onClose: () => void;
};

const TimeStepBottomSheet: React.FC<TimeStepBottomSheetProps> = ({
  onClose,
  sliderStep,
  updateSliderStep,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const getIcon = (step: number) =>
    sliderStep === step ? (
      <Icon
        name="radio-button-on"
        width={22}
        height={22}
        style={{ color: SECONDARY_BLUE }}
      />
    ) : (
      <Icon
        name="radio-button-off"
        width={22}
        height={22}
        style={{ color: GRAY_1 }}
      />
    );
  return (
    <View
      style={[
        styles.sheetListContainer,
        { backgroundColor: colors.background },
      ]}>
      <View style={styles.closeButtonContainer}>
        <CloseButton
          onPress={onClose}
          accessibilityLabel={t(
            'map:timeStepBottomSheet:closeAccessibilityLabel'
          )}
        />
      </View>
      <View style={styles.sheetTitle}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t('map:timeStepBottomSheet:title')}
        </Text>
      </View>
      <View
        style={[
          styles.rowWrapper,
          styles.withBorderBottom,
          { borderBottomColor: colors.border },
        ]}>
        <TouchableOpacity onPress={() => updateSliderStep(15)}>
          <View style={styles.row}>
            <Text style={[styles.text, { color: colors.text }]}>15 min</Text>
            {getIcon(15)}
          </View>
        </TouchableOpacity>
      </View>
      <View
        style={[
          styles.rowWrapper,
          styles.withBorderBottom,
          { borderBottomColor: colors.border },
        ]}>
        <TouchableOpacity onPress={() => updateSliderStep(30)}>
          <View style={styles.row}>
            <Text style={[styles.text, { color: colors.text }]}>30 min</Text>
            {getIcon(30)}
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.rowWrapper}>
        <TouchableOpacity onPress={() => updateSliderStep(60)}>
          <View style={styles.row}>
            <Text style={[styles.text, { color: colors.text }]}>60 min</Text>
            {getIcon(60)}
          </View>
        </TouchableOpacity>
      </View>
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
    justifyContent: 'space-between',
  },
  rowWrapper: {
    marginHorizontal: 12,
  },
  withBorderBottom: {
    borderBottomWidth: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  text: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
  },
  title: {
    fontSize: 16,
    fontFamily: 'Roboto-Bold',
  },
});

export default connector(TimeStepBottomSheet);
