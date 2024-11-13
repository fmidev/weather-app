import SwiftUI

struct ForecastRow: View {
  let location: Location
  let timeSteps: [TimeStep]
  let COLUMN_WIDTH: CGFloat = 45
  let COLUMN_HEIGHT: CGFloat = 74
  let COLUMN_COUNT = 5
  
  var body: some View {
    HStack {
      ForEach(0..<COLUMN_COUNT, id: \.self) { i in
        Spacer()
        ForecastColumn(location: location, timeStep: timeSteps[i])
          .frame(width: COLUMN_WIDTH, height: COLUMN_HEIGHT)
        Spacer()
        if (i == COLUMN_COUNT) {
          Divider()
            .frame(width: 1, height: COLUMN_HEIGHT)
            .padding(.top, 3)
            .overlay(Color("ForecastBorderColor"))
        }
      }
    }
  }
}

#Preview {
  ForecastRow(location: defaultLocation, timeSteps: [defaultTimeStep])
}
