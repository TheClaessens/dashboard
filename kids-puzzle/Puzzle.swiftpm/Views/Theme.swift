import SwiftUI
import UIKit

extension Color {
    /// `Color(hex: 0xF6EFE6)`
    init(hex: UInt32, opacity: Double = 1.0) {
        let r = Double((hex >> 16) & 0xFF) / 255.0
        let g = Double((hex >> 8) & 0xFF) / 255.0
        let b = Double(hex & 0xFF) / 255.0
        self.init(.sRGB, red: r, green: g, blue: b, opacity: opacity)
    }
}

extension UIColor {
    convenience init(hex: UInt32, alpha: CGFloat = 1.0) {
        let r = CGFloat((hex >> 16) & 0xFF) / 255.0
        let g = CGFloat((hex >> 8) & 0xFF) / 255.0
        let b = CGFloat(hex & 0xFF) / 255.0
        self.init(red: r, green: g, blue: b, alpha: alpha)
    }
}

enum Theme {
    static let cream = Color(hex: 0xF6EFE6)
    static let tray = Color(hex: 0xE8D9C4)
    static let board = Color.white
    static let accent = Color(hex: 0xFF8A3D)
    static let ink = Color(hex: 0x6B4F3A)
    static let star = Color(hex: 0xFFC93C)

    /// Name of the coordinate space shared by everything on the puzzle screen.
    static let puzzleSpace: String = "puzzle"
}

/// Gentle press feedback for buttons.
struct PressScaleButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.92 : 1.0)
            .animation(.easeOut(duration: 0.12), value: configuration.isPressed)
    }
}

/// Round translucent icon button (60pt by default, so it is easy to hit).
struct CircleIconButton: View {
    let systemName: String
    var diameter: CGFloat = 60
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Image(systemName: systemName)
                .font(.system(size: 26, weight: .semibold))
                .foregroundColor(Theme.ink)
                .frame(width: diameter, height: diameter)
                .background(Circle().fill(Color.white.opacity(0.78)))
                .overlay(Circle().stroke(Color.black.opacity(0.06), lineWidth: 1))
                .shadow(color: Color.black.opacity(0.12), radius: 4, x: 0, y: 2)
        }
        .buttonStyle(PressScaleButtonStyle())
    }
}
