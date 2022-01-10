//
//  WidgetSmall.swift
//  MobileWeatherDevWidgetExtension
//
//  Created by Paavo Väänänen on 10.1.2022.
//

import SwiftUI
import WidgetKit

struct WidgetSmall: View {
  
  let entry: LocationEntry
  
  var body: some View {
    VStack(spacing: 0) {
      TitleDateHeader(title: "Sijainti", date: entry.date)
        .padding(.vertical, 14)
        .padding(.horizontal)
      
      CoordinateView(latitude: entry.location.latitude, longitude: entry.location.longitude)
    }
    .redacted(reason: entry.isPlaceholder ? .placeholder : .init())
  }
}

struct WidgetSmall_Previews: PreviewProvider {
  static var previews: some View {
    WidgetSmall(entry: LocationEntry.stub)
      .previewContext(WidgetPreviewContext(family: .systemSmall))
  }
}
