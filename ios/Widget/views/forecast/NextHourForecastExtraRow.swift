import SwiftUI

struct NextHourForecastExtraRow: View {
  var timeStep: TimeStep
  let IMAGE_SIZE: CGFloat = 20;
  
  var body: some View {
    HStack(alignment: .bottom) {
      if (timeStep.uvCumulated != nil) {
        Spacer()
        Text("UV **\(timeStep.uvCumulated!)**")
      }
      Spacer()
      Image(timeStep.windCompass8)
        .resizable()
        .aspectRatio(contentMode: .fit)
        .frame(width: IMAGE_SIZE, height: IMAGE_SIZE)
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
