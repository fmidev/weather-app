import { AnalyticActions, AnalyticCategories, Config } from '@config';
import i18n from '@i18n';
// import { useTranslation } from 'react-i18next';

// import matomo functions
import { trackEvent, createTracker } from "@logicwind/react-native-matomo-tracker";

let isMatomoInitialized:boolean = false;

// init matomo tracking
function initMatomo() {
    // get settings from config
    const analytics = Config.get('analytics');

    // init analytics if enabled or user hasn't opted out
    // TODO: user opted out?
    if(analytics?.enabled) {
        if(analytics.siteId){
            createTracker(analytics.url, analytics.siteId[i18n.language]);
            isMatomoInitialized = true;
        }else{
            console.log('No siteId defined');
        }
    } else {
        console.log('Analytics are disabled');
    }
}

export function trackMatomoEvent(category:AnalyticCategories, action:AnalyticActions, name:string){
    if(!isMatomoInitialized) {
        initMatomo();
    }

    if (isMatomoInitialized) {
        console.log(category, action, name);
        trackEvent(category, action, name);
    } else {
        console.log('matomo not initialized');
    }
}