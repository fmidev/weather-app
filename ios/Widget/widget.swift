import WidgetKit
import CoreLocation
import SwiftUI
import AsyncLocationKit

let UPDATE_INTERVAL = 30

struct Provider: TimelineProvider {
  func placeholder(in context: Context) -> TimeStepEntry {
    return defaultEntry
  }

  func getSnapshot(in context: Context, completion: @escaping (TimeStepEntry) -> ()) {
    completion(defaultEntry)
  }

  func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
    Task {
      var entries: [TimeStepEntry] = []
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
      
      guard let forecast = try await fetchForecast(location: location!) else { return }
      
      let updated = Date()
           
      for item in forecast {
        let date = Date(timeIntervalSince1970: TimeInterval(item.epochtime))
        entries.append(TimeStepEntry(date: date, updated: updated, location: location!, timeStep: item))
      }
            
      let timeline = Timeline(
        entries: entries,
        policy:
            .after(
              Date() + TimeInterval(UPDATE_INTERVAL * 60)
            )
      )
      completion(timeline)
    }
  }

}

struct smallWidget : View {
  var entry: Provider.Entry

  var body: some View {
    VStack {
      Text(entry.location.formatName())
      Text(entry.timeStep.formatDateAndTime()).style(name: "dateAndTime")
      Spacer()
      HStack {
        Spacer()
        Text(entry.timeStep.formatTemperature()).style(name: "largeTemperature")
        Image(String(entry.timeStep.smartSymbol)).resizable().frame(width: 40, height: 40)
        Spacer()
      }
      Spacer()
      Text("Updated"+" "+entry.formatUpdated())
    }.modifier(TextModifier())
  }
}

struct widget: Widget {
    let kind: String = "widget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            smallWidget(entry: entry)
              .containerBackground(Color("WidgetBackground"), for: .widget)
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
