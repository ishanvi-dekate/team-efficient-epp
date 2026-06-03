import SwiftUI
import FirebaseAuth
import FirebaseFirestore

@MainActor
final class AppState: ObservableObject {
    @Published var currentUser: FirebaseAuth.User?
    @Published var userProfile: UserProfile?
    @Published var isLoading = true
    @Published var needsOnboarding = false
    @Published var focusModeEnabled = false

    private let db = Firestore.firestore()
    private var authListener: AuthStateDidChangeListenerHandle?
    private var profileListener: ListenerRegistration?

    init() {
        authListener = Auth.auth().addStateDidChangeListener { [weak self] _, user in
            Task { @MainActor in
                self?.currentUser = user
                if let user {
                    await self?.loadUserProfile(uid: user.uid)
                } else {
                    self?.userProfile = nil
                    self?.needsOnboarding = false
                    self?.isLoading = false
                }
            }
        }
    }

    deinit {
        if let listener = authListener {
            Auth.auth().removeStateDidChangeListener(listener)
        }
        profileListener?.remove()
    }

    func loadUserProfile(uid: String) async {
        profileListener?.remove()
        profileListener = db.collection("users").document(uid)
            .addSnapshotListener { [weak self] snapshot, _ in
                Task { @MainActor in
                    if let data = snapshot?.data(), !data.isEmpty {
                        self?.userProfile = UserProfile(id: uid, data: data)
                        self?.needsOnboarding = false
                        self?.focusModeEnabled = (data["focusMode"] as? Bool) ?? false
                    } else {
                        self?.userProfile = nil
                        self?.needsOnboarding = true
                    }
                    self?.isLoading = false
                }
            }
    }

    func signOut() {
        try? Auth.auth().signOut()
        userProfile = nil
        needsOnboarding = false
    }
}
