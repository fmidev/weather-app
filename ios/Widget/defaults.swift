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
  feelsLike: 12,
  smartSymbol: 1,
  windCompass8: ["N", "NE", "E", "SE", "S", "SW", "W", "NW"].randomElement()!,
  windDirection: 270,
  windSpeed: 5,
  dark: 0
)

let defaultEntry = TimeStepEntry(
  date: Date(),
  updated: getDefaultUpdatedDate(),
  location: getDefaultLocation(),
  timeSteps: [1,2,3,4,5].map{
    return TimeStep(
      observation: false,
      epochtime: Int(Date()
        .addingTimeInterval($0 * 60 * 60)
        .startOfHour()!
        .timeIntervalSince1970),
      temperature: defaultTimeStep.temperature + Double(Int.random(in: -2...2)),
      feelsLike: defaultTimeStep.feelsLike + Double(Int.random(in: -2...2)),
      smartSymbol: defaultTimeStep.smartSymbol + Int.random(in: 0...1),
      windCompass8: ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]
        .randomElement()!,
      windDirection: Int.random(in: 0...360),
      windSpeed: defaultTimeStep.windSpeed + Double(Int.random(in: -2...2)),
      dark: defaultTimeStep.dark
    )
  },
  crisisMessage: nil,
  error: WidgetError.none,
  settings: defaultWidgetSettings
)

let defaultWarningEntry = WarningEntry(
  date: Date(),
  updated: getDefaultUpdatedDate(),
  location: getDefaultLocation(),
  warningLevel: .none,
  warningCount: 0,
  error: nil
)

let defaultWidgetSettings = WidgetSettings(
  showLogo: true
)

let WHO="mobileweather_ios_widget"
let UPDATE_INTERVAL = 30
let SUPPORTED_LANGUAGES = ["fi", "sv", "en"]
let FALLBACK_LANGUAGE = "en"