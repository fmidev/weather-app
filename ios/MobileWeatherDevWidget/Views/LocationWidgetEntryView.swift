//
//  LocationWidgetEntryView.swift
//  MobileWeatherDevWidgetExtension
//
//  Created by Paavo Väänänen on 10.1.2022.
//

import SwiftUI
import WidgetKit

struct LocationWidgetEntryView: View {
  
  let entry: LocationEntry
  @Environment(\.widgetFamily) var family
  
  var body: some View {
    switch family {
    case .systemSmall:
      WidgetSmall(entry: entry)
    case .systemLarge:
      WidgetMedium(entry: entry)
    default:
      WidgetMedium(entry: entry)
    }
  }
}

struct LocationWidgetEntryView_Previews: PreviewProvider {
  static var previews: some View {
    LocationWidgetEntryView(entry: LocationEntry.stub)
      .previewContext(WidgetPreviewContext(family: .systemSmall))
  }
}
