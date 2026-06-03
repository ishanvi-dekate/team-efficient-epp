import SwiftUI
import FirebaseAuth
import FirebaseFirestore

struct MentalHistoryView: View {
    @Environment(\.dismiss) var dismiss
    @State private var checks: [MentalCheck] = []
    @State private var listener: ListenerRegistration?

    var body: some View {
        NavigationStack {
            List(checks) { check in
                MentalCheckRow(check: check)
            }
            .navigationTitle("Mental History")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Done") { dismiss() }
                }
            }
            .overlay {
                if checks.isEmpty {
                    ContentUnavailableView("No check-ins yet", systemImage: "heart.slash",
                                          description: Text("Complete a mental check-in to see history here."))
                }
            }
        }
        .onAppear { setupListener() }
        .onDisappear { listener?.remove() }
    }

    private func setupListener() {
        guard let uid = Auth.auth().currentUser?.uid else { return }
        // Fetch all (no limit) for history view
        listener = Firestore.firestore()
            .collection("users").document(uid)
            .collection("mentalChecks")
            .order(by: "submittedAt", descending: true)
            .addSnapshotListener { snap, _ in
                checks = snap?.documents.compactMap { MentalCheck(id: $0.documentID, data: $0.data()) } ?? []
            }
    }
}
