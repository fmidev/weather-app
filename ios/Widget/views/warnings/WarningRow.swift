import SwiftUI

struct WarningRow: View {
  let warning: WarningTimeStep
  
  var body: some View {
    HStack(spacing: 6) {
      WarningIcon(warning: warning)
      VStack(alignment: .leading) {
        Text(warning.type.accessibilityLabel).style(.warningTitle)
        Text(warning.duration.formatDuration())
      }
    }
  }
}

#Preview {
  WarningRow(warning: defaultWarningTimeStep)
}
