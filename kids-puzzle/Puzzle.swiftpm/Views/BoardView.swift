import SwiftUI
import UIKit

/// The board: white tray, ghost image, placed pieces, hint glow, final full image.
@MainActor
struct BoardView: View {
    @ObservedObject var session: PuzzleSession
    let geometry: PuzzleGeometry
    /// On-screen size of the board.
    let size: CGSize

    private var scale: CGFloat {
        return size.width / geometry.sourceWidth
    }

    var body: some View {
        ZStack(alignment: .topLeading) {
            boardBackground
            ghostLayer
            piecesLayer
            hintLayer
            completeLayer
        }
        .frame(width: size.width, height: size.height, alignment: .topLeading)
    }

    private var boardBackground: some View {
        RoundedRectangle(cornerRadius: 8, style: .continuous)
            .fill(Theme.board)
            .overlay {
                RoundedRectangle(cornerRadius: 8, style: .continuous)
                    .stroke(Color.black.opacity(0.18), lineWidth: 8)
                    .blur(radius: 5)
                    .offset(x: 0, y: 3)
                    .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
            }
            .shadow(color: Color.black.opacity(0.12), radius: 8, x: 0, y: 4)
            .frame(width: size.width, height: size.height)
    }

    @ViewBuilder
    private var ghostLayer: some View {
        if let full = session.fullImage {
            Image(uiImage: full)
                .resizable()
                .frame(width: size.width, height: size.height)
                .opacity(session.showGhost ? 0.25 : 0.0)
                .animation(.easeInOut(duration: 0.25), value: session.showGhost)
                .allowsHitTesting(false)
        }
    }

    @ViewBuilder
    private var piecesLayer: some View {
        if !session.pieceImages.isEmpty {
            ForEach(session.placedOrder, id: \.self) { index in
                if index < session.pieceImages.count {
                    PlacedPieceView(
                        image: session.pieceImages[index],
                        frame: pieceFrame(for: index),
                        pop: session.lastPlaced == index
                    )
                }
            }
        }
    }

    @ViewBuilder
    private var hintLayer: some View {
        if let hint = session.hintIndex {
            HintGlowView(rect: cellFrame(for: hint))
                .id(hint)
        }
    }

    @ViewBuilder
    private var completeLayer: some View {
        if let full = session.fullImage {
            Image(uiImage: full)
                .resizable()
                .frame(width: size.width, height: size.height)
                .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
                .opacity(session.isComplete ? 1.0 : 0.0)
                .animation(.easeInOut(duration: 1.0), value: session.isComplete)
                .allowsHitTesting(false)
        }
    }

    // MARK: - Geometry helpers

    /// The piece image frame (including knob padding) in board coordinates.
    private func pieceFrame(for index: Int) -> CGRect {
        let row: Int = geometry.row(of: index)
        let col: Int = geometry.col(of: index)
        let x: CGFloat = (CGFloat(col) * geometry.cellW - geometry.pad) * scale
        let y: CGFloat = (CGFloat(row) * geometry.cellH - geometry.pad) * scale
        return CGRect(x: x, y: y, width: geometry.pieceWidth * scale, height: geometry.pieceHeight * scale)
    }

    /// Just the cell body in board coordinates.
    private func cellFrame(for index: Int) -> CGRect {
        let row: Int = geometry.row(of: index)
        let col: Int = geometry.col(of: index)
        return CGRect(
            x: CGFloat(col) * geometry.cellW * scale,
            y: CGFloat(row) * geometry.cellH * scale,
            width: geometry.cellW * scale,
            height: geometry.cellH * scale
        )
    }
}

/// A piece locked on the board. A freshly placed piece gives a tiny pop.
struct PlacedPieceView: View {
    let image: UIImage
    let frame: CGRect
    let pop: Bool

    @State private var popScale: CGFloat

    init(image: UIImage, frame: CGRect, pop: Bool) {
        self.image = image
        self.frame = frame
        self.pop = pop
        _popScale = State(initialValue: pop ? 1.15 : 1.0)
    }

    var body: some View {
        Image(uiImage: image)
            .resizable()
            .frame(width: frame.width, height: frame.height)
            .scaleEffect(popScale)
            .offset(x: frame.minX, y: frame.minY)
            .allowsHitTesting(false)
            .onAppear {
                if pop {
                    withAnimation(.spring(response: 0.3, dampingFraction: 0.5)) {
                        popScale = 1.0
                    }
                }
            }
    }
}

/// Soft pulsing glow on a cell.
struct HintGlowView: View {
    let rect: CGRect

    @State private var bright: Bool = false

    var body: some View {
        RoundedRectangle(cornerRadius: 8, style: .continuous)
            .fill(Theme.accent.opacity(0.35))
            .overlay {
                RoundedRectangle(cornerRadius: 8, style: .continuous)
                    .stroke(Theme.accent, lineWidth: 3)
            }
            .frame(width: rect.width, height: rect.height)
            .opacity(bright ? 1.0 : 0.3)
            .offset(x: rect.minX, y: rect.minY)
            .allowsHitTesting(false)
            .onAppear {
                withAnimation(.easeInOut(duration: 0.45).repeatForever(autoreverses: true)) {
                    bright = true
                }
            }
    }
}
