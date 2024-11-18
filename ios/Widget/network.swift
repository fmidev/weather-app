import Alamofire
import SwiftyJSON

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
    id: json[0]["geoid"].int ?? 0,
    name: json[0]["name"].stringValue,
    area: json[0]["region"].stringValue,
    lat: json[0]["latitude"].doubleValue,
    lon: json[0]["longitude"].doubleValue,
    timezone: json[0]["localtz"].stringValue,
    iso2: json[0]["iso2"].stringValue,
    country: json[0]["country"].stringValue
  )
  
  return location
}

func fetchForecast(location: Location) async throws -> [TimeStep]? {
  let timeseriesUrl = getSetting("weather.apiUrl") as! String
  let param = "epochtime,temperature,feelslike,smartsymbol,windcompass8,winddirection,windspeedms,dark"
  var url = timeseriesUrl+"?param=\(param)&timesteps=30&format=json&who=\(WHO)"
  url += location.id != 0 ? "&geoid=\(location.id)" : "&latlon=\(location.lat),\(location.lon)"
  
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
      feelsLike: $0["feelslike"].doubleValue,
      smartSymbol: $0["smartsymbol"].intValue,
      windCompass8: $0["windcompass8"].stringValue,
      windDirection: $0["winddirection"].intValue,
      windSpeed: $0["windspeedms"].doubleValue,
      dark: $0["dark"].intValue
    )
  })

  return items  
}

func fetchUVForecast(location: Location) async throws -> [UVTimeStep]? {
  let timeseriesUrl = getSetting("weather.apiUrl") as! String
  let param = "epochtime,uvcumulated"
  var url = timeseriesUrl+"?param=\(param)&producer=uv&timesteps=30&format=json&who=\(WHO)"
  url += location.id != 0 ? "&geoid=\(location.id)" : "&latlon=\(location.lat),\(location.lon)"
  
  let dataTask = AF.request(url).serializingData()
  let value = try await dataTask.value
  
  guard let json = try? JSON(data: value) else { return nil }
  guard let arrayJSON = json.array else { return nil }
  
  var items = [UVTimeStep]()
  items = arrayJSON.map({
    return UVTimeStep(
      epochtime: $0["epochtime"].intValue,
      uvCumulated: $0["uvcumulated"].intValue
    )
  })
  
  return items
}

func resolveWarningSeverity(severity: String) -> WarningSeverity {
  switch severity {
    case "Moderate": return .moderate
    case "Severe": return .severe
    case "Extreme": return .extreme
    default: return .none
  }
}

func fetchWarnings(location: Location) async throws -> [WarningTimeStep]? {
  let formatter = DateFormatter()
  formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSSZ"
  
  let apiUrl = getSetting("warnings.apiUrl") as! String
  let url = apiUrl+"?latlon=\(location.lat),\(location.lon)&country=fi&who=\(WHO)"
  let dataTask = AF.request(url).serializingData()
  let value = try await dataTask.value
  
  guard let json = try? JSON(data: value) else { return nil }
  guard let warningsArray = json["data"]["warnings"].array else { return nil }
   
  var items = [WarningTimeStep]()
  items = warningsArray.map({
    return WarningTimeStep(
      type: $0["type"].stringValue,
      severity: resolveWarningSeverity(severity: $0["severity"].stringValue),
      duration: WarningDuration(
        startTime: formatter.date(from: $0["duration"]["startTime"].stringValue),
        endTime: formatter.date(from: $0["duration"]["endTime"].stringValue)
      )
    )
  })
   
  return items
}

func fetchCrisisMessage() async throws -> String? {
  var language = FALLBACK_LANGUAGE
  
  if (Locale.current.language.languageCode?.identifier != nil &&
      SUPPORTED_LANGUAGES.contains(Locale.current.language.languageCode!.identifier)
  ) {
    language = Locale.current.language.languageCode!.identifier
  }
   
  guard let apiUrl = getSetting("announcements.api."+language) as? String else { return nil }
  
  let dataTask = AF.request(apiUrl).serializingData()
  let value = try await dataTask.value
  
  guard let json = try? JSON(data: value) else { return nil }
  guard let announcementsArray = json.array else { return nil }
   
  for announcement in announcementsArray {
    if (announcement["type"].stringValue == "Crisis") {
      return announcement["content"].stringValue
    }
  }
  
  return nil
}
