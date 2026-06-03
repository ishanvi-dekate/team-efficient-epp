import SwiftUI
import FirebaseAuth

struct LoginView: View {
    @EnvironmentObject var appState: AppState
    @State private var showEmailLogin = false
    @State private var showSignUp = false
    @State private var errorMessage: String?
    @State private var isLoading = false

    var body: some View {
        ZStack {
            LinearGradient(colors: [Color(hex: "#0f0c29"), Color(hex: "#302b63"), Color(hex: "#24243e")],
                           startPoint: .topLeading, endPoint: .bottomTrailing)
                .ignoresSafeArea()

            VStack(spacing: 32) {
                Spacer()

                VStack(spacing: 12) {
                    Image(systemName: "sparkles")
                        .font(.system(size: 56))
                        .foregroundStyle(.white)
                    Text("efficient.epp")
                        .font(.system(size: 36, weight: .bold))
                        .foregroundStyle(.white)
                    Text("Your student productivity companion")
                        .font(.subheadline)
                        .foregroundStyle(.white.opacity(0.7))
                }

                Spacer()

                VStack(spacing: 16) {
                    if let error = errorMessage {
                        Text(error)
                            .font(.footnote)
                            .foregroundStyle(.red)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal)
                    }

                    GoogleSignInButton(isLoading: $isLoading) {
                        signInWithGoogle()
                    }

                    Button("Sign in with Email") {
                        showEmailLogin = true
                    }
                    .font(.subheadline.weight(.medium))
                    .foregroundStyle(.white.opacity(0.85))
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(.white.opacity(0.1), in: RoundedRectangle(cornerRadius: 14))

                    Button("Create Account") {
                        showSignUp = true
                    }
                    .font(.subheadline)
                    .foregroundStyle(.white.opacity(0.6))
                }
                .padding(.horizontal, 32)
                .padding(.bottom, 48)
            }
        }
        .sheet(isPresented: $showEmailLogin) { EmailLoginView() }
        .sheet(isPresented: $showSignUp) { SignUpView() }
    }

    private func signInWithGoogle() {
        guard let scene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
              let root = scene.windows.first?.rootViewController else { return }
        isLoading = true
        errorMessage = nil
        Task {
            do {
                let (_, isNew) = try await AuthService.shared.signInWithGoogle(presenting: root)
                if isNew {
                    await MainActor.run { appState.needsOnboarding = true }
                }
            } catch {
                await MainActor.run {
                    errorMessage = error.localizedDescription
                    isLoading = false
                }
            }
        }
    }
}

struct GoogleSignInButton: View {
    @Binding var isLoading: Bool
    var action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 10) {
                if isLoading {
                    ProgressView().tint(.black)
                } else {
                    Image(systemName: "g.circle.fill")
                        .font(.title3)
                        .foregroundStyle(.red)
                    Text("Continue with Google")
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(.black)
                }
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
            .background(.white, in: RoundedRectangle(cornerRadius: 14))
        }
        .disabled(isLoading)
    }
}
