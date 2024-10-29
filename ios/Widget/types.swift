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
  
  func formatDateAndTime() -> String {
    let dateFormatter = DateFormatter()
    dateFormatter.dateFormat = "dd.MM. HH.mm"
    let date = Date(timeIntervalSince1970: TimeInterval(epochtime))
    
    return dateFormatter.string(from: date)
  }
  
  
}

struct TimeStepEntry: TimelineEntry {
  let date: Date
  let updated: Date
  let location: Location
  let timeStep: TimeStep
  
  func formatUpdated() -> String {
    let dateFormatter = DateFormatter()
    dateFormatter.dateFormat = "dd.MM. HH.mm"
    
    return dateFormatter.string(from: updated)
  }
  
}

