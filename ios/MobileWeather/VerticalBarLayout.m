#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#import <UIKit/UIKit.h>

@interface VerticalBarLayout : RCTEventEmitter <RCTBridgeModule>
@property(nonatomic, weak) UIWindow *observedWindow;
@property(nonatomic, strong) id traitRegistration;
@end

@implementation VerticalBarLayout

RCT_EXPORT_MODULE();

+ (BOOL)requiresMainQueueSetup
{
  return YES;
}

- (dispatch_queue_t)methodQueue
{
  return dispatch_get_main_queue();
}

- (NSArray<NSString *> *)supportedEvents
{
  return @[@"verticalBarLayoutDidChange"];
}

- (UIWindow *)activeWindow
{
  for (UIScene *scene in UIApplication.sharedApplication.connectedScenes) {
    if ([scene isKindOfClass:UIWindowScene.class] &&
        scene.activationState == UISceneActivationStateForegroundActive) {
      for (UIWindow *window in ((UIWindowScene *)scene).windows) {
        if (window.isKeyWindow) return window;
      }
    }
  }
  return nil;
}

- (BOOL)usesVerticalBarLayout
{
#if __IPHONE_OS_VERSION_MAX_ALLOWED >= 270100
  if (@available(iOS 27.1, *)) {
    UIWindow *window = self.activeWindow;
    return window != nil && window.traitCollection.verticalBarEdge != UIVerticalBarEdgeUnspecified;
  }
#endif
  return NO;
}

RCT_EXPORT_METHOD(getUsesVerticalBarLayout:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  resolve(@(self.usesVerticalBarLayout));
}

- (void)removeTraitObservation
{
#if __IPHONE_OS_VERSION_MAX_ALLOWED >= 270100
  if (@available(iOS 27.1, *)) {
    if (self.traitRegistration != nil) {
      [self.observedWindow unregisterForTraitChanges:self.traitRegistration];
    }
  }
#endif
  self.traitRegistration = nil;
  self.observedWindow = nil;
}

- (void)observeWindow
{
  UIWindow *window = self.activeWindow;
  if (window != self.observedWindow) {
    [self removeTraitObservation];
    self.observedWindow = window;
#if __IPHONE_OS_VERSION_MAX_ALLOWED >= 270100
    if (@available(iOS 27.1, *)) {
      __weak VerticalBarLayout *weakSelf = self;
      self.traitRegistration = [window
          registerForTraitChanges:UITraitCollection.systemTraitsAffectingVerticalBarEdge
                      withHandler:^(__kindof id<UITraitEnvironment> environment, UITraitCollection *previous) {
                        VerticalBarLayout *strongSelf = weakSelf;
                        if (strongSelf != nil) {
                          [strongSelf sendEventWithName:@"verticalBarLayoutDidChange"
                                                  body:@(strongSelf.usesVerticalBarLayout)];
                        }
                      }];
    }
#endif
  }
  [self sendEventWithName:@"verticalBarLayoutDidChange" body:@(self.usesVerticalBarLayout)];
}

- (void)sceneDidActivate:(NSNotification *)notification
{
  [self observeWindow];
}

- (void)startObserving
{
  [NSNotificationCenter.defaultCenter addObserver:self
                                        selector:@selector(sceneDidActivate:)
                                            name:UISceneDidActivateNotification
                                          object:nil];
  [self observeWindow];
}

- (void)stopObserving
{
  [NSNotificationCenter.defaultCenter removeObserver:self name:UISceneDidActivateNotification object:nil];
  [self removeTraitObservation];
}

@end
