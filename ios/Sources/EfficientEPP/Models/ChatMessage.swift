import Foundation
import FirebaseFirestore

struct ChatMessage: Identifiable, Equatable {
    var id: String
    var role: Role
    var text: String
    var isAction: Bool
    var timestamp: Date

    enum Role: String {
        case user, assistant
    }

    init(id: String = UUID().uuidString, role: Role, text: String, isAction: Bool = false, timestamp: Date = .now) {
        self.id = id; self.role = role; self.text = text
        self.isAction = isAction; self.timestamp = timestamp
    }

    init?(id: String, data: [String: Any]) {
        guard let roleStr = data["role"] as? String,
              let role = Role(rawValue: roleStr),
              let text = data["text"] as? String else { return nil }
        self.id = id; self.role = role; self.text = text
        self.isAction = data["isAction"] as? Bool ?? false
        self.timestamp = (data["timestamp"] as? Timestamp)?.dateValue() ?? .now
    }

    func toDictionary() -> [String: Any] {
        ["role": role.rawValue, "text": text, "isAction": isAction, "timestamp": Timestamp(date: timestamp)]
    }
}
