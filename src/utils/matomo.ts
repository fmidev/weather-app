import { AnalyticActions, AnalyticCategories, Config } from '@config';
import i18n from '@i18n';

// import matomo functions
import { trackEvent, createTracker } from "@logicwind/react-native-matomo-tracker";

let isMatomoInitialized:boolean = false;

// init matomo tracking
function initMatomo() {
    // get settings from config
    const analytics = Config.get('analytics');

    // init analytics if enabled
    if(analytics?.enabled) {
        if(analytics.siteId){
            createTracker(analytics.url, analytics.siteId[i18n.language]);
            isMatomoInitialized = true;
        }
    }
}

export function trackMatomoEvent(category:AnalyticCategories, action:AnalyticActions, name:string){
    if(!isMatomoInitialized) {
        initMatomo();
    }

    if (isMatomoInitialized) {
        trackEvent(category, action, name);
    }
}