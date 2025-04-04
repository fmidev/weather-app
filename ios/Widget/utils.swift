import Foundation
import SwiftUI
import SwiftyJSON

func mergeUvToForecast(forecast: [TimeStep], uvForecast: [UVTimeStep]) -> [TimeStep] {
  return forecast.map{item in
    let uvItem = uvForecast.first(where: {$0.epochtime == item.epochtime})
    var mutable = item
    mutable.uvCumulated = uvItem?.uvCumulated
    return mutable
  }
}

func getMidSummerDay(_ year: Int) -> Int {
  let calendar = Calendar.current
  let dateComponents = DateComponents(year: year, month: 6, day: 19)
  
  if let date = calendar.date(from: dateComponents) {
    let weekday = calendar.component(.weekday, from: date)
    let a = 19 - weekday + 6
    return a == 19 ? a + 7 : a
  } else {
    return -1 // Failure
  }
}

func isMidSummer() -> Bool {
  let currentDate = Date()
  let calendar = Calendar.current
  let year = calendar.component(.year, from: currentDate)
  let month = calendar.component(.month, from: currentDate)
  let day = calendar.component(.day, from: currentDate)
  let midSummerDay = getMidSummerDay(year)
  
  if (month == 6 && (day == midSummerDay || day == midSummerDay - 1)) {
    return true
  }
  
  return false
}

func getEaster(year: Int) -> (month: Int, day: Int) {
  let G = year % 19
  let C = year / 100
  let H = (C - C / 4 - (8 * C + 13) / 25 + 19 * G + 15) % 30
  let I = H - (H / 28) * (1 - (29 / (H + 1)) * ((21 - G) / 11))
  let J = (year + year / 4 + I + 2 - C + C / 4) % 7
  let L = I - J
  let month = 3 + (L + 40) / 44
  let day = L + 28 - 31 * (month / 4)

  return (month, day)
}

func isEaster() -> Bool {
  let currentDate = Date()
  let calendar = Calendar.current
  let year = calendar.component(.year, from: currentDate)

  let easter = getEaster(year: year)
  let easterDateComponents = DateComponents(year: year, month: easter.month, day: easter.day)
  
  guard let easterDate = calendar.date(from: easterDateComponents) else { return false }
  let goodFriday = calendar.date(byAdding: .day, value: -2, to: easterDate)!
  let nextTuesday = calendar.date(byAdding: .day, value: 2, to: easterDate)!
   
  return currentDate >= goodFriday && currentDate < nextTuesday
}

func filterUniqueWarnings(_ warnings : [WarningTimeStep]) -> [WarningTimeStep] {
  var processed = [WarningTimeStep]()
  var filtered = [WarningTimeStep]()
  
  for warning in warnings {
    if (!processed.contains(where: {$0.type == warning.type && $0.severity == warning.severity})) {
      processed.append(warning)
      filtered.append(warning)
    }
  }
  
  return filtered;
}

func sortWarnings(_ warnings: [WarningTimeStep]) -> [WarningTimeStep] {
  var extremeWarnings = warnings.filter{$0.severity == .extreme}
  extremeWarnings.sort(by: {$0.type.rawValue > $1.type.rawValue})
  var severeWarnings = warnings.filter{$0.severity == .severe}
  severeWarnings.sort(by: {$0.type.rawValue > $1.type.rawValue})
  var moderateWarnings = warnings.filter{$0.severity == .moderate}
  moderateWarnings.sort(by: {$0.type.rawValue > $1.type.rawValue})
  
  return extremeWarnings + severeWarnings + moderateWarnings
}

func resolveWarningSeverity(_ severity: String) -> WarningSeverity {
  switch severity {
    case "Moderate": return .moderate
    case "Severe": return .severe
    case "Extreme": return .extreme
    default: return .none
  }
}

func resolveWarningType(_ type: String) -> WarningType {
  switch type {
    case "thunderstorm": return .thunderstorm
    case "forestFireWeather": return .forestFireWeather
    case "grassFireWeather": return .grassFireWeather
    case "wind": return .wind
    case "trafficWeather": return .trafficWeather
    case "rain": return .rain
    case "pedestrianSafety": return .pedestrianSafety
    case "hotWeather": return .hotWeather
    case "coldWeather": return .coldWeather
    case "uvNote": return .uvNote
    case "flooding": return .flooding
    case "seaWind": return .seaWind
    case "seaThunderStorm": return .seaThunderStorm
    case "seaWaveHeight": return .seaWaveHeight
    case "seaWaterHeightHighWater": return .seaWaterHeightHighWater
    case "seaWaterHeightShallowWater": return .seaWaterHeightShallowWater
    case "seaIcing": return .seaIcing
    default: return .none
  }
}

func convertLocationSettingToLocation(_ location: LocationSetting) -> Location {
  return Location(
    id: location.geoid as! Int,
    name: location.displayString,
    area: location.area ?? "",
    lat: location.lat as? Double ?? 0,
    lon: location.lon as? Double ?? 0,
    timezone: location.timezone ?? "Europe/Helsinki",
    iso2: location.iso2 ?? "",
    country: ""
  )
}

func convertSettingsIntentToWidgetSettings(_ intent: SettingsIntent) -> WidgetSettings {
  let showLogo = getSetting("layout.logo.enabled") as? Bool ?? true
  
  switch intent.theme.rawValue {
    case 2: return WidgetSettings(theme: "light", showLogo: showLogo)
    case 3: return WidgetSettings(theme: "dark", showLogo: showLogo)
    case 4: return WidgetSettings(theme: "gradient", showLogo: showLogo)
    default: return WidgetSettings(theme: "automatic", showLogo: showLogo)
  }
}

func resolveColorScheme(settings: WidgetSettings) -> ColorScheme? {
  if (settings.theme == "gradient" || settings.theme == "dark") {
    return .dark
  }
  if (settings.theme == "light") {
    return .light
  }
  
  return nil
}

func resolveUserInterfaceStyle(settings: WidgetSettings) -> UIUserInterfaceStyle? {
  if (settings.theme == "gradient" || settings.theme == "dark") {
    return .dark
  }
  if (settings.theme == "light") {
    return .light
  }
  
  return nil
}

func backroundGradient() -> LinearGradient {
  return LinearGradient(
    gradient: Gradient(stops: [
      Gradient.Stop(color: Color(red: 2/255, green: 184/255, blue: 206/255), location: 0.0),
      Gradient.Stop(color: Color(red: 0/255, green: 127/255, blue: 173/255), location: 0.095),
      Gradient.Stop(color: Color(red: 31/255, green: 32/255, blue: 96/255), location: 0.4251),
      Gradient.Stop(color: Color(red: 15/255, green: 15/255, blue: 45/255), location: 1.0)
    ]),
    startPoint: .top,
    endPoint: .bottom
  )
}

// containerBackground() method requires that options have same type. Therefore this utility
// function creates single color background using LinearGradient.
func singleColorWidgetBackground(_ settings: WidgetSettings) -> LinearGradient {
  let uiStyle = resolveUserInterfaceStyle(settings: settings)
  var color = Color("WidgetBackground")
  
  if (uiStyle != nil) {
    color = Color(UIColor(named: "WidgetBackground")!.resolvedColor(with: UITraitCollection(userInterfaceStyle: uiStyle!)))
  }
  
  return LinearGradient(
    gradient: Gradient(stops: [
      Gradient.Stop(color: color, location: 0.0),
      Gradient.Stop(color: color, location: 1.0)
    ]),
    startPoint: .top,
    endPoint: .bottom
  )
}
