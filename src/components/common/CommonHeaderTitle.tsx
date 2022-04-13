import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Text, View, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { State } from '@store/types';
import { selectCurrent, selectIsGeolocation } from '@store/location/selector';

import { useOrientation } from '@utils/hooks';
import Icon from './Icon';
import AccessibleTouchableOpacity from './AccessibleTouchableOpacity';

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
  const { t } = useTranslation('navigation');
  const { colors } = useTheme();
  const isLandscape = useOrientation();

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
    <View
      style={[styles.container, !isLandscape && styles.portraitWidth]}
      pointerEvents="box-none">
      <AccessibleTouchableOpacity onPress={onPress}>
        <View style={styles.row}>
          {isGeolocation && (
            <Icon
              name="map-marker"
              style={{ color: colors.text }}
              height={12}
            />
          )}
          <Text
            accessibilityRole="header"
            accessibilityLabel={
              isGeolocation ? `${title()}, ${t('currentLocation')}` : title()
            }
            style={[styles.title, { color: colors.text }]}>
            {title()}
          </Text>
        </View>
        {currentLocation.country !== 'FI' && (
          <Text
            style={[
              styles.timezone,
              !isLandscape && styles.timeZoneMarginBottom,
              { color: colors.text },
            ]}>{`${t('timezone')}: ${currentLocation.timezone}`}</Text>
        )}
      </AccessibleTouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    minWidth: '90%',
    alignSelf: 'center',
  },
  title: {
    fontSize: 16,
    fontFamily: 'Roboto-Medium',
    textAlign: 'center',
  },
  timezone: {
    fontFamily: 'Roboto-Regular',
    fontSize: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeZoneMarginBottom: {
    marginBottom: 10,
  },
  portraitWidth: {
    maxWidth: '97%',
  },
});

export default connector(CommonHeaderTitle);
