//
//  MobileWeatherDevWidget.swift
//  MobileWeatherDevWidget
//
//  Created by Paavo Väänänen on 10.1.2022.
//

import WidgetKit
import SwiftUI

@main
struct MobileWeatherDevWidget: Widget {
    let kind: String = "MobileWeatherDevWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: LocationTimelineProvider()) { entry in
            LocationWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Location")
        .description("This is an example widget showing current device location.")
    }
}

struct MobileWeatherDevWidget_Previews: PreviewProvider {
    static var previews: some View {
      LocationWidgetEntryView(entry: LocationEntry.stub)
            .previewContext(WidgetPreviewContext(family: .systemSmall))
    }
}
