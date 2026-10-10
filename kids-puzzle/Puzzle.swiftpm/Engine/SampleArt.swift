import UIKit

/// A cheerful 2400x1600 scene drawn with Core Graphics: used as the built-in sample puzzle.
enum SampleArt {
    static let width: CGFloat = 2400
    static let height: CGFloat = 1600

    static func render() -> UIImage {
        let format = UIGraphicsImageRendererFormat()
        format.scale = 1
        format.opaque = true
        let size = CGSize(width: SampleArt.width, height: SampleArt.height)
        let renderer = UIGraphicsImageRenderer(size: size, format: format)
        return renderer.image { ctx in
            SampleArt.drawSky(ctx.cgContext)
            SampleArt.drawSun()
            SampleArt.drawRainbow()
            SampleArt.drawClouds()
            SampleArt.drawBirdsAndKite()
            SampleArt.drawHills()
            SampleArt.drawTrees()
            SampleArt.drawHouse()
            SampleArt.drawBalloons()
            SampleArt.drawPath()
            SampleArt.drawFlowers()
        }
    }

    // MARK: - Basic helpers

    private static func fillOval(_ rect: CGRect, _ color: UIColor) {
        color.setFill()
        UIBezierPath(ovalIn: rect).fill()
    }

    private static func fillRect(_ rect: CGRect, _ color: UIColor) {
        color.setFill()
        UIBezierPath(rect: rect).fill()
    }

    private static func fillPolygon(_ points: [CGPoint], _ color: UIColor) {
        guard let first = points.first else { return }
        let path = UIBezierPath()
        path.move(to: first)
        for p in points.dropFirst() {
            path.addLine(to: p)
        }
        path.close()
        color.setFill()
        path.fill()
    }

    private static func strokeLine(from a: CGPoint, to b: CGPoint, width: CGFloat, _ color: UIColor) {
        let path = UIBezierPath()
        path.move(to: a)
        path.addLine(to: b)
        path.lineWidth = width
        path.lineCapStyle = .round
        color.setStroke()
        path.stroke()
    }

    // MARK: - Sky

    private static func drawSky(_ cg: CGContext) {
        fillRect(CGRect(x: 0, y: 0, width: width, height: height), UIColor(hex: 0xFFF0C9))
        let colors = [
            UIColor(hex: 0x62B8EE).cgColor,
            UIColor(hex: 0xB5E3FA).cgColor,
            UIColor(hex: 0xFFF0C9).cgColor
        ] as CFArray
        let locations: [CGFloat] = [0.0, 0.55, 1.0]
        let space = CGColorSpaceCreateDeviceRGB()
        if let gradient = CGGradient(colorsSpace: space, colors: colors, locations: locations) {
            cg.drawLinearGradient(
                gradient,
                start: CGPoint(x: 0, y: 0),
                end: CGPoint(x: 0, y: 1150),
                options: [.drawsBeforeStartLocation, .drawsAfterEndLocation]
            )
        }
    }

    private static func drawSun() {
        let centre = CGPoint(x: 2050, y: 300)
        fillOval(CGRect(x: centre.x - 270, y: centre.y - 270, width: 540, height: 540), UIColor(hex: 0xFFF3B0, alpha: 0.35))
        let rayColor = UIColor(hex: 0xFFC83D)
        for i in 0..<16 {
            let angle: CGFloat = CGFloat(i) * (CGFloat.pi * 2.0 / 16.0)
            let inner: CGFloat = 185
            let outer: CGFloat = (i % 2 == 0) ? 305 : 250
            let a = CGPoint(x: centre.x + cos(angle) * inner, y: centre.y + sin(angle) * inner)
            let b = CGPoint(x: centre.x + cos(angle) * outer, y: centre.y + sin(angle) * outer)
            strokeLine(from: a, to: b, width: 22, rayColor)
        }
        fillOval(CGRect(x: centre.x - 150, y: centre.y - 150, width: 300, height: 300), UIColor(hex: 0xFFC83D))
        fillOval(CGRect(x: centre.x - 128, y: centre.y - 128, width: 256, height: 256), UIColor(hex: 0xFFE066))
        // Smiley face.
        let dark = UIColor(hex: 0x8A4B08)
        fillOval(CGRect(x: centre.x - 55, y: centre.y - 40, width: 24, height: 34), dark)
        fillOval(CGRect(x: centre.x + 31, y: centre.y - 40, width: 24, height: 34), dark)
        let smile = UIBezierPath(
            arcCenter: CGPoint(x: centre.x, y: centre.y + 5),
            radius: 62,
            startAngle: CGFloat.pi * 0.2,
            endAngle: CGFloat.pi * 0.8,
            clockwise: true
        )
        smile.lineWidth = 12
        smile.lineCapStyle = .round
        dark.setStroke()
        smile.stroke()
        fillOval(CGRect(x: centre.x - 100, y: centre.y + 10, width: 40, height: 28), UIColor(hex: 0xFF9E7A, alpha: 0.55))
        fillOval(CGRect(x: centre.x + 60, y: centre.y + 10, width: 40, height: 28), UIColor(hex: 0xFF9E7A, alpha: 0.55))
    }

