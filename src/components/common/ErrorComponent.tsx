import React, { useEffect, useState, useCallback } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import NetInfo from '@react-native-community/netinfo';
import { useNavigationState } from '@react-navigation/native';

import { State } from '@store/types';
import { selectCurrent } from '@store/location/selector';
import { selectError as selectForecastError } from '@store/forecast/selectors';
import { selectForecastInvalidData as selectForecastInvalidDataError } from '@store/forecast/selectors';
import { selectError as selectObservationError } from '@store/observation/selector';
import { selectError as selectWarningsError } from '@store/warnings/selectors';
import { selectActiveOverlay, selectOverlaysError } from '@store/map/selectors';

import { fetchForecast as fetchForecastAction } from '@store/forecast/actions';
import { fetchObservation as fetchObservationAction } from '@store/observation/actions';
import { fetchWarnings as fetchWarningsAction } from '@store/warnings/actions';
import { updateOverlays as updateOverlaysAction } from '@store/map/actions';

import { YELLOW, BLACK } from '@utils/colors';

import { Config } from '@config';
import Icon from './Icon';
import AccessibleTouchableOpacity from './AccessibleTouchableOpacity';

const mapStateToProps = (state: State) => ({
  location: selectCurrent(state),
  forecastError: selectForecastError(state),
  forecastInvalidDataError: selectForecastInvalidDataError(state),
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
  outOfServiceArea?: Message;
};

const ErrorComponent: React.FC<PropsFromRedux> = ({
  location,
  activeOverlay,
  forecastError,
  forecastInvalidDataError,
  observationError,
  warningsError,
  overlaysError,
  fetchForecast,
  fetchObservation,
  fetchWarnings,
  updateOverlays,
}) => {
  const activeRoute = useNavigationState(
    (state) => state?.routes[state.index].name || 'Weather'
  );

  const { t, i18n } = useTranslation('error');
  const [errorType, setErrorType] = useState<keyof Messages | undefined>(
    undefined
  );

  const tryUpdateForecast = useCallback(() => {
    const geoid = location.id;
    fetchForecast({ geoid }, [geoid]);
  }, [fetchForecast, location]);

  const tryUpdateObservation = useCallback(() => {
    const observationLocation = location.id
      ? { geoid: location.id }
      : { latlon: `${location.lat},${location.lon}` };
    fetchObservation(observationLocation, location.country);
  }, [fetchObservation, location]);

  const tryUpdateWarnings = useCallback(() => {
    fetchWarnings(location);
  }, [fetchWarnings, location]);

  const tryUpdateOverlays = useCallback(() => {
    updateOverlays(activeOverlay);
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
    outOfServiceArea: (() => {
      const messageFromConfig = Config.get('unresolvedGeoIdErrorMessage');
      if (messageFromConfig) {
        return messageFromConfig[i18n.language];
      }
      return undefined;
    })(),
  };

  useEffect(() => {
    NetInfo.fetch().then((state) => {
      if (!state.isConnected) {
        setErrorType('noInternet');
      }
      if (state.isConnected) {
        if (forecastError && activeRoute === 'Weather') {
          if (
            typeof forecastError === 'object' &&
            forecastError.message.includes('400') &&
            messages.outOfServiceArea
          ) {
            setErrorType('outOfServiceArea');
          } else {
            setErrorType('forecast');
          }
        } else if (forecastInvalidDataError && activeRoute === 'Weather') {
          setErrorType('forecast');
        } else if (observationError && activeRoute === 'Weather') {
          setErrorType('observation');
        } else if (warningsError && activeRoute === 'Warnings') {
          setErrorType('warnings');
        } else if (overlaysError && activeRoute === 'Map') {
          setErrorType('overlays');
        } else {
          setErrorType(undefined);
        }
      }
    });
  }, [
    forecastError,
    forecastInvalidDataError,
    observationError,
    warningsError,
    overlaysError,
    messages.outOfServiceArea,
    activeRoute,
  ]);

  return errorType ? (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.title}>{messages[errorType]?.title}</Text>
        <AccessibleTouchableOpacity
          onPress={() => setErrorType(undefined)}
          style={styles.closeButton}>
          <Icon name="close-outline" size={24} color={BLACK} />
        </AccessibleTouchableOpacity>
      </View>
      {['noInternet', 'outOfServiceArea'].includes(errorType) &&
      messages[errorType]?.additionalInfo ? (
        <Text style={styles.text}>{messages[errorType]?.additionalInfo}</Text>
      ) : (
        <>
          {errorType !== 'outOfServiceArea' && errorType !== 'noInternet' && (
            <AccessibleTouchableOpacity
              onPress={() => tryAgainFunctions[errorType]()}>
              <View style={styles.tryAgainButton}>
                <View style={styles.textContainer}>
                  <Text style={styles.buttonText}>{t('tryAgain')}</Text>
                </View>
              </View>
            </AccessibleTouchableOpacity>
          )}
        </>
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 16,
    shadowOpacity: 1,
    elevation: 10,
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
