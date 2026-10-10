import Foundation

struct PuzzleRecord: Codable, Identifiable, Equatable {
    let id: UUID
    let createdAt: Date
    let rows: Int
    let cols: Int
    let seed: UInt64
    /// Piece indices (row * cols + col) that are locked in place.
    var placed: [Int]
    let isSample: Bool

    init(
        id: UUID = UUID(),
        createdAt: Date = Date(),
        rows: Int,
        cols: Int,
        seed: UInt64,
        placed: [Int] = [],
        isSample: Bool = false
    ) {
        self.id = id
        self.createdAt = createdAt
        self.rows = rows
        self.cols = cols
        self.seed = seed
        self.placed = placed
        self.isSample = isSample
    }

    var total: Int {
        return rows * cols
    }

    var progress: Double {
        if total <= 0 { return 0 }
        return Double(placed.count) / Double(total)
    }

    var isComplete: Bool {
        return total > 0 && placed.count >= total
    }
}