    private static func drawRainbow() {
        let centre = CGPoint(x: 640, y: 1150)
        let hexes: [UInt32] = [0xE5383B, 0xF77F00, 0xFCCB16, 0x57CC5B, 0x3A9AD9, 0x5B5BD6, 0x9B5DE5]
        for (i, hex) in hexes.enumerated() {
            let radius: CGFloat = 560 - CGFloat(i) * 26
            let path = UIBezierPath(
                arcCenter: centre,
                radius: radius,
                startAngle: CGFloat.pi,
                endAngle: CGFloat.pi * 2.0,
                clockwise: true
            )
            path.lineWidth = 27
            UIColor(hex: hex).setStroke()
            path.stroke()
        }
    }

    private static func cloud(_ c: CGPoint, _ s: CGFloat) {
        let white = UIColor(white: 1.0, alpha: 0.95)
        fillOval(CGRect(x: c.x - 120 * s, y: c.y - 30 * s, width: 240 * s, height: 80 * s), white)
        fillOval(CGRect(x: c.x - 80 * s, y: c.y - 70 * s, width: 110 * s, height: 100 * s), white)
        fillOval(CGRect(x: c.x - 10 * s, y: c.y - 90 * s, width: 130 * s, height: 120 * s), white)
        fillOval(CGRect(x: c.x + 50 * s, y: c.y - 50 * s, width: 100 * s, height: 90 * s), white)
    }

    private static func drawClouds() {
        cloud(CGPoint(x: 330, y: 210), 1.3)
        cloud(CGPoint(x: 930, y: 150), 1.0)
        cloud(CGPoint(x: 1450, y: 250), 1.4)
        cloud(CGPoint(x: 2180, y: 700), 1.1)
        cloud(CGPoint(x: 120, y: 520), 0.8)
        cloud(CGPoint(x: 1780, y: 90), 0.7)
    }

    private static func bird(_ c: CGPoint, _ s: CGFloat) {
        let path = UIBezierPath()
        path.move(to: CGPoint(x: c.x - 34 * s, y: c.y))
        path.addQuadCurve(to: CGPoint(x: c.x, y: c.y + 10 * s), controlPoint: CGPoint(x: c.x - 18 * s, y: c.y - 18 * s))
        path.addQuadCurve(to: CGPoint(x: c.x + 34 * s, y: c.y), controlPoint: CGPoint(x: c.x + 18 * s, y: c.y - 18 * s))
        path.lineWidth = 7
        path.lineCapStyle = .round
        UIColor(hex: 0x3D405B).setStroke()
        path.stroke()
    }

    private static func drawBirdsAndKite() {
        bird(CGPoint(x: 1650, y: 360), 1.2)
        bird(CGPoint(x: 1770, y: 440), 0.9)
        bird(CGPoint(x: 1540, y: 470), 1.0)
        bird(CGPoint(x: 780, y: 230), 1.0)
        bird(CGPoint(x: 880, y: 300), 0.8)
        // Kite with a wavy tail.
        let top = CGPoint(x: 1500, y: 560)
        fillPolygon(
            [top, CGPoint(x: top.x + 70, y: top.y + 90), CGPoint(x: top.x, y: top.y + 220), CGPoint(x: top.x - 70, y: top.y + 90)],
            UIColor(hex: 0xEF476F)
        )
        fillPolygon(
            [top, CGPoint(x: top.x + 70, y: top.y + 90), CGPoint(x: top.x, y: top.y + 90)],
            UIColor(hex: 0xFFD166)
        )
        fillPolygon(
            [CGPoint(x: top.x, y: top.y + 90), CGPoint(x: top.x - 70, y: top.y + 90), CGPoint(x: top.x, y: top.y + 220)],
            UIColor(hex: 0x06D6A0)
        )
        let tail = UIBezierPath()
        tail.move(to: CGPoint(x: top.x, y: top.y + 220))
        tail.addQuadCurve(to: CGPoint(x: top.x - 60, y: top.y + 340), controlPoint: CGPoint(x: top.x + 70, y: top.y + 270))
        tail.addQuadCurve(to: CGPoint(x: top.x + 10, y: top.y + 440), controlPoint: CGPoint(x: top.x - 120, y: top.y + 390))
        tail.lineWidth = 5
        UIColor(hex: 0x5C4033).setStroke()
        tail.stroke()
        fillOval(CGRect(x: top.x - 76, y: top.y + 330, width: 32, height: 20), UIColor(hex: 0x118AB2))
        fillOval(CGRect(x: top.x - 20, y: top.y + 395, width: 32, height: 20), UIColor(hex: 0xFFD166))
    }

