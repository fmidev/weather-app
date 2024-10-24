/*
import Alamofire

let TIMESERIES_URL = "https://data.fmi.fi/fmi-apikey/ff22323b-ac44-486c-887c-3fb6ddf1116c/timeseries"
let WHO="iosWidget"

func fetchLocation(lat: Double, lon: Double) async throws -> Location {
  let param = "geoid,name,latitude,longitude,region,country,iso2,localtz"
  let latlon = "\(lat),\(lon)"
  let dataTask = AF.request(TIMESERIES_URL+"?param=\(param)&latlon=\(latlon)&who=\(WHO)").serializingData()
  let value = try await dataTask.value
  
  print(value)
  
  return defaultLocation
}

*/
