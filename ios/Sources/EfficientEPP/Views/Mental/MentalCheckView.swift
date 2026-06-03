import SwiftUI
import FirebaseAuth
import FirebaseFirestore

struct MentalCheckView: View {
    @State private var sleepTime = "23:00"
    @State private var wakeTime = "07:00"
    @State private var stressLevel = 3
    @State private var dayScale = 5
    @State private var worries = ""
    @State private var extraTime = ""
    @State private var isSaving = false
    @State private var showSuccess = false
    @State private var checks: [MentalCheck] = []
    @State private var listener: ListenerRegistration?
    @State private var showHistory = false

    var body: some View {
        NavigationStack {
            Form {
                Section("Sleep") {
                    HStack {
                        Text("Bedtime")
                        Spacer()
                        TextField("HH:MM", text: $sleepTime)
                            .multilineTextAlignment(.trailing)
                            .keyboardType(.numbersAndPunctuation)
                            .frame(width: 80)
                    }
                    HStack {
                        Text("Wake time")
                        Spacer()
                        TextField("HH:MM", text: $wakeTime)
                            .multilineTextAlignment(.trailing)
                            .keyboardType(.numbersAndPunctuation)
                            .frame(width: 80)
                    }
                    if let hours = computedSleepHours {
                        HStack {
                            Text("Sleep hours").foregroundStyle(.secondary)
                            Spacer()
                            Text(String(format: "%.1f hrs", hours))
                                .foregroundStyle(.indigo)
                        }
                    }
                }

                Section("How are you feeling?") {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Stress level: \(stressLevel)/5")
                        Slider(value: Binding(get: { Double(stressLevel) }, set: { stressLevel = Int($0) }),
                               in: 1...5, step: 1)
                            .tint(.orange)
                    }
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Day rating: \(dayScale)/10")
                        Slider(value: Binding(get: { Double(dayScale) }, set: { dayScale = Int($0) }),
                               in: 1...10, step: 1)
                            .tint(.green)
                    }
                }

                Section("Reflections") {
                    TextField("Worries or concerns…", text: $worries, axis: .vertical)
                        .lineLimit(3, reservesSpace: true)
                    TextField("Extracurricular time (e.g. 2 hrs)", text: $extraTime)
                }

                Section {
                    Button(isSaving ? "Saving…" : "Submit Check-In") { submit() }
                        .disabled(isSaving)
                        .frame(maxWidth: .infinity)
                }

                if !checks.isEmpty {
                    Section {
                        Button("View Full History") { showHistory = true }
                    }
                    Section("Recent Check-ins") {
                        ForEach(checks.prefix(5)) { check in
                            MentalCheckRow(check: check)
                        }
                    }
                }
            }
            .navigationTitle("Mental Check")
            .sheet(isPresented: $showHistory) { MentalHistoryView() }
            .overlay(alignment: .center) {
                if showSuccess {
                    VStack(spacing: 12) {
                        Image(systemName: "checkmark.circle.fill")
                            .font(.system(size: 60))
                            .foregroundStyle(.green)
                        Text("Check-in saved!")
                            .font(.title3.bold())
                    }
                    .padding(32)
                    .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 20))
                    .transition(.scale.combined(with: .opacity))
                }
            }
            .animation(.spring(), value: showSuccess)
        }
        .onAppear { setupListener() }
        .onDisappear { listener?.remove() }
    }

    private var computedSleepHours: Double? {
        let fmt = DateFormatter()
        fmt.dateFormat = "HH:mm"
        guard let sleep = fmt.date(from: sleepTime), let wake = fmt.date(from: wakeTime) else { return nil }
        var diff = wake.timeIntervalSince(sleep) / 3600
        if diff < 0 { diff += 24 }
        return diff
    }

    private func submit() {
        guard let uid = Auth.auth().currentUser?.uid else { return }
        isSaving = true
        Task {
            do {
                let newCheck = buildMentalCheck()
                try await FirestoreService.shared.addMentalCheck(newCheck, uid: uid)
                await MainActor.run {
                    isSaving = false
                    showSuccess = true
                    resetForm()
                }
                try await Task.sleep(nanoseconds: 2_000_000_000)
                await MainActor.run { showSuccess = false }
            } catch {
                await MainActor.run { isSaving = false }
            }
        }
    }

    private func buildMentalCheck() -> MentalCheck {
        let data: [String: Any] = [
            "sleepTime": sleepTime,
            "wakeTime": wakeTime,
            "stressLevel": stressLevel,
            "dayScale": dayScale,
            "worries": worries,
            "extraTime": extraTime,
            "submittedAt": Timestamp(date: .now)
        ]
        return MentalCheck(id: UUID().uuidString, data: data)!
    }

    private func resetForm() {
        sleepTime = "23:00"; wakeTime = "07:00"
        stressLevel = 3; dayScale = 5
        worries = ""; extraTime = ""
    }

    private func setupListener() {
        guard let uid = Auth.auth().currentUser?.uid else { return }
        listener = FirestoreService.shared.mentalChecksListener(uid: uid) { checks = $0 }
    }
}

struct MentalCheckRow: View {
    var check: MentalCheck

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                Text(check.submittedAt.formatted(date: .abbreviated, time: .omitted))
                    .font(.subheadline.weight(.medium))
                Spacer()
                Label("\(check.stressLevel)/5", systemImage: "bolt.fill")
                    .font(.caption)
                    .foregroundStyle(.orange)
                Label(String(format: "%.1f hrs", check.sleepHours), systemImage: "moon.fill")
                    .font(.caption)
                    .foregroundStyle(.indigo)
            }
            if !check.worries.isEmpty {
                Text(check.worries)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .lineLimit(2)
            }
        }
    }
}
