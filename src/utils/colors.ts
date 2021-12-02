export const PRIMARY_BLUE = '#303193';
export const SECONDARY_BLUE = '#3A66E3';
export const GRAYISH_BLUE = '#D8E7F2'; // line-light-mode
export const LIGHT_BLUE = '#EEF4FB';

export const WHITE = '#FFFFFF';
export const WHITE_TRANSPARENT = 'rgba(255,255,255,0.0)';
export const TRANSPARENT = 'transparent';

export const BLACK = '#000000';
export const GRAY_7 = '#121212';
export const GRAY_6 = '#1C1C1E';
export const GRAY_5 = '#2C2C2E';
export const GRAY_4 = '#3A3A3C';
export const GRAY_3 = '#48484A';
export const GRAY_2 = '#636366';
export const GRAY_1 = '#8E8E93';

export const GRAY_1_OPACITY = 'rgba(142,142,147,0.08)';

export const GRAY_6_TRANSPARENT = 'rgba(28,28,30,0.0)';
export const GRAY_6_95 = 'rgba(28,28,30,0.95)';

export const SHADOW_DARK = 'rgba(0,0,0,0.3)';
export const SHADOW_LIGHT = 'rgba(48,49,147,0.1)';

export const LIGHT_RED = '#F8D7DA';
export const DARK_RED = '#940214';
export const LIGHT_CYAN = '#CBF1F5';
export const DARK_CYAN = '#0B5B71';

export const GREEN = '#76C81D';
export const YELLOW = '#F8F800';
export const ORANGE = '#FFB700';
export const RED = '#D0021B';

export const RAIN_1 = '#0C9BFF';
export const RAIN_2 = '#06CDAB';
export const RAIN_3 = '#8CE614';
export const RAIN_4 = '#F0F014';
export const RAIN_5 = '#FFCD15';
export const RAIN_6 = '#FF503D';
export const RAIN_7 = '#D41B0E';

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
    chartSecondaryLine: string;
    hourListText: string;
    secondaryBorder: string;
  };
};
