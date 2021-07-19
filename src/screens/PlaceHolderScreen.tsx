import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { SafeAreaView, Text, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';

import { State } from '../store/types';
import { selectGeolocation } from '../store/general/selectors';

const mapStateToProps = (state: State) => ({
  geolocation: selectGeolocation(state),
});

const connector = connect(mapStateToProps, {});

type PropsFromRedux = ConnectedProps<typeof connector>;

type Props = PropsFromRedux & {
  text: string;
  showLocation?: boolean;
  testIndex: number;
};

const PlaceholderScreen: React.FC<Props> = ({
  text,
  showLocation,
  geolocation,
  testIndex,
}) => {
  const { colors } = useTheme();
  return (
    <SafeAreaView style={styles.container}>
      <Text
        style={[styles.text, { color: colors.text }]}
        testID={`screen_placeholder_text_${testIndex}`}>
        {text}
      </Text>
      {showLocation && (
        <Text style={[styles.text, { color: colors.text }]}>
          Laitteen sijainti: {JSON.stringify(geolocation, null, 2)}
        </Text>
      )}
    </SafeAreaView>
  );
};

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
