import SwiftUI
import UserNotifications

enum PomodoroMode: String, CaseIterable {
    case focus = "Focus"
    case shortBreak = "Short Break"
    case longBreak = "Long Break"

    var defaultMinutes: Int {
        switch self { case .focus: return 25; case .shortBreak: return 5; case .longBreak: return 15 }
    }

    var color: Color {
        switch self { case .focus: return .indigo; case .shortBreak: return .green; case .longBreak: return .blue }
    }
}

struct PomodoroView: View {
    @State private var mode: PomodoroMode = .focus
    @State private var totalSeconds: Int = 25 * 60
    @State private var remaining: Int = 25 * 60
    @State private var isRunning = false
    @State private var sessions = 0
    @State private var timer: Timer?
    @State private var showCustomize = false
    @State private var customMinutes: [PomodoroMode: Int] = [:]

    private var progress: Double { Double(totalSeconds - remaining) / Double(totalSeconds) }

    var body: some View {
        ScrollView {
            VStack(spacing: 32) {
                modePicker

                ZStack {
                    Circle()
                        .stroke(mode.color.opacity(0.2), lineWidth: 12)
                    Circle()
                        .trim(from: 0, to: progress)
                        .stroke(mode.color, style: StrokeStyle(lineWidth: 12, lineCap: .round))
                        .rotationEffect(.degrees(-90))
                        .animation(.linear(duration: 1), value: progress)
                    VStack(spacing: 6) {
                        Text(timeString)
                            .font(.system(size: 56, weight: .bold, design: .monospaced))
                        Text(mode.rawValue)
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                }
                .frame(width: 260, height: 260)

                HStack(spacing: 24) {
                    Button { reset() } label: {
                        Image(systemName: "arrow.clockwise")
                            .font(.title2)
                            .foregroundStyle(.secondary)
                    }
                    Button { isRunning ? pause() : start() } label: {
                        Image(systemName: isRunning ? "pause.circle.fill" : "play.circle.fill")
                            .font(.system(size: 56))
                            .foregroundStyle(mode.color)
                    }
                    Button { showCustomize = true } label: {
                        Image(systemName: "slider.horizontal.3")
                            .font(.title2)
                            .foregroundStyle(.secondary)
                    }
                }

                if sessions > 0 {
                    HStack(spacing: 8) {
                        ForEach(0..<sessions, id: \.self) { _ in
                            Image(systemName: "circle.fill")
                                .font(.caption2)
                                .foregroundStyle(.indigo)
                        }
                    }
                    Text("\(sessions) session\(sessions == 1 ? "" : "s") completed")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
            .padding(32)
        }
        .sheet(isPresented: $showCustomize) { CustomizeTimerSheet(customMinutes: $customMinutes) { applyCustom() } }
    }

    private var timeString: String {
        String(format: "%02d:%02d", remaining / 60, remaining % 60)
    }

    private func start() {
        isRunning = true
        timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { _ in
            if remaining > 0 {
                remaining -= 1
            } else {
                timer?.invalidate()
                isRunning = false
                sessions += 1
                scheduleNotification()
            }
        }
    }

    private func pause() {
        isRunning = false
        timer?.invalidate()
    }

    private func reset() {
        timer?.invalidate()
        isRunning = false
        let mins = customMinutes[mode] ?? mode.defaultMinutes
        totalSeconds = mins * 60
        remaining = totalSeconds
    }

    private func applyCustom() {
        if !isRunning { reset() }
    }

    private func scheduleNotification() {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound]) { granted, _ in
            guard granted else { return }
            let content = UNMutableNotificationContent()
            content.title = mode == .focus ? "Focus session complete!" : "Break time over!"
            content.body = mode == .focus ? "Time for a break." : "Ready to focus again?"
            content.sound = .default
            let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 0.5, repeats: false)
            let request = UNNotificationRequest(identifier: UUID().uuidString, content: content, trigger: trigger)
            UNUserNotificationCenter.current().add(request)
        }
    }
}

struct CustomizeTimerSheet: View {
    @Binding var customMinutes: [PomodoroMode: Int]
    var onApply: () -> Void
    @Environment(\.dismiss) var dismiss
    @State private var focusMins = 25
    @State private var shortMins = 5
    @State private var longMins = 15

    var body: some View {
        NavigationStack {
            Form {
                Section("Durations (minutes)") {
                    Stepper("Focus: \(focusMins) min", value: $focusMins, in: 1...120)
                    Stepper("Short Break: \(shortMins) min", value: $shortMins, in: 1...60)
                    Stepper("Long Break: \(longMins) min", value: $longMins, in: 1...60)
                }
            }
            .navigationTitle("Customize Timer")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancel") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Apply") {
                        customMinutes[.focus] = focusMins
                        customMinutes[.shortBreak] = shortMins
                        customMinutes[.longBreak] = longMins
                        onApply()
                        dismiss()
                    }
                }
            }
            .onAppear {
                focusMins = customMinutes[.focus] ?? 25
                shortMins = customMinutes[.shortBreak] ?? 5
                longMins = customMinutes[.longBreak] ?? 15
            }
        }
    }
}

extension PomodoroView {
    private var modePicker: some View {
        HStack(spacing: 0) {
            ForEach(PomodoroMode.allCases, id: \.self) { m in
                Button(m.rawValue) {
                    mode = m
                    timer?.invalidate()
                    isRunning = false
                    let mins = customMinutes[m] ?? m.defaultMinutes
                    totalSeconds = mins * 60
                    remaining = totalSeconds
                }
                .font(.footnote.weight(.medium))
                .foregroundStyle(mode == m ? .white : m.color)
                .padding(.vertical, 8)
                .frame(maxWidth: .infinity)
                .background(mode == m ? m.color : m.color.opacity(0.1),
                             in: RoundedRectangle(cornerRadius: 10))
            }
        }
        .padding(4)
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 14))
    }
}
