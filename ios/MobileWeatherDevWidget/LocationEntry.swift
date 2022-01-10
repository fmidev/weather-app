//
//  LocationEntry.swift
//  MobileWeatherDevWidgetExtension
//
//  Created by Paavo Väänänen on 10.1.2022.
//

import Foundation
import WidgetKit
import CoreLocation

struct LocationEntry: TimelineEntry {
  var date: Date
  
  let location: CLLocationCoordinate2D
  var isPlaceholder = false
}

extension LocationEntry {
  static var stub: LocationEntry {
    LocationEntry(date: Date(), location: .init(latitude: 60.192059, longitude: 24.945831))
  }
  
  static var placeholder: LocationEntry {
    LocationEntry(date: Date(), location: .init(latitude: 60.192059, longitude: 24.945831),
                  isPlaceholder: true)
  }
}
