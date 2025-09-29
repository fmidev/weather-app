import { State } from '@store/types';
import {
  createSelector,
  createSelectorCreator,
  defaultMemoize,
  Selector,
} from 'reselect';
import { NavigationState } from './types';
import { Config } from '@config';
import packageJSON from '../../../package.json';

const selectNavigationDomain: Selector<State, NavigationState> = (state) =>
  state.navigation;

const createInitialSelector = createSelectorCreator(defaultMemoize, () => true);

export const selectTab = createSelector(
  selectNavigationDomain,
  (navigation) => navigation.tab
);

export const selectInitialTab = createInitialSelector(
  selectNavigationDomain,
  (navigation) => navigation.tab
);

export const selectDidLaunchApp = createSelector(
  selectNavigationDomain,
  (navigation) => navigation.didLaunchApp
);

export const selectTermsOfUseAccepted = createSelector(
  selectNavigationDomain,
  (navigation) => {
    const { termsOfUseChanged } = Config.get('onboardingWizard')

    if (termsOfUseChanged && navigation.didLaunchApp === true
      && navigation.termsOfUseAccepted !== packageJSON.version) {
      return false;
    }

    return true;
  }
);
