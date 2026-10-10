import SwiftUI

/// A quiet lock button. It only fires after being held for 2 seconds while a ring fills.
struct ParentGateButton: View {
    let onUnlock: () -> Void

    @State private var progress: CGFloat = 0

    var body: some View {
        ZStack {
            Circle()
                .fill(Color.white.opacity(0.45))
            Circle()
                .trim(from: 0, to: progress)
                .stroke(Theme.accent, style: StrokeStyle(lineWidth: 5, lineCap: .round))
                .rotationEffect(.degrees(-90))
                .padding(3)
            Image(systemName: "lock.fill")
                .font(.system(size: 20, weight: .semibold))
                .foregroundColor(Theme.ink.opacity(0.55))
        }
        .frame(width: 56, height: 56)
        .contentShape(Circle())
        .onLongPressGesture(
            minimumDuration: 2.0,
            maximumDistance: 60,
            pressing: { isPressing in
                if isPressing {
                    withAnimation(.linear(duration: 2.0)) {
                        progress = 1.0
                    }
                } else {
                    withAnimation(.easeOut(duration: 0.2)) {
                        progress = 0.0
                    }
                }
            },
            perform: {
                progress = 0.0
                onUnlock()
            }
        )
    }
}
