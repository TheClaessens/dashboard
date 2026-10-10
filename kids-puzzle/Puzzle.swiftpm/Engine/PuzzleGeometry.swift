import CoreGraphics

/// Source-pixel geometry of a puzzle: cell size, knob padding, piece image size.
struct PuzzleGeometry {
    let rows: Int
    let cols: Int
    let sourceWidth: CGFloat
    let sourceHeight: CGFloat

    var cellW: CGFloat { sourceWidth / CGFloat(cols) }
    var cellH: CGFloat { sourceHeight / CGFloat(rows) }
    var pad: CGFloat { PieceShape.padRatio * min(cellW, cellH) }
    var pieceWidth: CGFloat { cellW + 2 * pad }
    var pieceHeight: CGFloat { cellH + 2 * pad }
    var aspect: CGFloat { sourceWidth / sourceHeight }
    var total: Int { rows * cols }

    func row(of index: Int) -> Int { index / cols }
    func col(of index: Int) -> Int { index % cols }
}
