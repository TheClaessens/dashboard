import Foundation
import CoreGraphics

/// Deterministic SplitMix64 generator. Swift's default RNG cannot be seeded.
struct SeededRandom: RandomNumberGenerator {
    private var state: UInt64

    init(seed: UInt64) {
        self.state = seed
    }

    mutating func next() -> UInt64 {
        state = state &+ 0x9E3779B97F4A7C15
        var z: UInt64 = state
        z = (z ^ (z >> 30)) &* 0xBF58476D1CE4E5B9
        z = (z ^ (z >> 27)) &* 0x94D049BB133111EB
        return z ^ (z >> 31)
    }

    /// Uniform Double in [0, 1).
    mutating func nextDouble() -> Double {
        let raw: UInt64 = self.next()
        return Double(raw >> 11) / 9007199254740992.0
    }

    /// Uniform CGFloat in the closed range.
    mutating func nextCGFloat(in range: ClosedRange<CGFloat>) -> CGFloat {
        let unit = CGFloat(nextDouble())
        return range.lowerBound + unit * (range.upperBound - range.lowerBound)
    }

    /// Fair coin flip.
    mutating func nextBool() -> Bool {
        let raw: UInt64 = self.next()
        return (raw & 1) == 1
    }
}
