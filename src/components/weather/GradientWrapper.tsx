import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '@react-navigation/native';

import { State } from '@store/types';
import {
  selectLoading,
  selectNextHourForecast,
} from '@store/forecast/selectors';

import {
  FREEZING,
  REALLY_COLD,
  COLD,
  WARM,
  REALLY_WARM,
  HOT,
  WHITE,
  CustomTheme,
} from '@utils/colors';

const mapStateToProps = (state: State) => ({
  loading: selectLoading(state),
  nextHourForecast: selectNextHourForecast(state),
});

const connector = connect(mapStateToProps, {});

type PropsFromRedux = ConnectedProps<typeof connector>;

type GradientWrapperProps = PropsFromRedux & {
  children: React.ReactNode;
};

const GradientWrapper: React.FC<GradientWrapperProps> = ({
  children,
  nextHourForecast,
}) => {
  const { colors, dark } = useTheme() as CustomTheme;

  const colorsDark = [colors.screenBackground];

  const tempColor = () => {
    if (!nextHourForecast) return colors.screenBackground;
    const { temperature } = nextHourForecast;
    if (temperature >= 25) {
      return HOT;
    }
    if (temperature <= 24 && temperature >= 15) {
      return REALLY_WARM;
    }
    if (temperature <= 14 && temperature > 0) {
      return WARM;
    }
    if (temperature <= 0 && temperature >= -9) {
      return COLD;
    }
    if (temperature <= -10 && temperature >= -24) {
      return REALLY_COLD;
    }
    if (temperature <= -25) {
      return FREEZING;
    }
    return colors.screenBackground;
  };

  return (
    <LinearGradient
      style={styles.gradient}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      colors={dark ? colorsDark : [tempColor(), WHITE]}>
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    minHeight: '100%',
  },
});

export default connector(GradientWrapper);
