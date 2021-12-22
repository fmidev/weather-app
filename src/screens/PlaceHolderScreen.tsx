import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { SafeAreaView, Text, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';

import { State } from '@store/types';
import { selectCurrent } from '@store/location/selector';

const mapStateToProps = (state: State) => ({
  currentLocation: selectCurrent(state),
});

const connector = connect(mapStateToProps, {});

type PropsFromRedux = ConnectedProps<typeof connector>;

type Props = PropsFromRedux & {
  text: string;
  showLocation?: boolean;
  testIndex: number;
};

const PlaceholderScreen: React.FC<Props> = ({
  currentLocation,
  text,
  showLocation,
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
          {JSON.stringify(currentLocation, null, 2)}
        </Text>
      )}
    </SafeAreaView>
  );
};

PlaceholderScreen.defaultProps = {
  showLocation: false,
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
    fontFamily: 'Roboto-Regular',
  },
});

export default connector(PlaceholderScreen);
