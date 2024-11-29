import SwiftUI

extension Font {
  static func system(size:CGFloat,type:FontRoboto = .Regular) -> Font{
    self.custom(type.rawValue, size: size)
  }
}

enum FontRoboto:String {
  case Bold="Roboto-Bold"
  case Light="Roboto-Light"
  case Medium="Roboto-Medium"
  case Regular="Roboto-Regular"
  case Thin="Robot-Thin"
}

extension StringProtocol {
  var firstUppercased: String { prefix(1).uppercased() + dropFirst() }
}

extension String {
  func localized(withComment comment: String? = nil) -> String {
    return NSLocalizedString(self, comment: comment ?? "")
  }
}

extension Date {
  func startOfHour() -> Date? {
    let calendar = Calendar.current

    var components = calendar.dateComponents([.year, .month, .day, .hour, .minute, .second], from: self)

    components.minute = 0
    components.second = 0

    return calendar.date(from: components)
  }

  func startOfDay() -> Date? {
    let calendar = Calendar.current

    var components = calendar.dateComponents([.year, .month, .day, .hour, .minute, .second], from: self)

    components.hour = 0
    components.minute = 0
    components.second = 0

    return calendar.date(from: components)
  }
  
  func endOfDay() -> Date? {
    let calendar = Calendar.current

    var components = calendar.dateComponents([.year, .month, .day, .hour, .minute, .second], from: self)

    components.hour = 23
    components.minute = 59
    components.second = 59

    return calendar.date(from: components)
  }
  
}
