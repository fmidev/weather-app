import Foundation

let defaultLocation = Location(
  id: 658225,
  name: "Helsinki",
  area: "Helsinki",
  lat: 24.93545,
  lon: 60.16952,
  timezone: "Europe/Helsinki",
  iso2: "FI",
  country: "Suomi"
)

let defaultTimeStep = TimeStep(
  observation: false,
  epochtime: Int(Date().timeIntervalSince1970),
  temperature: 11,
  smartSymbol: 4,
  dark: 0
)

let defaultEntry = TimeStepEntry(
  date: Date(),
  updated: Date(),
  location: defaultLocation,
  timeStep: defaultTimeStep,
  error: nil
)
