export const SET_NAVIGATION_TAB = 'SET_TAB';

interface SetNavigationTab {
  type: typeof SET_NAVIGATION_TAB;
  tab: NavigationTab;
}

export enum NavigationTabValues {
  Map,
  Weather,
  Warnings,
}
export type NavigationTab = keyof typeof NavigationTabValues;

export type NavigationActionTypes = SetNavigationTab;

export interface NavigationState {
  tab: NavigationTab;
}
