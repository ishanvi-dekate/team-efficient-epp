import SwiftUI
import FirebaseAuth
import FirebaseFirestore

struct GradeTrackerView: View {
    @State private var categories: [GradeCategory] = []
    @State private var entries: [GradeEntry] = []
    @State private var catListener: ListenerRegistration?
    @State private var entryListener: ListenerRegistration?
    @State private var showAddSubject = false
    @State private var showAddEntry = false
    @State private var selectedSubject: String?

    private var subjects: [String] {
        let s = Set(categories.map { $0.subject } + entries.map { $0.subject })
        return Array(s).sorted()
    }

    var body: some View {
        List {
            ForEach(subjects, id: \.self) { subject in
                SubjectGradeSection(
                    subject: subject,
                    categories: categories.filter { $0.subject == subject },
                    entries: entries.filter { $0.subject == subject },
                    uid: uid
                )
            }
            Button { showAddSubject = true } label: {
                Label("Add Subject", systemImage: "plus")
            }
        }
        .sheet(isPresented: $showAddSubject) { AddSubjectSheet(uid: uid) }
        .onAppear { setupListeners() }
        .onDisappear { catListener?.remove(); entryListener?.remove() }
    }

    private var uid: String { Auth.auth().currentUser?.uid ?? "" }

    private func setupListeners() {
        guard !uid.isEmpty else { return }
        catListener = FirestoreService.shared.gradeCategoriesListener(uid: uid) { categories = $0 }
        entryListener = FirestoreService.shared.gradeEntriesListener(uid: uid) { entries = $0 }
    }
}

struct SubjectGradeSection: View {
    var subject: String
    var categories: [GradeCategory]
    var entries: [GradeEntry]
    var uid: String
    @State private var showAddEntry = false
    @State private var showFinalCalc = false
    @State private var isExpanded = true

    private var overallPercentage: Double {
        if categories.isEmpty {
            let total = entries.reduce(0) { $0 + $1.total }
            let earned = entries.reduce(0) { $0 + $1.score }
            return total > 0 ? (earned / total) * 100 : 0
        }
        var weighted = 0.0
        var totalWeight = 0.0
        for cat in categories {
            let catEntries = entries.filter { $0.categoryId == cat.id }
            var pct: Double?
            if let earned = cat.pointsEarned, let max = cat.pointsMax, max > 0 {
                pct = earned / max * 100
            } else if !catEntries.isEmpty {
                let t = catEntries.reduce(0.0) { $0 + $1.total }
                let s = catEntries.reduce(0.0) { $0 + $1.score }
                if t > 0 { pct = s / t * 100 }
            }
            if let p = pct {
                weighted += p * (cat.weight / 100)
                totalWeight += cat.weight / 100
            }
        }
        return totalWeight > 0 ? weighted / totalWeight : 0
    }

    var body: some View {
        Section {
            if isExpanded {
                HStack {
                    VStack(alignment: .leading) {
                        Text(String(format: "%.1f%%", overallPercentage))
                            .font(.title2.bold())
                        Text(LetterGrade.from(percentage: overallPercentage))
                            .font(.subheadline)
                            .foregroundStyle(gradeColor)
                    }
                    Spacer()
                    ProgressView(value: overallPercentage / 100)
                        .tint(gradeColor)
                        .frame(width: 120)
                }

                ForEach(entries) { entry in
                    HStack {
                        VStack(alignment: .leading, spacing: 2) {
                            Text(entry.name.isEmpty ? "Assignment" : entry.name).font(.subheadline)
                            Text(String(format: "%.0f/%.0f", entry.score, entry.total))
                                .font(.caption).foregroundStyle(.secondary)
                        }
                        Spacer()
                        Text(String(format: "%.1f%%", entry.percentage))
                            .font(.caption.bold())
                            .foregroundStyle(entry.percentage >= 70 ? .green : .red)
                    }
                }
                .onDelete { indexSet in
                    for i in indexSet {
                        Task { try? await FirestoreService.shared.deleteGradeEntry(id: entries[i].id, uid: uid) }
                    }
                }

                Button { showAddEntry = true } label: {
                    Label("Add Grade", systemImage: "plus.circle")
                        .font(.subheadline)
                }
                Button { showFinalCalc = true } label: {
                    Label("Final Exam Calculator", systemImage: "function")
                        .font(.subheadline)
                }
            }
        } header: {
            Button {
                withAnimation { isExpanded.toggle() }
            } label: {
                HStack {
                    Text(subject).foregroundStyle(.primary)
                    Spacer()
                    Image(systemName: isExpanded ? "chevron.up" : "chevron.down")
                        .foregroundStyle(.secondary)
                        .font(.caption)
                }
            }
        }
        .sheet(isPresented: $showAddEntry) { AddGradeEntrySheet(subject: subject, uid: uid) }
        .sheet(isPresented: $showFinalCalc) { FinalExamCalcSheet(currentGrade: overallPercentage) }
    }

