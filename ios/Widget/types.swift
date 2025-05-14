import WidgetKit

struct Location: Codable {
  let id: Int
  let name: String
  let area: String
  let lat: Double
  let lon: Double
  let timezone: String
  let iso2: String
  let country: String?
  
  func formatName() -> String {
    if (iso2 == "FI") {
      if (name == area) { return name }
      return name+", "+area
    }
    
    if (country != nil) {
      return name+", "+country!
    }
    
    return name
  }
}

struct TimeStep: Hashable, Identifiable, Codable {
  var id = UUID()
  let observation: Bool
  let epochtime: Int
  let temperature: Double
  let feelsLike: Double
  let smartSymbol: Int
  let windCompass8: String
  let windDirection: Int
  let windSpeed: Double
  let dark: Int
  var uvCumulated: Int? = nil
  
  func formatTemperature(includeDegree: Bool = false, useFeelsLike: Bool = false) -> String {
    let value = useFeelsLike ? feelsLike : temperature
    
    let suffix = includeDegree ? "°" : ""
    
    if (observation) {
      return String(value)+suffix
    }
    return String(Int(value.rounded()))+suffix
  }
  
  func formatWindSpeed() -> String {
    if (observation) {
      return String(windSpeed)
    }
    
    return String(Int(windSpeed.rounded()))
  }
  
  func formatDateAndTime(timezone: String? = nil, longFormat: Bool = false) -> String {
    let dateFormatter = DateFormatter()
    if (longFormat) {
      dateFormatter.dateFormat = "EEE dd.MM. '"+"at".localized()+"' HH:mm"
    } else {
      dateFormatter.dateFormat = "dd.MM. HH:mm"
    }
    if (timezone != nil) {
      dateFormatter.timeZone = TimeZone(identifier: timezone!)
    }
    
    let date = Date(timeIntervalSince1970: TimeInterval(epochtime))
    
    return longFormat ?
      dateFormatter.string(from: date).firstUppercased :
      dateFormatter.string(from: date)
  }
  
  func formatTime(timezone: String? = nil) -> String {
    let dateFormatter = DateFormatter()
    dateFormatter.dateFormat = "HH:mm"
      
    if (timezone != nil) {
      dateFormatter.timeZone = TimeZone(identifier: timezone!)
    }
    
    let date = Date(timeIntervalSince1970: TimeInterval(epochtime))
    
    return dateFormatter.string(from: date)
  }
  
  func formatHours(timezone: String? = nil) -> String {
    let dateFormatter = DateFormatter()
    dateFormatter.dateFormat = "HH"
      
    if (timezone != nil) {
      dateFormatter.timeZone = TimeZone(identifier: timezone!)
    }
    
    let date = Date(timeIntervalSince1970: TimeInterval(epochtime))
    
    return dateFormatter.string(from: date)
  }
  
  
  func getFeelsLikeIcon() -> String {
    let shouldUseFinnishHolidays = getSetting("location.default.country") as? String == "FI"

    if (shouldUseFinnishHolidays) {
      let currentDate = Date()
      let calendar = Calendar.current
      //let year = calendar.component(.year, from: currentDate)
      let month = calendar.component(.month, from: currentDate)
      let day = calendar.component(.day, from: currentDate)
      
      // holidays
      if (isMidSummer()) {
        return "midsummer"
      }
      if (isEaster()) {
        return "easter"
      }
      if (month == 12 && day == 6) {
          return "independence"
      }
      if (month == 3 && day == 8) {
          return "womensday"
      }
      if (month == 12 && day == 31) {
          return "newyear"
      }
      if (month == 12 && (day >= 24 && day <= 26)) {
        return "xmas"
      }
      if (month == 5 && day == 1) {
        return "vappu"
      }
      if (month == 2 && day == 14) {
        return "valentine"
      }
    }
    
    // Weather related
    
    if (windSpeed) >= 10 {
      return "windy"
    }
    if (temperature >= 30) {
      return "hot"
    }
    if (temperature <= -10) {
      return "winter"
    }
    if (smartSymbol >= 37 && smartSymbol <= 39) {
      return "raining"
    }
    
    return "basic"
  }
  
  func getSmartSymbolTranslationKey() -> String {
    if (smartSymbol >= 100) {
      return "symbol-" + (smartSymbol-100).description
    }
    
    return "symbol-" + smartSymbol.description
  }
  
}

struct UVTimeStep {
  let epochtime: Int
  let uvCumulated: Int
}

struct TimeStepEntry: TimelineEntry, Codable {
  let date: Date
  let updated: Date
  let location: Location
  let timeSteps: [TimeStep]
  let crisisMessage: String?
  let error: WidgetError?
  let settings: WidgetSettings
  
  func formatLocation() -> String {
    if (location.name == location.area) {
      return location.name
    }
    
    return location.name + ", "
  }
  
  func formatArea() -> String {
    if (location.name == location.area) {
      return ""
    }
    
    return location.area
  }
  
  func formatUpdated() -> String {
    let dateFormatter = DateFormatter()
    dateFormatter.dateFormat = "HH.mm"
    dateFormatter.timeZone = TimeZone(identifier: location.timezone)
    
    return dateFormatter.string(from: updated)
  }
}

struct WidgetSettings: Codable {
  let theme: String
  let showLogo: Bool
}

struct WarningEntry: TimelineEntry, Codable {
  let date: Date
  let updated: Date
  let location: Location
  let warnings: [WarningTimeStep]
  let crisisMessage: String?
  let error: WidgetError?
  let settings: WidgetSettings
  
