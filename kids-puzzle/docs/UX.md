# Puzzle — UX design iterations

**Who it's for:** a 5-year-old who can't read yet, on an iPad, doing 100–200 piece
puzzles made from family photos. A parent sets the puzzle up; the child plays alone.

**Design goals**
1. No text in the child's path. Icons, pictures and motion only.
2. Nothing to get lost in. No menus, settings, timers or scores.
3. Make 150 pieces doable for a 5-year-old. On paper, that is far too many for this age.
4. Nothing breaks. Progress saves automatically, and nothing destructive is reachable
   without the parent.

---

## Iteration 1: "a normal jigsaw app"

```
┌──────────────────────────────────────────────────────────┐
│ ☰ Menu   Puzzle #3      ⏱ 04:12   [Preview][Edges][Hint] │
├──────────────────────────────────────────────────────────┤
│  ▢ ▢   ▢      ┌──────────────────────┐   ▢  ▢     ▢      │
│ ▢   ▢ ▢   ▢   │                      │  ▢   ▢  ▢   ▢    │
│   ▢  ▢     ▢  │        board         │ ▢  ▢     ▢       │
│ ▢ ▢     ▢  ▢  │                      │    ▢  ▢   ▢  ▢   │
│  ▢   ▢ ▢      └──────────────────────┘  ▢   ▢    ▢      │
│ ▢  ▢   ▢   ▢  ▢   ▢ ▢   ▢  ▢   ▢ ▢   ▢  ▢   ▢  ▢   ▢     │
└──────────────────────────────────────────────────────────┘
Home: grid of puzzles · "New puzzle" → photo picker → piece-count slider (24…500)
```

**Critique**
- A timer, a title and five buttons are all distractions, and the text means nothing
  to a non-reader.
- 150 pieces scattered around the board is visual chaos. Pieces pile up and hide each
  other, and the child spends their energy searching instead of matching.
- The leftover space around a 3:2 board leaves very little room for 150 scattered
  pieces, so they end up tiny or overlapping.
- A piece-count slider is meaningless to the child, and the parent doesn't need that
  much range.
- "Hint" and "Edges" are adult strategies.
- Nothing stops the child from deleting puzzles or opening the photo library.

## Iteration 2: "kid mode + parent mode"

```
┌──────────────────────────────────────────────────────────┐
│ ⌂                                                     👁 │
│        ┌────────────────────────────────────┐            │
│        │   faint "ghost" of the photo       │            │
│        │   (the child matches shapes and    │            │
│        │    colours onto it)                │            │
│        └────────────────────────────────────┘            │
│ ◀ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▶      │ ← scrolling tray, all 150
└──────────────────────────────────────────────────────────┘
```

**What improved**
- The **ghost image** on the board is the key scaffolding. It turns the task into
  colour and picture matching, which a 5-year-old can do.
- The parent features (adding a photo, deleting) are behind a parent gate.
- Pieces live in a **tray**, so the board stays clean.

**Critique**
- A tray that scrolls through 150 pieces is tedious. The child has to scroll and hunt,
  and scrolling and dragging fight each other.
- Pieces dropped in the wrong place: do they stay on the board and cover the ghost
  image? That clutters fast.
- No sense of progress, and no reward moment.
- Photos come in every aspect ratio. A portrait photo on a landscape board gives tiny
  pieces.

## Iteration 3 (final): "the smart pile"

### Shelf (home)

```
┌──────────────────────────────────────────────────────────┐
│                                                     (🔒) │ ← hold 2 s = parent mode
│   ┌────────┐   ┌────────┐   ┌────────┐                   │
│   │ photo  │   │ photo  │   │ photo  │                   │
│   │   ◔    │   │   ★    │   │   ◑    │   ◔ = progress ring│
│   └────────┘   └────────┘   └────────┘   ★ = finished    │
└──────────────────────────────────────────────────────────┘
Parent mode:  [ + ] card appears, cards get ✕ badges, ✓ to leave.
```

- Big photo cards and nothing else. Tapping a card opens the puzzle exactly where it
  was left.
- **Parent gate:** a small, quiet lock button that only works if you **hold it for
  2 seconds** while a ring fills. A child tapping it gets nothing. Parent mode shows a
  "+" card and ✕ delete badges.
