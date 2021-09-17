import { State } from '@store/types';
import {
  createSelector,
  createSelectorCreator,
  defaultMemoize,
  Selector,
} from 'reselect';
import { NavigationState, NavigationTab } from './types';

const selectNavigationDomain: Selector<State, NavigationState> = (state) =>
  state.navigation;

const createInitialSelector = createSelectorCreator(defaultMemoize, () => true);

export const selectTab = createSelector<State, NavigationState, NavigationTab>(
  selectNavigationDomain,
  (navigation) => navigation.tab
);

export const selectInitialTab = createInitialSelector<
  State,
  NavigationState,
  NavigationTab
>(selectNavigationDomain, (navigation) => navigation.tab);
