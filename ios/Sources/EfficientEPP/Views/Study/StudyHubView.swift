import SwiftUI

struct StudyHubView: View {
    @State private var selectedTab = 0

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                Picker("Study Tool", selection: $selectedTab) {
                    Text("Pomodoro").tag(0)
                    Text("Exams").tag(1)
                    Text("Grades").tag(2)
                }
                .pickerStyle(.segmented)
                .padding(.horizontal)
                .padding(.vertical, 8)

                Divider()

                Group {
                    switch selectedTab {
                    case 0: PomodoroView()
                    case 1: ExamCountdownView()
                    default: GradeTrackerView()
                    }
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            }
            .navigationTitle("Study Hub")
        }
    }
}
