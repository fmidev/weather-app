import SwiftUI

enum CustomTextStyle {
  case location
  case boldLocation
  case dateAndTime
  case time
  case largeTime
  case updatedTime
  case temperature
  case largeTemperature
  case veryLargeTemperature
  case errorTitle
  case errorDescription
  case temperatureUnit
  case largeTemperatureUnit
  case crisis
  case largeCrisis
  case windIcon
  case warningTitle
}

extension Font {
  static let customFont: (CustomTextStyle) -> Font = { style in
    switch style {
      case .boldLocation:
        Font.custom("Roboto-Bold", size: 15)
      case .location:
        Font.custom("Roboto-Regular", size: 15)
      case .dateAndTime:
        Font.custom("Roboto-Reqular", size: 13)
      case .time:
        Font.custom("Roboto-Bold", size: 13)
      case .largeTime:
        Font.custom("Roboto-Regular", size: 15)
      case .updatedTime:
        Font.custom("Roboto-Regular", size: 12)
      case .temperature:
        Font.custom("Roboto-Medium", size: 13)
      case .largeTemperature:
        Font.custom("Roboto-Regular", size: 36)
      case .veryLargeTemperature:
        Font.custom("Roboto-Light", size: 58)
      case .errorTitle:
          Font.custom("Roboto-Medium", size: 16)
      case .errorDescription:
        Font.custom("Roboto-Regular", size: 13)
      case .temperatureUnit:
        Font.custom("Roboto-Regular", size: 15)
      case .largeTemperatureUnit:
        Font.custom("Roboto-Regular", size: 20)
      case .crisis:
        Font.custom("Roboto-Medium", size: 13)
      case .largeCrisis:
        Font.custom("Roboto-Medium", size: 15)
      case .windIcon:
        Font.custom("Roboto-Bold", size: 13)
      case .warningTitle:
        Font.custom("Roboto-Medium", size: 15)
    }
  }
}

extension Text {
  func style(_ textStyle: CustomTextStyle, _ size: CGFloat? = nil) -> Text {
      return self.font(.customFont(textStyle))
    }
}
