import SwiftUI

struct NextHourForecast: View {
  var timeStep: TimeStep
  var large: Bool = false
  let SYMBOL_SIZE: CGFloat = 54
  let LARGE_SYMBOL_SIZE: CGFloat = 78
  let BASELINE_OFFSET: CGFloat = 15
  let LARGE_BASELINE_OFFSET: CGFloat = 25
  let SPACING_BETWEEN_ELEMENTS: CGFloat = 22
   
  var body: some View {
    VStack {
      HStack(spacing: 2) {
        Image(
          String(timeStep.smartSymbol),
          label: Text(timeStep.getSmartSymbolTranslationKey().localized())
        )
          .resizable()
          .frame(
            width: large ? LARGE_SYMBOL_SIZE : SYMBOL_SIZE,
            height: large ? LARGE_SYMBOL_SIZE : SYMBOL_SIZE
          )
        if (large) {
          Spacer().frame(width: SPACING_BETWEEN_ELEMENTS)
        }
        Text(timeStep.formatTemperature())
          .style(large ? .veryLargeTemperature : .largeTemperature)
        Text("°C")
          .style(large ? .largeTemperatureUnit : .temperatureUnit)
          .baselineOffset(large ? LARGE_BASELINE_OFFSET : BASELINE_OFFSET)
      }
    }.frame(height: large ? LARGE_SYMBOL_SIZE : SYMBOL_SIZE)
    
    if (large) {
      NextHourForecastExtraRow(timeStep: timeStep)
    }
  }
}

#Preview {
  NextHourForecast(timeStep: defaultTimeStep)
}
