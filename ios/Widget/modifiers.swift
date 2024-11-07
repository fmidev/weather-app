import SwiftUI

struct TextModifier: ViewModifier {
    func body(content: Content) -> some View {
        content
          .font(.custom("Roboto-Regular", size: 15))
          .foregroundColor(Color("TextColor"))
    }
}


