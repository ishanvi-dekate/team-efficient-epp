import SwiftUI
import FirebaseAuth
import PhotosUI

struct ProfileView: View {
    @EnvironmentObject var appState: AppState
    @State private var isEditing = false
    @State private var editedProfile: UserProfile?
    @State private var photoItem: PhotosPickerItem?
    @State private var isSaving = false

    private var profile: UserProfile? { isEditing ? editedProfile : appState.userProfile }

    var body: some View {
        NavigationStack {
            if let profile {
                ScrollView {
                    VStack(spacing: 0) {
                        bannerHeader(profile: profile)
                        profileContent(profile: profile)
                    }
                }
                .navigationTitle("Profile")
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .topBarTrailing) {
                        if isEditing {
                            Button("Save") { save() }
                                .disabled(isSaving)
                        } else {
                            Button("Edit") {
                                editedProfile = profile
                                isEditing = true
                            }
                        }
                    }
                    if isEditing {
                        ToolbarItem(placement: .topBarLeading) {
                            Button("Cancel") { isEditing = false }
                        }
                    }
                }
            } else {
                ProgressView()
            }
        }
    }

    @ViewBuilder
    private func bannerHeader(profile: UserProfile) -> some View {
        ZStack(alignment: .bottomLeading) {
            LinearGradient(
                colors: profile.bannerPreset.gradient.compactMap { Color(hex: $0) },
                startPoint: .topLeading, endPoint: .bottomTrailing
            )
            .frame(height: 140)

            HStack(alignment: .bottom, spacing: 16) {
                avatarView(profile: profile)
                    .offset(y: 30)
                Spacer()
                if isEditing {
                    bannerPresetPicker
                        .padding(.bottom, 8)
                        .padding(.trailing, 16)
                }
            }
            .padding(.leading, 20)
        }
        .padding(.bottom, 36)
    }

    @ViewBuilder
    private func avatarView(profile: UserProfile) -> some View {
        ZStack {
            if let photoURL = profile.photoURL, let data = Data(base64Encoded: photoURL),
               let uiImage = UIImage(data: data) {
                Image(uiImage: uiImage)
                    .resizable()
                    .scaledToFill()
                    .frame(width: 80, height: 80)
                    .clipShape(Circle())
            } else {
                Circle()
                    .fill(.indigo.opacity(0.3))
                    .frame(width: 80, height: 80)
                    .overlay {
                        Text(String(profile.username.prefix(1)).uppercased())
                            .font(.title.bold())
                            .foregroundStyle(.indigo)
                    }
            }
            Circle().stroke(.background, lineWidth: 4).frame(width: 88, height: 88)
        }
        .overlay(alignment: .bottomTrailing) {
            if isEditing {
                PhotosPicker(selection: $photoItem, matching: .images) {
                    Image(systemName: "camera.circle.fill")
                        .font(.title3)
                        .foregroundStyle(.white, .indigo)
                }
            }
        }
        .onChange(of: photoItem) { loadPhoto() }
    }

    private var bannerPresetPicker: some View {
        HStack(spacing: 8) {
            ForEach(UserProfile.BannerPreset.allCases, id: \.self) { preset in
                Button {
                    editedProfile?.bannerPreset = preset
                } label: {
                    Circle()
                        .fill(LinearGradient(
                            colors: preset.gradient.compactMap { Color(hex: $0) },
                            startPoint: .topLeading, endPoint: .bottomTrailing
                        ))
                        .frame(width: 24, height: 24)
                        .overlay {
                            if editedProfile?.bannerPreset == preset {
                                Circle().stroke(.white, lineWidth: 2)
                            }
                        }
                }
            }
        }
    }

    @ViewBuilder
    private func profileContent(profile: UserProfile) -> some View {
        VStack(alignment: .leading, spacing: 20) {
            if isEditing, var ep = editedProfile {
                Group {
                    LabeledContent("Username") {
                        TextField("Username", text: Binding(
                            get: { editedProfile?.username ?? "" },
                            set: { editedProfile?.username = $0 }
                        ))
                        .multilineTextAlignment(.trailing)
                    }
                    LabeledContent("Bedtime") {
                        TextField("e.g. 11pm", text: Binding(
                            get: { editedProfile?.bedtime ?? "" },
                            set: { editedProfile?.bedtime = $0 }
                        ))
                        .multilineTextAlignment(.trailing)
                    }
                    LabeledContent("Sleep Hours") {
                        TextField("e.g. 7 hours", text: Binding(
                            get: { editedProfile?.sleepHours ?? "" },
                            set: { editedProfile?.sleepHours = $0 }
                        ))
                        .multilineTextAlignment(.trailing)
                    }
                }
                .padding(.horizontal)
            } else {
                // Display mode
                Text(profile.username)
                    .font(.title2.bold())
                    .padding(.horizontal)

                Divider().padding(.horizontal)

                profileInfoSection(profile: profile)
            }
        }
        .padding(.top, 8)
    }

    private func profileInfoSection(profile: UserProfile) -> some View {
        VStack(alignment: .leading, spacing: 16) {
            ProfileSection(title: "About") {
                ProfileRow(label: "Bedtime", value: profile.bedtime)
                ProfileRow(label: "Sleep", value: profile.sleepHours)
                ProfileRow(label: "Hardest Class", value: profile.homeworkClass)
            }

            ProfileSection(title: "Courses") {
                FlowLayout(items: profile.courses)
            }

            if !profile.extracurriculars.isEmpty {
                ProfileSection(title: "Extracurriculars") {
                    Text(profile.extracurriculars).font(.subheadline)
                }
            }

            ProfileSection(title: "Goals") {
                if !profile.goal1.isEmpty { Text("1. \(profile.goal1)").font(.subheadline) }
                if !profile.goal2.isEmpty { Text("2. \(profile.goal2)").font(.subheadline) }
                if !profile.goal3.isEmpty { Text("3. \(profile.goal3)").font(.subheadline) }
            }

            if !profile.stress.isEmpty {
                ProfileSection(title: "Biggest Stressor") {
                    Text(profile.stress).font(.subheadline)
                }
            }
        }
        .padding(.horizontal)
        .padding(.bottom, 32)
    }

    private func loadPhoto() {
        Task {
            guard let item = photoItem,
                  let data = try? await item.loadTransferable(type: Data.self),
                  let uiImage = UIImage(data: data),
                  let compressed = compressImage(uiImage) else { return }
            let base64 = compressed.base64EncodedString()
            await MainActor.run { editedProfile?.photoURL = base64 }
        }
    }

    private func compressImage(_ image: UIImage) -> Data? {
        let maxSize: CGFloat = 800
        let ratio = min(maxSize / image.size.width, maxSize / image.size.height, 1)
        let newSize = CGSize(width: image.size.width * ratio, height: image.size.height * ratio)
        return UIGraphicsImageRenderer(size: newSize).jpegData(withCompressionQuality: 0.75) { _ in
            image.draw(in: CGRect(origin: .zero, size: newSize))
        }
    }

    private func save() {
        guard let profile = editedProfile, let uid = Auth.auth().currentUser?.uid else { return }
        isSaving = true
        Task {
            try? await FirestoreService.shared.updateUserProfile(uid: uid, data: profile.toDictionary())
            await MainActor.run { isEditing = false; isSaving = false }
        }
    }
}

struct ProfileSection<Content: View>: View {
    var title: String
    @ViewBuilder var content: Content

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title)
                .font(.caption.weight(.semibold))
                .foregroundStyle(.secondary)
                .textCase(.uppercase)
            content
        }
    }
}

struct ProfileRow: View {
    var label: String
    var value: String

    var body: some View {
        HStack {
            Text(label).font(.subheadline).foregroundStyle(.secondary)
            Spacer()
            Text(value).font(.subheadline)
        }
    }
}

struct FlowLayout: View {
    var items: [String]

    var body: some View {
        LazyVGrid(columns: [GridItem(.adaptive(minimum: 80))], alignment: .leading, spacing: 8) {
            ForEach(items, id: \.self) { item in
                Text(item)
                    .font(.caption.weight(.medium))
                    .padding(.horizontal, 10)
                    .padding(.vertical, 5)
                    .background(.indigo.opacity(0.12), in: Capsule())
                    .foregroundStyle(.indigo)
            }
        }
    }
}
