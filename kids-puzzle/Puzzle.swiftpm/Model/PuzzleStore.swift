import UIKit
import Foundation

/// On-disk persistence: Application Support/Puzzles/<id>/{image.jpg, thumb.jpg, record.json}
@MainActor
final class PuzzleStore: ObservableObject {
    @Published private(set) var puzzles: [PuzzleRecord] = []

    private let rootURL: URL
    private var thumbnailCache: [UUID: UIImage] = [:]

    init() {
        let fm = FileManager.default
        let base: URL = fm.urls(for: .applicationSupportDirectory, in: .userDomainMask).first ?? fm.temporaryDirectory
        self.rootURL = base.appendingPathComponent("Puzzles", isDirectory: true)
        _ = try? fm.createDirectory(at: rootURL, withIntermediateDirectories: true)
        loadAll()
        if puzzles.isEmpty {
            createSample()
        }
    }

    // MARK: - Public API

    /// `image` must already be normalised (3:2, ideally 2400x1600).
    @discardableResult
    func create(image: UIImage, rows: Int, cols: Int, isSample: Bool = false) -> PuzzleRecord? {
        let seed: UInt64 = UInt64.random(in: 1..<(UInt64(1) << 52))
        let record = PuzzleRecord(rows: rows, cols: cols, seed: seed, isSample: isSample)
        let dir = directory(for: record.id)
        do {
            try FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        } catch {
            return nil
        }
        guard let data = image.jpegData(compressionQuality: 0.9) else { return nil }
        do {
            try data.write(to: dir.appendingPathComponent("image.jpg"), options: .atomic)
        } catch {
            return nil
        }
        let thumb = ImageTools.thumbnail(image, width: 600)
        if let thumbData = thumb.jpegData(compressionQuality: 0.8) {
            _ = try? thumbData.write(to: dir.appendingPathComponent("thumb.jpg"), options: .atomic)
        }
        thumbnailCache[record.id] = thumb
        save(record)
        puzzles.insert(record, at: 0)
        return record
    }

    /// Records a placed piece and saves immediately.
    func markPlaced(id: UUID, index: Int) {
        guard let position = puzzles.firstIndex(where: { $0.id == id }) else { return }
        if puzzles[position].placed.contains(index) { return }
        puzzles[position].placed.append(index)
        save(puzzles[position])
    }

    func delete(id: UUID) {
        _ = try? FileManager.default.removeItem(at: directory(for: id))
        thumbnailCache[id] = nil
        puzzles.removeAll { $0.id == id }
    }

    func image(for id: UUID) -> UIImage? {
        let path = directory(for: id).appendingPathComponent("image.jpg").path
        return UIImage(contentsOfFile: path)
    }

    func thumbnail(for id: UUID) -> UIImage? {
        if let cached = thumbnailCache[id] {
            return cached
        }
        let thumbPath = directory(for: id).appendingPathComponent("thumb.jpg").path
        if let loaded = UIImage(contentsOfFile: thumbPath) {
            thumbnailCache[id] = loaded
            return loaded
        }
        if let full = image(for: id) {
            let made = ImageTools.thumbnail(full, width: 600)
            thumbnailCache[id] = made
            return made
        }
        return nil
    }

    // MARK: - Private

    private func directory(for id: UUID) -> URL {
        return rootURL.appendingPathComponent(id.uuidString, isDirectory: true)
    }

    private func save(_ record: PuzzleRecord) {
        let url = directory(for: record.id).appendingPathComponent("record.json")
        if let data = try? JSONEncoder().encode(record) {
            _ = try? data.write(to: url, options: .atomic)
        }
    }

    private func loadAll() {
        let fm = FileManager.default
        guard let entries = try? fm.contentsOfDirectory(at: rootURL, includingPropertiesForKeys: nil) else {
            return
        }
        var loaded: [PuzzleRecord] = []
        for entry in entries {
            let jsonURL = entry.appendingPathComponent("record.json")
            guard let data = try? Data(contentsOf: jsonURL),
                  let record = try? JSONDecoder().decode(PuzzleRecord.self, from: data) else {
                continue
            }
            loaded.append(record)
        }
        puzzles = loaded.sorted { $0.createdAt > $1.createdAt }
    }

    private func createSample() {
        let art = SampleArt.render()
        create(image: art, rows: 10, cols: 15, isSample: true)
    }
}
