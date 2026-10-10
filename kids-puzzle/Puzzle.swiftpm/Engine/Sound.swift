import AudioToolbox

/// Tiny wrapper around system sounds (respects the silent switch).
enum Sound {
    static func snap() {
        AudioServicesPlaySystemSound(1104)
    }

    static func complete() {
        AudioServicesPlaySystemSound(1025)
    }
}
