import SwiftUI
import UIKit

/// One piece in the pile: which slot it sits in and which piece it is.
struct PileItem: Identifiable, Equatable {
    let slot: Int
    let piece: Int
    var id: Int { piece }
}

/// The sand-coloured tray with the visible pieces and the swap button.
@MainActor
struct PileView: View {
    @ObservedObject var session: PuzzleSession
    let layout: PuzzleLayout
    let geometry: PuzzleGeometry
    @Binding var active: ActiveDrag?

    @State private var spin: Double = 0

    private var pieceScale: CGFloat {
        return layout.boardRect.width / geometry.sourceWidth
    }

    private var pieceSize: CGSize {
        return CGSize(width: geometry.pieceWidth * pieceScale, height: geometry.pieceHeight * pieceScale)
    }

    private var items: [PileItem] {
        var result: [PileItem] = []
        for (slot, entry) in session.pile.enumerated() {
            if let piece = entry, slot < layout.slotCount, piece < session.pieceImages.count {
                result.append(PileItem(slot: slot, piece: piece))
            }
        }
        return result
    }

    var body: some View {
        ZStack {
            trayBackground
            ForEach(items) { item in
                slotView(for: item)
            }
            swapButton
        }
        .frame(width: layout.size.width, height: layout.size.height)
        .onChange(of: session.pile) { _, newPile in
            // A dragged piece that left the pile (re-deal, rotation) must not stay stuck.
            if let current = active, !current.settling, !newPile.contains(current.piece) {
                active = nil
            }
        }
    }

    // MARK: - Pieces of the view

    private var trayBackground: some View {
        RoundedRectangle(cornerRadius: 28, style: .continuous)
            .fill(Theme.tray)
            .overlay {
                RoundedRectangle(cornerRadius: 28, style: .continuous)
                    .stroke(Color.black.opacity(0.10), lineWidth: 6)
                    .blur(radius: 4)
                    .offset(x: 0, y: 2)
                    .clipShape(RoundedRectangle(cornerRadius: 28, style: .continuous))
            }
            .frame(width: layout.trayRect.width, height: layout.trayRect.height)
            .position(x: layout.trayRect.midX, y: layout.trayRect.midY)
    }

    private var swapButton: some View {
        CircleIconButton(systemName: "arrow.triangle.2.circlepath") {
            if let current = active, !current.settling { return }
            spin += 180
            withAnimation(.spring(response: 0.45, dampingFraction: 0.8)) {
                session.swapPile()
            }
        }
        .rotationEffect(.degrees(spin))
        .animation(.spring(response: 0.5, dampingFraction: 0.7), value: spin)
        .position(x: layout.swapCenter.x, y: layout.swapCenter.y)
    }

    private func slotView(for item: PileItem) -> some View {
        PileSlotView(
            image: session.pieceImages[item.piece],
            size: pieceSize,
            center: layout.slotCenter(item.slot),
            isHidden: active?.piece == item.piece,
            onChanged: { value in
                handleChanged(item, value)
            },
            onEnded: { value in
                handleEnded(item, value)
            },
            onTap: {
                session.showHint(for: item.piece)
            },
            onCancel: {
                handleCancel(item)
            }
        )
    }

    // MARK: - Drag handling

    private func handleChanged(_ item: PileItem, _ value: DragGesture.Value) {
        if let current = active {
            // Another piece is being dragged, or this one is still settling.
            if current.piece != item.piece || current.settling { return }
            active?.center = CGPoint(
                x: value.location.x - current.grab.width,
                y: value.location.y - current.grab.height
            )
            return
        }
        let slotCenter: CGPoint = layout.slotCenter(item.slot)
        let grab = CGSize(
            width: value.startLocation.x - slotCenter.x,
            height: value.startLocation.y - slotCenter.y
        )
        active = ActiveDrag(
            piece: item.piece,
            slot: item.slot,
            center: CGPoint(x: value.location.x - grab.width, y: value.location.y - grab.height),
            grab: grab,
            scale: 1.0,
            settling: false
        )
        withAnimation(.easeOut(duration: 0.12)) {
            active?.scale = 1.08
        }
    }

