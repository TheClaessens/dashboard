import SwiftUI
import PhotosUI
import UIKit

/// How many pieces a new puzzle gets. Each is a near-square cell grid on a 3:2 board.
enum PuzzleSizeChoice: CaseIterable, Identifiable {
    case small
    case medium
    case large

    var id: PuzzleSizeChoice { self }

    var rows: Int {
        switch self {
        case .small: return 8
        case .medium: return 10
        case .large: return 11
        }
    }

    var cols: Int {
        switch self {
        case .small: return 13
        case .medium: return 15
        case .large: return 17
        }
    }

    var count: Int { rows * cols }

    var symbolName: String {
        switch self {
        case .small: return "square.grid.2x2.fill"
        case .medium: return "square.grid.3x3.fill"
        case .large: return "square.grid.4x3.fill"
        }
    }
}

/// Parent-only: pick a photo, frame it in a 3:2 crop, choose the size.
@MainActor
struct NewPuzzleView: View {
    let store: PuzzleStore

    @Environment(\.dismiss) private var dismiss
    @State private var pickerItem: PhotosPickerItem? = nil
    @State private var image: UIImage? = nil
    /// Normalised pan in -1...1 per axis (1 = image dragged fully right/down).
    @State private var pan: CGSize = CGSize.zero
    @State private var choice: PuzzleSizeChoice = .medium
    @State private var isWorking: Bool = false

    var body: some View {
        ZStack {
            Theme.cream.ignoresSafeArea()
            VStack(spacing: 24) {
                topBar
                cropArea
                sizeRow
                pickerRow
            }
            .padding(24)
            if isWorking {
                workingOverlay
            }
        }
        .onChange(of: pickerItem) { _, newItem in
            loadPhoto(newItem)
        }
    }

    // MARK: - Pieces of the screen

    private var topBar: some View {
        HStack {
            CircleIconButton(systemName: "xmark") {
                dismiss()
            }
            Spacer()
            CircleIconButton(systemName: "checkmark") {
                confirm()
            }
            .opacity(image == nil ? 0.35 : 1.0)
            .disabled(image == nil || isWorking)
        }
    }

    private var cropArea: some View {
        GeometryReader { geo in
            let frameW: CGFloat = min(geo.size.width, geo.size.height * 1.5)
            let frameH: CGFloat = frameW / 1.5
            ZStack {
                cropContent(frameSize: CGSize(width: frameW, height: frameH))
            }
            .frame(width: frameW, height: frameH)
            .position(x: geo.size.width / 2, y: geo.size.height / 2)
        }
    }

    @ViewBuilder
    private func cropContent(frameSize: CGSize) -> some View {
        if let image = image {
            CropEditorView(image: image, frameSize: frameSize, pan: $pan)
        } else {
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .fill(Color.white.opacity(0.7))
                .overlay {
                    Image(systemName: "photo.on.rectangle.angled")
                        .font(.system(size: 64))
                        .foregroundColor(Theme.ink.opacity(0.4))
                }
        }
    }

    private var sizeRow: some View {
        HStack(spacing: 20) {
            ForEach(PuzzleSizeChoice.allCases) { option in
                SizeButton(option: option, isSelected: option == choice) {
                    choice = option
                }
            }
        }
    }

    private var pickerRow: some View {
        PhotosPicker(selection: $pickerItem, matching: .images) {
            HStack(spacing: 10) {
                Image(systemName: "photo.on.rectangle")
                Text("Choose photo")
            }
            .font(.system(size: 22, weight: .semibold))
            .foregroundColor(Theme.ink)
            .padding(.horizontal, 28)
            .padding(.vertical, 16)
            .background(Capsule().fill(Color.white.opacity(0.85)))
            .shadow(color: Color.black.opacity(0.1), radius: 4, x: 0, y: 2)
        }
    }

    private var workingOverlay: some View {
        ZStack {
            Color.black.opacity(0.25).ignoresSafeArea()
            ProgressView()
                .scaleEffect(2.0)
        }
    }

    // MARK: - Actions

    private func loadPhoto(_ item: PhotosPickerItem?) {
        guard let item = item else { return }
        Task { @MainActor in
            let data: Data? = try? await item.loadTransferable(type: Data.self)
            guard let data = data else { return }
            let task = Task.detached(priority: .userInitiated) { () -> UIImage? in
                guard let raw = UIImage(data: data) else { return nil }
                return ImageTools.upright(raw)
            }
            let result: UIImage? = await task.value
            if let result = result {
                pan = CGSize.zero
                image = result
            }
        }
    }