  func formatUpdated() -> String {
    let dateFormatter = DateFormatter()
    dateFormatter.dateFormat = "HH:mm"
    dateFormatter.timeZone = TimeZone(identifier: location.timezone)
    
    return dateFormatter.string(from: updated)
  }
  
  func formatDate() -> String {
    let dateFormatter = DateFormatter()
    dateFormatter.dateFormat = "EEEE dd.MM."
    dateFormatter.timeZone = TimeZone(identifier: "Europe/Helsinki")
    
    return dateFormatter.string(from: date).firstUppercased
  }
  
  func formatLocation() -> String {
    if (location.name == location.area) {
      return location.name
    }
    
    return location.name + ", "
  }
  
  func formatArea() -> String {
    if (location.name == location.area) {
      return ""
    }
    
    return location.area
  }
}

enum WidgetError: Codable {
  case userLocationError
  case dataLoadingError
  case oldDataError
  case locationOutsideDataArea
}

enum WarningSeverity:Int, CustomStringConvertible, Codable {
  case none = 0
  case moderate = 1
  case severe = 2
  case extreme = 3
  
  var description : String {
    switch self {
      case .none: return "none"
      case .moderate: return "moderate"
      case .severe: return "severe"
      case .extreme: return "extreme"
    }
  }
}

enum WarningType: Int, CustomStringConvertible, Codable {
  case thunderstorm = 17
  case forestFireWeather = 16
  case grassFireWeather = 15
  case wind = 14
  case trafficWeather = 13
  case rain = 12
  case pedestrianSafety = 11
  case hotWeather = 10
  case coldWeather = 9
  case uvNote = 8
  case flooding = 7
  case seaWind = 6
  case seaThunderStorm = 5
  case seaWaveHeight = 4
  case seaWaterHeightHighWater = 3
  case seaWaterHeightShallowWater = 2
  case seaIcing = 1
  case none = 0
  
  var description: String {
    switch self {
      case .thunderstorm: return "thunderstorm"
      case .forestFireWeather: return "forestFireWeather"
      case .grassFireWeather: return "grassFireWeather"
      case .wind: return "wind"
      case .trafficWeather: return "trafficWeather"
      case .rain: return "rain"
      case .pedestrianSafety: return "pedestrianSafety"
      case .hotWeather: return "hotWeather"
      case .coldWeather: return "coldWeather"
      case .uvNote: return "uvNote"
      case .flooding: return "flooding"
      case .seaWind: return "seaWind"
      case .seaThunderStorm: return "seaThunderStorm"
      case .seaWaveHeight: return "seaWaveHeight"
      case .seaWaterHeightHighWater: return "seaWaterHeightHighWater"
      case .seaWaterHeightShallowWater: return "seaWaterHeightShallowWater"
      case .seaIcing: return "seaIcing"
      case .none: return "none"
    }
  }
  
  var accessibilityLabel: String {
    switch self {
      case .thunderstorm: return "Severe thunderstorm warning".localized()
      case .forestFireWeather: return "Forest fire warning".localized()
      case .grassFireWeather: return "Grass fire warning".localized()
      case .wind: return "Wind warning for land areas".localized()
      case .trafficWeather: return "Traffic weather warning".localized()
      case .rain: return "Heavy rain warning".localized()
      case .pedestrianSafety: return "Pedestrian weather warning".localized()
      case .hotWeather: return "Heat wave warning".localized()
      case .coldWeather: return "Cold warning".localized()
      case .uvNote: return "UV advisory".localized()
      case .flooding: return "Flood warning".localized()
      case .seaWind: return "Wind warning for sea areas".localized()
      case .seaThunderStorm: return "Thunderstorm wind gusts for sea areas".localized()
      case .seaWaveHeight: return "Wave height warning".localized()
      case .seaWaterHeightHighWater: return "Warning for high sea level".localized()
      case .seaWaterHeightShallowWater: return "Warning for low sea level".localized()
      case .seaIcing: return "Ice accretion warning".localized()
      case .none: return "No warnings".localized()
    }
  }
}

struct WarningDuration: Codable {
  let startTime: Date?
  let endTime: Date?
  
  func formatDuration() -> String {
    let shortDateFormatter = DateFormatter()
    shortDateFormatter.dateFormat = "HH:mm"
    shortDateFormatter.timeZone = TimeZone(identifier: "Europe/Helsinki")
    let longDateFormatter = DateFormatter()
    longDateFormatter.dateFormat = "dd.MM. HH:mm"
    shortDateFormatter.timeZone = TimeZone(identifier: "Europe/Helsinki")
    
    guard let start = startTime else { return "" }
    guard let end = endTime else { return "" }
       
    if Calendar.current.isDate(start, inSameDayAs: end) {
      return shortDateFormatter.string(from: start)+" - "+shortDateFormatter.string(from: end)
    } else {
      return longDateFormatter.string(from: start)+" - "+longDateFormatter.string(from: end)
    }
  }
}

struct WindWarningDetails: Codable {
  let direction: Int
  let speed: Int
}

struct WarningTimeStep: Codable {
  let type: WarningType
  let severity: WarningSeverity
  let duration: WarningDuration
  let language: String
  var wind: WindWarningDetails? = nil
  
  func isValidOnDay(_ date: Date) -> Bool {
    guard let startTime = duration.startTime else { return false }
    guard let endTime = duration.endTime else { return false }
      
    return date >= startTime.startOfDay()! && date <= endTime.endOfDay()!
  }
}
