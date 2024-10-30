import SwiftUI

enum TextStyle {
  case location
  case dateAndTime
  case largeTemperature
  case error
}

extension Font {
    static let customFont: (String) -> Font = {name in
      switch name {
        case "location":
          Font.custom("Roboto-Bold", size: 15)
        case "dateAndTime":
          Font.custom("Roboto-Reqular", size: 13)
        case "largeTemperature":
          Font.custom("Roboto-Medium", size: 36)
        case "error":
          Font.custom("Roboto-Medium", size: 16)
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

