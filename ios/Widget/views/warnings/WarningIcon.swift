//
//  WarningIcon.swift
//  WidgetExtension
//
//  Created by Pekka Keränen on 20.11.2024.
//

import SwiftUI

struct WarningIcon: View {
  var warning: WarningTimeStep
  let IMAGE_SIZE: CGFloat = 30;
  
  var body: some View {
    if (warning.wind != nil) {
      ZStack{
        Image(
          warning.type.description+"Rotatable",
          label: Text(warning.type.accessibilityLabel)
        )
        .resizable()
        .rotationEffect(.degrees(Double(warning.wind!.direction+180)))
        .frame(width: IMAGE_SIZE, height: IMAGE_SIZE)
        .background(Color(warning.severity.description))
        .clipShape(Circle())
        Text(String(warning.wind!.speed))
          .style(.windIcon)
          .foregroundStyle(.white)
      }
    } else {
      Image(
        warning.type.description,
        label: Text(warning.type.accessibilityLabel)
      )
      .resizable()
      .frame(width: IMAGE_SIZE, height: IMAGE_SIZE)
      .background(Color(warning.severity.description))
      .clipShape(Circle())
    }
  }
}

#Preview {
  WarningIcon(warning: defaultWarningTimeStep)
}