- On first launch, a built-in sample puzzle (a drawn, colourful scene) means the shelf
  is never empty.

### New puzzle (parent only)

```
┌──────────────────────────────────────────────────────────┐
│  ✕                                                  ✓    │
│        ┌────────────────────────────────────┐            │
│        │  photo, drag to frame it (3:2)     │            │
│        └────────────────────────────────────┘            │
│            [ ▦ 104 ]   [ ▦ 150 ]   [ ▦ 187 ]              │
└──────────────────────────────────────────────────────────┘
```

- PhotosPicker, then the photo appears in a fixed **3:2 frame**. Drag it to choose
  the crop, so a portrait photo of a face isn't decapitated.
- Three sizes, shown as grid icons with the number: **104 (13×8), 150 (15×10) and
  187 (17×11)**. 150 is the default. Each is a near-square cell grid on a 3:2 board.

### Puzzle screen (the child's space)

```
┌──────────────────────────────────────────────────────────┐
│ ⌂                                                  👁    │
│   ┌──────────────────────────────────────────────────┐   │
│   │ ghost photo (25%) · placed pieces are full colour│   │
│   │                                                  │   │
│   │                                                  │   │
│   └──────────────────────────────────────────────────┘   │
│ ▬▬▬▬▬▬▬▬▬▬▬▬▬▬░░░░░░░░░░░░░░░░░░░░░░░░  (progress)       │
│ ╭──────────────────────────────────────────────────╮  ⟳  │
│ │  ▢    ▢    ▢    ▢    ▢    ▢    ▢    ▢    ▢    ▢  │      │ ← the pile: ~8–10 pieces
│ ╰──────────────────────────────────────────────────╯      │
└──────────────────────────────────────────────────────────┘
```

- **The pile shows only a handful of pieces at a time** (as many as fit in one row).
  This removes 90% of the visual load. When a piece is placed, a new one slides in.
- **Smart order:** corners first, then edges, then interior pieces. Interior pieces
  next to already-placed pieces come first, with a little randomness, so the puzzle
  grows outward from what is done. Each new piece has a high chance of fitting
  somewhere obvious.
- **⟳ (swap):** puts the visible pieces back at the end of the queue and deals new
  ones. This is the only "I'm stuck" button.
- **Drag** a piece onto the board. If it's dropped within about half a piece of its
  spot, it **snaps** into place with a soft click and a tiny pop animation, and locks
  there. Placed pieces can't be moved, so nothing gets undone by accident.
- **Wrong drop:** the piece floats gently back to its slot in the pile. No error sound
  and no penalty.
- **Tap** a piece (without dragging): its spot on the board glows softly for a moment.
  This is a hint the child can discover on their own, with no button to learn.
- **👁** toggles the ghost image (for an older child or a second play-through).
- **⌂** goes back to the shelf. Progress is saved after every placed piece, so leaving
  is never destructive.
- Progress is a thin bar that fills up. It's visual, not a number.
- Pieces in the pile are shown **at the same size as on the board**, so what they see
  is what fits. On an 11" iPad in landscape, a 150-piece board gives cells of about
  60 pt, which is comfortable for small fingers.
- Works in every orientation. In portrait, the board shrinks to the width and the pile
  stays at the bottom.
- The status bar is hidden, the home indicator is dimmed, and system edge gestures are
  deferred, so a drag that starts near an edge doesn't open the Control Center.

### Finishing

- The last piece snaps in, the piece outlines fade away and the full photo appears,
  confetti falls, a big star bounces in, and a cheerful chime plays.
- Tapping anywhere goes back to the shelf, where the card now wears a ★.

### Look & feel

- A warm, calm palette: a cream "table" (#F6EFE6), a soft white board with an inner
  shadow, and a rounded tray in a slightly darker sand colour. One accent colour
  (orange).
- Pieces get a subtle bevel: a light top-left edge and a soft drop shadow. They look
  like real cardboard, without extra visual noise.
- Big, rounded SF Symbols, with hit targets of at least 60 pt. No text in the child's
  path.
- Motion is gentle springs. Nothing flashes.

### Tip for parents

Turn on **Guided Access** (Settings → Accessibility → Guided Access, then triple-click
the side button inside the app). It locks the iPad to the puzzle app.