    // MARK: - Ground

    private static func hillY(x: CGFloat, base: CGFloat, amp: CGFloat, freq: CGFloat, phase: CGFloat) -> CGFloat {
        let primary: CGFloat = amp * sin(x * freq + phase)
        let detail: CGFloat = amp * 0.35 * sin(x * freq * 2.3 + phase * 1.7)
        return base + primary + detail
    }

    private static func hill(base: CGFloat, amp: CGFloat, freq: CGFloat, phase: CGFloat, color: UIColor) {
        let path = UIBezierPath()
        path.move(to: CGPoint(x: 0, y: height))
        var x: CGFloat = 0
        while x <= width {
            path.addLine(to: CGPoint(x: x, y: hillY(x: x, base: base, amp: amp, freq: freq, phase: phase)))
            x += 12
        }
        path.addLine(to: CGPoint(x: width, y: height))
        path.close()
        color.setFill()
        path.fill()
    }

    private static func hillStripes(base: CGFloat, amp: CGFloat, freq: CGFloat, phase: CGFloat, count: Int, spacing: CGFloat, color: UIColor) {
        for k in 1...count {
            let offset: CGFloat = CGFloat(k) * spacing
            let path = UIBezierPath()
            var x: CGFloat = 0
            var first = true
            while x <= width {
                let y: CGFloat = hillY(x: x, base: base, amp: amp, freq: freq, phase: phase) + offset
                if first {
                    path.move(to: CGPoint(x: x, y: y))
                    first = false
                } else {
                    path.addLine(to: CGPoint(x: x, y: y))
                }
                x += 12
            }
            path.lineWidth = 9 + CGFloat(k)
            color.setStroke()
            path.stroke()
        }
    }

    private static func drawHills() {
        hill(base: 1000, amp: 70, freq: 0.0030, phase: 0.4, color: UIColor(hex: 0x9AD98A))
        hill(base: 1135, amp: 80, freq: 0.0035, phase: 1.0, color: UIColor(hex: 0x6CC067))
        hillStripes(base: 1135, amp: 80, freq: 0.0035, phase: 1.0, count: 4, spacing: 38, color: UIColor(hex: 0x5BB058, alpha: 0.55))
        hill(base: 1340, amp: 70, freq: 0.0028, phase: 2.2, color: UIColor(hex: 0x45A94E))
        hillStripes(base: 1340, amp: 70, freq: 0.0028, phase: 2.2, count: 6, spacing: 40, color: UIColor(hex: 0x3A9A45, alpha: 0.6))
    }

    private static func tree(x: CGFloat, baseY: CGFloat, scale s: CGFloat) {
        fillRect(CGRect(x: x - 16 * s, y: baseY - 130 * s, width: 32 * s, height: 130 * s), UIColor(hex: 0x8B5A2B))
        fillOval(CGRect(x: x - 90 * s, y: baseY - 250 * s, width: 180 * s, height: 160 * s), UIColor(hex: 0x2E8B3D))
        fillOval(CGRect(x: x - 60 * s, y: baseY - 300 * s, width: 140 * s, height: 140 * s), UIColor(hex: 0x3FA34D))
        fillOval(CGRect(x: x - 10 * s, y: baseY - 250 * s, width: 110 * s, height: 110 * s), UIColor(hex: 0x4FB85C))
        let apple = UIColor(hex: 0xE63946)
        fillOval(CGRect(x: x - 55 * s, y: baseY - 200 * s, width: 22 * s, height: 22 * s), apple)
        fillOval(CGRect(x: x + 30 * s, y: baseY - 230 * s, width: 22 * s, height: 22 * s), apple)
        fillOval(CGRect(x: x - 5 * s, y: baseY - 160 * s, width: 22 * s, height: 22 * s), apple)
    }

