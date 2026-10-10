import SwiftUI

@main
@MainActor
struct PuzzleApp: App {
    @StateObject private var store = PuzzleStore()

    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(store)
        }
    }
}

/// Simple state-driven navigation: the shelf, with the puzzle shown on top of it.
@MainActor
struct RootView: View {
    @EnvironmentObject private var store: PuzzleStore
    @State private var openRecord: PuzzleRecord? = nil

    var body: some View {
        ZStack {
            ShelfView(store: store, onOpen: { record in
                withAnimation(.easeInOut(duration: 0.3)) {
                    openRecord = record
                }
            })
            if let record = openRecord {
                PuzzleView(record: record, store: store, onExit: {
                    withAnimation(.easeInOut(duration: 0.3)) {
                        openRecord = nil
                    }
                })
                .id(record.id)
                .transition(.opacity)
                .zIndex(1)
            }
        }
        .statusBarHidden(true)
    }
}
