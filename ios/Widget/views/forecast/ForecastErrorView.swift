import SwiftUI
import CoreLocation

enum ErrorViewSize {
  case small
  case medium
  case large
}

struct ForecastErrorView: View {
  var error: WidgetError
  var size: ErrorViewSize
  
  @StateObject private var networkManager = NetworkStatusManager()
  let locationManager = CLLocationManager()
 
  var body: some View {
    VStack {
      if (size == .medium) {
        HStack {
          Spacer()
          Image(decorative: "FMI").resizable().frame(width: 56, height: 27)
        }
      }
      if (size == .large) {
          Spacer()
      }
      HStack(spacing: size == .small ? 0 : 9) {
        Spacer()
        if (size != .small) {
          Image(decorative: "infoIcon")
            .resizable()
            .aspectRatio(contentMode: .fit)
            .foregroundColor(Color("TextColor"))
            .frame(width: 22, height: 22)
        }
        switch error {
          // .locationOutsideDataArea should not happen for forecast data, just to make compiler happy
          case .dataLoadingError, .locationOutsideDataArea:
            Text("Failed to load weather data")
              .style(size == .large ? .largeErrorTitle : .errorTitle)
              .multilineTextAlignment(.center)
          case .oldDataError:
            Text("The weather information is outdated")
              .style(size == .large ? .largeErrorTitle : .errorTitle)
              .multilineTextAlignment(.center)
          case .userLocationError:
            Text("Location failed")
              .style(size == .large ? .largeErrorTitle : .errorTitle)
              .multilineTextAlignment(.center)
        }
        Spacer()
      }
      if (size == .large) {
        Spacer().frame(height: 15)
      } else {
        Spacer()
      }
      switch error {
        case .dataLoadingError, .oldDataError, .locationOutsideDataArea:
          Text(
            networkManager.isAirplaneMode ?
              "The device is in airplane mode. Weather updates will refresh when the internet connection is back." :
              "Weather updates will refresh when the internet connection is back."
          ).style(size == .large ? .largeErrorDescription : .errorDescription)
          .multilineTextAlignment(.center)
        case .userLocationError:
          Text(
            !locationManager.isAuthorizedForWidgetUpdates ?
              "Location services are not allowed. Please enable them in the settings." :
              "Retrying location services automatically."
          ).style(size == .large ? .largeErrorDescription : .errorDescription)
            .multilineTextAlignment(.center)
      }
      Spacer()
      if (size == .large) {
        HStack {
          Image(decorative: "FMI").resizable().frame(width: 56, height: 27)
          Spacer()
        }
      }
    }.modifier(TextModifier()).padding(8)
  }
}

#Preview {
  ForecastErrorView(error: .userLocationError, size: .medium)
}
