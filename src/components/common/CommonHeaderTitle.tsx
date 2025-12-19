import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { State } from '@store/types';
import { selectCurrent, selectIsGeolocation } from '@store/location/selector';

import { useOrientation } from '@utils/hooks';
import Text from '@components/common/AppText';
import Icon from '@components/common/ScalableIcon';
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
              maxScaleFactor={2}
              name="map-marker"
              style={{ color: colors.text }}
              width={14}
              height={14}
            />
          )}
          <Text
            numberOfLines={1}
            accessibilityRole="header"
            accessibilityLabel={
              isGeolocation ? `${title()}, ${t('currentLocation')}` : title()
            }
            style={[styles.title, { color: colors.text }]}>
            {title()}
          </Text>
        </View>
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  portraitWidth: {
    maxWidth: '97%',
  },
});

export default connector(CommonHeaderTitle);
