import SwiftUI

struct LargeNextHoursForecast: View {
    var timeSteps: [TimeStep]
    var timezone: String
  
    let COLUMN_WIDTH: CGFloat = 40
    
    var body: some View {
      VStack{
        HStack{
          Image("clock")
          Spacer()
          ForEach(1..<timeSteps.count, id: \.self) { i in
            Text(timeSteps[i].formatTime(timezone: timezone))
              .style(.time)
              .frame(width: COLUMN_WIDTH)
            if (i<timeSteps.count-1) {
              Spacer()
            }
          }
        }
        .padding(8)
        .background(Color("ForecastRowBackground"))
        
        HStack{
          Image("symbol")
          Spacer()
          ForEach(1..<timeSteps.count, id: \.self) { i in
            Image(String(timeSteps[i].smartSymbol))
              .resizable()
              .frame(width: COLUMN_WIDTH, height: COLUMN_WIDTH)
            if (i<timeSteps.count-1) {
              Spacer()
            }
          }
        }
        .frame(height: COLUMN_WIDTH)
        .padding(.horizontal, 8)
        
        HStack{
          Image("temperature")
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
        .background(Color("ForecastRowBackground"))
      }
    }
}

#Preview {
  LargeNextHoursForecast(
    timeSteps: [TimeStep](repeating: defaultTimeStep, count: 5),
    timezone: "Europe/Helsinki"
  )
}
