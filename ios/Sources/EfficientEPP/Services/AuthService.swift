import Foundation
import FirebaseAuth
import FirebaseFirestore
import GoogleSignIn
import UIKit

final class AuthService {
    static let shared = AuthService()
    private let db = Firestore.firestore()

    private init() {}

    func signInWithGoogle(presenting viewController: UIViewController) async throws -> (FirebaseAuth.User, Bool) {
        guard let clientID = FirebaseApp.app()?.options.clientID else {
            throw AuthError.missingClientID
        }
        let config = GIDConfiguration(clientID: clientID)
        GIDSignIn.sharedInstance.configuration = config

        let result = try await GIDSignIn.sharedInstance.signIn(withPresenting: viewController)
        let user = result.user
        guard let idToken = user.idToken?.tokenString else {
            throw AuthError.missingToken
        }
        let credential = GoogleAuthProvider.credential(
            withIDToken: idToken,
            accessToken: user.accessToken.tokenString
        )
        let authResult = try await Auth.auth().signIn(with: credential)
        let isNew = await isNewUser(uid: authResult.user.uid)
        return (authResult.user, isNew)
    }

    func signInWithEmail(email: String, password: String) async throws -> FirebaseAuth.User {
        let result = try await Auth.auth().signIn(withEmail: email, password: password)
        return result.user
    }

    func createAccount(email: String, password: String) async throws -> FirebaseAuth.User {
        let result = try await Auth.auth().createUser(withEmail: email, password: password)
        return result.user
    }

    func sendPasswordReset(email: String) async throws {
        try await Auth.auth().sendPasswordReset(withEmail: email)
    }

    func deleteAccount() async throws {
        guard let user = Auth.auth().currentUser else { return }
        let uid = user.uid
        try await deleteUserData(uid: uid)
        try await user.delete()
    }

    func signOut() throws {
        try Auth.auth().signOut()
    }

    func saveNewUserProfile(uid: String, email: String, profile: UserProfile) async throws {
        var dict = profile.toDictionary()
        dict["createdAt"] = ISO8601DateFormatter().string(from: Date())
        dict["userId"] = uid
        dict["email"] = email
        try await db.collection("users").document(uid).setData(dict)
    }

    private func isNewUser(uid: String) async -> Bool {
        let doc = try? await db.collection("users").document(uid).getDocument()
        return !(doc?.exists ?? false)
    }

    private func deleteUserData(uid: String) async throws {
        let ref = db.collection("users").document(uid)
        let subcollections = ["todos", "mentalChecks", "activities", "distractionLog",
                              "exams", "grades", "gradeCategories", "chatHistory"]
        for sub in subcollections {
            let docs = try await ref.collection(sub).getDocuments()
            for doc in docs.documents {
                try await doc.reference.delete()
            }
        }
        try await ref.delete()
    }

    enum AuthError: LocalizedError {
        case missingClientID, missingToken
        var errorDescription: String? {
            switch self {
            case .missingClientID: return "Missing Firebase client ID"
            case .missingToken: return "Missing Google ID token"
            }
        }
    }
}
