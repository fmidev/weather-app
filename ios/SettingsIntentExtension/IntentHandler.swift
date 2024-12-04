import Intents

class IntentHandler: INExtension, SettingsIntentHandling {
  func resolveCurrentLocation(for intent: SettingsIntent) async -> INBooleanResolutionResult {
    return intent.currentLocation == nil ?
      .needsValue() :
      .success(with: intent.currentLocation! as! Bool)
  }

  func provideLocationOptionsCollection(for intent: SettingsIntent) async throws -> INObjectCollection<LocationSetting> {
    print("provideLocationOptionsCollection called")
    let liperi = LocationSetting(identifier: "Liperi", display: "Liperi")
    liperi.geoid = 647852
    let tikkurila = LocationSetting(identifier: "Tikkurila", display: "Tikkurila")
    tikkurila.geoid = 843429
    
    let options = [liperi, tikkurila]
    return INObjectCollection(items: options)
  }
  
  /*
  func provideLocationOptionsCollection(for intent: SettingsIntent, with completion: @escaping (INObjectCollection<LocationSetting>?, Error?) -> Void) {
    print("provideLocationOptionsCollection called")
    let liperi = LocationSetting(identifier: "Liperi", display: "Liperi")
    liperi.geoid = 647852
    let tikkurila = LocationSetting(identifier: "Tikkurila", display: "Tikkurila")
    tikkurila.geoid = 843429
    
    let options = [liperi, tikkurila]
    completion(INObjectCollection(items: options), nil)
  }
  */
  
  /*
  func provideLocationOptionsCollection(for intent: SettingsIntent) async throws -> INObjectCollection<NSString> {
    print("provideLocationOptionsCollection called")
    let options = ["Automaattinen", "Liperi", "Tikkurila"] as [NSString]
    return INObjectCollection(items: options)
  }
  */

  func resolveLocation(for intent: SettingsIntent) async -> LocationSettingResolutionResult {
    return intent.location == nil ? .needsValue() : .success(with: intent.location!)
  }

  func resolveTheme(for intent: SettingsIntent) async -> ThemeOptionsResolutionResult {
    return .success(with: intent.theme)
  }
    
}
