import Foundation
import FirebaseFirestore

struct MentalCheck: Identifiable, Equatable {
    var id: String
    var sleepTime: String
    var wakeTime: String
    var stressLevel: Int    // 1-5
    var dayScale: Int       // 1-10
    var worries: String
    var extraTime: String
    var submittedAt: Date

    var sleepHours: Double {
        let fmt = DateFormatter()
        fmt.dateFormat = "HH:mm"
        guard let sleep = fmt.date(from: sleepTime),
              let wake = fmt.date(from: wakeTime) else { return 0 }
        var diff = wake.timeIntervalSince(sleep) / 3600
        if diff < 0 { diff += 24 }
        return diff
    }

    init?(id: String, data: [String: Any]) {
        guard let sleepTime = data["sleepTime"] as? String,
              let wakeTime = data["wakeTime"] as? String else { return nil }
        self.id = id
        self.sleepTime = sleepTime
        self.wakeTime = wakeTime
        self.stressLevel = data["stressLevel"] as? Int ?? 3
        self.dayScale = data["dayScale"] as? Int ?? 5
        self.worries = data["worries"] as? String ?? ""
        self.extraTime = data["extraTime"] as? String ?? ""
        self.submittedAt = (data["submittedAt"] as? Timestamp)?.dateValue() ?? .now
    }

    func toDictionary() -> [String: Any] {
        [
            "sleepTime": sleepTime,
            "wakeTime": wakeTime,
            "stressLevel": stressLevel,
            "dayScale": dayScale,
            "worries": worries,
            "extraTime": extraTime,
            "submittedAt": Timestamp(date: submittedAt)
        ]
    }
}
