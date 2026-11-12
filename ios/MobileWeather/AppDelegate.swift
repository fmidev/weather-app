import UIKit
 
@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    // Clear cache because of old forecast data issues
    URLCache.shared.removeAllCachedResponses()

    return true
  }
}
