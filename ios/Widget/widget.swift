import WidgetKit
import CoreLocation
import SwiftUI
// import AsyncLocationKit

let defaultEntry = TimestepEntry(date: Date(), temperature: 11, weatherSymbol: 1)

struct Provider: TimelineProvider {
  func placeholder(in context: Context) -> TimestepEntry {
    return defaultEntry
  }

  func getSnapshot(in context: Context, completion: @escaping (TimestepEntry) -> ()) {
    completion(defaultEntry)
  }

  func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
    Task {
      var entries: [TimestepEntry] = []
      var location = defaultLocation
      var geoLocation:CLLocation?
      
      /*
      let asyncLocationManager = AsyncLocationManager(
        desiredAccuracy: .hundredMetersAccuracy
      )
      
      let locationUpdateEvent = try await asyncLocationManager.requestLocation()
      var geoLocation : CLLocation?
      
      switch locationUpdateEvent {
        case .didUpdateLocations(let locations):
          geoLocation = locations.first
        default:
          geoLocation = nil
      }
      
      if (geoLocation != nil) {
        location = try await fetchLocation(
          lat: geoLocation!.coordinate.latitude, lon: geoLocation!.coordinate.longitude
        )
      }

      */
       
      // Generate a timeline consisting of five entries an hour apart, starting from the current date.
      let currentDate = Date()
      for hourOffset in 0 ..< 5 {
        let entryDate = Calendar.current.date(byAdding: .hour, value: hourOffset, to: currentDate)!
        let entry = TimestepEntry(date: entryDate, temperature: -1, weatherSymbol: 4)
        entries.append(entry)
      }
      
      let timeline = Timeline(entries: entries, policy: .atEnd)
      completion(timeline)
    }
  }

}

struct widgetEntryView : View {
  var entry: Provider.Entry

  var body: some View {
    VStack {
      Text(entry.date, style: .time)
      Text(String(entry.temperature))
    }
  }
}

struct widget: Widget {
    let kind: String = "widget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            if #available(iOS 17.0, *) {
                widgetEntryView(entry: entry)
                    .containerBackground(.fill.tertiary, for: .widget)
            } else {
                widgetEntryView(entry: entry)
                    .padding()
                    .background()
            }
        }
        .configurationDisplayName("FMI weather")
        .description("Next hour forecast")
    }
}

#Preview(as: .systemSmall) {
    widget()
} timeline: {
    defaultEntry
}
