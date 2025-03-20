import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import moment from 'moment';

import { State } from '@store/types';

import { CustomTheme } from '@assets/colors';
import { selectForecastByDay } from '@store/forecast/selectors';
import ModalForecast from './ModalForecast';
import { uppercaseFirst } from '@utils/helpers';
import Icon from '@components/common/Icon';
import CloseButton from '@components/common/CloseButton';

const mapStateToProps = (state: State) => ({
  data: selectForecastByDay(state),
});

const connector = connect(mapStateToProps, {});

type PropsFromRedux = ConnectedProps<typeof connector>;

type ModalContentProps = PropsFromRedux & {
  activeDayIndex: number;
  timeStamp: number;
  onClose: () => void;
  onDayChange: (forward: boolean) => void;
};

const DailyModal: React.FC<ModalContentProps> = ({
  data,
  activeDayIndex,
  timeStamp,
  onClose,
  onDayChange
}) => {
  const { t } = useTranslation('forecast');
  const { colors } = useTheme() as CustomTheme;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.flex, styles.flexRow, styles.center]}>
          { activeDayIndex > 0 ?
            (<Icon name="arrow-left" color={colors.primaryText} onPress={ () => onDayChange(false) } />)
            :
            (<View style={styles.spacer} />)
          }
          <Text style={[styles.text, styles.bold, styles.headerText, { color: colors.primaryText }]}>
            {uppercaseFirst(moment(timeStamp).format('dddd, D.M.'))}
          </Text>
          <Icon name="arrow-right" color={colors.primaryText} onPress={() => onDayChange(true) } />
        </View>
        <View style={styles.closeButtonContainer}>
          <CloseButton
            testID="forecast_modal_close_button"
            onPress={onClose}
            accessibilityLabel={t('close')}
          />
        </View>
      </View>
      <ModalForecast data={data ? data[moment(timeStamp).format('D.M.')] : []} />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  header: {
    width: '100%',
    height: 50,
    alignItems: 'center',
    paddingVertical: 16,
  },
  text: {
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
  },
  bold: {
    fontWeight: 'bold',
  },
  closeButtonContainer: {
    position: 'absolute',
    right: 0,
    top: 2,
  },
  flex: {
    flex: 1,
  },
  flexRow: {
    flexDirection: 'row',
  },
  center: {
    alignItems: 'center',
  },
  headerText: {
    marginHorizontal: 16,
    width: 130,
    height: 25,
    textAlign: 'center',
  },
  spacer: {
    width: 25,
    height: 25,
  },
});

export default connector(DailyModal);