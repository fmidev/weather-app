import WidgetKit
import SwiftDate

struct Location {
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

struct TimeStep: Hashable, Identifiable {
  let id = UUID()
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
    
    let prefix = value >= 0 ? "+" : ""
    let suffix = includeDegree ? "°" : ""
    
    if (observation) {
      return prefix+String(value)+suffix
    }
    return prefix+String(Int(value.rounded()))+suffix
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
}

struct UVTimeStep {
  let epochtime: Int
  let uvCumulated: Int
}

struct TimeStepEntry: TimelineEntry {
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
  
  func formatAreaOrCountry() -> String {
    if (location.name == location.area) {
      return ""
    }
    
    if (location.iso2 == "FI") {
      return location.area
    }
        
    return location.country != nil ? location.country! : ""
  }
  
  func formatUpdated() -> String {
    let dateFormatter = DateFormatter()
    dateFormatter.dateFormat = "HH.mm"
    dateFormatter.timeZone = TimeZone(identifier: location.timezone)
    
    return dateFormatter.string(from: updated)
  }
}

struct WarningEntry: TimelineEntry {
  let date: Date
  let updated: Date
  let location: Location
  let warningLevel: WarningSeverity
  let warningCount: Int
  let error: WidgetError?
  
  func formatUpdated() -> String {
    let dateFormatter = DateFormatter()
    dateFormatter.dateFormat = "dd.MM. HH.mm"
    dateFormatter.timeZone = TimeZone(identifier: location.timezone)
    
    return dateFormatter.string(from: updated)
  }
  
  func formatDate() -> String {
    let dateFormatter = DateFormatter()
    dateFormatter.dateFormat = "EEEE dd.MM."
    dateFormatter.timeZone = TimeZone(identifier: "Europe/Helsinki")
    
    return dateFormatter.string(from: date).firstUppercased
  }
}

enum WidgetError {
  case none
  case userLocationError
  case dataLoadingError
  case oldDataError
  case locationOutsideDataArea
}

enum WarningSeverity:Int {
  case none = 0
  case moderate = 1
  case severe = 2
  case extreme = 3
}

struct WarningDuration {
  let startTime: Date?
  let endTime: Date?
}

struct WarningTimeStep {
  let type: String
  let severity: WarningSeverity
  let duration: WarningDuration
  
  func isValidOnDay(date: Date) -> Bool {
    if (duration.startTime == nil || duration.endTime == nil) {
      return false
    }
    
    return date
      .isInRange(
        date: duration.startTime!,
        and: duration.endTime!,
        orEqual: true,
        granularity: .day
      )
  }
}

struct WidgetSettings {
  var showLogo: Bool
}