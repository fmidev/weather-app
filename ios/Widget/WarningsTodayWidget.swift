import WidgetKit
import CoreLocation
import SwiftUI
import AsyncLocationKit

struct WarningProvider: TimelineProvider {
  let USER_DEFAULTS_PREFIX = "warnings-today"
  
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
      var wfsWarnings = [] as [WarningTimeStep]?
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
        warnings = try await fetchWarnings(location!)
        if (warnings == nil) {
          error = .dataLoadingError
        } else if (warnings!.contains(
          where: { $0.type == .wind || $0.type == .seaWind }
        )){
          /*
          wfsWarnings = try await fetchWFSWarnings(location!)
          
          if (wfsWarnings != nil) {
            warnings = mergeWarnings(warnings: warnings!, wfsWarnings: wfsWarnings!)
          }
          */
        }
      }
      
      if (error != nil) {
        let lastUpdated = getUpdated()
        
        if (lastUpdated != nil && lastUpdated!.addingTimeInterval(12*60*60) > Date()) {
          // Try to restore old timeline
          let oldEntries = getEntries()
          if (oldEntries != nil) {
            let timeline = Timeline(
              entries: entries,
              policy: .after(Date() + TimeInterval(updateInterval * 60))
            )
            completion(timeline)
            return
          }
        }
        
        let errorEntry = WarningEntry(
          date: Date(),
          updated: Date(),
          location: defaultLocation,
          warnings: [],
          crisisMessage: nil,
          error: error
        )
        
        let timeline = Timeline(
          entries: [errorEntry],
          policy: .after(Date() + TimeInterval(updateInterval * 60))
        )
        completion(timeline)
        return
      }
                  
      let updated = Date()
      let dates = [Date(), Date().addingTimeInterval(24*60*60)]
       
      for date in dates {
        var currentDayWarnings: [WarningTimeStep] = warnings!.filter { warning in
          return warning.language == "fi" && warning
            .isValidOnDay(date)
        }
        currentDayWarnings = filterUniqueWarnings(currentDayWarnings)
        currentDayWarnings = sortWarnings(currentDayWarnings)
        
        print("Count: \(currentDayWarnings.count)")

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
      saveEntries(entries)
      
      let timeline = Timeline(
        entries: entries,
        policy: .after(Date() + TimeInterval(updateInterval * 60))
      )
      completion(timeline)
    }
  }
  
  func saveEntries(_ entries: [WarningEntry]) {
    let userDefaults = UserDefaults.standard
    if let data = try? JSONEncoder().encode(entries) {
      userDefaults.set(data, forKey: USER_DEFAULTS_PREFIX+"-entries")
    }
    UserDefaults.standard.set(Date().timeIntervalSince1970, forKey: USER_DEFAULTS_PREFIX+"-updated")
  }

  func getEntries() -> [WarningEntry]? {
    let userDefaults = UserDefaults.standard
    if let data = userDefaults.data(forKey: USER_DEFAULTS_PREFIX+"-entries"),
      let entries = try? JSONDecoder().decode([WarningEntry].self, from: data) {
      return entries
    }
    return nil
  }
  
  func getUpdated() -> Date? {
    return Date(timeIntervalSince1970: UserDefaults.standard.double(forKey: USER_DEFAULTS_PREFIX+"-updated"))
  }
}

struct SmallWarningTodayView : View {
  var entry: WarningProvider.Entry;

  var body: some View {
    if (entry.error != nil) {
      WarningsErrorView(error: entry.error!)
        .modifier(TextModifier())
    } else {
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
          if (entry.crisisMessage != nil) {
            Text(entry.crisisMessage!)
              .style(.crisis)
              .foregroundStyle(Color("CrisisTextColor"))
              .lineLimit(2)
              .fixedSize(horizontal: false, vertical: true)
          } else if (entry.warnings.count == 1) {
            VStack {
              Text("**\(entry.warnings[0].type.accessibilityLabel)**")
              Text(entry.warnings[0].duration.formatDuration())
            }
          } else {
            Text("Warnings (\(entry.warnings.count))")
          }
          Spacer()
        }
      }.modifier(TextModifier())
    }
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
