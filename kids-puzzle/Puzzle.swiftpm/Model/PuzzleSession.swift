import UIKit
import Foundation

/// State of one puzzle being played: cut pieces, the pile, placed pieces, hints, completion.
@MainActor
final class PuzzleSession: ObservableObject {
    let record: PuzzleRecord

    @Published private(set) var isLoading: Bool = true
    @Published private(set) var geometry: PuzzleGeometry? = nil
    @Published private(set) var pieceImages: [UIImage] = []
    @Published private(set) var fullImage: UIImage? = nil
    @Published private(set) var placedOrder: [Int]
    /// One entry per pile slot; nil = empty slot.
    @Published private(set) var pile: [Int?] = []
    @Published var showGhost: Bool = true
    @Published private(set) var isComplete: Bool
    @Published private(set) var celebrate: Bool = false
    @Published private(set) var hintIndex: Int? = nil
    @Published private(set) var lastPlaced: Int? = nil

    private let store: PuzzleStore
    private var queue: PileQueue
    private var slotCount: Int = 8
    private var hintToken: Int = 0

    init(record: PuzzleRecord, store: PuzzleStore) {
        self.record = record
        self.store = store
        self.placedOrder = record.placed
        self.isComplete = record.isComplete
        self.queue = PileQueue(rows: record.rows, cols: record.cols, seed: record.seed, placed: record.placed)
    }

    var progress: Double {
        let total: Int = record.rows * record.cols
        if total <= 0 { return 0 }
        return Double(placedOrder.count) / Double(total)
    }

    // MARK: - Loading

    func load() async {
        guard isLoading else { return }
        guard let image = store.image(for: record.id), let cg = image.cgImage else {
            isLoading = false
            return
        }
        let geo = PuzzleGeometry(
            rows: record.rows,
            cols: record.cols,
            sourceWidth: CGFloat(cg.width),
            sourceHeight: CGFloat(cg.height)
        )
        fullImage = image
        if !isComplete {
            pieceImages = await PieceCutter.cut(image: image, rows: record.rows, cols: record.cols, seed: record.seed)
        }
        geometry = geo
        pile = queue.visible(count: slotCount)
        isLoading = false
        if isComplete {
            celebrate = true
        }
    }

    // MARK: - Pile

    func setSlotCount(_ count: Int) {
        slotCount = max(count, 1)
        if isLoading { return }
        pile = queue.visible(count: slotCount)
    }

    func swapPile() {
        if isLoading || isComplete { return }
        pile = queue.swap()
    }

    // MARK: - Placing

    func place(_ index: Int) {
        if placedOrder.contains(index) { return }
        lastPlaced = index
        placedOrder.append(index)
        queue.place(index)
        pile = queue.visible(count: slotCount)
        store.markPlaced(id: record.id, index: index)
        if hintIndex == index {
            hintIndex = nil
        }
        if placedOrder.count >= record.rows * record.cols {
            finish()
        }
    }

    private func finish() {
        isComplete = true
        Task { @MainActor in
            _ = try? await Task.sleep(nanoseconds: 900_000_000)
            self.celebrate = true
            Sound.complete()
        }
    }

    // MARK: - Hint

    /// Makes the target cell of a pile piece glow for a moment.
    func showHint(for index: Int) {
        hintToken += 1
        let token: Int = hintToken
        hintIndex = index
        Task { @MainActor in
            _ = try? await Task.sleep(nanoseconds: 1_600_000_000)
            if self.hintToken == token {
                self.hintIndex = nil
            }
        }
    }
}
