import SwiftUI
import Network

class NetworkStatusManager: ObservableObject {
  private let monitor = NWPathMonitor()
  private let queue = DispatchQueue(label: "NetworkMonitor")
  
  @Published var isAirplaneMode: Bool = false

  init() {
    monitor.pathUpdateHandler = { [weak self] path in
      DispatchQueue.main.async {
        self?.isAirplaneMode = path.status == .unsatisfied && path.availableInterfaces.isEmpty
      }
    }
    monitor.start(queue: queue)
  }
  
  deinit {
    monitor.cancel()
  }
}

