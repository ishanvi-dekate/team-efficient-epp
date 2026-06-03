import SwiftUI
import FirebaseCore
import GoogleSignIn

@main
struct EfficientEPPApp: App {
    @StateObject private var appState = AppState()

    init() {
        FirebaseApp.configure()
    }

    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(appState)
                .onOpenURL { url in
                    GIDSignIn.sharedInstance.handle(url)
                }
        }
    }
}

struct RootView: View {
    @EnvironmentObject var appState: AppState

    var body: some View {
        Group {
            if appState.isLoading {
                SplashView()
            } else if appState.currentUser == nil {
                LoginView()
            } else if appState.needsOnboarding {
                OnboardingView()
            } else {
                MainTabView()
            }
        }
        .animation(.easeInOut(duration: 0.3), value: appState.currentUser?.uid)
        .animation(.easeInOut(duration: 0.3), value: appState.isLoading)
    }
}

struct SplashView: View {
    var body: some View {
        ZStack {
            Color("Background").ignoresSafeArea()
            VStack(spacing: 16) {
                Image(systemName: "sparkles")
                    .font(.system(size: 60))
                    .foregroundStyle(.indigo)
                Text("efficient.epp")
                    .font(.largeTitle.bold())
                    .foregroundStyle(.primary)
                ProgressView()
                    .padding(.top, 8)
            }
        }
    }
}
