#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(IOSCompatibilityMode, NSObject)

RCT_EXTERN_METHOD(isRunningOnMac:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
