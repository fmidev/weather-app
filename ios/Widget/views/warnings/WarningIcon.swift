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

#Preview {
  WarningIcon(warning: defaultWarningTimeStep)
}
