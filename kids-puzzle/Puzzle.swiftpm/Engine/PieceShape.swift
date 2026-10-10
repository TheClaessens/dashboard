import CoreGraphics

/// Jigsaw edge layout for a whole grid, plus the path of each piece.
///
/// Piece-local coordinates: the cell body is the rect (pad, pad, cellW, cellH) and
/// knobs stick out into the surrounding padding. Paths run clockwise
/// (top -> right -> bottom -> left, y pointing down).
struct PieceShape {
    /// Padding around the cell body as a fraction of the smaller cell side.
    static let padRatio: CGFloat = 0.28

    struct EdgeSpec {
        /// +1: the knob bulges toward the right / bottom neighbour, -1: toward left / top.
        var direction: CGFloat
        /// Knob position offset along the edge, as a fraction of the edge length.
        var position: CGFloat
        /// Knob size factor (about 0.9 ... 1.1).
        var size: CGFloat
        /// Neck width factor (about 0.9 ... 1.1).
        var neck: CGFloat
    }

    struct CubicSegment {
        let c1: CGPoint
        let c2: CGPoint
        let end: CGPoint
    }

    /// One shared edge in its canonical direction (left -> right, or top -> bottom).
    struct EdgeCurve {
        let start: CGPoint
        let segments: [CubicSegment]
    }

    let rows: Int
    let cols: Int
    /// Edges between (r, c) and (r + 1, c): (rows - 1) x cols.
    private let horizontalLines: [[EdgeSpec]]
    /// Edges between (r, c) and (r, c + 1): rows x (cols - 1).
    private let verticalLines: [[EdgeSpec]]

    init(rows: Int, cols: Int, seed: UInt64) {
        self.rows = rows
        self.cols = cols
        var rng = SeededRandom(seed: seed)

        var horizontal: [[EdgeSpec]] = []
        let horizontalRowCount: Int = max(rows - 1, 0)
        for _ in 0..<horizontalRowCount {
            var line: [EdgeSpec] = []
            for _ in 0..<cols {
                line.append(PieceShape.randomSpec(&rng))
            }
            horizontal.append(line)
        }

        var vertical: [[EdgeSpec]] = []
        let verticalColCount: Int = max(cols - 1, 0)
        for _ in 0..<rows {
            var line: [EdgeSpec] = []
            for _ in 0..<verticalColCount {
                line.append(PieceShape.randomSpec(&rng))
            }
            vertical.append(line)
        }

        self.horizontalLines = horizontal
        self.verticalLines = vertical
    }

    private static func randomSpec(_ rng: inout SeededRandom) -> EdgeSpec {
        let direction: CGFloat = rng.nextBool() ? 1.0 : -1.0
        let position: CGFloat = rng.nextCGFloat(in: -0.08...0.08)
        let size: CGFloat = rng.nextCGFloat(in: 0.9...1.1)
        let neck: CGFloat = rng.nextCGFloat(in: 0.9...1.1)
        return EdgeSpec(direction: direction, position: position, size: size, neck: neck)
    }

    // MARK: - Piece path

    func path(row: Int, col: Int, cellW: CGFloat, cellH: CGFloat) -> CGPath {
        let unit: CGFloat = min(cellW, cellH)
        let pad: CGFloat = PieceShape.padRatio * unit
        let tl = CGPoint(x: pad, y: pad)
        let tr = CGPoint(x: pad + cellW, y: pad)
        let br = CGPoint(x: pad + cellW, y: pad + cellH)
        let bl = CGPoint(x: pad, y: pad + cellH)

        let path = CGMutablePath()
        path.move(to: tl)

        // Top edge, traversed in canonical direction (left -> right).
        if row > 0 {
            let curve = PieceShape.curve(spec: horizontalLines[row - 1][col], start: tl, length: cellW, vertical: false, unit: unit)
            PieceShape.append(curve, reversed: false, to: path)
        } else {
            path.addLine(to: tr)
        }

        // Right edge, canonical direction (top -> bottom).
        if col < cols - 1 {
            let curve = PieceShape.curve(spec: verticalLines[row][col], start: tr, length: cellH, vertical: true, unit: unit)
            PieceShape.append(curve, reversed: false, to: path)
        } else {
            path.addLine(to: br)
        }

        // Bottom edge, traversed right -> left = reverse of canonical.
        if row < rows - 1 {
            let curve = PieceShape.curve(spec: horizontalLines[row][col], start: bl, length: cellW, vertical: false, unit: unit)
            PieceShape.append(curve, reversed: true, to: path)
        } else {
            path.addLine(to: bl)
        }

        // Left edge, traversed bottom -> top = reverse of canonical.
        if col > 0 {
            let curve = PieceShape.curve(spec: verticalLines[row][col - 1], start: tl, length: cellH, vertical: true, unit: unit)
            PieceShape.append(curve, reversed: true, to: path)
        } else {
            path.addLine(to: tl)
        }

        path.closeSubpath()
        return path
    }

