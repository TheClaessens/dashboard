import SwiftUI
import UIKit

/// Home screen: big photo cards, nothing else. Parent mode adds "+" and delete badges.
@MainActor
struct ShelfView: View {
    @ObservedObject var store: PuzzleStore
    let onOpen: (PuzzleRecord) -> Void

    @State private var parentMode: Bool = false
    @State private var showNewPuzzle: Bool = false
    @State private var pendingDelete: PuzzleRecord? = nil
    @State private var showDeleteAlert: Bool = false

    private let columns: [GridItem] = [GridItem(.adaptive(minimum: 260), spacing: 24)]

    var body: some View {
        ZStack(alignment: .topTrailing) {
            Theme.cream.ignoresSafeArea()
            ScrollView {
                grid
            }
            topButton
                .padding(16)
        }
        .fullScreenCover(isPresented: $showNewPuzzle) {
            NewPuzzleView(store: store)
        }
        .alert("Delete this puzzle?", isPresented: $showDeleteAlert) {
            Button("Delete", role: .destructive) {
                if let record = pendingDelete {
                    store.delete(id: record.id)
                }
                pendingDelete = nil
            }
            Button("Cancel", role: .cancel) {
                pendingDelete = nil
            }
        } message: {
            Text("The photo and its progress will be removed. This cannot be undone.")
        }
    }

    private var grid: some View {
        LazyVGrid(columns: columns, spacing: 24) {
            if parentMode {
                AddPuzzleCard {
                    showNewPuzzle = true
                }
            }
            ForEach(store.puzzles) { record in
                PuzzleCard(
                    record: record,
                    thumbnail: store.thumbnail(for: record.id),
                    parentMode: parentMode,
                    onOpen: { onOpen(record) },
                    onDelete: {
                        pendingDelete = record
                        showDeleteAlert = true
                    }
                )
            }
        }
        .padding(.horizontal, 32)
        .padding(.top, 80)
        .padding(.bottom, 40)
    }

    @ViewBuilder
    private var topButton: some View {
        if parentMode {
            CircleIconButton(systemName: "checkmark") {
                withAnimation(.easeInOut(duration: 0.25)) {
                    parentMode = false
                }
            }
        } else {
            ParentGateButton {
                withAnimation(.easeInOut(duration: 0.25)) {
                    parentMode = true
                }
            }
        }
    }
}

// MARK: - Cards

struct PuzzleCard: View {
    let record: PuzzleRecord
    let thumbnail: UIImage?
    let parentMode: Bool
    let onOpen: () -> Void
    let onDelete: () -> Void

    var body: some View {
        Button(action: onOpen) {
            cardImage
        }
        .buttonStyle(PressScaleButtonStyle())
        .overlay(alignment: .bottomTrailing) {
            statusBadge
                .padding(12)
                .allowsHitTesting(false)
        }
        .overlay(alignment: .topLeading) {
            deleteBadge
        }
    }

    private var cardImage: some View {
        Color.clear
            .aspectRatio(1.5, contentMode: .fit)
            .overlay {
                thumbnailImage
            }
            .background(Theme.tray)
            .clipShape(RoundedRectangle(cornerRadius: 24, style: .continuous))
            .shadow(color: Color.black.opacity(0.18), radius: 10, x: 0, y: 6)
    }

    @ViewBuilder
    private var thumbnailImage: some View {
        if let thumbnail = thumbnail {
            Image(uiImage: thumbnail)
                .resizable()
                .scaledToFill()
        } else {
            Theme.tray
        }
    }

    @ViewBuilder
    private var statusBadge: some View {
        if record.isComplete {
            Image(systemName: "star.fill")
                .font(.system(size: 54))
                .foregroundColor(Theme.star)
                .shadow(color: Color.black.opacity(0.35), radius: 4, x: 0, y: 2)
        } else if !record.placed.isEmpty {
            ProgressRing(progress: record.progress)
        }
    }

    @ViewBuilder
    private var deleteBadge: some View {
        if parentMode {
            Button(action: onDelete) {
                Image(systemName: "xmark")
                    .font(.system(size: 20, weight: .bold))
                    .foregroundColor(Color.white)
                    .frame(width: 48, height: 48)
                    .background(Circle().fill(Color.red))
                    .shadow(color: Color.black.opacity(0.3), radius: 3, x: 0, y: 2)
            }
            .buttonStyle(PressScaleButtonStyle())
            .padding(10)
        }
    }
}

struct AddPuzzleCard: View {
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Color.clear
                .aspectRatio(1.5, contentMode: .fit)
                .overlay {
                    Image(systemName: "plus")
                        .font(.system(size: 64, weight: .bold))
                        .foregroundColor(Theme.accent)
                }
                .background(Color.white.opacity(0.6))
                .clipShape(RoundedRectangle(cornerRadius: 24, style: .continuous))
                .overlay {
                    RoundedRectangle(cornerRadius: 24, style: .continuous)
                        .strokeBorder(Theme.accent, style: StrokeStyle(lineWidth: 4, dash: [14, 10]))
                }
        }
        .buttonStyle(PressScaleButtonStyle())
    }
}

struct ProgressRing: View {
    let progress: Double

    var body: some View {
        ZStack {
            Circle()
                .fill(Color.white.opacity(0.93))
            Circle()
                .stroke(Color.black.opacity(0.08), lineWidth: 7)
                .padding(11)
            Circle()
                .trim(from: 0, to: CGFloat(progress))
                .stroke(Theme.accent, style: StrokeStyle(lineWidth: 7, lineCap: .round))
                .rotationEffect(.degrees(-90))
                .padding(11)
        }
        .frame(width: 60, height: 60)
        .shadow(color: Color.black.opacity(0.25), radius: 4, x: 0, y: 2)
    }
}
