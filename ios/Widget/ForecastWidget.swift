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
      var entries: [TimeStepEntry] = []
      var location:Location?
      var crisisMessage = nil as String?
                 
      let currentLocation = try await getCurrentLocation()
      
      print(currentLocation as Any)
      
      if (currentLocation != nil) {
        location = try await fetchLocation(
          lat: currentLocation!.coordinate.latitude, lon: currentLocation!.coordinate.longitude
        )
      } else {
        error = .userLocationError
      }
      
      if (getSetting("announcements.enabled") as? Bool == true) {
        crisisMessage = try? await fetchCrisisMessage()
        print(crisisMessage as Any)
      }
      
      if (error == nil) {
        forecast = try await fetchForecast(location: location!)
        if (forecast == nil) {
          error = .dataError
        }
      }
      
      let updated = Date()
       
      if (error != nil) {
        entries.append(
          TimeStepEntry(
            date: Date(),
            updated: updated,
            location: defaultLocation,
            timeStep: defaultTimeStep,
            crisisMessage: crisisMessage,
            error: error
          )
        )
      } else {
        for item in forecast! {
          let date = Date(timeIntervalSince1970: TimeInterval(item.epochtime)).addingTimeInterval(TimeInterval(-60*60))
          entries
            .append(
              TimeStepEntry(
                date: date,
                updated: updated,
                location: location!,
                timeStep: item,
                crisisMessage: crisisMessage,
                error: nil
              )
            )
          
          if (entries.count >= 24) { break }
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
        case .dataError:
          Text("Error loading forecast data").style(.error).multilineTextAlignment(.center)
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
    if (entry.error != nil) {
      ErrorView(entry: entry)
    } else {
      VStack {
        Text(entry.formatLocation()).style(.location).padding(.top, 17)
        Text(entry.formatAreaOrCountry()).style(.areaOrCountry)
        Spacer()
        HStack(spacing: 2) {
          Image(String(entry.timeStep.smartSymbol)).resizable().frame(width: 54, height: 54)
          Text(entry.timeStep.formatTemperature()).style(.largeTemperature)
          Text("°C").style(.temperatureUnit).baselineOffset(15)
        }
        if (entry.crisisMessage != nil) {
          Text(entry.crisisMessage!)
            .style(.crisis)
            .foregroundStyle(Color("CrisisTextColor"))
            .lineLimit(2)
            .fixedSize(horizontal: false, vertical: true)
        } else {
          Spacer()
          Image("FMI").resizable().frame(width: 50, height: 24)
        }
      }.modifier(TextModifier())
    }
  }
}

struct ForecastWidget: Widget {
    let kind: String = "ForecastWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: ForecastProvider()) { entry in
            SmallWidgetView(entry: entry)
              .containerBackground(Color("WidgetBackground"), for: .widget)
              .padding(8)
        }
        .contentMarginsDisabled()
        .configurationDisplayName("Forecast")
        .description("Next hour forecast")
        .supportedFamilies([.systemSmall])
    }
}

#Preview(as: .systemSmall) {
    ForecastWidget()
} timeline: {
    defaultEntry
}