    private static func drawTrees() {
        tree(x: 1130, baseY: 1170, scale: 1.0)
        tree(x: 1290, baseY: 1195, scale: 0.7)
        tree(x: 2170, baseY: 1175, scale: 1.25)
    }

    private static func drawHouse() {
        let wall = CGRect(x: 1500, y: 940, width: 400, height: 270)
        let roofRed = UIColor(hex: 0xD64545)
        let roofDark = UIColor(hex: 0xB53030)
        // Chimney first, so the roof overlaps it.
        fillRect(CGRect(x: 1800, y: 790, width: 56, height: 130), roofDark)
        fillRect(CGRect(x: 1792, y: 780, width: 72, height: 20), UIColor(hex: 0x8F2323))
        fillRect(wall, UIColor(hex: 0xFFF8F0))
        fillRect(CGRect(x: wall.minX, y: wall.maxY - 24, width: wall.width, height: 24), UIColor(hex: 0xE9DCCB))
        fillPolygon(
            [CGPoint(x: 1460, y: 948), CGPoint(x: 1700, y: 760), CGPoint(x: 1940, y: 948)],
            roofRed
        )
        fillRect(CGRect(x: 1460, y: 936, width: 480, height: 24), roofDark)
        fillOval(CGRect(x: 1670, y: 850, width: 60, height: 60), UIColor(hex: 0xFFFFFF))
        fillOval(CGRect(x: 1680, y: 860, width: 40, height: 40), UIColor(hex: 0x8FD3F4))
        // Door.
        fillRect(CGRect(x: 1665, y: 1055, width: 70, height: 155), roofRed)
        fillOval(CGRect(x: 1715, y: 1130, width: 12, height: 12), UIColor(hex: 0xFFD166))
        // Windows.
        let windows: [CGRect] = [
            CGRect(x: 1540, y: 1010, width: 84, height: 84),
            CGRect(x: 1776, y: 1010, width: 84, height: 84)
        ]
        for w in windows {
            fillRect(w.insetBy(dx: -8, dy: -8), roofRed)
            fillRect(w, UIColor(hex: 0x8FD3F4))
            fillRect(CGRect(x: w.midX - 3, y: w.minY, width: 6, height: w.height), UIColor.white)
            fillRect(CGRect(x: w.minX, y: w.midY - 3, width: w.width, height: 6), UIColor.white)
        }
        // Flower boxes under the windows.
        for w in windows {
            fillRect(CGRect(x: w.minX - 8, y: w.maxY + 8, width: w.width + 16, height: 18), UIColor(hex: 0x8B5A2B))
            fillOval(CGRect(x: w.minX, y: w.maxY - 4, width: 22, height: 22), UIColor(hex: 0xFF70A6))
            fillOval(CGRect(x: w.minX + 30, y: w.maxY - 4, width: 22, height: 22), UIColor(hex: 0xFFD166))
            fillOval(CGRect(x: w.minX + 60, y: w.maxY - 4, width: 22, height: 22), UIColor(hex: 0xFF70A6))
        }
    }

    private static func balloon(centre: CGPoint, radius rx: CGFloat, color: UIColor) {
        let ry: CGFloat = rx * 1.25
        let tieY: CGFloat = centre.y + ry
        // String first, so the balloon covers its top.
        let string = UIBezierPath()
        string.move(to: CGPoint(x: centre.x, y: tieY + 16))
        string.addQuadCurve(
            to: CGPoint(x: centre.x + 30, y: tieY + 330),
            controlPoint: CGPoint(x: centre.x - 60, y: tieY + 150)
        )
        string.lineWidth = 4
        UIColor(hex: 0x4A4A4A, alpha: 0.7).setStroke()
        string.stroke()
        fillOval(CGRect(x: centre.x - rx, y: centre.y - ry, width: rx * 2, height: ry * 2), color)
        fillPolygon(
            [CGPoint(x: centre.x, y: tieY - 4), CGPoint(x: centre.x - 12, y: tieY + 18), CGPoint(x: centre.x + 12, y: tieY + 18)],
            color
        )
        fillOval(
            CGRect(x: centre.x - rx * 0.6, y: centre.y - ry * 0.65, width: rx * 0.45, height: ry * 0.4),
            UIColor(white: 1.0, alpha: 0.5)
        )
    }

