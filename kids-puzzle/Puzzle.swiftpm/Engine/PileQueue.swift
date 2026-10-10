import Foundation

/// Pure logic for the "smart pile": which pieces are shown, and in what order they are dealt.
///
/// Order: corners, then other edge pieces (shuffled), then interior pieces. Interior pieces
/// that touch an already placed piece are strongly preferred (weighted random).
struct PileQueue {
    let rows: Int
    let cols: Int
    private(set) var placed: Set<Int>

    private var rng: SeededRandom
    /// Corners first, then edges. Swapped-out pieces are appended at the back.
    private var edgeQueue: [Int] = []
    /// Interior pieces eligible to be dealt.
    private var interior: [Int] = []
    /// Interior pieces that were swapped away; eligible again once `interior` runs dry.
    private var shelved: [Int] = []
    /// Fixed slots: a piece stays in its slot until it is placed or swapped away.
    private var slots: [Int?] = []

    init(rows: Int, cols: Int, seed: UInt64, placed: [Int]) {
        self.rows = rows
        self.cols = cols
        self.placed = Set(placed)
        self.rng = SeededRandom(seed: seed ^ 0xA5A5A5A5)

        var corners: [Int] = []
        var edges: [Int] = []
        var inner: [Int] = []
        for index in 0..<(rows * cols) {
            if self.placed.contains(index) { continue }
            let r = index / cols
            let c = index % cols
            let onRowEdge = (r == 0 || r == rows - 1)
            let onColEdge = (c == 0 || c == cols - 1)
            if onRowEdge && onColEdge {
                corners.append(index)
            } else if onRowEdge || onColEdge {
                edges.append(index)
            } else {
                inner.append(index)
            }
        }
        corners.shuffle(using: &self.rng)
        edges.shuffle(using: &self.rng)
        self.edgeQueue = corners + edges
        self.interior = inner
    }

    var remaining: Int {
        return rows * cols - placed.count
    }

    /// The next `count` unplaced pieces, one entry per slot (nil = nothing left to deal).
    /// Calling this again with the same count returns the same pieces in the same slots.
    mutating func visible(count: Int) -> [Int?] {
        let n: Int = max(count, 0)
        if slots.count > n {
            var i: Int = slots.count - 1
            while i >= n {
                if let piece = slots[i] {
                    giveBack(piece)
                }
                i -= 1
            }
            slots.removeLast(slots.count - n)
        }
        while slots.count < n {
            slots.append(nil)
        }
        for i in 0..<slots.count {
            if slots[i] == nil {
                slots[i] = deal()
            }
        }
        return slots
    }

    /// Moves the currently visible pieces to the back of the queue and deals new ones.
    @discardableResult
    mutating func swap() -> [Int?] {
        for entry in slots {
            if let piece = entry {
                if isEdge(piece) {
                    edgeQueue.append(piece)
                } else {
                    shelved.append(piece)
                }
            }
        }
        for i in 0..<slots.count {
            slots[i] = nil
        }
        for i in 0..<slots.count {
            slots[i] = deal()
        }
        return slots
    }

    /// Marks a piece as placed; only its vacated slot is refilled.
    mutating func place(_ index: Int) {
        placed.insert(index)
        edgeQueue.removeAll { $0 == index }
        interior.removeAll { $0 == index }
        shelved.removeAll { $0 == index }
        if let slot = slots.firstIndex(where: { $0 == index }) {
            slots[slot] = deal()
        }
    }

    // MARK: - Dealing

    private func isEdge(_ index: Int) -> Bool {
        let r = index / cols
        let c = index % cols
        return r == 0 || r == rows - 1 || c == 0 || c == cols - 1
    }

    private mutating func giveBack(_ piece: Int) {
        if isEdge(piece) {
            edgeQueue.insert(piece, at: 0)
        } else {
            interior.append(piece)
        }
    }

    private mutating func deal() -> Int? {
        if !edgeQueue.isEmpty {
            return edgeQueue.removeFirst()
        }
        return pickInterior()
    }

    private mutating func pickInterior() -> Int? {
        if interior.isEmpty {
            if shelved.isEmpty { return nil }
            interior = shelved
            shelved = []
        }
        var weights: [Double] = []
        var total: Double = 0
        for index in interior {
            let weight: Double = 1.0 + 9.0 * Double(placedNeighbourCount(of: index))
            weights.append(weight)
            total += weight
        }
        var roll: Double = rng.nextDouble() * total
        for i in 0..<weights.count {
            roll -= weights[i]
            if roll <= 0 {
                return interior.remove(at: i)
            }
        }
        return interior.removeLast()
    }

    private func placedNeighbourCount(of index: Int) -> Int {
        let r = index / cols
        let c = index % cols
        var count = 0
        if r > 0 && placed.contains(index - cols) { count += 1 }
        if r < rows - 1 && placed.contains(index + cols) { count += 1 }
        if c > 0 && placed.contains(index - 1) { count += 1 }
        if c < cols - 1 && placed.contains(index + 1) { count += 1 }
        return count
    }
}
