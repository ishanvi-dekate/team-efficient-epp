import SwiftUI
import FirebaseAuth
import FirebaseFirestore

struct HomeView: View {
    @EnvironmentObject var appState: AppState
    @State private var mentalChecks: [MentalCheck] = []
    @State private var todayTodos: [TodoItem] = []
    @State private var mentalListener: ListenerRegistration?
    @State private var todoListener: ListenerRegistration?
    @State private var showChat = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    welcomeBanner
                    statCards
                    quickActions
                }
                .padding()
            }
            .navigationTitle("Home")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button { showChat = true } label: {
                        Image(systemName: "bubble.left.and.bubble.right.fill")
                            .foregroundStyle(.indigo)
                    }
                }
            }
            .sheet(isPresented: $showChat) { ChatBotView() }
        }
        .onAppear { setupListeners() }
        .onDisappear { teardown() }
    }

    private var welcomeBanner: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("Hey, \(appState.userProfile?.username ?? "there") 👋")
                .font(.title2.bold())
            Text(Date.now.formatted(date: .complete, time: .omitted))
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(20)
        .background(.indigo.opacity(0.12), in: RoundedRectangle(cornerRadius: 18))
    }

    private var statCards: some View {
        VStack(spacing: 14) {
            // Stress card
            StatCard(
                title: "Stress Levels",
                icon: "bolt.fill",
                iconColor: .orange,
                values: mentalChecks.map { Double($0.stressLevel) }.reversed(),
                subtitle: stressSubtitle
            )
            // Sleep card
            StatCard(
                title: "Sleep Hours",
                icon: "moon.fill",
                iconColor: .indigo,
                values: mentalChecks.map { $0.sleepHours }.reversed(),
                subtitle: sleepSubtitle
            )
            // Tasks card
            HStack(spacing: 14) {
                VStack(alignment: .leading, spacing: 4) {
                    Label("Tasks Today", systemImage: "checklist")
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(.secondary)
                    Text("\(todayTodos.filter { !$0.done }.count) remaining")
                        .font(.title3.bold())
                    Text("\(todayTodos.filter { $0.done }.count) completed")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                Spacer()
                VStack(alignment: .trailing, spacing: 4) {
                    Label("Courses", systemImage: "books.vertical.fill")
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(.secondary)
                    Text("\(appState.userProfile?.courses.count ?? 0)")
                        .font(.title3.bold())
                }
            }
            .padding(16)
            .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 18))
        }
    }

    private var stressSubtitle: String {
        guard let last = mentalChecks.first else { return "No data yet" }
        return "Last: \(last.stressLevel)/5"
    }

    private var sleepSubtitle: String {
        guard let last = mentalChecks.first else { return "No data yet" }
        return String(format: "Last: %.1f hrs", last.sleepHours)
    }

    private var quickActions: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Quick Access")
                .font(.headline)
            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible()), GridItem(.flexible())], spacing: 14) {
                QuickActionTile(icon: "checklist", label: "To-Do", color: .blue)
                QuickActionTile(icon: "book.fill", label: "Study", color: .green)
                QuickActionTile(icon: "heart.fill", label: "Mental", color: .pink)
                QuickActionTile(icon: "person.fill", label: "Profile", color: .purple)
                QuickActionTile(icon: "gearshape.fill", label: "Settings", color: .gray)
                QuickActionTile(icon: "bubble.left.fill", label: "Chat", color: .indigo) {
                    showChat = true
                }
            }
        }
    }

    private func setupListeners() {
        guard let uid = Auth.auth().currentUser?.uid else { return }
        let today = DateFormatter.yyyyMMdd.string(from: .now)
        mentalListener = FirestoreService.shared.mentalChecksListener(uid: uid) { checks in
            mentalChecks = checks
        }
        todoListener = FirestoreService.shared.todosListener(uid: uid, date: today) { todos in
            todayTodos = todos
        }
    }

    private func teardown() {
        mentalListener?.remove()
        todoListener?.remove()
    }
}

struct StatCard: View {
    var title: String
    var icon: String
    var iconColor: Color
    var values: [Double]
    var subtitle: String

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Label(title, systemImage: icon)
                .font(.caption.weight(.semibold))
                .foregroundStyle(iconColor)
            SparklineView(values: values.isEmpty ? [0] : values, color: iconColor)
                .frame(height: 40)
            Text(subtitle)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .padding(16)
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 18))
    }
}

struct QuickActionTile: View {
    var icon: String
    var label: String
    var color: Color
    var action: (() -> Void)? = nil

    var body: some View {
        Button {
            action?()
        } label: {
            VStack(spacing: 8) {
                Image(systemName: icon)
                    .font(.title2)
                    .foregroundStyle(color)
                Text(label)
                    .font(.caption.weight(.medium))
                    .foregroundStyle(.primary)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 16)
            .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 14))
        }
        .buttonStyle(.plain)
    }
}

extension DateFormatter {
    static let yyyyMMdd: DateFormatter = {
        let f = DateFormatter()
        f.dateFormat = "yyyy-MM-dd"
        return f
    }()
}
