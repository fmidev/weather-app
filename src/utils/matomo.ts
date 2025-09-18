import { AnalyticActions, AnalyticCategories, Config } from '@config';
import i18n from '@i18n';

// import matomo functions
import { trackEvent, createTracker, trackDispatch } from "@logicwind/react-native-matomo-tracker";

let isMatomoInitialized:boolean = false;

// init matomo tracking
export const initMatomo = () => {
    // get settings from config
    const analytics = Config.get('analytics');

    // init analytics if enabled or user hasn't opted out
    // TODO: user opted out?
    if(analytics?.enabled) {
        if(analytics.siteId){
            createTracker(analytics.url, analytics.siteId[i18n.language]);
            isMatomoInitialized = true;
        }
    }
}

export const trackMatomoEvent = (category:AnalyticCategories, action:AnalyticActions, name:string) => {
    if(!isMatomoInitialized) {
        initMatomo();
    }

    if (isMatomoInitialized) {
        trackEvent(category, action, name);
    }
}

export const sendMatomoEvents = () => {
    if(isMatomoInitialized) {
        trackDispatch();
    }
}
