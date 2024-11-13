import Foundation

func mergeUvToForecast(forecast: [TimeStep], uvForecast: [UVTimeStep]) -> [TimeStep] {
  return forecast.map{item in
    let uvItem = uvForecast.first(where: {$0.epochtime == item.epochtime})
    var mutable = item
    mutable.uvCumulated = uvItem?.uvCumulated
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
