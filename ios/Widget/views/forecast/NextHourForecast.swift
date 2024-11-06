import SwiftUI

struct NextHourForecast: View {
  var timeStep: TimeStep
  let SYMBOL_SIZE: CGFloat = 54
  
  var body: some View {
    HStack(spacing: 2) {
      Image(String(timeStep.smartSymbol))
        .resizable()
        .frame(width: SYMBOL_SIZE, height: SYMBOL_SIZE)
      Text(timeStep.formatTemperature()).style(.largeTemperature)
      Text("°C").style(.temperatureUnit).baselineOffset(15)
    }
  }
}

#Preview {
  NextHourForecast(timeStep: defaultTimeStep)
}
