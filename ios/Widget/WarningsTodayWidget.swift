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
      var crisisMessage = nil as String?
      var location:Location?
      var entries: [WarningEntry] = []
      let updateInterval = getSetting("warnings.interval") as? Int ?? UPDATE_INTERVAL
      
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
      
      if (getSetting("announcements.enabled") as? Bool == true) {
        crisisMessage = try? await fetchCrisisMessage()
      }
      
      if (error == nil) {
        warnings = try await fetchWarnings(location: location!)
        if (warnings == nil) {
          error = .dataLoadingError
        }
      }
            
      let updated = Date()
      let dates = [Date(), Date().addingTimeInterval(24*60*60)]
       
      for date in dates {
        var currentDayWarnings: [WarningTimeStep] = warnings!.filter { warning in
          return warning.language == "fi" && warning.isValidOnDay(date)
        }
        currentDayWarnings = filterUniqueWarnings(currentDayWarnings)
        currentDayWarnings = sortWarnings(currentDayWarnings)
        
        print("Count: \(currentDayWarnings.count)")
        currentDayWarnings.forEach { warning in
          print(warning.type.description)
        }

        let entry = WarningEntry(
          date: date.startOfDay()!,
          updated: updated,
          location: location!,
          warnings: currentDayWarnings,
          crisisMessage: crisisMessage,
          error: nil
        )

        entries.append(entry)
      }
      
      let expiredEntry = WarningEntry(
        date: Date().addingTimeInterval(2*60*60).startOfDay()!,
        updated: updated,
        location: location!,
        warnings: [],
        crisisMessage: crisisMessage,
        error: .oldDataError
      )
      entries.append(expiredEntry)
      
      let timeline = Timeline(
        entries: entries,
        policy:
            .after(
              Date() + TimeInterval(updateInterval * 60)
            )
      )
      completion(timeline)
    }
  }
}

struct SmallWarningTodayView : View {
  var entry: WarningProvider.Entry;

  var body: some View {
    VStack {
      Text("**\(entry.location.name),**").style(.location)
      Text(entry.location.area).style(.location)
      if (entry.warnings.isEmpty) {
        Spacer()
        Text("No warnings")
        Spacer()
      } else {
        Spacer()
        HStack(spacing: 15) {
          let range = 0..<min(3, entry.warnings.count)
          ForEach(range, id: \.self) { i in
            WarningIcon(warning: entry.warnings[i])
          }
        }
        Spacer()
        Text("Warnings (\(entry.warnings.count))")
        Spacer()
      }
    }.modifier(TextModifier())
  }
}

struct WarningsTodayWidget: Widget {
    let kind: String = "WarningsTodayWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: WarningProvider()) { entry in
            SmallWarningTodayView(entry: entry)
              .containerBackground(Color("WidgetBackground"), for: .widget)
              .padding(10)
        }
        .contentMarginsDisabled()
        .configurationDisplayName("Weather warnings for today")
        .description("Weather warnings in your location")
        .supportedFamilies([.systemSmall])
    }
}

#Preview(as: .systemSmall) {
    WarningsTodayWidget()
} timeline: {
  defaultWarningEntry
}