    private static func drawBalloons() {
        balloon(centre: CGPoint(x: 1010, y: 430), radius: 62, color: UIColor(hex: 0xE63946))
        balloon(centre: CGPoint(x: 1150, y: 330), radius: 70, color: UIColor(hex: 0xFFD23F))
        balloon(centre: CGPoint(x: 1290, y: 470), radius: 58, color: UIColor(hex: 0x3A86FF))
        balloon(centre: CGPoint(x: 330, y: 340), radius: 66, color: UIColor(hex: 0x2EC4B6))
        balloon(centre: CGPoint(x: 520, y: 250), radius: 60, color: UIColor(hex: 0xFF70A6))
        balloon(centre: CGPoint(x: 2230, y: 880), radius: 64, color: UIColor(hex: 0xB5179E))
        balloon(centre: CGPoint(x: 150, y: 820), radius: 56, color: UIColor(hex: 0xFF9F1C))
    }

    private static func drawPath() {
        let path = UIBezierPath()
        path.move(to: CGPoint(x: 1668, y: 1210))
        path.addLine(to: CGPoint(x: 1735, y: 1210))
        path.addQuadCurve(to: CGPoint(x: 2020, y: 1600), controlPoint: CGPoint(x: 1740, y: 1400))
        path.addLine(to: CGPoint(x: 1380, y: 1600))
        path.addQuadCurve(to: CGPoint(x: 1668, y: 1210), controlPoint: CGPoint(x: 1660, y: 1400))
        path.close()
        UIColor(hex: 0xF1DDB0).setFill()
        path.fill()
        // Pebbles.
        let pebble = UIColor(hex: 0xD9C294)
        fillOval(CGRect(x: 1690, y: 1290, width: 30, height: 18), pebble)
        fillOval(CGRect(x: 1650, y: 1380, width: 36, height: 20), pebble)
        fillOval(CGRect(x: 1740, y: 1430, width: 28, height: 16), pebble)
        fillOval(CGRect(x: 1600, y: 1510, width: 40, height: 22), pebble)
        fillOval(CGRect(x: 1760, y: 1540, width: 34, height: 18), pebble)
    }

    private static func flower(at c: CGPoint, radius r: CGFloat, petals: UIColor) {
        for i in 0..<5 {
            let angle: CGFloat = CGFloat(i) * (CGFloat.pi * 2.0 / 5.0)
            let px: CGFloat = c.x + cos(angle) * r * 0.7
            let py: CGFloat = c.y + sin(angle) * r * 0.7
            fillOval(CGRect(x: px - r * 0.5, y: py - r * 0.5, width: r, height: r), petals)
        }
        fillOval(CGRect(x: c.x - r * 0.38, y: c.y - r * 0.38, width: r * 0.76, height: r * 0.76), UIColor(hex: 0xFFD23F))
    }

    private static func drawFlowers() {
        var rng = SeededRandom(seed: 2024)
        let hexes: [UInt32] = [0xFF70A6, 0xFFFFFF, 0xB388EB, 0xFF4D6D, 0xFFB703, 0x74C0FC]
        var placed = 0
        while placed < 120 {
            let x: CGFloat = rng.nextCGFloat(in: 0...2400)
            let y: CGFloat = rng.nextCGFloat(in: 1300...1585)
            // Keep the dirt path clear.
            let onPath: Bool = x > 1400 && x < 2040 && y > 1250
            if onPath { continue }
            let r: CGFloat = rng.nextCGFloat(in: 11...22)
            let pick: Int = Int(rng.nextDouble() * Double(hexes.count))
            flower(at: CGPoint(x: x, y: y), radius: r, petals: UIColor(hex: hexes[min(pick, hexes.count - 1)]))
            placed += 1
        }
        // A few on the middle hill, away from the house.
        for i in 0..<14 {
            let x: CGFloat = 80 + CGFloat(i) * 70
            let y: CGFloat = 1230 + CGFloat((i * 37) % 60)
            flower(at: CGPoint(x: x, y: y), radius: 14, petals: UIColor(hex: hexes[i % hexes.count]))
        }
    }
}
