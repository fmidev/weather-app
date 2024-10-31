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
      var error = nil as WidgetError?
      var entries: [TimeStepEntry] = []
      var location:Location?
          
      print("Request location")
      
      let currentLocation = try await getCurrentLocation()
      
      print(currentLocation as Any)
      
      if (currentLocation != nil) {
        location = try await fetchLocation(
          lat: currentLocation!.coordinate.latitude, lon: currentLocation!.coordinate.longitude
        )
      } else {
        error = WidgetError.userLocationError
      }
      
      if (location == nil ) {
        location = defaultLocation
      }
      
      let forecast = try await fetchForecast(location: location!)
      if (forecast == nil) {
        error = WidgetError.dataError
      }
      
      let updated = Date()
       
      if (error != nil) {
        entries.append(
          TimeStepEntry(
            date: Date(),
            updated: updated,
            location: defaultLocation,
            timeStep: defaultTimeStep,
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
  var entry: Provider.Entry
     
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
  var entry: Provider.Entry

  var body: some View {
    if (entry.error != nil) {
      ErrorView(entry: entry)
    } else {
      VStack {
        Text(entry.location.formatName()).style(.location)
        Spacer().frame(height: 3)
        Text(
          entry.timeStep
            .formatDateAndTime(timezone:entry.location.timezone, longFormat: true)
        ).style(.dateAndTime)
        Spacer()
        HStack {
          Spacer()
          Text(entry.timeStep.formatTemperature()).style(.largeTemperature)
          Spacer()
          Image(String(entry.timeStep.smartSymbol)).resizable().frame(width: 40, height: 40)
          Spacer()
        }
        Spacer()
        Text("Updated \(entry.formatUpdated())").style(.dateAndTime)
          .style(.dateAndTime)
      }.modifier(TextModifier())
    }
  }
}

struct ForecastWidget: Widget {
    let kind: String = "widget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            SmallWidgetView(entry: entry)
              .containerBackground(Color("WidgetBackground"), for: .widget)
              .padding(10)
        }
        .contentMarginsDisabled()
        .configurationDisplayName("FMI weather")
        .description("Next hour forecast")
        .supportedFamilies([.systemSmall])
    }
}

#Preview(as: .systemSmall) {
    ForecastWidget()
} timeline: {
    defaultEntry
}
