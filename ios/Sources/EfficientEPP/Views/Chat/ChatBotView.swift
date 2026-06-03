import SwiftUI
import FirebaseAuth
import FirebaseFirestore

enum AIMode: String, CaseIterable {
    case tutor = "Tutor"
    case quick = "Quick Help"
    case writing = "Writing Coach"
    case motivator = "Motivator"

    var systemPrompt: String {
        switch self {
        case .tutor:
            return "You are Eppy, a Socratic tutor. Never give direct answers. Guide with questions. Help students think, not just get answers."
        case .quick:
            return "You are Eppy, a quick help assistant. Give clear, direct answers with brief explanations."
        case .writing:
            return "You are Eppy, a writing coach. Give feedback on structure, clarity, and argument without rewriting the student's work."
        case .motivator:
            return "You are Eppy, an encouraging motivator. Be positive, brief, and uplifting. Acknowledge struggles and celebrate progress."
        }
    }
}

struct ChatBotView: View {
    @Environment(\.dismiss) var dismiss
    @EnvironmentObject var appState: AppState
    @State private var messages: [ChatMessage] = []
    @State private var inputText = ""
    @State private var isLoading = false
    @State private var mode: AIMode = .tutor
    @State private var listener: ListenerRegistration?
    @State private var showClearAlert = false

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                modePicker
                    .padding(.horizontal)
                    .padding(.vertical, 8)

                Divider()

                ScrollViewReader { proxy in
                    ScrollView {
                        LazyVStack(spacing: 12) {
                            ForEach(messages) { msg in
                                MessageBubble(message: msg)
                            }
                            if isLoading {
                                HStack {
                                    ProgressView()
                                    Text("Eppy is thinking…")
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                    Spacer()
                                }
                                .padding(.horizontal)
                            }
                        }
                        .padding()
                        .id("bottom")
                    }
                    .onChange(of: messages.count) {
                        withAnimation { proxy.scrollTo("bottom") }
                    }
                }

                Divider()

                HStack(spacing: 12) {
                    TextField("Ask Eppy…", text: $inputText, axis: .vertical)
                        .lineLimit(4)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 8)
                        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 20))
                    Button {
                        send()
                    } label: {
                        Image(systemName: "arrow.up.circle.fill")
                            .font(.system(size: 32))
                            .foregroundStyle(inputText.isEmpty || isLoading ? .secondary : .indigo)
                    }
                    .disabled(inputText.trimmingCharacters(in: .whitespaces).isEmpty || isLoading)
                }
                .padding(.horizontal)
                .padding(.vertical, 10)
            }
            .navigationTitle("Eppy")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Done") { dismiss() }
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button { showClearAlert = true } label: {
                        Image(systemName: "trash")
                    }
                }
            }
            .alert("Clear Chat?", isPresented: $showClearAlert) {
                Button("Clear", role: .destructive) { clearHistory() }
                Button("Cancel", role: .cancel) {}
            }
        }
        .onAppear { setupListener() }
        .onDisappear { listener?.remove() }
    }

    private var modePicker: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                ForEach(AIMode.allCases, id: \.self) { m in
                    Button(m.rawValue) { mode = m }
                        .font(.caption.weight(.medium))
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .background(mode == m ? .indigo : .indigo.opacity(0.1),
                                     in: Capsule())
                        .foregroundStyle(mode == m ? .white : .indigo)
                }
            }
        }
    }

    private func send() {
        let text = inputText.trimmingCharacters(in: .whitespaces)
        guard !text.isEmpty, let uid = Auth.auth().currentUser?.uid else { return }
        inputText = ""
        isLoading = true

        let userMsg = ChatMessage(role: .user, text: text)
        Task {
            try? await FirestoreService.shared.saveChatMessage(userMsg, uid: uid)
            do {
                let systemPrompt = buildSystemPrompt()
                let reply = try await GeminiService.shared.chat(
                    systemPrompt: systemPrompt,
                    history: messages,
                    userMessage: text
                )
                let assistantMsg = ChatMessage(role: .assistant, text: reply)
                try? await FirestoreService.shared.saveChatMessage(assistantMsg, uid: uid)
            } catch {
                let errMsg = ChatMessage(role: .assistant, text: error.localizedDescription)
                try? await FirestoreService.shared.saveChatMessage(errMsg, uid: uid)
            }
            await MainActor.run { isLoading = false }
        }
    }

    private func buildSystemPrompt() -> String {
        var prompt = mode.systemPrompt
        if let profile = appState.userProfile {
            prompt += "\n\nStudent context: Name: \(profile.username). Courses: \(profile.courses.joined(separator: ", ")). Biggest stressor: \(profile.stress). Goals: \(profile.goal1), \(profile.goal2), \(profile.goal3)."
        }
        prompt += "\n\nToday is \(Date.now.formatted(date: .complete, time: .omitted))."
        return prompt
    }

    private func setupListener() {
        guard let uid = Auth.auth().currentUser?.uid else { return }
        listener = FirestoreService.shared.chatHistoryListener(uid: uid) { msgs in
            messages = msgs
        }
    }

    private func clearHistory() {
        guard let uid = Auth.auth().currentUser?.uid else { return }
        Task { try? await FirestoreService.shared.clearChatHistory(uid: uid) }
    }
}

struct MessageBubble: View {
    var message: ChatMessage

    var body: some View {
        HStack(alignment: .bottom, spacing: 8) {
            if message.role == .assistant {
                Image(systemName: "sparkles")
                    .font(.caption)
                    .foregroundStyle(.indigo)
                    .padding(6)
                    .background(.indigo.opacity(0.12), in: Circle())
            }

            Text(message.text)
                .font(.subheadline)
                .padding(.horizontal, 14)
                .padding(.vertical, 10)
                .background(message.role == .user ? Color.indigo : Color(.systemGray6),
                             in: RoundedRectangle(cornerRadius: 18))
                .foregroundStyle(message.role == .user ? .white : .primary)
                .frame(maxWidth: 300, alignment: message.role == .user ? .trailing : .leading)

            if message.role == .user { Spacer() }
        }
        .frame(maxWidth: .infinity, alignment: message.role == .user ? .trailing : .leading)
    }
}
