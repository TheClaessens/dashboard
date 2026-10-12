// swift-tools-version: 5.9
import PackageDescription
import AppleProductTypes

let package = Package(
    name: "Puzzle",
    platforms: [.iOS("17.0")],
    products: [
        .iOSApplication(
            name: "Puzzle",
            targets: ["AppModule"],
            bundleIdentifier: "com.claessens.kidspuzzle",
            displayVersion: "1.0",
            bundleVersion: "1",
            accentColor: .presetColor(.orange),
            supportedDeviceFamilies: [.pad, .phone],
            supportedInterfaceOrientations: [
                .portrait, .landscapeRight, .landscapeLeft, .portraitUpsideDown(.when(deviceFamilies: [.pad]))
            ]
        )
    ],
    targets: [
        .executableTarget(name: "AppModule", path: ".")
    ]
)
