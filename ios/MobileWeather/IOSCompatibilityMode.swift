import Foundation

@objc(IOSCompatibilityMode)
final class IOSCompatibilityMode: NSObject {
  @objc
  static func requiresMainQueueSetup() -> Bool {
    false
  }

  @objc
  func isRunningOnMac(
    _ resolve: RCTPromiseResolveBlock,
    rejecter _: RCTPromiseRejectBlock
  ) {
    #if targetEnvironment(macCatalyst)
      resolve(false)
    #else
      if #available(iOS 14.0, *) {
        resolve(ProcessInfo.processInfo.isiOSAppOnMac)
      } else {
        resolve(false)
      }
    #endif
  }
}
