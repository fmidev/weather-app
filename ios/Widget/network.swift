import Alamofire
import SwiftyJSON

let TIMESERIES_URL = "https://data.fmi.fi/fmi-apikey/ff22323b-ac44-486c-887c-3fb6ddf1116c/timeseries"
let WHO="iosWidget"

func fetchLocation(lat: Double, lon: Double) async throws -> Location? {
  print("fetchLocation")
  let param = "geoid,name,region,latitude,longitude,region,country,iso2,localtz"
  let latlon = "\(lat),\(lon)"
  let dataTask = AF.request(TIMESERIES_URL+"?param=\(param)&latlon=\(latlon)&format=json&who=\(WHO)").serializingData()
  let value = try await dataTask.value
  
  guard let json = try? JSON(data: value) else { return nil }
  
  print(json as Any)
  
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
