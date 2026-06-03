import SwiftUI
import FirebaseAuth
import FirebaseFirestore

struct TrackerView: View {
    @State private var selectedDate = Date.now
    @State private var todos: [TodoItem] = []
    @State private var activities: [Activity] = []
    @State private var distractions: [DistractionEntry] = []
    @State private var todoListener: ListenerRegistration?
    @State private var activityListener: ListenerRegistration?
    @State private var distractionListener: ListenerRegistration?

    private var dateKey: String { DateFormatter.yyyyMMdd.string(from: selectedDate) }

    var body: some View {
        NavigationStack {
            List {
                Section {
                    DatePicker("Date", selection: $selectedDate, displayedComponents: .date)
                        .datePickerStyle(.graphical)
                }

                todoSection
                activitySection
                distractionSection
            }
            .navigationTitle("Tracker")
            .listStyle(.insetGrouped)
        }
        .onChange(of: selectedDate) { setupListeners() }
        .onAppear { setupListeners() }
        .onDisappear { teardown() }
    }

    private var todoSection: some View {
        Section("To-Do") {
            ForEach(todos) { todo in
                TodoRow(todo: todo) { updated in
                    Task { try? await FirestoreService.shared.updateTodo(updated, uid: uid) }
                }
            }
            .onDelete { indexSet in
                for i in indexSet {
                    Task { try? await FirestoreService.shared.deleteTodo(id: todos[i].id, uid: uid) }
                }
            }
            AddTodoRow(date: dateKey)
        }
    }

    private var activitySection: some View {
        Section("Activities") {
            ForEach(activities) { activity in
                HStack {
                    Image(systemName: "figure.run").foregroundStyle(.green)
                    VStack(alignment: .leading) {
                        Text(activity.name).font(.subheadline)
                        if !activity.duration.isEmpty {
                            Text(activity.duration).font(.caption).foregroundStyle(.secondary)
                        }
                    }
                }
            }
            .onDelete { indexSet in
                for i in indexSet {
                    Task { try? await FirestoreService.shared.deleteActivity(id: activities[i].id, uid: uid) }
                }
            }
            AddActivityRow(date: dateKey)
        }
    }

    private var distractionSection: some View {
        Section("Distractions") {
            ForEach(distractions) { entry in
                HStack {
                    Image(systemName: "exclamationmark.triangle.fill").foregroundStyle(.orange)
                    VStack(alignment: .leading) {
                        Text(entry.name).font(.subheadline)
                        if !entry.duration.isEmpty {
                            Text(entry.duration).font(.caption).foregroundStyle(.secondary)
                        }
                    }
                }
            }
            .onDelete { indexSet in
                for i in indexSet {
                    Task { try? await FirestoreService.shared.deleteDistraction(id: distractions[i].id, uid: uid) }
                }
            }
            AddDistractionRow(date: dateKey)
        }
    }

    private var uid: String { Auth.auth().currentUser?.uid ?? "" }

    private func setupListeners() {
        teardown()
        guard !uid.isEmpty else { return }
        todoListener = FirestoreService.shared.todosListener(uid: uid, date: dateKey) { todos = $0 }
        activityListener = FirestoreService.shared.activitiesListener(uid: uid, date: dateKey) { activities = $0 }
        distractionListener = FirestoreService.shared.distractionsListener(uid: uid, date: dateKey) { distractions = $0 }
    }

    private func teardown() {
        todoListener?.remove(); activityListener?.remove(); distractionListener?.remove()
    }
}

struct TodoRow: View {
    var todo: TodoItem
    var onUpdate: (TodoItem) -> Void

    var body: some View {
        HStack {
            Button {
                var updated = todo
                updated.done.toggle()
                onUpdate(updated)
            } label: {
                Image(systemName: todo.done ? "checkmark.circle.fill" : "circle")
                    .foregroundStyle(todo.done ? .green : .secondary)
            }
            .buttonStyle(.plain)

            VStack(alignment: .leading, spacing: 2) {
                Text(todo.text)
                    .strikethrough(todo.done)
                    .foregroundStyle(todo.done ? .secondary : .primary)
                if let time = todo.dueTime {
                    Text(time).font(.caption2).foregroundStyle(.orange)
                }
            }
        }
    }
}

struct AddTodoRow: View {
    var date: String
    @State private var text = ""
    @State private var dueTime = ""
    @State private var showTimeField = false

    var body: some View {
        VStack(spacing: 8) {
            HStack {
                TextField("Add task…", text: $text)
                Button("Add") { add() }
                    .disabled(text.trimmingCharacters(in: .whitespaces).isEmpty)
            }
            if showTimeField {
                TextField("Due time (HH:MM)", text: $dueTime)
                    .font(.caption)
            }
            Button(showTimeField ? "Remove time" : "Set due time") {
                showTimeField.toggle()
                if !showTimeField { dueTime = "" }
            }
            .font(.caption)
            .foregroundStyle(.secondary)
        }
    }

    private func add() {
        let trimmed = text.trimmingCharacters(in: .whitespaces)
        guard !trimmed.isEmpty, let uid = Auth.auth().currentUser?.uid else { return }
        let todo = TodoItem(text: trimmed, date: date, dueTime: dueTime.isEmpty ? nil : dueTime)
        text = ""; dueTime = ""; showTimeField = false
        Task { try? await FirestoreService.shared.addTodo(todo, uid: uid) }
    }
}

struct AddActivityRow: View {
    var date: String
    @State private var name = ""
    @State private var duration = ""

    var body: some View {
        HStack {
            TextField("Activity name", text: $name)
            TextField("Duration", text: $duration).frame(width: 80)
            Button("Add") { add() }.disabled(name.isEmpty)
        }
    }

    private func add() {
        guard let uid = Auth.auth().currentUser?.uid else { return }
        let activity = Activity(name: name, duration: duration, date: date)
        name = ""; duration = ""
        Task { try? await FirestoreService.shared.addActivity(activity, uid: uid) }
    }
}

struct AddDistractionRow: View {
    var date: String
    @State private var name = ""
    @State private var duration = ""

    var body: some View {
        HStack {
            TextField("Distraction", text: $name)
            TextField("Duration", text: $duration).frame(width: 80)
            Button("Add") { add() }.disabled(name.isEmpty)
        }
    }

    private func add() {
        guard let uid = Auth.auth().currentUser?.uid else { return }
        let entry = DistractionEntry(name: name, duration: duration, date: date)
        name = ""; duration = ""
        Task { try? await FirestoreService.shared.addDistraction(entry, uid: uid) }
    }
}
