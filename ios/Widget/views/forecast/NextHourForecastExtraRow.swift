import SwiftUI

struct NextHourForecastExtraRow: View {
  var timeStep: TimeStep
  let IMAGE_SIZE: CGFloat = 20;
  let useCardinalsForWindDirection = getSetting("weather.useCardinalsForWindDirection") as? Bool
  
  var body: some View {
    HStack(alignment: .bottom) {
      if (timeStep.uvCumulated != nil) {
        Spacer()
        Text("UV **\(timeStep.uvCumulated!)**")
      }
      Spacer()
      if (useCardinalsForWindDirection == true) {
        Image(timeStep.windCompass8)
          .resizable()
          .aspectRatio(contentMode: .fit)
          .frame(width: IMAGE_SIZE, height: IMAGE_SIZE)
      } else {
        Image("N")
          .resizable()
          .aspectRatio(contentMode: .fit)
          .frame(width: IMAGE_SIZE, height: IMAGE_SIZE)
          .rotationEffect(.degrees(Double(timeStep.windDirection)))
      }
      Text("**\(timeStep.formatWindSpeed())** m/s")
      Spacer()
      Text("feels like **\(timeStep.formatTemperature(includeDegree: true, useFeelsLike: true))**")
      Image(timeStep.getFeelsLikeIcon())
        .resizable()
        .aspectRatio(contentMode: .fit)
        .foregroundColor(Color("TextColor"))
        .frame(height: IMAGE_SIZE)
        .padding(.bottom, 2)
      Spacer()
    }
  }
}

#Preview {
    NextHourForecastExtraRow(timeStep: defaultTimeStep)
}