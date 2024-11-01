import Alamofire
import SwiftyJSON

let WHO="mobileweather_ios_widget"
let SUPPORTED_LANGUAGES = ["fi", "sv", "en"]

func getLanguageCode() -> String {
  let lang = Locale.current.language.languageCode?.identifier ?? "fi"
  return SUPPORTED_LANGUAGES.contains(lang) ? lang : "fi"
}

func fetchLocation(lat: Double, lon: Double) async throws -> Location? {
  let timeseriesUrl = getSetting("location.apiUrl") as! String
  let lang = getLanguageCode()
  let param = "geoid,name,region,latitude,longitude,region,country,iso2,localtz"
  let url = timeseriesUrl+"?param=\(param)&latlon=\(lat),\(lon)&lang=\(lang)&format=json&who=\(WHO)"
  let dataTask = AF.request(url).serializingData()
  let value = try await dataTask.value
  
  guard let json = try? JSON(data: value) else { return nil }
    
  let location = Location(
    id: json[0]["geoid"].int!,
    name: json[0]["name"].string!,
    area: json[0]["region"].string!,
    lat: json[0]["latitude"].double!,
    lon: json[0]["longitude"].double!,
    timezone: json[0]["localtz"].string!,
    iso2: json[0]["iso2"].string!,
    country: json[0]["country"].string!
  )
  
  return location
}

func fetchForecast(location: Location) async throws -> [TimeStep]? {
  let timeseriesUrl = getSetting("weather.apiUrl") as! String
  let param = "epochtime,temperature,smartsymbol,dark"
  let url = timeseriesUrl+"?param=\(param)&geoid=\(location.id)&format=json&who=\(WHO)"
  let dataTask = AF.request(url).serializingData()
  let value = try await dataTask.value
  
  guard let json = try? JSON(data: value) else { return nil }
  guard let arrayJSON = json.array else { return nil }
  
  var items = [TimeStep]()
  items = arrayJSON.map({
    return TimeStep(
      observation: false,
      epochtime: $0["epochtime"].intValue,
      temperature: $0["temperature"].doubleValue,
      smartSymbol: $0["smartsymbol"].intValue,
      dark: $0["dark"].intValue
    )
  })
  
  return items  
}

func resolveWarningLevel(level: String) -> WarningLevel {
  switch level {
    case "Moderate": return .moderate
    case "Severe": return .severe
    case "Extreme": return .extreme
    default: return .none
  }
}

func fetchWarnings(location: Location) async throws -> [WarningTimeStep]? {
  let apiUrl = getSetting("warnings.apiUrl") as! String
  let url = apiUrl+"?latlon=\(location.lat),\(location.lon)&country=fi&who=\(WHO)"
  
  print(url)
  
  let dataTask = AF.request(url).serializingData()
  let value = try await dataTask.value
  
  guard let json = try? JSON(data: value) else { return nil }
  guard let warningsArray = json["warnings"].array else { return nil }
  
  var items = [WarningTimeStep]()
  items = warningsArray.map({
    return WarningTimeStep(
      type: $0["type"].stringValue,
      level: resolveWarningLevel(level: $0["level"].stringValue),
      duration: WarningDuration(startTime: Date(), endTime: Date())
    )
  })
  
  return items
}
