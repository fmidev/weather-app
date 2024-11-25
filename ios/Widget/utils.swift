import Foundation

func mergeUvToForecast(forecast: [TimeStep], uvForecast: [UVTimeStep]) -> [TimeStep] {
  return forecast.map{item in
    let uvItem = uvForecast.first(where: {$0.epochtime == item.epochtime})
    var mutable = item
    mutable.uvCumulated = uvItem?.uvCumulated
    return mutable
  }
}

func mergeWarnings(warnings: [WarningTimeStep], wfsWarnings: [WarningTimeStep]) -> [WarningTimeStep] {
  //print(warnings.filter({$0.type == .seaWind}))
  //print(wfsWarnings.filter({$0.wind != nil}))
  
  return warnings.map{item in
    let wfsItem = wfsWarnings.first(where: {
      $0.wind != nil &&
      $0.type == item.type &&
      $0.severity == item.severity &&
      //$0.duration.startTime == item.duration.startTime &&
      $0.duration.endTime == item.duration.endTime
    })
    var mutable = item
    mutable.wind = wfsItem?.wind   
    return mutable
  }
}

func getMidSummerDay(_ year: Int) -> Int {
  let calendar = Calendar.current
  let dateComponents = DateComponents(year: year, month: 6, day: 19)
  
  if let date = calendar.date(from: dateComponents) {
    let weekday = calendar.component(.weekday, from: date)
    let a = 19 - weekday + 6
    return a == 19 ? a + 7 : a
  } else {
    return -1 // Failure
  }
}

func isMidSummer() -> Bool {
  let currentDate = Date()
  let calendar = Calendar.current
  let year = calendar.component(.year, from: currentDate)
  let month = calendar.component(.month, from: currentDate)
  let day = calendar.component(.day, from: currentDate)
  let midSummerDay = getMidSummerDay(year)
  
  if (month == 6 && (day == midSummerDay || day == midSummerDay - 1)) {
    return true
  }
  
  return false
}

func getEaster(year: Int) -> (month: Int, day: Int) {
  let G = year % 19
  let C = year / 100
  let H = (C - C / 4 - (8 * C + 13) / 25 + 19 * G + 15) % 30
  let I = H - (H / 28) * (1 - (29 / (H + 1)) * ((21 - G) / 11))
  let J = (year + year / 4 + I + 2 - C + C / 4) % 7
  let L = I - J
  let month = 3 + (L + 40) / 44
  let day = L + 28 - 31 * (month / 4)

  return (month, day)
}

func isEaster() -> Bool {
  let currentDate = Date()
  let calendar = Calendar.current
  let year = calendar.component(.year, from: currentDate)

  let easter = getEaster(year: year)
  let easterDateComponents = DateComponents(year: year, month: easter.month, day: easter.day)
  
  guard let easterDate = calendar.date(from: easterDateComponents) else { return false }
  let goodFriday = calendar.date(byAdding: .day, value: -2, to: easterDate)!
  let nextTuesday = calendar.date(byAdding: .day, value: 2, to: easterDate)!
   
  return currentDate >= goodFriday && currentDate < nextTuesday
}

func filterUniqueWarnings(_ warnings : [WarningTimeStep]) -> [WarningTimeStep] {
  var processed = [WarningTimeStep]()
  var filtered = [WarningTimeStep]()
  
  for warning in warnings {
    if (!processed.contains(where: {$0.type == warning.type && $0.severity == warning.severity})) {
      processed.append(warning)
      filtered.append(warning)
    }
  }
  
  return filtered;
}

func sortWarnings(_ warnings: [WarningTimeStep]) -> [WarningTimeStep] {
  var extremeWarnings = warnings.filter{$0.severity == .extreme}
  extremeWarnings.sort(by: {$0.type.rawValue > $1.type.rawValue})
  var severeWarnings = warnings.filter{$0.severity == .severe}
  severeWarnings.sort(by: {$0.type.rawValue > $1.type.rawValue})
  var moderateWarnings = warnings.filter{$0.severity == .moderate}
  moderateWarnings.sort(by: {$0.type.rawValue > $1.type.rawValue})
  
  return extremeWarnings + severeWarnings + moderateWarnings
}

func resolveWarningSeverity(_ severity: String, wfs: Bool = false) -> WarningSeverity {
  if (wfs) {
    switch severity {
      case "level-2": return .moderate
      case "level-3": return .severe
      case "level-4": return .extreme
      default: return .none
    }
  } else {
    switch severity {
      case "Moderate": return .moderate
      case "Severe": return .severe
      case "Extreme": return .extreme
      default: return .none
    }
  }
}

func resolveWarningType(_ type: String, wfs: Bool = false) -> WarningType {
  if (wfs) {
    switch type {
     case "thunderstorm": return .thunderstorm
     case "forest-fire-weather": return .forestFireWeather
     case "grass-fire-weather": return .grassFireWeather
     case "wind": return .wind
     case "traffic-weather": return .trafficWeather
     case "rain": return .rain
     case "pedestrian-safety": return .pedestrianSafety
     case "hot-weather": return .hotWeather
     case "cold-weather": return .coldWeather
     case "uv-note": return .uvNote
     case "flooding": return .flooding
     case "sea-wind": return .seaWind
     case "sea-thunder-storm": return .seaThunderStorm
     case "sea-wave-height": return .seaWaveHeight
     case "sea-water-height-high-water": return .seaWaterHeightHighWater
     case "sea-water-height-shallow-water": return .seaWaterHeightShallowWater
     case "sea-icing": return .seaIcing
     default: return .none
   }
  } else {
     switch type {
      case "thunderstorm": return .thunderstorm
      case "forestFireWeather": return .forestFireWeather
      case "grassFireWeather": return .grassFireWeather
      case "wind": return .wind
      case "trafficWeather": return .trafficWeather
      case "rain": return .rain
      case "pedestrianSafety": return .pedestrianSafety
      case "hotWeather": return .hotWeather
      case "coldWeather": return .coldWeather
      case "uvNote": return .uvNote
      case "flooding": return .flooding
      case "seaWind": return .seaWind
      case "seaThunderStorm": return .seaThunderStorm
      case "seaWaveHeight": return .seaWaveHeight
      case "seaWaterHeightHighWater": return .seaWaterHeightHighWater
      case "seaWaterHeightShallowWater": return .seaWaterHeightShallowWater
      case "seaIcing": return .seaIcing
      default: return .none
    }
  }
}
  
