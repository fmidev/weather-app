import SwiftUI

struct NextHourForecastExtraRow: View {
  var timeStep: TimeStep
  let IMAGE_SIZE: CGFloat = 20;
  
  var body: some View {
    HStack(alignment: .firstTextBaseline) {
      Spacer()
      Text("UV **0**")
      Spacer()
      Image(timeStep.windCompass8)
        .resizable()
        .aspectRatio(contentMode: .fit)
        .frame(width: IMAGE_SIZE, height: IMAGE_SIZE)
      Text("**\(timeStep.formatWindSpeed())** m/s")
      Spacer()
      Text("feels like **\(timeStep.formatTemperature(includeDegree: true, useFeelsLike: true))**")
      Spacer()
      Image("basic")
        .resizable()
        .aspectRatio(contentMode: .fit)
        .foregroundColor(Color("TextColor"))
        .frame(height: IMAGE_SIZE)
      Spacer()
    }
  }
}

#Preview {
    NextHourForecastExtraRow(timeStep: defaultTimeStep)
}
