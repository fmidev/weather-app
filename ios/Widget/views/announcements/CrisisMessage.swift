import SwiftUI

struct CrisisMessage: View {
  var message: String
  var large: Bool = false
  
  let ICON_SIZE: CGFloat = 20
  
  var body: some View {
    HStack {
      Image("CrisisIcon")
        .resizable()
        .scaledToFit()
        .frame(width: ICON_SIZE, height: ICON_SIZE)
      Text(message)
        .style(large ? .largeCrisis : .crisis)
        .foregroundStyle(Color("CrisisTextColor"))
        .lineLimit(2)
        .fixedSize(horizontal: false, vertical: true)
    }
    .padding(.horizontal, 8)
    .padding(.vertical, 3)
    .background(Color("CrisisBackgroundColor"))
  }
}

#Preview {
  CrisisMessage(message: "Voimakkaat tuulet ja rankkasateet voivat aiheuttaa tulvia ja sähkökatkoja. Vältä ulkona liikkumista ja seuraa viranomaisten ohjeita.")
}
