import Foundation

struct UserProfile: Identifiable, Equatable {
    var id: String
    var username: String
    var email: String
    var bedtime: String
    var sleepHours: String
    var stress: String
    var distractions: String
    var extracurriculars: String
    var homeworkClass: String
    var courses: [String]
    var goal1: String
    var goal2: String
    var goal3: String
    var photoURL: String?
    var bannerPreset: BannerPreset

    enum BannerPreset: String, CaseIterable {
        case lavender, sunset, ocean, mint, peach, galaxy

        var gradient: [String] {
            switch self {
            case .lavender: return ["#C3B1E1", "#9B7FD4"]
            case .sunset:   return ["#FFB347", "#FF6961"]
            case .ocean:    return ["#7EC8E3", "#0077B6"]
            case .mint:     return ["#98FF98", "#00C896"]
            case .peach:    return ["#FFDAB9", "#FF9A8B"]
            case .galaxy:   return ["#2C1654", "#8B5CF6"]
            }
        }
    }

    init(id: String, data: [String: Any]) {
        self.id = id
        username = data["username"] as? String ?? ""
        email = data["email"] as? String ?? ""
        bedtime = data["bedtime"] as? String ?? ""
        sleepHours = data["sleepHours"] as? String ?? ""
        stress = data["stress"] as? String ?? ""
        distractions = data["distractions"] as? String ?? ""
        extracurriculars = data["extracurriculars"] as? String ?? ""
        homeworkClass = data["homeworkClass"] as? String ?? ""
        let rawCourses = data["courses"] as? String ?? ""
        courses = rawCourses
            .components(separatedBy: CharacterSet(charactersIn: ",\n"))
            .map { $0.trimmingCharacters(in: .whitespaces) }
            .filter { !$0.isEmpty }
        goal1 = data["goal1"] as? String ?? ""
        goal2 = data["goal2"] as? String ?? ""
        goal3 = data["goal3"] as? String ?? ""
        photoURL = data["photoURL"] as? String
        bannerPreset = BannerPreset(rawValue: data["bannerPreset"] as? String ?? "") ?? .lavender
    }

    func toDictionary() -> [String: Any] {
        var dict: [String: Any] = [
            "username": username,
            "email": email,
            "bedtime": bedtime,
            "sleepHours": sleepHours,
            "stress": stress,
            "distractions": distractions,
            "extracurriculars": extracurriculars,
            "homeworkClass": homeworkClass,
            "courses": courses.joined(separator: "\n"),
            "goal1": goal1,
            "goal2": goal2,
            "goal3": goal3,
            "bannerPreset": bannerPreset.rawValue,
            "updatedAt": ISO8601DateFormatter().string(from: Date())
        ]
        if let photo = photoURL { dict["photoURL"] = photo }
        return dict
    }
}
