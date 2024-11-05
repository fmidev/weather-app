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

struct TimeStep {
  let observation: Bool
  let epochtime: Int
  let temperature: Double
  let smartSymbol: Int
  let dark: Int
  
  func formatTemperature() -> String {
    let prefix = temperature >= 0 ? "+" : ""
    if (observation) {
      return prefix+String(temperature)
    }
    
    return prefix+String(Int(temperature.rounded()))
  }
  
  func formatDateAndTime(timezone: String? = nil, longFormat: Bool = false) -> String {
    let dateFormatter = DateFormatter()
    if (longFormat) {
      dateFormatter.dateFormat = "EEE dd.MM. '"+"at".localized()+"' HH.mm"
    } else {
      dateFormatter.dateFormat = "dd.MM. HH.mm"
    }    
    if (timezone != nil) {
      dateFormatter.timeZone = TimeZone(identifier: timezone!)
    }
    
    let date = Date(timeIntervalSince1970: TimeInterval(epochtime))
    
    return longFormat ?
      dateFormatter.string(from: date).firstUppercased :
      dateFormatter.string(from: date)
  }
}

struct TimeStepEntry: TimelineEntry {
  let date: Date
  let updated: Date
  let location: Location
  let timeStep: TimeStep
  let crisisMessage: String?
  let error: WidgetError?
  
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
    dateFormatter.dateFormat = "dd.MM. HH.mm"
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
  case dataError
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
