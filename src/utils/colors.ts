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

export const RAIN_1_LIGHT = 'rgb(208,219,239)';
export const RAIN_2_LIGHT = 'rgb(208,219,239)';
export const RAIN_3_LIGHT = 'rgb(134,152,211)';
export const RAIN_4_LIGHT = 'rgb(134,152,211)';
export const RAIN_5_LIGHT = 'rgb(11,89,178)';
export const RAIN_6_LIGHT = 'rgb(11,89,178)';
export const RAIN_7_LIGHT = 'rgb(91,26,142)';
export const RAIN_8_LIGHT = 'rgb(91,26,142)';

export const RAIN_1_DARK = '#C1FAFB';
export const RAIN_2_DARK = '#6BB1C9';
export const RAIN_3_DARK = '#247DA2';
export const RAIN_4_DARK = '#6BC37E';
export const RAIN_5_DARK = '#F9F961';
export const RAIN_6_DARK = '#D29F00';
export const RAIN_7_DARK = '#AE5200';
export const RAIN_8_DARK = '#760000';

export const CHART_BLUE = '#7594EB';

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
  };
};
