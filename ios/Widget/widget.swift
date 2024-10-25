import WidgetKit
import CoreLocation
import SwiftUI
import AsyncLocationKit

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
      var location:Location?
     
      print("Request location")      
      
      let currentLocation = try await getCurrentLocation()
      
      print(currentLocation as Any)
      
      if (currentLocation != nil) {
        location = try await fetchLocation(
          lat: currentLocation!.coordinate.latitude, lon: currentLocation!.coordinate.longitude
        )
      }
      
      if (location == nil ) {
        location = defaultLocation
      }
           
      // Generate a timeline consisting of five entries an hour apart, starting from the current date.
      let currentDate = Date()
      for hourOffset in 0 ..< 5 {
        let entryDate = Calendar.current.date(byAdding: .hour, value: hourOffset, to: currentDate)!
        let entry = TimestepEntry(date: entryDate, location: location!, temperature: -1, weatherSymbol: 4)
        entries.append(entry)
      }
      
      let timeline = Timeline(entries: entries, policy: .after(currentDate))
      completion(timeline)
    }
  }

}

struct widgetEntryView : View {
  var entry: Provider.Entry

  var body: some View {
    VStack {
      Text(entry.location.name)
      Text(entry.date, style: .time)
      Text(String(entry.temperature))
      Text(String(entry.weatherSymbol))
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
