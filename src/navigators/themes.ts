import {
  PRIMARY_BLUE,
  SECONDARY_BLUE,
  GRAYISH_BLUE,
  LIGHT_BLUE,
  WHITE,
  // BLACK,
  GRAY_7,
  GRAY_6,
  GRAY_5,
  GRAY_4,
  GRAY_3,
  // GRAY_2,
  GRAY_1,
} from '../utils/colors';

export const lightTheme = {
  dark: false,
  colors: {
    primary: SECONDARY_BLUE,
    background: WHITE,
    card: WHITE,
    text: PRIMARY_BLUE,
    notification: WHITE,
    primaryText: PRIMARY_BLUE,
    secondaryText: GRAY_1,
    border: GRAYISH_BLUE,
    inputBackground: LIGHT_BLUE,
    inputButtonBackground: WHITE,
    mapButtonBackground: WHITE,
    headerBackground: WHITE,
    timeStepBackground: LIGHT_BLUE,
  },
};

export const darkTheme = {
  dark: true,
  colors: {
    primary: WHITE,
    background: GRAY_6,
    card: GRAY_7,
    text: WHITE,
    notification: WHITE,
    primaryText: WHITE,
    secondaryText: GRAY_1,
    border: GRAY_3,
    inputBackground: GRAY_4,
    inputButtonBackground: GRAY_5,
    mapButtonBackground: GRAY_6,
    headerBackground: GRAY_6,
    timeStepBackground: GRAY_6,
  },
};
