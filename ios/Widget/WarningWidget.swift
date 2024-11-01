import WidgetKit
import CoreLocation
import SwiftUI
import AsyncLocationKit

struct WarningProvider: TimelineProvider { 
  func placeholder(in context: Context) -> WarningEntry {
    return defaultWarningEntry
  }

  func getSnapshot(in context: Context, completion: @escaping (WarningEntry) -> ()) {
    completion(defaultWarningEntry)
  }

  func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
    Task {
      var error = nil as WidgetError?
      var warnings = [] as [WarningTimeStep]?
      var location:Location?
      var entries: [WarningEntry] = []
      let currentLocation = try await getCurrentLocation()
      
      if (currentLocation != nil) {
        location = try await fetchLocation(
          lat: currentLocation!.coordinate.latitude, lon: currentLocation!.coordinate.longitude
        )
      } else {
        error = .userLocationError
      }
      
      if (location?.iso2 != "FI") {
        error = .locationOutsideDataArea
      }
      
      if (error == nil) {
        warnings = try await fetchWarnings(location: location!)
        if (warnings == nil) {
          error = WidgetError.dataError
        }
      }
      
      print("Warnings")
      print(error as Any)
      print(warnings as Any)
      
      let updated = Date()
      
      entries.append(defaultWarningEntry)
      
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

struct SmallWarningView : View {
  var entry: WarningProvider.Entry

  var body: some View {
    VStack {
      Spacer()
      Text("Weather warnings")
      Spacer()
    }.modifier(TextModifier())
  }
}

struct WarningWidget: Widget {
    let kind: String = "WarningWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: WarningProvider()) { entry in
            SmallWarningView(entry: entry)
              .containerBackground(Color("WidgetBackground"), for: .widget)
              .padding(10)
        }
        .contentMarginsDisabled()
        .configurationDisplayName("Weather warnings")
        .description("Weather warnings in your area")
        .supportedFamilies([.systemSmall])
    }
}

#Preview(as: .systemSmall) {
    WarningWidget()
} timeline: {
  defaultWarningEntry
}
