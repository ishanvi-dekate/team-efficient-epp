// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "EfficientEPP",
    platforms: [.iOS(.v17)],
    products: [
        .library(name: "EfficientEPP", targets: ["EfficientEPP"])
    ],
    dependencies: [
        .package(
            url: "https://github.com/firebase/firebase-ios-sdk.git",
            from: "10.0.0"
        ),
        .package(
            url: "https://github.com/google/GoogleSignIn-iOS.git",
            from: "7.0.0"
        )
    ],
    targets: [
        .target(
            name: "EfficientEPP",
            dependencies: [
                .product(name: "FirebaseAuth", package: "firebase-ios-sdk"),
                .product(name: "FirebaseFirestore", package: "firebase-ios-sdk"),
                .product(name: "GoogleSignIn", package: "GoogleSignIn-iOS"),
                .product(name: "GoogleSignInSwift", package: "GoogleSignIn-iOS")
            ],
            path: "Sources/EfficientEPP",
            resources: [.process("Resources")]
        )
    ]
)
