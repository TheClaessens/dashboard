import UIKit

/// Renders every puzzle piece to its own UIImage (off the main thread).
enum PieceCutter {
    /// Padding ratio so views can position pieces (see `PuzzleGeometry.pad`).
    static var padRatio: CGFloat { PieceShape.padRatio }

    static func cut(image: UIImage, rows: Int, cols: Int, seed: UInt64) async -> [UIImage] {
        let task = Task.detached(priority: .userInitiated) { () -> [UIImage] in
            return PieceCutter.cutSynchronously(image: image, rows: rows, cols: cols, seed: seed)
        }
        return await task.value
    }

    /// Index of a piece is `row * cols + col`.
    static func cutSynchronously(image: UIImage, rows: Int, cols: Int, seed: UInt64) -> [UIImage] {
        guard let cgImage = image.cgImage else { return [] }
        let srcW = CGFloat(cgImage.width)
        let srcH = CGFloat(cgImage.height)
        let geometry = PuzzleGeometry(rows: rows, cols: cols, sourceWidth: srcW, sourceHeight: srcH)
        let shape = PieceShape(rows: rows, cols: cols, seed: seed)

        let cellW: CGFloat = geometry.cellW
        let cellH: CGFloat = geometry.cellH
        let pad: CGFloat = geometry.pad
        let pieceW: CGFloat = geometry.pieceWidth
        let pieceH: CGFloat = geometry.pieceHeight
        let imageBounds = CGRect(x: 0, y: 0, width: srcW, height: srcH)

        let format = UIGraphicsImageRendererFormat()
        format.scale = 1
        format.opaque = false
        let renderer = UIGraphicsImageRenderer(size: CGSize(width: pieceW, height: pieceH), format: format)

        var result: [UIImage] = []
        result.reserveCapacity(rows * cols)

        for r in 0..<rows {
            for c in 0..<cols {
                let path = shape.path(row: r, col: c, cellW: cellW, cellH: cellH)
                let originX: CGFloat = CGFloat(c) * cellW - pad
                let originY: CGFloat = CGFloat(r) * cellH - pad
                let wanted = CGRect(x: originX, y: originY, width: pieceW, height: pieceH)
                let cropRect = wanted.intersection(imageBounds).integral.intersection(imageBounds)
                let sub: CGImage? = cgImage.cropping(to: cropRect)

                let piece = renderer.image { ctx in
                    let cg = ctx.cgContext

                    if let sub = sub {
                        cg.saveGState()
                        cg.addPath(path)
                        cg.clip()
                        let drawRect = CGRect(
                            x: cropRect.minX - originX,
                            y: cropRect.minY - originY,
                            width: cropRect.width,
                            height: cropRect.height
                        )
                        UIImage(cgImage: sub).draw(in: drawRect)
                        cg.restoreGState()
                    }

                    // Soft dark outline.
                    cg.saveGState()
                    cg.addPath(path)
                    cg.setLineWidth(1.0)
                    cg.setStrokeColor(UIColor.black.withAlphaComponent(0.18).cgColor)
                    cg.strokePath()
                    cg.restoreGState()

                    // Light inner edge (the outer half of the stroke is clipped away).
                    cg.saveGState()
                    cg.addPath(path)
                    cg.clip()
                    cg.addPath(path)
                    cg.setLineWidth(2.0)
                    cg.setStrokeColor(UIColor.white.withAlphaComponent(0.35).cgColor)
                    cg.strokePath()
                    cg.restoreGState()
                }
                result.append(piece)
            }
        }
        return result
    }
}
