import SwiftUI

/// Confetti + a big star. Tap anywhere (after a short moment) to go back to the shelf.
struct CelebrationView: View {
    let onTap: () -> Void

    @State private var starScale: CGFloat = 0.01
    @State private var wiggle: Bool = false
    @State private var canExit: Bool = false
    @State private var startDate: Date = Date()
    @State private var particles: [ConfettiParticle] = ConfettiParticle.makeAll(count: 120)

    var body: some View {
        ZStack {
            Color.white.opacity(0.001)
            ConfettiView(particles: particles, startDate: startDate)
            starView
        }
        .contentShape(Rectangle())
        .onTapGesture {
            if canExit {
                onTap()
            }
        }
        .onAppear {
            startDate = Date()
            withAnimation(.spring(response: 0.7, dampingFraction: 0.5)) {
                starScale = 1.0
            }
            withAnimation(.easeInOut(duration: 1.1).repeatForever(autoreverses: true)) {
                wiggle = true
            }
            Task { @MainActor in
                _ = try? await Task.sleep(nanoseconds: 1_200_000_000)
                canExit = true
            }
        }
    }

    private var starView: some View {
        Image(systemName: "star.fill")
            .font(.system(size: 200))
            .foregroundColor(Theme.star)
            .shadow(color: Color.black.opacity(0.35), radius: 12, x: 0, y: 8)
            .scaleEffect(starScale)
            .rotationEffect(.degrees(wiggle ? 6 : -6))
            .allowsHitTesting(false)
    }
}

struct ConfettiParticle {
    let x: CGFloat
    let delay: Double
    let duration: Double
    let width: CGFloat
    let height: CGFloat
    let swayAmplitude: CGFloat
    let swayFrequency: Double
    let spin: Double
    let phase: Double
    let colorIndex: Int

    static let palette: [Color] = [
        Color(hex: 0xFF595E),
        Color(hex: 0xFFCA3A),
        Color(hex: 0x8AC926),
        Color(hex: 0x1982C4),
        Color(hex: 0x6A4C93),
        Color(hex: 0xFF8A3D),
        Color(hex: 0xFF70A6)
    ]

    static func makeAll(count: Int) -> [ConfettiParticle] {
        var rng = SeededRandom(seed: 77)
        var result: [ConfettiParticle] = []
        for _ in 0..<count {
            let width: CGFloat = rng.nextCGFloat(in: 10...20)
            let particle = ConfettiParticle(
                x: rng.nextCGFloat(in: 0...1),
                delay: rng.nextDouble() * 1.2,
                duration: 2.4 + rng.nextDouble() * 1.4,
                width: width,
                height: width * rng.nextCGFloat(in: 0.4...0.9),
                swayAmplitude: rng.nextCGFloat(in: 10...50),
                swayFrequency: 1.5 + rng.nextDouble() * 2.5,
                spin: 2.0 + rng.nextDouble() * 6.0,
                phase: rng.nextDouble() * 6.28,
                colorIndex: Int(rng.nextDouble() * Double(palette.count))
            )
            result.append(particle)
        }
        return result
    }
}

/// Particle system drawn with a Canvas; every particle falls once (about 4 s in total).
struct ConfettiView: View {
    let particles: [ConfettiParticle]
    let startDate: Date

    var body: some View {
        TimelineView(.animation) { timeline in
            let elapsed: Double = timeline.date.timeIntervalSince(startDate)
            Canvas { gc, size in
                ConfettiView.draw(particles: particles, elapsed: elapsed, context: gc, size: size)
            }
        }
        .allowsHitTesting(false)
    }

    private static func draw(particles: [ConfettiParticle], elapsed: Double, context: GraphicsContext, size: CGSize) {
        let colorCount: Int = ConfettiParticle.palette.count
        for p in particles {
            let local: Double = elapsed - p.delay
            if local < 0 || local > p.duration { continue }
            let progress: CGFloat = CGFloat(local / p.duration)
            let sway: CGFloat = p.swayAmplitude * CGFloat(sin(local * p.swayFrequency + p.phase))
            let x: CGFloat = p.x * size.width + sway
            let y: CGFloat = -30.0 + progress * (size.height + 60.0)
            let flip: CGFloat = max(0.15, CGFloat(abs(cos(local * p.spin * 0.7 + p.phase))))

            var layer = context
            layer.translateBy(x: x, y: y)
            layer.rotate(by: Angle.radians(local * p.spin + p.phase))
            layer.scaleBy(x: 1.0, y: flip)
            let rect = CGRect(x: -p.width / 2, y: -p.height / 2, width: p.width, height: p.height)
            let color: Color = ConfettiParticle.palette[p.colorIndex % colorCount]
            layer.fill(Path(rect), with: GraphicsContext.Shading.color(color))
        }
    }
}
