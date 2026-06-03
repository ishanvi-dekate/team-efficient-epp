import Foundation
import FirebaseFirestore

struct Exam: Identifiable, Equatable {
    var id: String
    var name: String
    var subject: String
    var date: String  // YYYY-MM-DD
    var createdAt: Date

    var daysUntil: Int {
        let fmt = DateFormatter()
        fmt.dateFormat = "yyyy-MM-dd"
        guard let examDate = fmt.date(from: date) else { return 0 }
        return Calendar.current.dateComponents([.day], from: Calendar.current.startOfDay(for: .now), to: examDate).day ?? 0
    }

    var isPast: Bool { daysUntil < 0 }

    init(id: String = UUID().uuidString, name: String, subject: String = "", date: String, createdAt: Date = .now) {
        self.id = id; self.name = name; self.subject = subject; self.date = date; self.createdAt = createdAt
    }

    init?(id: String, data: [String: Any]) {
        guard let name = data["name"] as? String, let date = data["date"] as? String else { return nil }
        self.id = id; self.name = name
        self.subject = data["subject"] as? String ?? ""
        self.date = date
        self.createdAt = (data["createdAt"] as? Timestamp)?.dateValue() ?? .now
    }

    func toDictionary() -> [String: Any] {
        ["name": name, "subject": subject, "date": date, "createdAt": Timestamp(date: createdAt)]
    }
}

struct GradeCategory: Identifiable, Equatable {
    var id: String
    var subject: String
    var name: String
    var weight: Double   // 0-100
    var pointsEarned: Double?
    var pointsMax: Double?
    var createdAt: Date

    init(id: String = UUID().uuidString, subject: String, name: String, weight: Double,
         pointsEarned: Double? = nil, pointsMax: Double? = nil, createdAt: Date = .now) {
        self.id = id; self.subject = subject; self.name = name; self.weight = weight
        self.pointsEarned = pointsEarned; self.pointsMax = pointsMax; self.createdAt = createdAt
    }

    init?(id: String, data: [String: Any]) {
        guard let subject = data["subject"] as? String, let name = data["name"] as? String else { return nil }
        self.id = id; self.subject = subject; self.name = name
        self.weight = data["weight"] as? Double ?? 0
        self.pointsEarned = data["pointsEarned"] as? Double
        self.pointsMax = data["pointsMax"] as? Double
        self.createdAt = (data["createdAt"] as? Timestamp)?.dateValue() ?? .now
    }

    func toDictionary() -> [String: Any] {
        var d: [String: Any] = ["subject": subject, "name": name, "weight": weight, "createdAt": Timestamp(date: createdAt)]
        if let e = pointsEarned { d["pointsEarned"] = e }
        if let m = pointsMax { d["pointsMax"] = m }
        return d
    }
}

struct GradeEntry: Identifiable, Equatable {
    var id: String
    var subject: String
    var name: String
    var score: Double
    var total: Double
    var categoryId: String?
    var createdAt: Date

    var percentage: Double { total > 0 ? (score / total) * 100 : 0 }

    init(id: String = UUID().uuidString, subject: String, name: String,
         score: Double, total: Double, categoryId: String? = nil, createdAt: Date = .now) {
        self.id = id; self.subject = subject; self.name = name
        self.score = score; self.total = total; self.categoryId = categoryId; self.createdAt = createdAt
    }

    init?(id: String, data: [String: Any]) {
        guard let subject = data["subject"] as? String else { return nil }
        self.id = id; self.subject = subject
        self.name = data["name"] as? String ?? ""
        self.score = data["score"] as? Double ?? 0
        self.total = data["total"] as? Double ?? 0
        self.categoryId = data["categoryId"] as? String
        self.createdAt = (data["createdAt"] as? Timestamp)?.dateValue() ?? .now
    }

    func toDictionary() -> [String: Any] {
        var d: [String: Any] = ["subject": subject, "name": name, "score": score, "total": total, "createdAt": Timestamp(date: createdAt)]
        if let c = categoryId { d["categoryId"] = c }
        return d
    }
}

struct LetterGrade {
    static func from(percentage: Double) -> String {
        switch percentage {
        case 97...: return "A+"
        case 93...: return "A"
        case 90...: return "A-"
        case 87...: return "B+"
        case 83...: return "B"
        case 80...: return "B-"
        case 77...: return "C+"
        case 73...: return "C"
        case 70...: return "C-"
        case 67...: return "D+"
        case 63...: return "D"
        default:    return "F"
        }
    }
}
