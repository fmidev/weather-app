import { Location } from '@store/location/types';

export type StackScreenListener = ({ navigation }: { navigation: any }) => {
  blur: () => void;
};

export type OthersStackParamList = {
  StackOthers: undefined;
  About: undefined;
  Settings: undefined;
  TermsAndConditions: undefined;
  Accessibility: undefined;
  GiveFeedback: undefined;
};

export type MapStackParamList = {
  Map: Location;
  Search: undefined;
};

export type WeatherStackParamList = {
  Weather: Location;
  Search: undefined;
  Warnings: undefined;
};

export type SetupStackParamList = {
  Onboarding: undefined;
  SetupScreen: undefined;
  TermsAndConditions: undefined;
};