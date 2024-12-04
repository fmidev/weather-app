import Intents
import SwiftyJSON

func readStoredLocations() -> [LocationSetting] {
  let appGroupID = "group.fi.fmi.mobileweather.settings"
  let key = "persist:location"
  var locations = [LocationSetting]()
  
  if let userDefaults = UserDefaults(suiteName: appGroupID) {
    if let storedLocations = userDefaults.string(forKey: key) {
      let json = JSON.init(parseJSON: storedLocations)
      guard let favorites = json["favorites"].string else {
        return locations
      }
      let favoritesJson = JSON.init(parseJSON: favorites.replacingOccurrences(of: "\\", with: ""))
      let favoritesArray = favoritesJson.arrayValue
      
      locations = favoritesArray.map({
        let location = LocationSetting(
          identifier: $0["id"].stringValue,
          display: $0["name"].stringValue
        )
        location.geoid = NSNumber(value: Int($0["id"].stringValue) ?? 0)
        location.lat = NSNumber(value: $0["lat"].doubleValue)
        location.lon = NSNumber(value: $0["lon"].doubleValue)
        location.timezone = $0["timezone"].stringValue
        location.area = $0["area"].stringValue
        location.iso2 = $0["country"].stringValue
        return location
      })
      
    } else {
      print("No data found for key 'persist:location'.")
    }
  } else {
    print("Failed to access UserDefaults with group ID: \(appGroupID).")
  }
  
  return locations
}

class IntentHandler: INExtension, SettingsIntentHandling {
  func resolveCurrentLocation(for intent: SettingsIntent) async -> INBooleanResolutionResult {
    return intent.currentLocation == nil ?
      .needsValue() :
      .success(with: intent.currentLocation! as! Bool)
  }

  func provideLocationOptionsCollection(for intent: SettingsIntent) async throws -> INObjectCollection<LocationSetting> {
    let options = readStoredLocations()
    return INObjectCollection(items: options)
  }

  func resolveLocation(for intent: SettingsIntent) async -> LocationSettingResolutionResult {
    return intent.location == nil ? .needsValue() : .success(with: intent.location!)
  }

  func resolveTheme(for intent: SettingsIntent) async -> ThemeOptionsResolutionResult {
    return .success(with: intent.theme)
  }
    
}
