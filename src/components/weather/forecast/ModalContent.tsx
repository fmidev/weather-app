import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import moment from 'moment';

import { State } from '@store/types';
import { CustomTheme } from '@assets/colors';
import { selectForecastByDay } from '@store/forecast/selectors';
import ModalForecast from './ModalForecast';
import { uppercaseFirst } from '@utils/helpers';
import Icon from '@assets/Icon';
import Text from '@components/common/AppText';
import CloseButton from '@components/common/CloseButton';
import { trackMatomoEvent } from '@utils/matomo';

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
  initialPosition: 'start' | 'end';
};

const DailyModal: React.FC<ModalContentProps> = ({
  data,
  activeDayIndex,
  timeStamp,
  onClose,
  onDayChange,
  initialPosition
}) => {
  const { fontScale } = useWindowDimensions();
  const { t, i18n } = useTranslation('forecast');
  const { colors } = useTheme() as CustomTheme;
  const largeFonts = fontScale >= 1.5;
  const iconSize = Math.min(fontScale * 22, 44);
  const dateFormat = largeFonts ? 'dd D.M.' : 'dddd, D.M.';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.flex, styles.flexRow, styles.center]}>
          { activeDayIndex > 0 ?
            (<View accessible>
                <Icon
                  name="arrow-left"
                  color={colors.primaryText}
                  onPress={ () => {
                    trackMatomoEvent('User action', 'Weather', 'Modal PREV day');
                    onDayChange(false);
                  }}
                  size={iconSize}
                  accessibilityLabel={t('previousDay')}
                />
              </View>)
            :
            (<View style={styles.spacer} />)
          }
          <Text
            accessibilityRole="header"
            numberOfLines={1}
            style={[styles.text, styles.bold, styles.headerText, { color: colors.primaryText }]}>
            {uppercaseFirst(moment(timeStamp).locale(i18n.language).format(dateFormat))}
          </Text>
          <View accessible>
            <Icon
              name="arrow-right"
              color={colors.primaryText}
              onPress={() => {
                trackMatomoEvent('User action', 'Weather', 'Modal NEXT day');
                onDayChange(true)
              }}
              size={iconSize}
              accessibilityLabel={t('nextDay')}
            />
          </View>
        </View>
        <View style={styles.closeButtonContainer} accessible>
          <CloseButton
            testID="forecast_modal_close_button"
            maxScaleFactor={1.5}
            onPress={() => {
              trackMatomoEvent('User action', 'Weather', 'Modal close X');
              onClose();
            }}
            accessibilityLabel={t('closeModal')}
          />
        </View>
      </View>
      <ModalForecast
        data={data ? data[moment(timeStamp).format('D.M.')] : []}
        initialPosition={initialPosition}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  header: {
    width: '100%',
    minHeight: 70,
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
    width: 150,
    minHeight: 20,
    textAlign: 'center',
  },
  spacer: {
    width: 25,
    height: 25,
  },
});

export default connector(DailyModal);