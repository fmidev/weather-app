import SwiftUI

enum CustomTextStyle {
  case location
  case dateAndTime
  case largeTemperature
  case error
  case temperatureUnit
  case areaOrCountry
  case crisis
}

extension Font {
  static let customFont: (CustomTextStyle) -> Font = { style in
    switch style {
      case .location:
        Font.custom("Roboto-Bold", size: 15)
      case  .areaOrCountry:
        Font.custom("Roboto-Regular", size: 15)
      case .dateAndTime:
        Font.custom("Roboto-Reqular", size: 13)
      case .largeTemperature:
        Font.custom("Roboto-Regular", size: 36)
      case .error:
        Font.custom("Roboto-Medium", size: 16)
      case .temperatureUnit:
        Font.custom("Roboto-Regular", size: 15)
      case .crisis:
        Font.custom("Roboto-Medium", size: 13)
    }
  }
}

extension Text {
  func style(_ textStyle: CustomTextStyle, _ size: CGFloat? = nil) -> Text {
      return self.font(.customFont(textStyle))
    }
}
