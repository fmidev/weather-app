import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';

import { State } from '@store/types';
import { selectCurrent, selectIsGeolocation } from '@store/location/selector';

import Icon from './Icon';

const mapStateToProps = (state: State) => ({
  currentLocation: selectCurrent(state),
  isGeolocation: selectIsGeolocation(state),
});

const connector = connect(mapStateToProps, {});

type PropsFromRedux = ConnectedProps<typeof connector>;

type CommonHeaderProps = PropsFromRedux & {
  onPress: () => void;
};

const CommonHeaderTitle: React.FC<CommonHeaderProps> = ({
  currentLocation,
  isGeolocation,
  onPress,
}) => {
  const { colors } = useTheme();
  const title = (): string => {
    if (currentLocation) {
      return currentLocation.area &&
        currentLocation.area !== currentLocation.name
        ? `${currentLocation.name}, ${currentLocation.area}`
        : currentLocation.name;
    }
    return 'Null';
  };

  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.container}>
        {isGeolocation && (
          <Icon name="map-marker" style={{ color: colors.text }} height={12} />
        )}
        <Text
          accessibilityRole="header"
          style={[styles.title, { color: colors.text }]}>
          {title()}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
  },
  title: {
    fontSize: 16,
    alignSelf: 'center',
    fontFamily: 'Roboto-Medium',
  },
});

export default connector(CommonHeaderTitle);
