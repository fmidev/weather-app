import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Text, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';

import { State } from '../store/types';
import { selectCurrentLocation } from '../store/general/selectors';

const mapStateToProps = (state: State) => ({
  currentLocation: selectCurrentLocation(state),
});

const connector = connect(mapStateToProps, {});

type PropsFromRedux = ConnectedProps<typeof connector>;

type CommonHeaderProps = PropsFromRedux & {};

const CommonHeaderTitle: React.FC<CommonHeaderProps> = ({
  currentLocation,
}) => {
  const { colors } = useTheme();
  const title = (): string => {
    if (currentLocation) {
      return currentLocation.area &&
        currentLocation.area !== currentLocation.name
        ? `${currentLocation.name}, ${currentLocation.area}`
        : currentLocation.name;
    }
    return 'Helsinki';
  };

  return <Text style={[styles.title, { color: colors.text }]}>{title()}</Text>;
};

const styles = StyleSheet.create({
  title: {
    fontWeight: 'bold',
    alignSelf: 'center',
  },
});

export default connector(CommonHeaderTitle);
