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

