import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';

import { State } from '../store/types';
import { selectSliderStep } from '../store/map/selectors';
import { updateSliderStep as updateSliderStepAction } from '../store/map/actions';

import { VERY_LIGHT_BLUE, PRIMARY_BLUE } from '../utils/colors';

const mapStateToProps = (state: State) => ({
  sliderStep: selectSliderStep(state),
});

const mapDispatchToProps = {
  updateSliderStep: updateSliderStepAction,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

type Props = PropsFromRedux;

const TimeStepBottomSheet: React.FC<Props> = ({
  sliderStep,
  updateSliderStep,
}) => {
  const { t } = useTranslation();
  return (
    <View style={styles.sheetListContainer}>
      <View style={styles.sheetTitle}>
        <Text style={styles.title}>{t('map:timeStepBottomSheetTitle')}</Text>
      </View>
      <View style={[styles.rowWrapper, styles.withBorderBottom]}>
        <TouchableOpacity onPress={() => updateSliderStep(15)}>
          <View style={styles.row}>
            <Text style={styles.text}>15 min</Text>
            {sliderStep === 15 && (
              <Icon name="checkmark" size={22} color={PRIMARY_BLUE} />
            )}
          </View>
        </TouchableOpacity>
      </View>
      <View style={[styles.rowWrapper, styles.withBorderBottom]}>
        <TouchableOpacity onPress={() => updateSliderStep(30)}>
          <View style={styles.row}>
            <Text style={styles.text}>30 min</Text>
            {sliderStep === 30 && (
              <Icon name="checkmark" size={22} color={PRIMARY_BLUE} />
            )}
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.rowWrapper}>
        <TouchableOpacity onPress={() => updateSliderStep(60)}>
          <View style={styles.row}>
            <Text style={styles.text}>60 min</Text>
            {sliderStep === 60 && (
              <Icon name="checkmark" size={22} color={PRIMARY_BLUE} />
            )}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sheetListContainer: {
    flex: 1,
    paddingTop: 20,
  },
  sheetTitle: {
    flexDirection: 'row',
    paddingLeft: 20,
    paddingBottom: 10,
  },
  rowWrapper: {
    marginHorizontal: 32,
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
