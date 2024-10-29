import SwiftUI

extension Font {
    static let customFont: (String) -> Font = {name in
      switch name {
        case "dateAndTime":
          Font.custom("Roboto-Regular", size: 13)
        case "largeTemperature":
          Font.custom("Roboto-Regular", size: 36)
        default:
          Font.custom("Roboto-Regular", size: 12)
      }
    }
}

extension Text {
  func style(name: String) -> Text {
      return self.font(.customFont(name))
  }
}

