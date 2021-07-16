import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';

import Icon from './Icon';
import CloseButton from './CloseButton';

import { State } from '../store/types';
import { selectSliderStep } from '../store/map/selectors';
import { updateSliderStep as updateSliderStepAction } from '../store/map/actions';

import {
  VERY_LIGHT_BLUE,
  PRIMARY_BLUE,
  SECONDARY_BLUE,
  GRAY,
} from '../utils/colors';

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
        style={{ color: GRAY }}
      />
    );
  return (
    <View style={styles.sheetListContainer}>
      <View style={styles.closeButtonContainer}>
        <CloseButton
          onPress={onClose}
          accessibilityLabel={t(
            'map:timeStepBottomSheet:closeAccessibilityLabel'
          )}
        />
      </View>
      <View style={styles.sheetTitle}>
        <Text style={styles.title}>{t('map:timeStepBottomSheet:title')}</Text>
      </View>
      <View style={[styles.rowWrapper, styles.withBorderBottom]}>
        <TouchableOpacity onPress={() => updateSliderStep(15)}>
          <View style={styles.row}>
            <Text style={styles.text}>15 min</Text>
            {getIcon(15)}
          </View>
        </TouchableOpacity>
      </View>
      <View style={[styles.rowWrapper, styles.withBorderBottom]}>
        <TouchableOpacity onPress={() => updateSliderStep(30)}>
          <View style={styles.row}>
            <Text style={styles.text}>30 min</Text>
            {getIcon(30)}
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.rowWrapper}>
        <TouchableOpacity onPress={() => updateSliderStep(60)}>
          <View style={styles.row}>
            <Text style={styles.text}>60 min</Text>
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
    borderColor: VERY_LIGHT_BLUE,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  text: {
    fontSize: 16,
    color: PRIMARY_BLUE,
  },
  title: {
    fontSize: 14,
    color: PRIMARY_BLUE,
    fontWeight: 'bold',
  },
});

export default connector(TimeStepBottomSheet);
