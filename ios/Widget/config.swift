import Foundation
import SwiftyJSON

func getSetting(_ setting: String) -> Any? {
  guard let url = Bundle.main.url(forResource:"widgetConfig", withExtension: "json") else { return nil }
  guard let contents = try? String(contentsOf: url) else { return nil }
  
  let json = JSON.init(parseJSON: contents)
  let path: [JSONSubscriptType] = setting.components(separatedBy: ".")
  return json[path].rawValue
}

func getDefaultLocation() -> Location {
  guard let url = Bundle.main.url(forResource:"widgetConfig", withExtension: "json")
  else {
    return defaultLocation
  }
  guard let contents = try? String(contentsOf: url) else { return defaultLocation }
  
  let json = JSON.init(parseJSON: contents)
   
  return Location(
    id: json["location"]["default"]["id"].int!,
    name: json["location"]["default"]["name"].string!,
    area: json["location"]["default"]["area"].string!,
    lat: json["location"]["default"]["lat"].double!,
    lon: json["location"]["default"]["lon"].double!,
    timezone: json["location"]["default"]["timezone"].string!,
    iso2: json["location"]["default"]["country"].string!,
    country: nil
  )
}
  
