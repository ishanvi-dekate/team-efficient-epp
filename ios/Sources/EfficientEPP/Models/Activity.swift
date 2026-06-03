import Foundation
import FirebaseFirestore

struct Activity: Identifiable, Equatable {
    var id: String
    var name: String
    var duration: String
    var date: String
    var createdAt: Date

    init(id: String = UUID().uuidString, name: String, duration: String = "", date: String, createdAt: Date = .now) {
        self.id = id; self.name = name; self.duration = duration
        self.date = date; self.createdAt = createdAt
    }

    init?(id: String, data: [String: Any]) {
        guard let name = data["name"] as? String, let date = data["date"] as? String else { return nil }
        self.id = id; self.name = name
        self.duration = data["duration"] as? String ?? ""
        self.date = date
        self.createdAt = (data["createdAt"] as? Timestamp)?.dateValue() ?? .now
    }

    func toDictionary() -> [String: Any] {
        ["name": name, "duration": duration, "date": date, "createdAt": Timestamp(date: createdAt)]
    }
}

struct DistractionEntry: Identifiable, Equatable {
    var id: String
    var name: String
    var duration: String
    var date: String
    var createdAt: Date

    init(id: String = UUID().uuidString, name: String, duration: String = "", date: String, createdAt: Date = .now) {
        self.id = id; self.name = name; self.duration = duration
        self.date = date; self.createdAt = createdAt
    }

    init?(id: String, data: [String: Any]) {
        guard let name = data["name"] as? String, let date = data["date"] as? String else { return nil }
        self.id = id; self.name = name
        self.duration = data["duration"] as? String ?? ""
        self.date = date
        self.createdAt = (data["createdAt"] as? Timestamp)?.dateValue() ?? .now
    }

    func toDictionary() -> [String: Any] {
        ["name": name, "duration": duration, "date": date, "createdAt": Timestamp(date: createdAt)]
    }
}
