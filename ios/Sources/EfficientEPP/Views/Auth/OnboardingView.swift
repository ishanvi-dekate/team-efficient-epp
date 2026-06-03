import SwiftUI
import FirebaseAuth

struct OnboardingView: View {
    @EnvironmentObject var appState: AppState

    @State private var username = ""
    @State private var bedtime = ""
    @State private var sleepHours = ""
    @State private var stress = ""
    @State private var distractions = ""
    @State private var extracurriculars = ""
    @State private var homeworkClass = ""
    @State private var courses = ""
    @State private var goal1 = ""
    @State private var goal2 = ""
    @State private var goal3 = ""
    @State private var agreed = false
    @State private var isSaving = false
    @State private var errorMessage: String?
    @State private var step = 0

    var body: some View {
        NavigationStack {
            TabView(selection: $step) {
                basicInfoStep.tag(0)
                academicStep.tag(1)
                goalsStep.tag(2)
            }
            .tabViewStyle(.page(indexDisplayMode: .always))
            .navigationTitle("Setup Profile")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    if step < 2 {
                        Button("Next") { withAnimation { step += 1 } }
                            .disabled(username.isEmpty)
                    }
                }
            }
        }
    }

    private var basicInfoStep: some View {
        Form {
            Section("Who are you?") {
                TextField("Username", text: $username)
                TextField("Bedtime (e.g. 11pm)", text: $bedtime)
                TextField("Sleep hours (e.g. 7 hours)", text: $sleepHours)
            }
            Section("Challenges") {
                TextField("Biggest stressor", text: $stress)
                TextField("External distractions", text: $distractions)
            }
        }
    }

    private var academicStep: some View {
        Form {
            Section("Academics") {
                TextField("Most homework-heavy class", text: $homeworkClass)
                TextField("Extracurriculars", text: $extracurriculars)
                TextField("Courses (one per line)", text: $courses, axis: .vertical)
                    .lineLimit(4, reservesSpace: true)
            }
        }
    }

    private var goalsStep: some View {
        Form {
            Section("Your Goals") {
                TextField("Goal 1", text: $goal1)
                TextField("Goal 2", text: $goal2)
                TextField("Goal 3", text: $goal3)
            }

            if let error = errorMessage {
                Section { Text(error).foregroundStyle(.red).font(.footnote) }
            }

            Section {
                Toggle("I agree to use this app responsibly", isOn: $agreed)
                Button(isSaving ? "Saving…" : "Get Started") { save() }
                    .disabled(!agreed || isSaving || username.isEmpty)
                    .frame(maxWidth: .infinity)
            }
        }
    }

    private func save() {
        guard let uid = Auth.auth().currentUser?.uid,
              let email = Auth.auth().currentUser?.email else { return }
        isSaving = true
        var profile = UserProfile(id: uid, data: [:])
        profile.username = username
        profile.bedtime = bedtime
        profile.sleepHours = sleepHours
        profile.stress = stress
        profile.distractions = distractions
        profile.extracurriculars = extracurriculars
        profile.homeworkClass = homeworkClass
        profile.courses = courses.components(separatedBy: "\n").map { $0.trimmingCharacters(in: .whitespaces) }.filter { !$0.isEmpty }
        profile.goal1 = goal1; profile.goal2 = goal2; profile.goal3 = goal3

        Task {
            do {
                try await AuthService.shared.saveNewUserProfile(uid: uid, email: email, profile: profile)
                await MainActor.run { appState.needsOnboarding = false }
            } catch {
                await MainActor.run {
                    errorMessage = error.localizedDescription
                    isSaving = false
                }
            }
        }
    }
}
