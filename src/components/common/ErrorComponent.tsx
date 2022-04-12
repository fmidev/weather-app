import React, { useEffect, useState, useCallback } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import NetInfo from '@react-native-community/netinfo';

import { State } from '@store/types';
import { selectCurrent } from '@store/location/selector';
import { selectError as selectForecastError } from '@store/forecast/selectors';
import { selectError as selectObservationError } from '@store/observation/selector';
import { selectError as selectWarningsError } from '@store/warnings/selectors';
import { selectActiveOverlay, selectOverlaysError } from '@store/map/selectors';

import { fetchForecast as fetchForecastAction } from '@store/forecast/actions';
import { fetchObservation as fetchObservationAction } from '@store/observation/actions';
import { fetchWarnings as fetchWarningsAction } from '@store/warnings/actions';
import { updateOverlays as updateOverlaysAction } from '@store/map/actions';

import { YELLOW, BLACK, CustomTheme } from '@utils/colors';

import Icon from './Icon';
import AccessibleTouchableOpacity from './AccessibleTouchableOpacity';

const mapStateToProps = (state: State) => ({
  location: selectCurrent(state),
  forecastError: selectForecastError(state),
  observationError: selectObservationError(state),
  warningsError: selectWarningsError(state),
  activeOverlay: selectActiveOverlay(state),
  overlaysError: selectOverlaysError(state),
});

const mapDispatchToProps = {
  fetchForecast: fetchForecastAction,
  fetchObservation: fetchObservationAction,
  fetchWarnings: fetchWarningsAction,
  updateOverlays: updateOverlaysAction,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

type Message = {
  title: string;
  additionalInfo?: string;
};

type Messages = {
  warnings: Message;
  forecast: Message;
  observation: Message;
  overlays: Message;
  noInternet: Message;
};

const ErrorComponent: React.FC<PropsFromRedux> = ({
  location,
  activeOverlay,
  forecastError,
  observationError,
  warningsError,
  overlaysError,
  fetchForecast,
  fetchObservation,
  fetchWarnings,
  updateOverlays,
}) => {
  const { t } = useTranslation('error');
  const { colors } = useTheme() as CustomTheme;
  const [errorType, setErrorType] = useState<keyof Messages | undefined>(
    undefined
  );

  const tryUpdateForecast = useCallback(() => {
    const geoid = location.id;
    fetchForecast({ geoid }, [geoid]);
    setErrorType(undefined);
  }, [fetchForecast, location]);

  const tryUpdateObservation = useCallback(() => {
    fetchObservation({ geoid: location.id }, location.country);
    setErrorType(undefined);
  }, [fetchObservation, location]);

  const tryUpdateWarnings = useCallback(() => {
    fetchWarnings(location);
    setErrorType(undefined);
  }, [fetchWarnings, location]);

  const tryUpdateOverlays = useCallback(() => {
    updateOverlays(activeOverlay);
    setErrorType(undefined);
  }, [updateOverlays, activeOverlay]);

  const tryAgainFunctions: {
    forecast: () => void;
    observation: () => void;
    warnings: () => void;
    overlays: () => void;
  } = {
    forecast: tryUpdateForecast,
    observation: tryUpdateObservation,
    warnings: tryUpdateWarnings,
    overlays: tryUpdateOverlays,
  };

  const messages: Messages = {
    forecast: {
      title: t('forecastErrorTitle'),
    },
    observation: {
      title: t('observationErrorTitle'),
    },
    warnings: {
      title: t('warningsErrorTitle'),
    },
    noInternet: {
      title: t('noInternetTitle'),
      additionalInfo: t('checkConnection'),
    },
    overlays: {
      title: t('overlaysErrorTitle'),
    },
  };

  useEffect(() => {
    NetInfo.fetch().then((state) => {
      if (!state.isConnected) {
        setErrorType('noInternet');
      }
      if (state.isConnected) {
        if (forecastError) {
          setErrorType('forecast');
        }
        if (observationError) {
          setErrorType('observation');
        }
        if (warningsError) {
          setErrorType('warnings');
        }
        if (overlaysError) {
          setErrorType('overlays');
        }
      }
    });
  }, [forecastError, observationError, warningsError, overlaysError]);

  return errorType ? (
    <View style={[styles.container, { borderColor: colors.border }]}>
      <View style={styles.row}>
        <Text style={styles.title}>{messages[errorType].title}</Text>
        <AccessibleTouchableOpacity
          onPress={() => setErrorType(undefined)}
          style={styles.closeButton}>
          <Icon name="close-outline" size={24} color={BLACK} />
        </AccessibleTouchableOpacity>
      </View>
      {errorType === 'noInternet' ? (
        <Text style={styles.text}>{messages[errorType].additionalInfo}</Text>
      ) : (
        <AccessibleTouchableOpacity
          onPress={() => tryAgainFunctions[errorType]()}>
          <View style={styles.tryAgainButton}>
            <View style={styles.textContainer}>
              <Text style={styles.buttonText}>{t('tryAgain')}</Text>
            </View>
          </View>
        </AccessibleTouchableOpacity>
      )}
    </View>
  ) : null;
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 90,
    right: 10,
    left: 10,
    padding: 12,
    backgroundColor: YELLOW,
    borderWidth: 2,
    flex: 1,
    borderRadius: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontFamily: 'Roboto-Medium',
    color: BLACK,
  },
  text: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
    color: BLACK,
  },
  buttonText: {
    fontSize: 14,
    fontFamily: 'Roboto-Medium',
    color: BLACK,
  },
  closeButton: {
    marginTop: -12,
    marginRight: -12,
  },
  textContainer: {
    height: '100%',
    justifyContent: 'center',
  },
  tryAgainButton: {
    paddingHorizontal: 20,
    height: 44,
    borderRadius: 25,
    borderWidth: 2,
  },
});

export default connector(ErrorComponent);
