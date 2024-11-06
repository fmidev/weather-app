import SwiftUI

struct ForecastRow: View {
  let location: Location
  let timeSteps: [TimeStep]
  
  var body: some View {
    HStack {
      ForEach(0..<timeSteps.count, id: \.self) { i in
        Spacer()
        ForecastColumn(location: location, timeStep: timeSteps[i])
          .frame(width: 45, height: 80)
        Spacer()
        if (i < timeSteps.count - 1) {
          Divider().frame(width: 1, height: 74).padding(.top, 3).overlay(Color("ForecastBorderColor"))
        }
      }
    }
  }
}

#Preview {
  ForecastRow(location: defaultLocation, timeSteps: [defaultTimeStep])
}