    private static func append(_ curve: EdgeCurve, reversed: Bool, to path: CGMutablePath) {
        if !reversed {
            for seg in curve.segments {
                path.addCurve(to: seg.end, control1: seg.c1, control2: seg.c2)
            }
            return
        }
        var starts: [CGPoint] = [curve.start]
        for seg in curve.segments {
            starts.append(seg.end)
        }
        var i: Int = curve.segments.count - 1
        while i >= 0 {
            let seg = curve.segments[i]
            // Reverse: go back to the segment start, control points swapped.
            path.addCurve(to: starts[i], control1: seg.c2, control2: seg.c1)
            i -= 1
        }
    }

    // MARK: - Knob geometry

    /// Builds one shared edge. `start` is the canonical start (left or top end of the edge).
    private static func curve(spec: EdgeSpec, start: CGPoint, length: CGFloat, vertical: Bool, unit: CGFloat) -> EdgeCurve {
        let along = vertical ? CGPoint(x: 0, y: 1) : CGPoint(x: 1, y: 0)
        let normal = vertical ? CGPoint(x: 1, y: 0) : CGPoint(x: 0, y: 1)

        let s: CGFloat = spec.size
        let centre: CGFloat = length * (0.5 + spec.position)
        let baseHalf: CGFloat = 0.10 * unit * s      // flared base half width
        let neckHalf: CGFloat = 0.05 * unit * s * spec.neck
        let neckHeight: CGFloat = 0.07 * unit * s
        let headRadius: CGFloat = 0.105 * unit * s
        let headCentre: CGFloat = 0.24 * unit * s - headRadius
        let k: CGFloat = 0.5523
        let rise: CGFloat = (headCentre - neckHeight) * 0.45
        let dir: CGFloat = spec.direction

        // (u, v): u along the edge relative to the knob centre, v height toward the knob side.
        func pt(_ u: CGFloat, _ v: CGFloat) -> CGPoint {
            let a: CGFloat = centre + u
            let n: CGFloat = dir * v
            let x: CGFloat = start.x + along.x * a + normal.x * n
            let y: CGFloat = start.y + along.y * a + normal.y * n
            return CGPoint(x: x, y: y)
        }

        var segs: [CubicSegment] = []

        func addLine(from a: CGPoint, to b: CGPoint) {
            let c1 = CGPoint(x: a.x + (b.x - a.x) / 3.0, y: a.y + (b.y - a.y) / 3.0)
            let c2 = CGPoint(x: a.x + (b.x - a.x) * 2.0 / 3.0, y: a.y + (b.y - a.y) * 2.0 / 3.0)
            segs.append(CubicSegment(c1: c1, c2: c2, end: b))
        }

        func addCurve(_ c1: CGPoint, _ c2: CGPoint, _ end: CGPoint) {
            segs.append(CubicSegment(c1: c1, c2: c2, end: end))
        }

        let end = CGPoint(x: start.x + along.x * length, y: start.y + along.y * length)
        let baseLeft = pt(-baseHalf, 0)
        let baseRight = pt(baseHalf, 0)
        let neckLeft = pt(-neckHalf, neckHeight)
        let neckRight = pt(neckHalf, neckHeight)
        let headLeft = pt(-headRadius, headCentre)
        let headRight = pt(headRadius, headCentre)
        let headTop = pt(0, headCentre + headRadius)

        let flare: CGFloat = 0.6 * (baseHalf - neckHalf)

        addLine(from: start, to: baseLeft)
        addCurve(pt(-baseHalf + flare, 0), pt(-neckHalf, neckHeight * 0.4), neckLeft)
        addCurve(pt(-neckHalf, neckHeight + rise), pt(-headRadius, headCentre - rise), headLeft)
        addCurve(pt(-headRadius, headCentre + k * headRadius), pt(-k * headRadius, headCentre + headRadius), headTop)
        addCurve(pt(k * headRadius, headCentre + headRadius), pt(headRadius, headCentre + k * headRadius), headRight)
        addCurve(pt(headRadius, headCentre - rise), pt(neckHalf, neckHeight + rise), neckRight)
        addCurve(pt(neckHalf, neckHeight * 0.4), pt(baseHalf - flare, 0), baseRight)
        addLine(from: baseRight, to: end)

        return EdgeCurve(start: start, segments: segs)
    }
}
