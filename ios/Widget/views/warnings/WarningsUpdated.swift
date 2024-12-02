//
//  WarningsUpdated.swift
//  WidgetExtension
//
//  Created by Pekka Keränen on 2.12.2024.
//

import SwiftUI

enum LogoPosition {
  case left
  case right
}

struct WarningsUpdated: View {
  var updated: String
  var logoPosition : LogoPosition

  var body: some View {
    HStack {
      if (logoPosition == .left) {
        Image("FMI").resizable().frame(width: 56, height: 27)
      } else {
        Spacer().frame(width: 56)
      }
      Spacer()
      Text("Updated at **\(updated)**").style(.updatedTime)
      Spacer()
      if (logoPosition == .right) {
        Image("FMI").resizable().frame(width: 50, height: 24)
      } else {
        Spacer().frame(width: 50)
      }
    }
  }
}

#Preview {
    WarningsUpdated(updated: "08:12", logoPosition: .left)
}
