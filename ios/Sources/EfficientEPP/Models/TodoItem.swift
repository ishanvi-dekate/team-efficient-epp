import Foundation
import FirebaseFirestore

struct TodoItem: Identifiable, Equatable {
    var id: String
    var text: String
    var done: Bool
    var date: String      // YYYY-MM-DD
    var dueTime: String?  // HH:MM optional
    var createdAt: Date

    init(id: String = UUID().uuidString, text: String, done: Bool = false,
         date: String, dueTime: String? = nil, createdAt: Date = .now) {
        self.id = id
        self.text = text
        self.done = done
        self.date = date
        self.dueTime = dueTime
        self.createdAt = createdAt
    }

    init?(id: String, data: [String: Any]) {
        guard let text = data["text"] as? String,
              let date = data["date"] as? String else { return nil }
        self.id = id
        self.text = text
        self.done = data["done"] as? Bool ?? false
        self.date = date
        self.dueTime = data["dueTime"] as? String
        self.createdAt = (data["createdAt"] as? Timestamp)?.dateValue() ?? .now
    }

    func toDictionary() -> [String: Any] {
        var dict: [String: Any] = [
            "text": text,
            "done": done,
            "date": date,
            "createdAt": Timestamp(date: createdAt)
        ]
        if let t = dueTime { dict["dueTime"] = t }
        return dict
    }
}
