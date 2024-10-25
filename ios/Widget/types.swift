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
}

struct TimestepEntry: TimelineEntry {
  let date: Date
  let location: Location
  let temperature: Double
  let weatherSymbol: Int
}
