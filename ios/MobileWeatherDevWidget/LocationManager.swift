//
//  LocationManager.swift
//  MobileWeatherDevWidgetExtension
//
//  Created by Paavo Väänänen on 10.1.2022.
//

import Foundation
import CoreLocation

class LocationManager:NSObject, CLLocationManagerDelegate {
  static let shared = LocationManager()
  
  let manager = CLLocationManager()
  var completion: ((CLLocation) -> Void)?
  
  public func getUserLocation(completion: @escaping ((CLLocation) -> Void)) {
    self.completion = completion
    manager.requestWhenInUseAuthorization()
    manager.delegate = self
    manager.startUpdatingLocation()
  }
  
  func locationManager(_ manager: CLLocationManager, didUpdateLocations locations:
  [CLLocation]) {
    guard let location = locations.first else {
      return
    }
    print("LOCATION:", location)
    completion?(location)
    manager.stopUpdatingLocation()
  }

}
  