    private func confirm() {
        guard let source = image, !isWorking else { return }
        isWorking = true
        let rect: CGRect = NewPuzzleView.cropRect(for: source, pan: pan)
        let rows: Int = choice.rows
        let cols: Int = choice.cols
        Task { @MainActor in
            let task = Task.detached(priority: .userInitiated) { () -> UIImage in
                return ImageTools.crop(source, to: rect)
            }
            let cropped: UIImage = await task.value
            store.create(image: cropped, rows: rows, cols: cols)
            dismiss()
        }
    }

    /// The 3:2 crop rect in pixel space of the (upright, scale-1) image.
    static func cropRect(for image: UIImage, pan: CGSize) -> CGRect {
        let iw: CGFloat = image.size.width
        let ih: CGFloat = image.size.height
        let aspect: CGFloat = 1.5
        var cw: CGFloat = iw
        var ch: CGFloat = iw / aspect
        if ch > ih {
            ch = ih
            cw = ih * aspect
        }
        let slackX: CGFloat = iw - cw
        let slackY: CGFloat = ih - ch
        // Dragging the image right shows more of its left side, so the crop moves left.
        let x: CGFloat = slackX * (1.0 - pan.width) / 2.0
        let y: CGFloat = slackY * (1.0 - pan.height) / 2.0
        return CGRect(x: x, y: y, width: cw, height: ch)
    }
}

// MARK: - Subviews

struct SizeButton: View {
    let option: PuzzleSizeChoice
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: 6) {
                Image(systemName: option.symbolName)
                    .font(.system(size: 40))
                Text("\(option.count)")
                    .font(.system(size: 28, weight: .bold, design: .rounded))
            }
            .foregroundColor(isSelected ? Color.white : Theme.ink)
            .frame(width: 140, height: 110)
            .background(
                RoundedRectangle(cornerRadius: 20, style: .continuous)
                    .fill(isSelected ? Theme.accent : Color.white.opacity(0.85))
            )
            .shadow(color: Color.black.opacity(0.1), radius: 4, x: 0, y: 2)
        }
        .buttonStyle(PressScaleButtonStyle())
    }
}

/// The photo in a fixed 3:2 frame (scaled to fill); dragging pans the crop.
struct CropEditorView: View {
    let image: UIImage
    let frameSize: CGSize
    @Binding var pan: CGSize

    @State private var dragStart: CGSize? = nil

    private var fillScale: CGFloat {
        let iw: CGFloat = max(image.size.width, 1)
        let ih: CGFloat = max(image.size.height, 1)
        return max(frameSize.width / iw, frameSize.height / ih)
    }

    private var displayedSize: CGSize {
        return CGSize(width: image.size.width * fillScale, height: image.size.height * fillScale)
    }

    private var maxPan: CGSize {
        let w: CGFloat = max(0, (displayedSize.width - frameSize.width) / 2)
        let h: CGFloat = max(0, (displayedSize.height - frameSize.height) / 2)
        return CGSize(width: w, height: h)
    }

    var body: some View {
        ZStack {
            Color.black.opacity(0.08)
            Image(uiImage: image)
                .resizable()
                .frame(width: displayedSize.width, height: displayedSize.height)
                .offset(x: pan.width * maxPan.width, y: pan.height * maxPan.height)
        }
        .frame(width: frameSize.width, height: frameSize.height)
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
        .overlay {
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .stroke(Color.white, lineWidth: 4)
        }
        .shadow(color: Color.black.opacity(0.2), radius: 8, x: 0, y: 4)
        .gesture(
            DragGesture()
                .onChanged { value in
                    dragChanged(value)
                }
                .onEnded { _ in
                    dragStart = nil
                }
        )
    }

    private func dragChanged(_ value: DragGesture.Value) {
        let start: CGSize = dragStart ?? pan
        if dragStart == nil {
            dragStart = pan
        }
        let mx: CGFloat = maxPan.width
        let my: CGFloat = maxPan.height
        var px: CGFloat = start.width
        var py: CGFloat = start.height
        if mx > 0 {
            px += value.translation.width / mx
        }
        if my > 0 {
            py += value.translation.height / my
        }
        pan = CGSize(width: min(max(px, -1), 1), height: min(max(py, -1), 1))
    }
}
