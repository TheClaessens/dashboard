# Puzzle

A native iPad jigsaw puzzle app for a 5-year-old, built with SwiftUI. A parent turns a family
photo into a 104, 150 or 187 piece puzzle; the child plays alone. There is no text in the
child's path: icons, pictures and motion only.

The design reasoning is in [`docs/UX.md`](docs/UX.md) (the "Iteration 3 (final)" section is what is built).

> **Written without a compiler available.** This code was written on a machine with no Swift
> toolchain, so it has never been compiled. If Xcode or Swift Playgrounds reports an error, it is
> most likely a small typo or signature mismatch. Copy the error message (and the file/line) and
> paste it to Claude to get it fixed.

## What it does

**Shelf (home).** Big photo cards on a cream background, nothing else. Each card shows a progress
ring while the puzzle is in progress and a big yellow star once finished. Tap a card to open the
puzzle exactly where it was left. On first launch a built-in sample puzzle (a drawn, colourful
scene, 150 pieces) is created so the shelf is never empty.

**Parent mode.** A small, quiet lock in the top-right corner must be **held for 2 seconds** (a ring
fills while you press). A child tapping it gets nothing. In parent mode a "+" card appears (pick a
photo, drag to frame the 3:2 crop, choose 104 / 150 / 187 pieces, tap the check mark), every card
gets a red x badge (delete, with a confirmation alert), and a check mark button leaves parent mode.

**Puzzle screen.**
- A 3:2 board with the photo as a faint "ghost" (the eye button toggles it).
- A sand-coloured tray (the pile) shows only as many pieces as fit in one row. Pieces are dealt
  smartly: corners first, then edges, then interior pieces that touch already placed ones.
- Drag a piece onto the board. Within about half a piece of its spot it snaps in with a soft click and
  a small pop, and locks. A wrong drop floats gently back to its slot. No errors, no penalty.
- Tap a piece (no drag) and its spot on the board glows for a moment.
- The circular arrows button puts the visible pieces at the back of the queue and deals new ones.
- A thin bar fills up as the puzzle progresses. The house button goes back to the shelf.
- Progress is saved after every placed piece, so leaving is never destructive.
- Finishing: the full photo fades in over the pieces, confetti falls, a big star bounces in and a chime
  plays. Tap anywhere to go back to the shelf.
- Works in portrait and landscape. The status bar is hidden and system edge gestures are deferred.

## How to run

### A. On the iPad itself with Swift Playgrounds (free)

1. Install **Swift Playgrounds** (4.4 or newer) from the App Store.
2. Get the `Puzzle.swiftpm` folder onto the iPad: AirDrop it, put it in iCloud Drive, or copy it
   through the Files app.
3. Open it in Files (or from Playgrounds: "Open..."). Playgrounds opens the app package.
4. Press the play button. The app runs full screen **inside Swift Playgrounds**. It does not
   become a separate home-screen app, and it is not "installed" outside Playgrounds. Your puzzles are
   stored in the app's own sandbox and survive between runs.
5. Allow photo access when asked (the photo picker itself works without it).

### B. Mac + Xcode 15 or newer (gives a real home-screen icon)

1. Double-click `Puzzle.swiftpm` (it opens in Xcode).
2. Select the iPad as the run destination (connected by cable or wirelessly; enable Developer Mode
   on the iPad under Settings > Privacy & Security).
3. In the project settings, pick your team under Signing. A **free Apple ID** works, but the app
   must be re-signed (run again from Xcode) every 7 days. A paid developer account lasts a year.
4. Press Run.

The same package also runs in the iPad simulator.

### Tip: Guided Access

To lock the iPad to the puzzle app: Settings > Accessibility > Guided Access, switch it on, then
triple-click the side (or home) button inside the app. The child can't leave the app until you
triple-click and enter the passcode.

## Project structure

```
kids-puzzle/
  README.md
  docs/UX.md                    UX iterations and the final spec
  Puzzle.swiftpm/
    Package.swift               Swift Playgrounds / Xcode app package (iOS 17, iPad)
    App/PuzzleApp.swift         @main, RootView (shelf <-> puzzle switch)
    Model/
      PuzzleRecord.swift        Codable puzzle record (grid, seed, placed pieces)
      PuzzleStore.swift         Persistence in Application Support/Puzzles/<id>/
      PuzzleSession.swift       State of the puzzle being played
      ImageTools.swift          Orientation fix, 3:2 crop, thumbnails
    Engine/
      SeededRandom.swift        SplitMix64 deterministic RNG
      PieceShape.swift          Jigsaw edge layout and piece paths (interlocking knobs)
      PieceCutter.swift         Renders each piece to a UIImage off the main thread
      PuzzleGeometry.swift      Cell size / padding maths shared by engine and views
      PileQueue.swift           Pure logic for the smart pile
      SampleArt.swift           Core Graphics drawing of the sample scene
      Sound.swift               System sounds for snap and completion
    Views/
      Theme.swift               Colours, Color(hex:), round icon button
      ShelfView.swift           Shelf, cards, progress ring, parent mode
      ParentGateButton.swift    Hold-for-2-seconds lock
      NewPuzzleView.swift       Photo picker, crop, size choice (parent only)
      PuzzleView.swift          Puzzle screen shell, progress bar, loading, drag overlay
      PuzzleLayout.swift        Geometry-driven layout (portrait and landscape)
      BoardView.swift           Board, ghost, placed pieces, hint glow
      PileView.swift            Tray, pile slots, drag and snap logic
      CelebrationView.swift     Confetti and star
```

Everything is drawn in code: no asset catalogs and no resource files.
