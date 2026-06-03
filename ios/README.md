# efficient.epp — iOS App

Native iOS app built with Swift & SwiftUI, mirroring the web app's full feature set.

## Features
- Google Sign-In + Email/Password authentication
- 3-step onboarding profile setup
- **Home**: Dashboard with stress/sleep sparklines and task summary
- **Tracker**: Daily to-do list, activity log, distraction tracker with date picker
- **Mental Check**: Weekly check-in form (sleep, stress, day rating, worries) with history
- **Study Hub**: Pomodoro timer, exam countdown, weighted grade tracker with final exam calculator
- **Profile**: Customizable banner, avatar upload, edit all profile fields
- **Settings**: Focus mode, notification preferences, account management, danger zone
- **Eppy AI Chat**: 4 modes (Tutor, Quick Help, Writing Coach, Motivator) powered by Gemini 2.0 Flash

## Setup

### 1. Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com)
2. Add an iOS app to your existing project (use bundle ID `com.yourname.efficientepp`)
3. Download `GoogleService-Info.plist` and add it to `Sources/EfficientEPP/Resources/`
4. Enable **Authentication** → Google and Email/Password sign-in methods
5. Enable **Cloud Firestore**

### 2. Google Sign-In URL Scheme
In your Xcode project's `Info.plist`, add a URL scheme:
- Open the project target → Info → URL Types
- Add a URL type with the `REVERSED_CLIENT_ID` from your `GoogleService-Info.plist`

### 3. Gemini API Key
In `Info.plist`, add a string key `GEMINI_API_KEY` with your Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

### 4. Open in Xcode
```bash
cd ios
open Package.swift
```
Xcode will resolve Swift Package Manager dependencies automatically (Firebase iOS SDK, GoogleSignIn).

### 5. Run
Select an iOS 17+ simulator or device and press Run.

## Architecture

```
Sources/EfficientEPP/
├── App/
│   ├── EfficientEPPApp.swift   # @main entry point, Firebase init
│   ├── AppState.swift          # Auth state, user profile, global state
│   └── Extensions.swift        # Color(hex:) and DateFormatter helpers
├── Models/                     # Data models (Firestore-mapped structs)
├── Services/
│   ├── AuthService.swift       # Firebase Auth + Google Sign-In
│   ├── FirestoreService.swift  # All Firestore CRUD + real-time listeners
│   └── GeminiService.swift     # Gemini 2.0 Flash API client
└── Views/
    ├── Auth/                   # Login, Sign Up, Onboarding
    ├── Home/                   # Dashboard with stat cards
    ├── Tracker/                # Todo + Activities + Distractions
    ├── Mental/                 # Mental check-in + history
    ├── Study/                  # Pomodoro, Exam countdown, Grade tracker
    ├── Profile/                # Profile view + editing
    ├── Settings/               # Settings, account management
    ├── Chat/                   # Eppy AI chatbot
    └── Components/             # Shared UI (MainTabView, SparklineView)
```

## Firestore Security Rules
The iOS app uses the same Firestore database as the web app. Ensure your rules allow authenticated users to read/write only their own `users/{uid}` subtree.