    private var gradeColor: Color {
        switch overallPercentage {
        case 90...: return .green
        case 80...: return .blue
        case 70...: return .orange
        default: return .red
        }
    }
}

struct AddGradeEntrySheet: View {
    @Environment(\.dismiss) var dismiss
    var subject: String
    var uid: String
    @State private var name = ""
    @State private var score = ""
    @State private var total = ""

    var body: some View {
        NavigationStack {
            Form {
                TextField("Assignment name (optional)", text: $name)
                HStack {
                    TextField("Score", text: $score).keyboardType(.decimalPad)
                    Text("/")
                    TextField("Total", text: $total).keyboardType(.decimalPad)
                }
            }
            .navigationTitle("Add Grade")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancel") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Add") { add() }
                        .disabled(score.isEmpty || total.isEmpty)
                }
            }
        }
    }

    private func add() {
        guard let s = Double(score), let t = Double(total) else { return }
        let entry = GradeEntry(subject: subject, name: name, score: s, total: t)
        Task {
            try? await FirestoreService.shared.addGradeEntry(entry, uid: uid)
            await MainActor.run { dismiss() }
        }
    }
}

struct AddSubjectSheet: View {
    @Environment(\.dismiss) var dismiss
    var uid: String
    @State private var subject = ""
    @State private var categories: [(name: String, weight: String)] = [("", "")]

    var body: some View {
        NavigationStack {
            Form {
                Section("Subject Name") {
                    TextField("e.g. AP Chemistry", text: $subject)
                }
                Section("Grade Categories (optional)") {
                    ForEach(categories.indices, id: \.self) { i in
                        HStack {
                            TextField("Category name", text: $categories[i].name)
                            TextField("Weight %", text: $categories[i].weight)
                                .keyboardType(.decimalPad)
                                .frame(width: 80)
                        }
                    }
                    Button { categories.append(("", "")) } label: {
                        Label("Add Category", systemImage: "plus")
                    }
                }
            }
            .navigationTitle("Add Subject")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancel") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") { save() }.disabled(subject.isEmpty)
                }
            }
        }
    }

    private func save() {
        Task {
            for cat in categories where !cat.name.isEmpty {
                let weight = Double(cat.weight) ?? 0
                let category = GradeCategory(subject: subject, name: cat.name, weight: weight)
                try? await FirestoreService.shared.saveGradeCategory(category, uid: uid)
            }
            await MainActor.run { dismiss() }
        }
    }
}

struct FinalExamCalcSheet: View {
    @Environment(\.dismiss) var dismiss
    var currentGrade: Double
    @State private var targetGrade = ""
    @State private var finalWeight = ""

    private var neededGrade: Double? {
        guard let target = Double(targetGrade), let weight = Double(finalWeight), weight > 0, weight < 100 else { return nil }
        let currentWeight = 100 - weight
        return (target - currentGrade * (currentWeight / 100)) / (weight / 100)
    }

    var body: some View {
        NavigationStack {
            Form {
                Section("Current Grade") {
                    Text(String(format: "%.1f%% (%@)", currentGrade, LetterGrade.from(percentage: currentGrade)))
                        .foregroundStyle(.secondary)
                }
                Section("What do I need?") {
                    HStack {
                        Text("Target grade %")
                        Spacer()
                        TextField("e.g. 90", text: $targetGrade).keyboardType(.decimalPad).frame(width: 80).multilineTextAlignment(.trailing)
                    }
                    HStack {
                        Text("Final exam weight %")
                        Spacer()
                        TextField("e.g. 20", text: $finalWeight).keyboardType(.decimalPad).frame(width: 80).multilineTextAlignment(.trailing)
                    }
                }
                if let needed = neededGrade {
                    Section("Result") {
                        Text("You need \(String(format: "%.1f", needed))% on the final exam.")
                            .font(.headline)
                            .foregroundStyle(needed > 100 ? .red : .green)
                    }
                }
            }
            .navigationTitle("Final Calculator")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Done") { dismiss() } }
            }
        }
    }
}