    private func handleEnded(_ item: PileItem, _ value: DragGesture.Value) {
        guard let current = active, current.piece == item.piece, !current.settling else { return }

        let dropCenter = CGPoint(
            x: value.location.x - current.grab.width,
            y: value.location.y - current.grab.height
        )
        let travel: CGFloat = hypot(value.translation.width, value.translation.height)
        if travel < 8 {
            // Barely moved: treat as a tap.
            session.showHint(for: item.piece)
            returnToSlot(item)
            return
        }

        let target: CGPoint = targetCenter(for: item.piece)
        let distance: CGFloat = hypot(dropCenter.x - target.x, dropCenter.y - target.y)
        if distance <= layout.cellSize * 0.5 {
            snap(item, to: target)
        } else {
            returnToSlot(item)
        }
    }

    /// The drag gesture ended without `onEnded` (system cancel): send the piece home.
    private func handleCancel(_ item: PileItem) {
        let piece: Int = item.piece
        Task { @MainActor in
            // Give a normal `onEnded` time to run first.
            _ = try? await Task.sleep(nanoseconds: 150_000_000)
            if let current = active, current.piece == piece, !current.settling {
                returnToSlot(item)
            }
        }
    }

    private func snap(_ item: PileItem, to target: CGPoint) {
        Sound.snap()
        withAnimation(.spring(response: 0.25, dampingFraction: 0.75)) {
            active?.center = target
            active?.scale = 1.0
            active?.settling = true
        }
        let piece: Int = item.piece
        Task { @MainActor in
            _ = try? await Task.sleep(nanoseconds: 230_000_000)
            withAnimation(.spring(response: 0.4, dampingFraction: 0.8)) {
                session.place(piece)
            }
            active = nil
        }
    }

    private func returnToSlot(_ item: PileItem) {
        let home: CGPoint = layout.slotCenter(item.slot)
        withAnimation(.spring(response: 0.38, dampingFraction: 0.78)) {
            active?.center = home
            active?.scale = 1.0
            active?.settling = true
        }
        let piece: Int = item.piece
        Task { @MainActor in
            _ = try? await Task.sleep(nanoseconds: 450_000_000)
            if active?.piece == piece {
                active = nil
            }
        }
    }

    /// Centre of a piece's cell on screen ("puzzle" coordinate space).
    private func targetCenter(for piece: Int) -> CGPoint {
        let row: Int = geometry.row(of: piece)
        let col: Int = geometry.col(of: piece)
        let cellW: CGFloat = geometry.cellW * pieceScale
        let cellH: CGFloat = geometry.cellH * pieceScale
        return CGPoint(
            x: layout.boardRect.minX + (CGFloat(col) + 0.5) * cellW,
            y: layout.boardRect.minY + (CGFloat(row) + 0.5) * cellH
        )
    }
}

/// A piece lying in the pile. Hidden (not removed) while it is being dragged,
/// so the drag gesture keeps running.
struct PileSlotView: View {
    let image: UIImage
    let size: CGSize
    let center: CGPoint
    let isHidden: Bool
    let onChanged: (DragGesture.Value) -> Void
    let onEnded: (DragGesture.Value) -> Void
    let onTap: () -> Void
    let onCancel: () -> Void

    @GestureState private var isDragging: Bool = false

    var body: some View {
        Image(uiImage: image)
            .resizable()
            .frame(width: size.width, height: size.height)
            .shadow(color: Color.black.opacity(0.25), radius: 3, x: 0, y: 2)
            .opacity(isHidden ? 0.0 : 1.0)
            .contentShape(Rectangle())
            .onTapGesture {
                onTap()
            }
            .gesture(
                DragGesture(minimumDistance: 3, coordinateSpace: CoordinateSpace.named(Theme.puzzleSpace))
                    .updating($isDragging) { _, state, _ in
                        state = true
                    }
                    .onChanged { value in
                        onChanged(value)
                    }
                    .onEnded { value in
                        onEnded(value)
                    }
            )
            .onChange(of: isDragging) { _, nowDragging in
                if !nowDragging {
                    onCancel()
                }
            }
            .position(x: center.x, y: center.y)
            .transition(
                AnyTransition.asymmetric(
                    insertion: AnyTransition.scale(scale: 0.3).combined(with: AnyTransition.opacity),
                    removal: AnyTransition.identity
                )
            )
    }
}
