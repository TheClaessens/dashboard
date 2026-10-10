import SwiftUI
import UIKit

/// State of the piece the child is currently dragging.
struct ActiveDrag: Equatable {
    var piece: Int
    var slot: Int
    /// Centre of the piece body, in the "puzzle" coordinate space.
    var center: CGPoint
    /// Offset between the finger and the piece centre when the drag began.
    var grab: CGSize
    var scale: CGFloat
    /// True while the piece is animating to its final position (snap or return).
    var settling: Bool
}

/// The child's screen: board, progress bar, pile. No text anywhere.
@MainActor
struct PuzzleView: View {
    @StateObject private var session: PuzzleSession
    @State private var active: ActiveDrag? = nil
    @Environment(\.scenePhase) private var scenePhase

    let onExit: () -> Void

    init(record: PuzzleRecord, store: PuzzleStore, onExit: @escaping () -> Void) {
        _session = StateObject(wrappedValue: PuzzleSession(record: record, store: store))
        self.onExit = onExit
    }

    var body: some View {
        GeometryReader { proxy in
            content(size: proxy.size)
        }
        .background(Theme.cream.ignoresSafeArea())
        .statusBarHidden(true)
        .persistentSystemOverlays(.hidden)
        .defersSystemGestures(on: .all)
        .task {
            await session.load()
        }
    }

    private func content(size: CGSize) -> some View {
        let aspect: CGFloat = session.geometry?.aspect ?? 1.5
        let layout = PuzzleLayout.make(size: size, cols: session.record.cols, aspect: aspect)
        return ZStack {
            stageLayer(layout: layout)
            buttonLayer(layout: layout)
            celebrationLayer(size: size)
        }
        .frame(width: size.width, height: size.height)
        .coordinateSpace(name: Theme.puzzleSpace)
        .onChange(of: layout.slotCount, initial: true) { _, newValue in
            session.setSlotCount(newValue)
        }
        .onChange(of: scenePhase) { _, phase in
            if phase != .active {
                active = nil
            }
        }
    }

    @ViewBuilder
    private func stageLayer(layout: PuzzleLayout) -> some View {
        if let geometry = session.geometry {
            PlayfieldView(session: session, layout: layout, geometry: geometry, active: $active)
        } else {
            LoadingPuzzleView()
                .position(x: layout.size.width / 2, y: layout.size.height / 2)
        }
    }

    @ViewBuilder
    private func buttonLayer(layout: PuzzleLayout) -> some View {
        if !session.celebrate {
            CircleIconButton(systemName: "house.fill", action: onExit)
                .position(layout.homeCenter)
            if session.geometry != nil && !session.isComplete {
                CircleIconButton(systemName: session.showGhost ? "eye.fill" : "eye.slash.fill") {
                    session.showGhost.toggle()
                }
                .position(layout.eyeCenter)
            }
        }
    }

    @ViewBuilder
    private func celebrationLayer(size: CGSize) -> some View {
        if session.celebrate {
            CelebrationView(onTap: onExit)
                .frame(width: size.width, height: size.height)
        }
    }
}

// MARK: - Playfield

/// Board + progress bar + pile + the piece being dragged.
@MainActor
struct PlayfieldView: View {
    @ObservedObject var session: PuzzleSession
    let layout: PuzzleLayout
    let geometry: PuzzleGeometry
    @Binding var active: ActiveDrag?

    private var pieceScale: CGFloat {
        return layout.boardRect.width / geometry.sourceWidth
    }

    private var pieceSize: CGSize {
        return CGSize(width: geometry.pieceWidth * pieceScale, height: geometry.pieceHeight * pieceScale)
    }

    var body: some View {
        ZStack {
            BoardView(session: session, geometry: geometry, size: layout.boardRect.size)
                .position(x: layout.boardRect.midX, y: layout.boardRect.midY)
            ProgressBar(progress: session.progress)
                .frame(width: layout.progressRect.width, height: layout.progressRect.height)
                .position(x: layout.progressRect.midX, y: layout.progressRect.midY)
            pileLayer
            dragLayer
        }
        .frame(width: layout.size.width, height: layout.size.height)
    }

    private var pileLayer: some View {
        PileView(session: session, layout: layout, geometry: geometry, active: $active)
            .opacity(session.isComplete ? 0.0 : 1.0)
            .allowsHitTesting(!session.isComplete)
            .animation(.easeOut(duration: 0.5), value: session.isComplete)
    }

    @ViewBuilder
    private var dragLayer: some View {
        if let drag = active, drag.piece < session.pieceImages.count {
            DraggedPieceOverlay(image: session.pieceImages[drag.piece], size: pieceSize, drag: drag)
        }
    }
}

// MARK: - Progress bar

struct ProgressBar: View {
    let progress: Double

    var body: some View {
        GeometryReader { geo in
            ZStack(alignment: .leading) {
                Capsule()
                    .fill(Color.black.opacity(0.08))
                Capsule()
                    .fill(Theme.accent)
                    .frame(width: max(geo.size.height, geo.size.width * CGFloat(progress)))
                    .opacity(progress > 0 ? 1.0 : 0.0)
            }
        }
        .animation(.easeOut(duration: 0.35), value: progress)
    }
}

// MARK: - Loading

struct LoadingPuzzleView: View {
    @State private var spinning: Bool = false

    var body: some View {
        Image(systemName: "puzzlepiece.extension.fill")
            .font(.system(size: 96))
            .foregroundColor(Theme.accent.opacity(0.85))
            .rotationEffect(.degrees(spinning ? 12 : -12))
            .scaleEffect(spinning ? 1.08 : 0.94)
            .animation(.easeInOut(duration: 0.8).repeatForever(autoreverses: true), value: spinning)
            .onAppear {
                spinning = true
            }
    }
}

// MARK: - Dragged piece

struct DraggedPieceOverlay: View {
    let image: UIImage
    let size: CGSize
    let drag: ActiveDrag

    var body: some View {
        Image(uiImage: image)
            .resizable()
            .frame(width: size.width, height: size.height)
            .scaleEffect(drag.scale)
            .shadow(color: Color.black.opacity(0.3), radius: 10, x: 0, y: 8)
            .position(x: drag.center.x, y: drag.center.y)
            .allowsHitTesting(false)
    }
}
