import SwiftUI

struct MainTabView: View {
    @State private var selectedTab = 0

    var body: some View {
        TabView(selection: $selectedTab) {
            HomeView()
                .tabItem { Label("Home", systemImage: "house.fill") }
                .tag(0)

            TrackerView()
                .tabItem { Label("To-Do", systemImage: "checklist") }
                .tag(1)

            MentalCheckView()
                .tabItem { Label("Mental", systemImage: "heart.fill") }
                .tag(2)

            StudyHubView()
                .tabItem { Label("Study", systemImage: "book.fill") }
                .tag(3)

            ProfileView()
                .tabItem { Label("Profile", systemImage: "person.fill") }
                .tag(4)

            SettingsView()
                .tabItem { Label("Settings", systemImage: "gearshape.fill") }
                .tag(5)
        }
    }
}
