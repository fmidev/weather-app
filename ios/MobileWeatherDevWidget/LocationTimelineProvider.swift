//
//  LocationTimelineProvider.swift
//  MobileWeatherDevWidgetExtension
//
//  Created by Paavo Väänänen on 10.1.2022.
//

import Foundation
import WidgetKit
import CoreLocation


struct LocationTimelineProvider: TimelineProvider {
  
  typealias Entry = LocationEntry
  
  func placeholder(in context: Context) -> LocationEntry {
    LocationEntry.placeholder
  }
  
  func getSnapshot(in context: Context, completion: @escaping (LocationEntry) -> Void) {
    if context.isPreview {
      completion(LocationEntry.placeholder)
    } else {
      getCurrentLocation {(entry) in
        completion(entry)
      }
    }
  }
  
  func getTimeline(in context: Context, completion: @escaping (Timeline<LocationEntry>) -> Void) {
    getCurrentLocation { entry in
      // update timeline every hour => 1200 seconds
      let timeline = Timeline(entries: [entry], policy: .after(Date().addingTimeInterval(60*60)))
      completion(timeline)
    }
  }
  
  private func getCurrentLocation(completion: @escaping (LocationEntry) -> ()) {
    LocationManager.shared.getUserLocation { location in
      let entry = LocationEntry(date: Date(), location: .init(latitude: location.coordinate.latitude, longitude: location.coordinate.longitude) )
      completion(entry)
    }
  }
}
