import SwiftUI

struct LargeNextHoursForecast: View {
    var timeSteps: [TimeStep]
    var timezone: String
    var transparent = true
  
    let COLUMN_WIDTH: CGFloat = 38
    
    var body: some View {
      VStack{
        HStack{
          Image(decorative: "clock")
          Spacer()
          ForEach(1..<timeSteps.count, id: \.self) { i in
            Text(timeSteps[i].formatHours(timezone: timezone))
              .style(.time)
              .frame(width: COLUMN_WIDTH)
            if (i<timeSteps.count-1) {
              Spacer()
            }
          }
        }
        .padding(8)
        .background(Color("ForecastRowBackground").opacity(transparent ? 0 : 1))
        
        HStack{
          Image(decorative: "symbol")
          Spacer()
          ForEach(1..<timeSteps.count, id: \.self) { i in
            Image(
              String(timeSteps[i].smartSymbol),
              label: Text(timeSteps[i].getSmartSymbolTranslationKey().localized())
            ).resizable().frame(width: COLUMN_WIDTH, height: COLUMN_WIDTH)
            if (i<timeSteps.count-1) {
              Spacer()
            }
          }
        }
        .frame(height: COLUMN_WIDTH)
        .padding(.horizontal, 8)
        
        HStack{
          Image(decorative: "temperature")
          Spacer()
          ForEach(1..<timeSteps.count, id: \.self) { i in
            Text(timeSteps[i].formatTemperature(includeDegree: true))
              .style(.temperature)
              .frame(width: COLUMN_WIDTH)
            if (i<timeSteps.count-1) {
              Spacer()
            }
          }
        }
        .padding(8)
        .background(Color("ForecastRowBackground").opacity(transparent ? 0 : 1))
      }
    }
}

#Preview {
  LargeNextHoursForecast(
    timeSteps: [TimeStep](repeating: defaultTimeStep, count: 5),
    timezone: "Europe/Helsinki"
  )
}
