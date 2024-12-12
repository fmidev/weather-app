import WidgetKit
import CoreLocation
import SwiftUI
import AsyncLocationKit

struct WarningProvider: IntentTimelineProvider {
  let USER_DEFAULTS_PREFIX = "warnings-today"
  
  func placeholder(in context: Context) -> WarningEntry {
    return defaultWarningEntry
  }

  func getSnapshot(
    for configuration: SettingsIntent,
    in context: Context,
    completion: @escaping (WarningEntry) -> ()) {
    completion(defaultWarningEntry)
  }
 
  func getTimeline(
    for configuration: SettingsIntent,
    in context: Context,
    completion: @escaping (Timeline<Entry>) -> ()) {
    Task {
      var error = nil as WidgetError?
      var warnings = [] as [WarningTimeStep]?
      var crisisMessage = nil as String?
      var location:Location?
      var entries: [WarningEntry] = []
      let updateInterval = getSetting("warnings.interval") as? Int ?? UPDATE_INTERVAL
      let settings = convertSettingsIntentToWidgetSettings(configuration)
      
      if (configuration.currentLocation == 0 && configuration.location != nil) {
        // Use location from configuration
        location = convertLocationSettingToLocation(configuration.location!)
      } else {
        let currentLocation = try await getCurrentLocation()
        
        if (currentLocation != nil) {
          location = try await fetchLocation(
            lat: currentLocation!.coordinate.latitude, lon: currentLocation!.coordinate.longitude
          )
        } else {
          error = .userLocationError
        }
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
        }
      }
           
      if (error != nil) {
        let lastUpdated = getUpdated(settings: configuration)
        
        if (
          lastUpdated != nil &&
          lastUpdated!.addingTimeInterval(TimeInterval(WARNING_VALIDITY_PERIOD)) > Date()
        ) {
          // Try to restore old timeline
          let oldEntries = getEntries(settings: configuration)
          if (oldEntries != nil && oldEntries!.count > 0) {
            let timeline = Timeline(
              entries: oldEntries!,
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
          error: error,
          settings: settings
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

        let entry = WarningEntry(
          date: date.startOfDay()!,
          updated: updated,
          location: location!,
          warnings: currentDayWarnings,
          crisisMessage: crisisMessage,
          error: nil,
          settings: settings
        )
        entries.append(entry)
      }
      
      let expiredEntry = WarningEntry(
        date: Date().addingTimeInterval(2*60*60).startOfDay()!,
        updated: updated,
        location: location!,
        warnings: [],
        crisisMessage: crisisMessage,
        error: .oldDataError,
        settings: settings
      )
      entries.append(expiredEntry)
      saveEntries(entries, settings: configuration)
      
      let timeline = Timeline(
        entries: entries,
        policy: .after(Date() + TimeInterval(updateInterval * 60))
      )
      completion(timeline)
    }
  }
  
  func getUserDefaultsKey(settings: SettingsIntent) -> String {
    let currentLocation = settings.currentLocation == 0 ? "false" : "true"
    let customLocation = settings.location == nil ? "nil" : settings.location!.displayString
    
    return "\(USER_DEFAULTS_PREFIX)-\(settings.theme.rawValue)-\(currentLocation)-\(customLocation)"
  }
  
  func saveEntries(_ entries: [WarningEntry], settings: SettingsIntent) {
    if (entries.count == 0) {
      return
    }
    
    let userDefaults = UserDefaults.standard
    let key = getUserDefaultsKey(settings: settings)
    
    if let data = try? JSONEncoder().encode(entries) {
      userDefaults.set(data, forKey: key+"-entries")
    }
    UserDefaults.standard.set(Date().timeIntervalSince1970, forKey: key+"-updated")
  }

  func getEntries(settings: SettingsIntent) -> [WarningEntry]? {
    let userDefaults = UserDefaults.standard
    let key = getUserDefaultsKey(settings: settings)
    
    if let data = userDefaults.data(forKey: key+"-entries"),
      let entries = try? JSONDecoder().decode([WarningEntry].self, from: data) {
      return entries
    }
    return nil
  }
  
  func getUpdated(settings: SettingsIntent) -> Date? {
    let userDefaults = UserDefaults.standard
    let key = getUserDefaultsKey(settings: settings)
    return Date(
      timeIntervalSince1970: userDefaults.double(forKey: key+"-updated")
    )
  }
}

struct SmallWarningsTodayView : View {
  var entry: WarningProvider.Entry;

  var body: some View {
    if (entry.error != nil) {
      WarningsErrorView(error: entry.error!, size: .small)
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
            Spacer()
            Text(entry.crisisMessage!)
              .style(.crisis)
              .padding(.horizontal, 9)
              .foregroundStyle(Color("CrisisTextColor"))
              .background(Color("CrisisBackgroundColor"))
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

struct WarningsTodayView : View {
  var entry: WarningProvider.Entry;
  var size : ErrorViewSize
  var maxWarningRows: Int
  
  var body: some View {
    if (entry.error != nil) {
      WarningsErrorView(error: entry.error!, size: size)
        .modifier(TextModifier())
    } else {
      VStack(alignment: .leading) {
        Text(
          "**\(entry.formatLocation())** \(entry.formatAreaOrCountry())"
        ).style(.location)
          .padding(.top, 3)
          .frame(maxWidth: .infinity, alignment: .center)
        if (entry.warnings.isEmpty) {
          Spacer()
          Text("No warnings").frame(maxWidth: .infinity, alignment: .center)
          Spacer()
        } else {
          Spacer()
          if (maxWarningRows <= 2 && entry.warnings.count > 2) {
            WarningRow(warning: entry.warnings[0])
          } else {
            let range = 0..<min(maxWarningRows, entry.warnings.count)
            ForEach(range, id: \.self) { i in
              WarningRow(warning: entry.warnings[i])
              if (maxWarningRows > 2) {
                Spacer().frame(minHeight: 7, maxHeight: 24)
              }
            }
          }
          Spacer()
          if (entry.crisisMessage != nil) {
            CrisisMessage(message: entry.crisisMessage!)
          } else if entry.warnings.count > maxWarningRows {
            HStack {
              Spacer()
              Text("More warnings (\(entry.warnings.count - maxWarningRows))")
              Spacer()
            }
          }
        }
        if (entry.crisisMessage == nil) {
          WarningsUpdated(
            updated: entry.formatUpdated(),
            logoPosition: size == .medium ? .right : .left
          )
        }
      }.modifier(TextModifier())
    }
  }
}

struct WarningsTodayEntryView : View {
  @Environment(\.widgetFamily) var family
  @Environment(\.colorScheme) var colorScheme
  var entry: WarningProvider.Entry
  
  var body: some View {
    if (family == .systemSmall) {
      SmallWarningsTodayView(entry: entry)
        .colorScheme(resolveColorScheme(settings: entry.settings) ?? colorScheme)
    } else {
      WarningsTodayView(
        entry: entry,
        size: family == .systemMedium ? .medium : .large,
        maxWarningRows: family == .systemMedium ? 2 : 4
      )
        .colorScheme(resolveColorScheme(settings: entry.settings) ?? colorScheme)
        .padding(.horizontal, 13)
    }
  }
}

struct WarningsTodayWidget: Widget {
  let kind: String = "WarningsTodayWidget"

  var body: some WidgetConfiguration {
    IntentConfiguration(kind: kind, intent: SettingsIntent.self, provider: WarningProvider()) { entry in
      WarningsTodayEntryView(entry: entry)
        .containerBackground(
          entry.settings.theme == "gradient" ? backroundGradient() : singleColorWidgetBackground(entry.settings),
          for: .widget)
        .padding(10)
    }
    .contentMarginsDisabled()
    .configurationDisplayName("Weather warnings for today")
    .description("Weather warnings in your location. Press and hold the widget to edit settings.")
    .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
  }
}

#Preview(as: .systemSmall) {
  WarningsTodayWidget()
} timeline: {
  defaultWarningEntry
}
