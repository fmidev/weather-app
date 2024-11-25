//
//  WarningsErrorView.swift
//  WidgetExtension
//
//  Created by Pekka Keränen on 21.11.2024.
//

import SwiftUI
import CoreLocation

struct WarningsErrorView: View {
  var error: WidgetError

  @StateObject private var networkManager = NetworkStatusManager()
  let locationManager = CLLocationManager()
   
  var body: some View {
    VStack {
      switch error {
        case .dataLoadingError:
          Text("Failed to load alerts").style(.errorTitle).multilineTextAlignment(.center)
        case .oldDataError:
          Text("The alerts are outdated").style(.errorTitle).multilineTextAlignment(.center)
        case .userLocationError:
          Text("Location failed").style(.errorTitle).multilineTextAlignment(.center)
        case .locationOutsideDataArea:
          Text("Location outside data area").style(.errorTitle).multilineTextAlignment(.center)
      }
      Spacer()
      switch error {
        case .dataLoadingError, .oldDataError:
          Text(
            networkManager.isAirplaneMode ?
              "The device is in airplane mode. Warnings will be updated once the internet connection is back." :
              "Warnings will refresh when the internet connection is back."
            ).style(.errorDescription).multilineTextAlignment(.center)
        case .userLocationError:
          Text(
            !locationManager.isAuthorizedForWidgetUpdates ?
              "Location services are not allowed. Please enable them in the settings." :
              "Retrying location services automatically."
          ).style(.errorDescription).multilineTextAlignment(.center)
        case .locationOutsideDataArea:
          Text("Warnings are only available for the Finland region.")
            .style(.errorDescription).multilineTextAlignment(.center)
      }
      Spacer()
    }
  }
}

#Preview {
  WarningsErrorView(error: .userLocationError)
}
