export const PRIMARY_BLUE = '#303193';
export const SECONDARY_BLUE = '#3A66E3';
export const GRAYISH_BLUE = '#D8E7F2'; // line-light-mode
export const LIGHT_BLUE = '#EEF4FB';

export const WHITE = '#FFFFFF';
export const WHITE_TRANSPARENT = 'rgba(255,255,255,0.0)';
export const WHITE_OPACITY = 'rgba(255,255,255,0.07)';
export const TRANSPARENT = 'transparent';

export const FREEZING = '#CCDAFF';
export const REALLY_COLD = '#CBE2FE';
export const COLD = '#DEEEFF';
export const WARM = '#FEEFCB';
export const REALLY_WARM = '#FEE9B7';
export const HOT = '#FDDCB6';

export const BLACK = '#000000';
export const GRAY_8 = '#E6E6E6';
export const GRAY_7 = '#101113';
export const GRAY_6 = '#191B22';
export const GRAY_5 = '#282B34';
export const GRAY_4 = '#353944';
export const GRAY_3 = '#434752';
export const GRAY_2 = '#5E626E';
export const GRAY_1 = '#898D9B';

export const GRAY_1_OPACITY = 'rgba(142,142,147,0.08)';
export const GRAY_1_OPACITY_15 = 'rgba(142,142,147,0.15)';

export const GRAY_6_TRANSPARENT = 'rgba(28,28,30,0.0)';
export const GRAY_6_95 = 'rgba(28,28,30,0.95)';

export const BLACK_OPACITY = 'rgba(0,0,0,0.07)';
export const BLACK_TRANSPARENT = 'rgba(0,0,0,0.0)';

export const SHADOW_DARK = 'rgba(0,0,0,0.4)';
export const SHADOW_LIGHT = 'rgba(142,142,147,0.15)';
export const SHADOW_LIGHT_DARKER = 'rgba(142,142,147,0.3)';

export const HEADER_DARK = 'rgb(18,18,18)';

export const LIGHT_RED = '#F8D7DA';
export const DARK_RED = '#940214';
export const LIGHT_CYAN = '#CBF1F5';
export const DARK_CYAN = '#0B5B71';

export const GREEN = '#76C81D';
export const YELLOW = '#F8F800';
export const ORANGE = '#FFB700';
export const RED = '#D0021B';

export const CAP_WARNING_NEUTRAL = '#E4F7F3';
export const CAP_WARNING_YELLOW = '#FFFB7B';
export const CAP_WARNING_ORANGE = '#FFCB5F';
export const CAP_WARNING_RED = '#FF5A5A';

/*
export const RAIN_1_LIGHT = '#3A698E';
export const RAIN_2_LIGHT = '#6BB1C9';
export const RAIN_3_LIGHT = '#C5FBF2';
export const RAIN_4_LIGHT = '#589D6B';
export const RAIN_5_LIGHT = '#F9F961';
export const RAIN_6_LIGHT = '#D29F00';
export const RAIN_7_LIGHT = '#AE5200';
export const RAIN_8_LIGHT = '#760000';

export const RAIN_1_DARK = '#C1FAFB';
export const RAIN_2_DARK = '#6BB1C9';
export const RAIN_3_DARK = '#247DA2';
export const RAIN_4_DARK = '#6BC37E';
export const RAIN_5_DARK = '#F9F961';
export const RAIN_6_DARK = '#D29F00';
export const RAIN_7_DARK = '#AE5200';
export const RAIN_8_DARK = '#760000';
*/

export const RAIN_1 = '#ABF4F4';
export const RAIN_2 = '#86DCFF';
export const RAIN_3 = '#5BAFC7';
export const RAIN_4 = '#4388A5';
export const RAIN_5 = '#245388';
export const RAIN_6 = '#3C2181';
export const RAIN_7 = '#6940AC';
export const RAIN_8 = '#BD41EB';

export const CHART_BLUE = '#7594EB';

export const TEMPERATURE_1 = '#9a0875';
export const TEMPERATURE_2 = '#c61a9b';
export const TEMPERATURE_3 = '#e63ec8';
export const TEMPERATURE_4 = '#e65bfb';
export const TEMPERATURE_5 = '#c64df9';
export const TEMPERATURE_6 = '#a428eb';
export const TEMPERATURE_7 = '#8600d4';
export const TEMPERATURE_8 = '#5f0dbd';
export const TEMPERATURE_9 = '#6b1be3';
export const TEMPERATURE_10 = '#7548fa';
export const TEMPERATURE_11 = '#8a79f7';
export const TEMPERATURE_12 = '#0412b3';
export const TEMPERATURE_13 = '#1831d6';
export const TEMPERATURE_14 = '#3868eb';
export const TEMPERATURE_15 = '#6f9af7';
export const TEMPERATURE_16 = '#94b2f2';
export const TEMPERATURE_17 = '#0050ab';
export const TEMPERATURE_18 = '#0662c4';
export const TEMPERATURE_19 = '#187adb';
export const TEMPERATURE_20 = '#118dfa';
export const TEMPERATURE_21 = '#40a9ff';
export const TEMPERATURE_22 = '#65bdF7';
export const TEMPERATURE_23 = '#00678c';
export const TEMPERATURE_24 = '#027ba3';
export const TEMPERATURE_25 = '#009bba';
export const TEMPERATURE_26 = '#22bcD4';
export const TEMPERATURE_27 = '#67dbe6';
export const TEMPERATURE_28 = '#a3f3f7';
export const TEMPERATURE_29 = '#d4ffff';
export const TEMPERATURE_30 = '#05b38a';
export const TEMPERATURE_31 = '#02d495';
export const TEMPERATURE_32 = '#8aedbb';
export const TEMPERATURE_33 = '#ccffd0';
export const TEMPERATURE_34 = '#ebfccf';
export const TEMPERATURE_35 = '#ebff7a';
export const TEMPERATURE_36 = '#ffea80';
export const TEMPERATURE_37 = '#f7d423';
export const TEMPERATURE_38 = '#f5b400';
export const TEMPERATURE_39 = '#f29500';
export const TEMPERATURE_40 = '#f07400';
export const TEMPERATURE_41 = '#ff5324';
export const TEMPERATURE_42 = '#f71707';
export const TEMPERATURE_43 = '#db0a07';
export const TEMPERATURE_44 = '#bd0404';
export const TEMPERATURE_45 = '#9c0214';
export const TEMPERATURE_46 = '#c41862';
export const TEMPERATURE_47 = '#e82778';
export const TEMPERATURE_48 = '#f558ae';
export const TEMPERATURE_49 = '#f090d8';
export const TEMPERATURE_50 = '#f73bd5';

