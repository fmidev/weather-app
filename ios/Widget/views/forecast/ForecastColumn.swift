import SwiftUI

struct ForecastColumn: View {
  let SYMBOL_SIZE: CGFloat = 36
  let location: Location
  let timeStep: TimeStep
    
  var body: some View {
    VStack {
      Text(timeStep.formatHours(timezone: location.timezone)).style(.time)
      Spacer()
      Image(
        String(timeStep.smartSymbol),
        label: Text(timeStep.getSmartSymbolTranslationKey().localized())
      ).resizable().frame(width: SYMBOL_SIZE , height: SYMBOL_SIZE)
      Spacer()
      Text(timeStep.formatTemperature(includeDegree: true)).style(.temperature)
    }
  }
}

#Preview {
  ForecastColumn(location: defaultLocation, timeStep: defaultTimeStep)
}
  
