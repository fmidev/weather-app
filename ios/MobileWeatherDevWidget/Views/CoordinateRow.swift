//
//  CoordinateGrid.swift
//  MobileWeatherDevWidgetExtension
//
//  Created by Paavo Väänänen on 10.1.2022.
//

import SwiftUI
import WidgetKit

struct CoordinateRow: View {

  let latitude: Double
  let longitude: Double
  
  var body: some View {
    HStack {
          VStack {
            Text("Lat:")
            Text("\(latitude)")
              .font(.system(size: 16, weight: .semibold))
          }
          .padding()
          VStack {
            Text("Lon:")
            Text("\(longitude)")
              .font(.system(size: 16, weight: .semibold))
          }
          .padding()
      }
    .lineLimit(1)
    .minimumScaleFactor(0.7)
    .foregroundColor(.white)
    .padding(.horizontal)
    .frame(maxWidth: .infinity, maxHeight: .infinity)
    .background(primary)
  }
}

struct CoordinateRow_Previews: PreviewProvider {
  static var previews: some View {
    CoordinateRow(latitude: 60.192059, longitude: 24.945831)
      .previewContext(WidgetPreviewContext(family: .systemMedium))
  }
}
