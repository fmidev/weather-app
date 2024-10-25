import AsyncLocationKit
import CoreLocation

@MainActor // <- Perform this task on main thread
func getCurrentLocation() async throws -> CLLocation? {
  var locationManager = AsyncLocationManager(desiredAccuracy: .bestAccuracy)
  let locationUpdateEvent = try await locationManager.requestLocation()
  
  print(locationUpdateEvent as Any)
  
  let location:CLLocation?
  
  switch locationUpdateEvent {
    case .didUpdateLocations(let locations):
        return locations[0]
    default:
        break
  }
  
  return nil
}

