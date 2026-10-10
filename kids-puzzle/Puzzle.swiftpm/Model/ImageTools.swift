import UIKit

/// Image helpers. Everything here is pure and safe to call off the main thread.
enum ImageTools {
    /// Every puzzle image is normalised to exactly 3:2 at this size.
    static var outputSize: CGSize {
        return CGSize(width: 2400, height: 1600)
    }

    /// Redraws the image so its orientation is baked in (`.up`), capping the longest side.
    static func upright(_ image: UIImage, maxDimension: CGFloat = 3600) -> UIImage {
        let size = image.size
        let longest: CGFloat = max(size.width, size.height)
        let factor: CGFloat = longest > maxDimension ? maxDimension / longest : 1.0
        let target = CGSize(
            width: max((size.width * factor).rounded(), 1),
            height: max((size.height * factor).rounded(), 1)
        )
        let format = UIGraphicsImageRendererFormat()
        format.scale = 1
        format.opaque = true
        let renderer = UIGraphicsImageRenderer(size: target, format: format)
        return renderer.image { _ in
            image.draw(in: CGRect(origin: CGPoint.zero, size: target))
        }
    }

    /// Crops `rect` (in pixel coordinates of an upright, scale-1 image) to 2400x1600.
    static func crop(_ image: UIImage, to rect: CGRect) -> UIImage {
        let target = ImageTools.outputSize
        let safeW: CGFloat = max(rect.width, 1)
        let safeH: CGFloat = max(rect.height, 1)
        let sx: CGFloat = target.width / safeW
        let sy: CGFloat = target.height / safeH
        let format = UIGraphicsImageRendererFormat()
        format.scale = 1
        format.opaque = true
        let renderer = UIGraphicsImageRenderer(size: target, format: format)
        return renderer.image { _ in
            let drawRect = CGRect(
                x: -rect.minX * sx,
                y: -rect.minY * sy,
                width: image.size.width * sx,
                height: image.size.height * sy
            )
            image.draw(in: drawRect)
        }
    }

    /// A small scaled copy for the shelf.
    static func thumbnail(_ image: UIImage, width: CGFloat) -> UIImage {
        let size = image.size
        let aspect: CGFloat = size.height / max(size.width, 1)
        let target = CGSize(width: width, height: (width * aspect).rounded())
        let format = UIGraphicsImageRendererFormat()
        format.scale = 1
        format.opaque = true
        let renderer = UIGraphicsImageRenderer(size: target, format: format)
        return renderer.image { _ in
            image.draw(in: CGRect(origin: CGPoint.zero, size: target))
        }
    }
}
