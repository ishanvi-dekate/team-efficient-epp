import Foundation
import FirebaseFirestore

final class FirestoreService {
    static let shared = FirestoreService()
    private let db = Firestore.firestore()
    private init() {}

    // MARK: - User ref helper
    private func userRef(_ uid: String) -> DocumentReference {
        db.collection("users").document(uid)
    }

    // MARK: - Todos
    func todosListener(uid: String, date: String, onChange: @escaping ([TodoItem]) -> Void) -> ListenerRegistration {
        userRef(uid).collection("todos")
            .whereField("date", isEqualTo: date)
            .order(by: "createdAt")
            .addSnapshotListener { snap, _ in
                let items = snap?.documents.compactMap { TodoItem(id: $0.documentID, data: $0.data()) } ?? []
                onChange(items)
            }
    }

    func addTodo(_ todo: TodoItem, uid: String) async throws {
        try await userRef(uid).collection("todos").document(todo.id).setData(todo.toDictionary())
    }

    func updateTodo(_ todo: TodoItem, uid: String) async throws {
        try await userRef(uid).collection("todos").document(todo.id).updateData(todo.toDictionary())
    }

    func deleteTodo(id: String, uid: String) async throws {
        try await userRef(uid).collection("todos").document(id).delete()
    }

    // MARK: - Mental Checks
    func mentalChecksListener(uid: String, limit: Int = 20, onChange: @escaping ([MentalCheck]) -> Void) -> ListenerRegistration {
        userRef(uid).collection("mentalChecks")
            .order(by: "submittedAt", descending: true)
            .limit(to: limit)
            .addSnapshotListener { snap, _ in
                let items = snap?.documents.compactMap { MentalCheck(id: $0.documentID, data: $0.data()) } ?? []
                onChange(items)
            }
    }

    func addMentalCheck(_ check: MentalCheck, uid: String) async throws {
        try await userRef(uid).collection("mentalChecks").document(check.id).setData(check.toDictionary())
    }

    // MARK: - Activities
    func activitiesListener(uid: String, date: String, onChange: @escaping ([Activity]) -> Void) -> ListenerRegistration {
        userRef(uid).collection("activities")
            .whereField("date", isEqualTo: date)
            .order(by: "createdAt")
            .addSnapshotListener { snap, _ in
                let items = snap?.documents.compactMap { Activity(id: $0.documentID, data: $0.data()) } ?? []
                onChange(items)
            }
    }

    func addActivity(_ activity: Activity, uid: String) async throws {
        try await userRef(uid).collection("activities").document(activity.id).setData(activity.toDictionary())
    }

    func deleteActivity(id: String, uid: String) async throws {
        try await userRef(uid).collection("activities").document(id).delete()
    }

    // MARK: - Distractions
    func distractionsListener(uid: String, date: String, onChange: @escaping ([DistractionEntry]) -> Void) -> ListenerRegistration {
        userRef(uid).collection("distractionLog")
            .whereField("date", isEqualTo: date)
            .order(by: "createdAt")
            .addSnapshotListener { snap, _ in
                let items = snap?.documents.compactMap { DistractionEntry(id: $0.documentID, data: $0.data()) } ?? []
                onChange(items)
            }
    }

    func addDistraction(_ entry: DistractionEntry, uid: String) async throws {
        try await userRef(uid).collection("distractionLog").document(entry.id).setData(entry.toDictionary())
    }

    func deleteDistraction(id: String, uid: String) async throws {
        try await userRef(uid).collection("distractionLog").document(id).delete()
    }

    // MARK: - Exams
    func examsListener(uid: String, onChange: @escaping ([Exam]) -> Void) -> ListenerRegistration {
        userRef(uid).collection("exams")
            .order(by: "date")
            .addSnapshotListener { snap, _ in
                let items = snap?.documents.compactMap { Exam(id: $0.documentID, data: $0.data()) } ?? []
                onChange(items)
            }
    }

    func addExam(_ exam: Exam, uid: String) async throws {
        try await userRef(uid).collection("exams").document(exam.id).setData(exam.toDictionary())
    }

    func deleteExam(id: String, uid: String) async throws {
        try await userRef(uid).collection("exams").document(id).delete()
    }

    // MARK: - Grades
    func gradeCategoriesListener(uid: String, onChange: @escaping ([GradeCategory]) -> Void) -> ListenerRegistration {
        userRef(uid).collection("gradeCategories")
            .order(by: "createdAt")
            .addSnapshotListener { snap, _ in
                let items = snap?.documents.compactMap { GradeCategory(id: $0.documentID, data: $0.data()) } ?? []
                onChange(items)
            }
    }

    func gradeEntriesListener(uid: String, onChange: @escaping ([GradeEntry]) -> Void) -> ListenerRegistration {
        userRef(uid).collection("grades")
            .order(by: "createdAt")
            .addSnapshotListener { snap, _ in
                let items = snap?.documents.compactMap { GradeEntry(id: $0.documentID, data: $0.data()) } ?? []
                onChange(items)
            }
    }

    func saveGradeCategory(_ cat: GradeCategory, uid: String) async throws {
        try await userRef(uid).collection("gradeCategories").document(cat.id).setData(cat.toDictionary())
    }

    func deleteGradeCategory(id: String, uid: String) async throws {
        try await userRef(uid).collection("gradeCategories").document(id).delete()
    }

    func addGradeEntry(_ entry: GradeEntry, uid: String) async throws {
        try await userRef(uid).collection("grades").document(entry.id).setData(entry.toDictionary())
    }

    func deleteGradeEntry(id: String, uid: String) async throws {
        try await userRef(uid).collection("grades").document(id).delete()
    }

    // MARK: - Chat History
    func chatHistoryListener(uid: String, onChange: @escaping ([ChatMessage]) -> Void) -> ListenerRegistration {
        userRef(uid).collection("chatHistory")
            .order(by: "timestamp")
            .limit(to: 20)
            .addSnapshotListener { snap, _ in
                let msgs = snap?.documents.compactMap { ChatMessage(id: $0.documentID, data: $0.data()) } ?? []
                onChange(msgs)
            }
    }

    func saveChatMessage(_ msg: ChatMessage, uid: String) async throws {
        try await userRef(uid).collection("chatHistory").document(msg.id).setData(msg.toDictionary())
    }

    func clearChatHistory(uid: String) async throws {
        let docs = try await userRef(uid).collection("chatHistory").getDocuments()
        for doc in docs.documents {
            try await doc.reference.delete()
        }
    }

    // MARK: - User Profile
    func updateUserProfile(uid: String, data: [String: Any]) async throws {
        try await userRef(uid).updateData(data)
    }
}
