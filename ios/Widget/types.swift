import WidgetKit

struct Location {
  let id: Int
  let name: String
  let area: String
  let lat: Double
  let lon: Double
  let timezone: String
  let iso2: String
  let country: String
  
  func formatName() -> String {
    if (iso2 == "FI") {
      if (name == area) { return name }
      return name+", "+area
    }
    
    return name+", "+country;
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
      return prefix+String(temperature)+"°"
    }
    
    return prefix+String(Int(temperature.rounded()))+"°"
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
  let error: WidgetError?
  
  func formatUpdated() -> String {
    let dateFormatter = DateFormatter()
    dateFormatter.dateFormat = "dd.MM. HH.mm"
    dateFormatter.timeZone = TimeZone(identifier: location.timezone)
    
    return dateFormatter.string(from: updated)
  }
  
}

enum WidgetError {
  case userLocationError
  case dataError
}
