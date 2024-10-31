import AsyncLocationKit
import CoreLocation

@MainActor // <- Perform this task on main thread
func getCurrentLocation() async throws -> CLLocation? {
  let locationManager = AsyncLocationManager(
    desiredAccuracy: .hundredMetersAccuracy
  )
  let locationUpdateEvent = try? await locationManager.requestLocation()
    
  switch locationUpdateEvent {
    case .didUpdateLocations(let locations):
        return locations[0]
    default:
        break
  }
  
  return nil
}

