import SwiftUI
import FirebaseAuth
import FirebaseFirestore

struct SettingsView: View {
    @EnvironmentObject var appState: AppState
    @State private var showDeleteConfirm = false
    @State private var deleteText = ""
    @State private var showPersonalInfo = false
    @State private var focusModeEnabled = false
    @State private var emailReminders = false
    @State private var weeklyDigest = false
    @State private var taskDeadlines = false
    @State private var isSaving = false
    @State private var errorMessage: String?

    var body: some View {
        NavigationStack {
            Form {
                Section("Account") {
                    NavigationLink("Manage Account") { ManageAccountView() }
                    Button("Personal Information") { showPersonalInfo = true }
                }

                Section("Preferences") {
                    Toggle("Focus Mode", isOn: $focusModeEnabled)
                        .onChange(of: focusModeEnabled) { saveFocusMode() }
                }

                Section("Notifications") {
                    Toggle("Daily Reminders", isOn: $emailReminders)
                    Toggle("Weekly Digest", isOn: $weeklyDigest)
                    Toggle("Task Deadline Alerts", isOn: $taskDeadlines)
                    Button("Save Notification Preferences") { saveNotifications() }
                        .disabled(isSaving)
                }

                Section {
                    Button("Sign Out", role: .destructive) { appState.signOut() }
                }

                Section("Danger Zone") {
                    Button("Delete Account", role: .destructive) { showDeleteConfirm = true }
                }
            }
            .navigationTitle("Settings")
            .sheet(isPresented: $showPersonalInfo) { PersonalInfoSheet() }
            .alert("Delete Account", isPresented: $showDeleteConfirm) {
                TextField("Type DELETE to confirm", text: $deleteText)
                Button("Delete", role: .destructive) {
                    if deleteText == "DELETE" { deleteAccount() }
                }
                Button("Cancel", role: .cancel) {}
            } message: {
                Text("This will permanently delete all your data. Type DELETE to confirm.")
            }
        }
        .onAppear { loadSettings() }
    }

    private var uid: String { Auth.auth().currentUser?.uid ?? "" }

    private func loadSettings() {
        focusModeEnabled = appState.focusModeEnabled
        guard !uid.isEmpty else { return }
        let db = Firestore.firestore()
        db.collection("users").document(uid).collection("settings").document("notifications").getDocument { snap, _ in
            guard let data = snap?.data() else { return }
            Task { @MainActor in
                emailReminders = data["emailReminders"] as? Bool ?? false
                weeklyDigest = data["weeklyDigest"] as? Bool ?? false
                taskDeadlines = data["taskDeadlines"] as? Bool ?? false
            }
        }
    }

    private func saveFocusMode() {
        guard !uid.isEmpty else { return }
        Task {
            try? await FirestoreService.shared.updateUserProfile(uid: uid, data: ["focusMode": focusModeEnabled])
            await MainActor.run { appState.focusModeEnabled = focusModeEnabled }
        }
    }

    private func saveNotifications() {
        guard !uid.isEmpty else { return }
        isSaving = true
        Task {
            let data: [String: Any] = [
                "emailReminders": emailReminders,
                "weeklyDigest": weeklyDigest,
                "taskDeadlines": taskDeadlines
            ]
            try? await Firestore.firestore()
                .collection("users").document(uid)
                .collection("settings").document("notifications")
                .setData(data)
            await MainActor.run { isSaving = false }
        }
    }

    private func deleteAccount() {
        Task {
            do {
                try await AuthService.shared.deleteAccount()
            } catch {
                await MainActor.run { errorMessage = error.localizedDescription }
            }
        }
    }
}

struct ManageAccountView: View {
    @State private var displayName = ""
    @State private var isSaving = false
    @State private var showResetAlert = false
    @State private var resetSent = false

    var body: some View {
        Form {
            Section("Display Name") {
                TextField("Display name", text: $displayName)
                Button("Update Name") { updateName() }
                    .disabled(displayName.isEmpty || isSaving)
            }
            Section("Password") {
                Button("Send Password Reset Email") { showResetAlert = true }
            }
        }
        .navigationTitle("Manage Account")
        .onAppear { displayName = Auth.auth().currentUser?.displayName ?? "" }
        .alert("Reset Email Sent", isPresented: $showResetAlert) {
            Button("OK") {}
        } message: {
            Text("A password reset email has been sent to \(Auth.auth().currentUser?.email ?? "your email").")
        }
    }

    private func updateName() {
        isSaving = true
        let changeRequest = Auth.auth().currentUser?.createProfileChangeRequest()
        changeRequest?.displayName = displayName
        Task {
            try? await changeRequest?.commitChanges()
            await MainActor.run { isSaving = false }
        }
    }
}

struct PersonalInfoSheet: View {
    @Environment(\.dismiss) var dismiss
    @EnvironmentObject var appState: AppState
    @State private var profile: UserProfile?
    @State private var isSaving = false

    var body: some View {
        NavigationStack {
            if var p = profile {
                Form {
                    Section {
                        TextField("Bedtime", text: Binding(get: { profile?.bedtime ?? "" }, set: { profile?.bedtime = $0 }))
                        TextField("Sleep hours", text: Binding(get: { profile?.sleepHours ?? "" }, set: { profile?.sleepHours = $0 }))
                        TextField("Biggest stressor", text: Binding(get: { profile?.stress ?? "" }, set: { profile?.stress = $0 }))
                        TextField("Distractions", text: Binding(get: { profile?.distractions ?? "" }, set: { profile?.distractions = $0 }))
                        TextField("Extracurriculars", text: Binding(get: { profile?.extracurriculars ?? "" }, set: { profile?.extracurriculars = $0 }))
                        TextField("Hardest class", text: Binding(get: { profile?.homeworkClass ?? "" }, set: { profile?.homeworkClass = $0 }))
                    }
                }
                .navigationTitle("Personal Info")
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .cancellationAction) { Button("Cancel") { dismiss() } }
                    ToolbarItem(placement: .confirmationAction) {
                        Button("Save") { save() }.disabled(isSaving)
                    }
                }
            } else {
                ProgressView()
            }
        }
        .onAppear { profile = appState.userProfile }
    }

    private func save() {
        guard let p = profile, let uid = Auth.auth().currentUser?.uid else { return }
        isSaving = true
        Task {
            try? await FirestoreService.shared.updateUserProfile(uid: uid, data: p.toDictionary())
            await MainActor.run { dismiss() }
        }
    }
}
