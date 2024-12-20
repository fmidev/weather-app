import SwiftUI
import CoreLocation

struct WarningsErrorView: View {
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
          case .dataLoadingError:
            Text("Failed to load alerts")
              .style(size == .large ? .largeErrorTitle : .errorTitle)
              .multilineTextAlignment(.center)
          case .oldDataError:
            Text("The alerts are outdated")
              .style(size == .large ? .largeErrorTitle : .errorTitle)
              .multilineTextAlignment(.center)
          case .userLocationError:
            Text("Location failed")
              .style(size == .large ? .largeErrorTitle : .errorTitle)
              .multilineTextAlignment(.center)
          case .locationOutsideDataArea:
            Text("Location outside data area")
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
        case .dataLoadingError, .oldDataError:
          Text(
            networkManager.isAirplaneMode ?
              "The device is in airplane mode. Warnings will be updated once the internet connection is back." :
              "Warnings will refresh when the internet connection is back."
            ).style(size == .large ? .largeErrorDescription : .errorDescription)
              .multilineTextAlignment(.center)
        case .userLocationError:
          Text(
            !locationManager.isAuthorizedForWidgetUpdates ?
              "Location services are not allowed. Please enable them in the settings." :
              "Retrying location services automatically."
          ).style(size == .large ? .largeErrorDescription : .errorDescription)
            .multilineTextAlignment(.center)
        case .locationOutsideDataArea:
          Text("Warnings are only available for the Finland region.")
            .style(size == .large ? .largeErrorDescription : .errorDescription)
            .multilineTextAlignment(.center)
      }
      Spacer()
      if (size == .large) {
        HStack {
          Image(decorative: "FMI").resizable().frame(width: 56, height: 27)
          Spacer()
        }
      }
    }
  }
}

#Preview {
  WarningsErrorView(error: .userLocationError, size: .medium)
}
