import SwiftUI
import FirebaseAuth
import FirebaseFirestore

struct ExamCountdownView: View {
    @State private var exams: [Exam] = []
    @State private var listener: ListenerRegistration?
    @State private var showAdd = false

    private var upcoming: [Exam] { exams.filter { !$0.isPast } }
    private var past: [Exam] { exams.filter { $0.isPast } }

    var body: some View {
        List {
            Section("Upcoming Exams") {
                if upcoming.isEmpty {
                    Text("No upcoming exams").foregroundStyle(.secondary).font(.subheadline)
                }
                ForEach(upcoming) { exam in
                    ExamRow(exam: exam)
                }
                .onDelete { indexSet in
                    for i in indexSet {
                        let id = upcoming[i].id
                        Task { try? await FirestoreService.shared.deleteExam(id: id, uid: uid) }
                    }
                }
                Button { showAdd = true } label: {
                    Label("Add Exam", systemImage: "plus")
                }
            }

            if !past.isEmpty {
                Section("Past Exams") {
                    ForEach(past) { exam in
                        ExamRow(exam: exam)
                    }
                    .onDelete { indexSet in
                        for i in indexSet {
                            let id = past[i].id
                            Task { try? await FirestoreService.shared.deleteExam(id: id, uid: uid) }
                        }
                    }
                }
            }
        }
        .sheet(isPresented: $showAdd) { AddExamSheet() }
        .onAppear { setupListener() }
        .onDisappear { listener?.remove() }
    }

    private var uid: String { Auth.auth().currentUser?.uid ?? "" }

    private func setupListener() {
        guard !uid.isEmpty else { return }
        listener = FirestoreService.shared.examsListener(uid: uid) { exams = $0 }
    }
}

struct ExamRow: View {
    var exam: Exam

    private var urgencyColor: Color {
        let days = exam.daysUntil
        if days <= 3 { return .red }
        else if days <= 7 { return .orange }
        else if days <= 14 { return .yellow }
        return .green
    }

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                Text(exam.name).font(.subheadline.weight(.medium))
                if !exam.subject.isEmpty {
                    Text(exam.subject).font(.caption).foregroundStyle(.secondary)
                }
                Text(exam.date).font(.caption2).foregroundStyle(.secondary)
            }
            Spacer()
            if !exam.isPast {
                Text("\(exam.daysUntil)d")
                    .font(.headline.bold())
                    .foregroundStyle(urgencyColor)
            } else {
                Text("Past").font(.caption).foregroundStyle(.secondary)
            }
        }
    }
}

struct AddExamSheet: View {
    @Environment(\.dismiss) var dismiss
    @State private var name = ""
    @State private var subject = ""
    @State private var date = Date.now
    private var uid: String { Auth.auth().currentUser?.uid ?? "" }

    var body: some View {
        NavigationStack {
            Form {
                TextField("Exam name", text: $name)
                TextField("Subject (optional)", text: $subject)
                DatePicker("Date", selection: $date, displayedComponents: .date)
            }
            .navigationTitle("Add Exam")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancel") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Add") { add() }
                        .disabled(name.isEmpty)
                }
            }
        }
    }

    private func add() {
        let dateStr = DateFormatter.yyyyMMdd.string(from: date)
        let exam = Exam(name: name, subject: subject, date: dateStr)
        Task {
            try? await FirestoreService.shared.addExam(exam, uid: uid)
            await MainActor.run { dismiss() }
        }
    }
}
