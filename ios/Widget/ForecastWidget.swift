import WidgetKit
import CoreLocation
import SwiftUI
import AsyncLocationKit

struct ForecastProvider: TimelineProvider {
  func placeholder(in context: Context) -> TimeStepEntry {
    return defaultEntry
  }

  func getSnapshot(in context: Context, completion: @escaping (TimeStepEntry) -> ()) {
    completion(defaultEntry)
  }

  func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
    Task {
      var error = nil as WidgetError?
      var forecast = [] as [TimeStep]?
      var uvForecast = [] as [UVTimeStep]?
      var entries: [TimeStepEntry] = []
      var location:Location?
      var crisisMessage = nil as String?
      var settings = defaultWidgetSettings
      
      let showLogo = getSetting("layout.logo.enabled") as? Bool;
      
      if (showLogo != nil) {
        settings.showLogo = showLogo!
      }
                 
      let currentLocation = try await getCurrentLocation()
      
      if (currentLocation != nil) {
        location = try await fetchLocation(
          lat: currentLocation!.coordinate.latitude, lon: currentLocation!.coordinate.longitude
        )
      } else {
        error = .userLocationError
      }
      
      if (getSetting("announcements.enabled") as? Bool == true) {
        crisisMessage = try? await fetchCrisisMessage()
      }
      
      if (error == nil) {
        forecast = try? await fetchForecast(location: location!)
        
        if (forecast == nil) {
          error = .dataLoadingError
        } else {
          uvForecast = try? await fetchUVForecast(location: location!)
          
          if (uvForecast != nil) {
            forecast = mergeUvToForecast(forecast: forecast!, uvForecast: uvForecast!)
          }
        }
      }
      
      let updated = Date()
       
      if (error != nil) {
        entries.append(
          TimeStepEntry(
            date: Date(),
            updated: updated,
            location: defaultLocation,
            timeSteps: [defaultTimeStep],
            crisisMessage: crisisMessage,
            error: error,
            settings: settings
          )
        )
      } else {
        for (index, item) in forecast!.enumerated() {
          let timeSteps = Array(0...5).map{
            return forecast![index + $0]
          }
          
          let date = Date(timeIntervalSince1970: TimeInterval(item.epochtime)).addingTimeInterval(TimeInterval(-60*60))
          entries
            .append(
              TimeStepEntry(
                date: date,
                updated: updated,
                location: location!,
                timeSteps: timeSteps,
                crisisMessage: crisisMessage,
                error: WidgetError.none,
                settings: settings
              )
            )
          
          if (entries.count >= 24) {
            let oldDataEntry = TimeStepEntry(
              date: date.addingTimeInterval(TimeInterval(60*60)),
              updated: updated,
              location: location!,
              timeSteps: timeSteps,
              crisisMessage: crisisMessage,
              error: WidgetError.oldDataError,
              settings: settings
            )
            entries.append(oldDataEntry)
            break
          }
        }
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

struct ErrorView : View {
  var entry: ForecastProvider.Entry
     
  var body: some View {
    VStack {
      Spacer()
      switch entry.error {
        case .userLocationError:
          Text("Could not get location information").style(.error).multilineTextAlignment(.center)
        case .dataLoadingError:
          Text("Error loading forecast data").style(.error).multilineTextAlignment(.center)
        case .oldDataError:
          Text("Weather data is too old").style(.error).multilineTextAlignment(.center)
        default:
          Text("Unknown error").style(.error).multilineTextAlignment(.center)
      }
      Spacer()
    }.modifier(TextModifier())
  }
}

struct SmallWidgetView : View {
  var entry: ForecastProvider.Entry

  var body: some View {
    if (entry.error != WidgetError.none) {
      ErrorView(entry: entry)
    } else {
      VStack(spacing: 0) {
        Text(entry.formatLocation()).style(.boldLocation).padding(.top, 8)
        Text(entry.formatAreaOrCountry()).style(.location)
        Spacer()
        NextHourForecast(timeStep: entry.timeSteps[0])
        Spacer()
        if (entry.crisisMessage != nil) {
          HStack{
            Text(entry.crisisMessage!)
              .style(.crisis)
              .foregroundStyle(Color("CrisisTextColor"))
              .lineLimit(2)
              .fixedSize(horizontal: false, vertical: true)
          }.padding(.horizontal, 9).background(Color("CrisisBackgroundColor"))
        } else {
          if (entry.settings.showLogo) {
            Image("FMI").resizable().frame(width: 50, height: 24)
          }
        }
      }.padding(.horizontal, 5).modifier(TextModifier())
    }
  }
}

struct MediumWidgetView : View {
  var entry: ForecastProvider.Entry

  var body: some View {
    if (entry.error != WidgetError.none) {
      ErrorView(entry: entry)
    } else {
      VStack {
        if (entry.crisisMessage == nil) {
          HStack {
            Text(
              "**\(entry.formatLocation())** \(entry.formatAreaOrCountry())"
            ).style(.location)
            Spacer()
            if (entry.settings.showLogo) {
              Image("FMI").resizable().frame(width: 56, height: 27)
            }
          }.padding(.horizontal, 5)
        }
        Spacer()
        ForecastRow(location: entry.location, timeSteps: entry.timeSteps)
        Spacer()
        if (entry.crisisMessage != nil) {
          CrisisMessage(message: entry.crisisMessage!)
          Spacer()
        }
      }.padding(.horizontal, 8).modifier(TextModifier())
    }
  }
}

struct LargeWidgetView : View {
  var entry: ForecastProvider.Entry

  var body: some View {
    if (entry.error != WidgetError.none) {
      ErrorView(entry: entry)
    } else {
      VStack {
        Text(
          "**\(entry.formatLocation())** \(entry.formatAreaOrCountry())"
        ).style(.location)
        Text("at \(entry.timeSteps[0].formatTime(timezone: entry.location.timezone))")
          .style(.largeTime)
        NextHourForecast(timeStep: entry.timeSteps[0], large: true)
        LargeNextHoursForecast(
          timeSteps: entry.timeSteps,
          timezone: entry.location.timezone
        )
        if (entry.crisisMessage != nil) {
          Spacer()
          CrisisMessage(message: entry.crisisMessage!, large: true)
          Spacer()
        } else {
          HStack {
            Image("FMI").resizable().frame(width: 56, height: 27)
            Spacer()
            Text("Updated at **\(entry.formatUpdated())**").style(.updatedTime)
            Spacer()
            Spacer().frame(width: 56, height: 27)
          }
        }
      }.padding(.horizontal, 8).modifier(TextModifier())
    }
  }
}

struct ForecastWidgetEntryView : View {
  @Environment(\.widgetFamily) var family
  var entry: ForecastProvider.Entry
  
  var body: some View {
    if (family == .systemLarge) {
      LargeWidgetView(entry: entry)
    } else if (family == .systemMedium) {
      MediumWidgetView(entry: entry)
    } else {
      SmallWidgetView(entry: entry)
    }
  }
}

struct ForecastWidget: Widget {
    let kind: String = "ForecastWidget"
  
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: ForecastProvider()) { entry in
          ForecastWidgetEntryView(entry: entry)
                .containerBackground(Color("WidgetBackground"), for: .widget)
                .padding(8)
        }
        .contentMarginsDisabled()
        .configurationDisplayName("Forecast")
        .description("Displays the forecast for the next hour or the coming hours.")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    }
}

#Preview(as: .systemSmall) {
    ForecastWidget()
} timeline: {
    defaultEntry
}
