import SwiftUI

/// Where everything on the puzzle screen goes (all in the "puzzle" coordinate space).
struct PuzzleLayout {
    let size: CGSize
    let boardRect: CGRect
    let progressRect: CGRect
    let trayRect: CGRect
    let slotCount: Int
    let slotStartX: CGFloat
    let slotWidth: CGFloat
    let swapCenter: CGPoint
    let homeCenter: CGPoint
    let eyeCenter: CGPoint
    /// Board width / number of columns (on-screen size of one cell).
    let cellSize: CGFloat

    func slotCenter(_ slot: Int) -> CGPoint {
        let x: CGFloat = slotStartX + slotWidth * (CGFloat(slot) + 0.5)
        return CGPoint(x: x, y: trayRect.midY)
    }

    static func make(size: CGSize, cols: Int, aspect: CGFloat) -> PuzzleLayout {
        let margin: CGFloat = 16
        let button: CGFloat = 60
        let gap: CGFloat = 12
        let barHeight: CGFloat = 10
        let trayPad: CGFloat = 12
        let swapColumn: CGFloat = 84
        let colsF: CGFloat = CGFloat(max(cols, 1))
        let safeAspect: CGFloat = max(aspect, 0.1)

        // Total height needed per point of board width: board + pile.
        let perWidth: CGFloat = 1.0 / safeAspect + 1.7 / colsF
        let fixed: CGFloat = margin + gap + barHeight + gap + 2 * trayPad + margin
        let maxWidth: CGFloat = max(size.width - 2 * margin, 100)

        var boardW: CGFloat = min(maxWidth, (size.height - fixed) / perWidth)
        var topReserved: CGFloat = 0
        // If there is no room beside the board for the corner buttons, reserve a top row.
        if (size.width - boardW) / 2 < button + margin + 8 {
            topReserved = button + gap
            boardW = min(maxWidth, (size.height - fixed - topReserved) / perWidth)
        }
        boardW = max(boardW, 100)

        let boardH: CGFloat = boardW / safeAspect
        let cell: CGFloat = boardW / colsF
        let trayH: CGFloat = cell * 1.7 + 2 * trayPad
        let trayW: CGFloat = max(size.width - 2 * margin, 100)
        let trayY: CGFloat = size.height - margin - trayH

        // Board + progress bar are centred in the space above the tray.
        let groupH: CGFloat = boardH + gap + barHeight
        let spaceTop: CGFloat = margin + topReserved
        let spaceBottom: CGFloat = trayY - gap
        let groupY: CGFloat = spaceTop + max(0, (spaceBottom - spaceTop - groupH) / 2)

        let boardRect = CGRect(x: (size.width - boardW) / 2, y: groupY, width: boardW, height: boardH)
        let progressRect = CGRect(x: boardRect.minX, y: boardRect.maxY + gap, width: boardW, height: barHeight)
        let trayRect = CGRect(x: margin, y: trayY, width: trayW, height: trayH)

        let slotsWidth: CGFloat = max(trayW - 2 * trayPad - swapColumn, cell * 1.6)
        let count: Int = max(1, Int(floor(slotsWidth / (cell * 1.6))))
        let slotWidth: CGFloat = slotsWidth / CGFloat(count)

        return PuzzleLayout(
            size: size,
            boardRect: boardRect,
            progressRect: progressRect,
            trayRect: trayRect,
            slotCount: count,
            slotStartX: trayRect.minX + trayPad,
            slotWidth: slotWidth,
            swapCenter: CGPoint(x: trayRect.maxX - trayPad - swapColumn / 2, y: trayRect.midY),
            homeCenter: CGPoint(x: margin + button / 2, y: margin + button / 2),
            eyeCenter: CGPoint(x: size.width - margin - button / 2, y: margin + button / 2),
            cellSize: cell
        )
    }
}
