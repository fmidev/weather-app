//
//  WidgetMedium.swift
//  MobileWeatherDevWidgetExtension
//
//  Created by Paavo Väänänen on 10.1.2022.
//

import SwiftUI
import WidgetKit

struct WidgetMedium: View {
  
  let entry: LocationEntry
  
  var body: some View {
    VStack(spacing: 0) {
      TitleDateHeader(title: "Sijainti", date: entry.date)
        .padding(.vertical, 4)
        .padding(.horizontal)
      CoordinateRow(latitude: entry.location.latitude, longitude: entry.location.longitude)
    }
    .redacted(reason: entry.isPlaceholder ? .placeholder : .init())
  }
}

struct WidgetMedium_Previews: PreviewProvider {
  static var previews: some View {
    WidgetMedium(entry: LocationEntry.stub)
      .previewContext(WidgetPreviewContext(family: .systemMedium))
  }
}
