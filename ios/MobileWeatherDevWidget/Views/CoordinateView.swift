//
//  CoordinateView.swift
//  MobileWeatherDevWidgetExtension
//
//  Created by Paavo Väänänen on 10.1.2022.
//

import SwiftUI
import WidgetKit

let primary = Color(red: 48/255, green: 49/255, blue: 147/255)

struct CoordinateView: View {
 
  let latitude: Double
  let longitude: Double
  
  var body: some View {
    VStack {
      Text("Lat: \(latitude)")
        .font(.system(size: 16, weight: .semibold))
      Text("Lon: \(longitude)")
        .font(.system(size: 16, weight: .semibold))
    }
    .lineLimit(1)
    .minimumScaleFactor(0.7)
    .foregroundColor(.white)
    .padding(.horizontal)
    .frame(maxWidth: .infinity, maxHeight: .infinity)
    .background(primary)
  }
}

struct CoordinateView_Previews: PreviewProvider {
  static var previews: some View {
      CoordinateView(latitude: 60.192059, longitude: 24.945831)
      .previewContext(WidgetPreviewContext(family: .systemSmall))
  }
}