export type Rain = {
  0: string;
  1: string;
  2: string;
  3: string;
  4: string;
  5: string;
  6: string;
  7: string;
  8: string;
};

export type CustomTheme = {
  dark: boolean;
  colors: {
    primary: string;
    background: string;
    card: string;
    text: string;
    notification: string;
    primaryText: string;
    secondaryText: string;
    border: string;
    inputBackground: string;
    inputButtonBackground: string;
    mapButtonBackground: string;
    relocateButtonBackground: string;
    mapButtonBorder: string;
    headerBackground: string;
    timeStepBackground: string;
    shadow: string;
    screenBackground: string;
    cardHeader: string;
    cardShadow: string;
    warningsIconFill: string;
    selectedDayBackground: string;
    chartPrimaryLine: string;
    chartSecondaryLine: string;
    chartGrid: string;
    chartGridDay: string;
    hourListText: string;
    secondaryBorder: string;
    tabBarInactive: string;
    tabBarActive: string;
    timeSliderObservationText: string;
    timeSliderTick: string;
    listTint: string;
    rain: Rain;
    accordionContentBackground: string;
  };
};

export const getTemperatureIndexColor = (index: number) => {
  if (index === 1) return TEMPERATURE_1;
  else if (index === 2) return TEMPERATURE_2;
  else if (index === 3) return TEMPERATURE_3;
  else if (index === 4) return TEMPERATURE_4;
  else if (index === 5) return TEMPERATURE_5;
  else if (index === 6) return TEMPERATURE_6;
  else if (index === 7) return TEMPERATURE_7;
  else if (index === 8) return TEMPERATURE_8;
  else if (index === 9) return TEMPERATURE_9;
  else if (index === 10) return TEMPERATURE_10;
  else if (index === 11) return TEMPERATURE_11;
  else if (index === 12) return TEMPERATURE_12;
  else if (index === 13) return TEMPERATURE_13;
  else if (index === 14) return TEMPERATURE_14;
  else if (index === 15) return TEMPERATURE_15;
  else if (index === 16) return TEMPERATURE_16;
  else if (index === 17) return TEMPERATURE_17;
  else if (index === 18) return TEMPERATURE_18;
  else if (index === 19) return TEMPERATURE_19;
  else if (index === 20) return TEMPERATURE_20;
  else if (index === 21) return TEMPERATURE_21;
  else if (index === 22) return TEMPERATURE_22;
  else if (index === 23) return TEMPERATURE_23;
  else if (index === 24) return TEMPERATURE_24;
  else if (index === 25) return TEMPERATURE_25;
  else if (index === 26) return TEMPERATURE_26;
  else if (index === 27) return TEMPERATURE_27;
  else if (index === 28) return TEMPERATURE_28;
  else if (index === 29) return TEMPERATURE_29;
  else if (index === 30) return TEMPERATURE_30;
  else if (index === 31) return TEMPERATURE_31;
  else if (index === 32) return TEMPERATURE_32;
  else if (index === 33) return TEMPERATURE_33;
  else if (index === 34) return TEMPERATURE_34;
  else if (index === 35) return TEMPERATURE_35;
  else if (index === 36) return TEMPERATURE_36;
  else if (index === 37) return TEMPERATURE_37;
  else if (index === 38) return TEMPERATURE_38;
  else if (index === 39) return TEMPERATURE_39;
  else if (index === 40) return TEMPERATURE_40;
  else if (index === 41) return TEMPERATURE_41;
  else if (index === 42) return TEMPERATURE_42;
  else if (index === 43) return TEMPERATURE_43;
  else if (index === 44) return TEMPERATURE_44;
  else if (index === 45) return TEMPERATURE_45;
  else if (index === 46) return TEMPERATURE_46;
  else if (index === 47) return TEMPERATURE_47;
  else if (index === 48) return TEMPERATURE_48;
  else if (index === 49) return TEMPERATURE_49;
  else if (index === 50) return TEMPERATURE_50;
  else return TEMPERATURE_1;
};
