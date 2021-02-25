import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { SafeAreaView, Text, StyleSheet } from 'react-native';

import { State } from '../store/types';
import { selectGeolocation } from '../store/general/selectors';
import { setGeolocation as setGeolocationAction } from '../store/general/actions';

const mapStateToProps = (state: State) => {
  return {
    geolocation: selectGeolocation(state),
  };
};

const connector = connect(mapStateToProps, {});

type PropsFromRedux = ConnectedProps<typeof connector>;

type Props = PropsFromRedux & {
  text: string;
  showLocation?: boolean;
};

const PlaceholderScreen: React.FC<Props> = ({
  text,
  showLocation,
  geolocation,
}) => (
  <SafeAreaView style={styles.container}>
    <Text style={styles.text}>{text}</Text>
    {showLocation && (
      <Text style={styles.text}>
        Laitteen sijainti: {JSON.stringify(geolocation, null, 2)}
      </Text>
    )}
  </SafeAreaView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  text: {
    fontSize: 16,
    marginBottom: 20,
  },
});

export default connector(PlaceholderScreen);
