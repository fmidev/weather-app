import Foundation

func getDefaultForecastDate() -> Date {
  let date = Calendar.current.date(bySettingHour: 12, minute: 00, second: 0, of: Date())!
  return date
}

func getDefaultUpdatedDate() -> Date {
  let date = Calendar.current.date(bySettingHour: 11, minute: 55, second: 0, of: Date())!
  return date
}
  
let defaultLocation = Location(
  id: 658225,
  name: "Helsinki",
  area: "Helsinki",
  lat: 24.93545,
  lon: 60.16952,
  timezone: "Europe/Helsinki",
  iso2: "FI",
  country: "Suomi"
)

let defaultTimeStep = TimeStep(
  observation: false,
  epochtime: Int(getDefaultForecastDate().timeIntervalSince1970),
  temperature: 11,
  smartSymbol: 4,
  dark: 0
)

let defaultEntry = TimeStepEntry(
  date: Date(),
  updated: getDefaultUpdatedDate(),
  location: getDefaultLocation(),
  timeStep: defaultTimeStep,
  error: nil
)

let defaultWarningEntry = WarningEntry(
  date: Date(),
  updated: getDefaultUpdatedDate(),
  location: getDefaultLocation(),
  warningLevel: .none,
  warningCount: 0,
  error: nil
)

let UPDATE_INTERVAL = 30
