export const SET_NAVIGATION_TAB = 'SET_TAB';
export const SET_DID_LAUNCH_APP = 'DID_LAUNCH_APP';

interface SetNavigationTab {
  type: typeof SET_NAVIGATION_TAB;
  tab: NavigationTab;
}

interface SetDidLaunchApp {
  type: typeof SET_DID_LAUNCH_APP;
}

export enum NavigationTabValues {
  Map,
  Weather,
  Warnings,
}
export type NavigationTab = keyof typeof NavigationTabValues;

export type NavigationActionTypes = SetNavigationTab | SetDidLaunchApp;

export interface NavigationState {
  tab: NavigationTab;
  didLaunchApp: boolean;
  termsOfUseAccepted: string | false;
}
