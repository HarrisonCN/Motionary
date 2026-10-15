// motionary 15.2 — SwiftUI export of "Card intro" (motionary/studio/native). Generated; edit the scene, not this file.
// iOS 17+ / macOS 14+ (keyframeAnimator). Usage: Text("…").cardIntroTitle(play: visible)
import SwiftUI

/** Layer "title" (#title). */
struct CardIntroTitleValues {
    var opacity: Double
    var offsetY: Double
    var scaleX: Double
    var scaleY: Double
    static let start = CardIntroTitleValues(opacity: 0, offsetY: 20, scaleX: 0.9, scaleY: 0.9)
    static let end = CardIntroTitleValues(opacity: 1, offsetY: 0, scaleX: 1, scaleY: 1)
}

struct CardIntroTitleMotion: ViewModifier {
    var play: Bool
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    static func apply(_ view: some View, _ v: CardIntroTitleValues) -> some View {
        view.opacity(v.opacity).offset(y: v.offsetY).scaleEffect(x: v.scaleX, y: v.scaleY)
    }

    @ViewBuilder func body(content: Content) -> some View {
        if reduceMotion || !play {
            Self.apply(content, play ? .end : .start)
        } else {
            content.keyframeAnimator(initialValue: CardIntroTitleValues.end, trigger: play) { view, v in
                Self.apply(view, v)
            } keyframes: { _ in
                KeyframeTrack(\.opacity) {
                    LinearKeyframe(0, duration: 0)
                    LinearKeyframe(1, duration: 0.4, timingCurve: .bezier(startControlPoint: UnitPoint(x: 0.2, y: 0), endControlPoint: UnitPoint(x: 0, y: 1)))
                }
                KeyframeTrack(\.offsetY) {
                    LinearKeyframe(20, duration: 0)
                    LinearKeyframe(0, duration: 0.4, timingCurve: .bezier(startControlPoint: UnitPoint(x: 0.2, y: 0), endControlPoint: UnitPoint(x: 0, y: 1)))
                }
                KeyframeTrack(\.scaleX) {
                    LinearKeyframe(0.9, duration: 0)
                    LinearKeyframe(1, duration: 0.4, timingCurve: .bezier(startControlPoint: UnitPoint(x: 0.2, y: 0), endControlPoint: UnitPoint(x: 0, y: 1)))
                }
                KeyframeTrack(\.scaleY) {
                    LinearKeyframe(0.9, duration: 0)
                    LinearKeyframe(1, duration: 0.4, timingCurve: .bezier(startControlPoint: UnitPoint(x: 0.2, y: 0), endControlPoint: UnitPoint(x: 0, y: 1)))
                }
            }
        }
    }
}

extension View {
    func cardIntroTitle(play: Bool) -> some View { modifier(CardIntroTitleMotion(play: play)) }
}

/** Layer "card" (.card). */
struct CardIntroCardValues {
    var background: Color
    static let start = CardIntroCardValues(background: Color(red: 1, green: 1, blue: 1, opacity: 1))
    static let end = CardIntroCardValues(background: Color(red: 0.059, green: 0.09, blue: 0.165, opacity: 1))
}

struct CardIntroCardMotion: ViewModifier {
    var play: Bool
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    static func apply(_ view: some View, _ v: CardIntroCardValues) -> some View {
        view.background(v.background)
    }

    @ViewBuilder func body(content: Content) -> some View {
        if reduceMotion || !play {
            Self.apply(content, play ? .end : .start)
        } else {
            content.keyframeAnimator(initialValue: CardIntroCardValues.end, trigger: play) { view, v in
                Self.apply(view, v)
            } keyframes: { _ in
                KeyframeTrack(\.background) {
                    LinearKeyframe(Color(red: 1, green: 1, blue: 1, opacity: 1), duration: 0)
                    LinearKeyframe(Color(red: 1, green: 1, blue: 1, opacity: 1), duration: 0.1)
                    LinearKeyframe(Color(red: 0.059, green: 0.09, blue: 0.165, opacity: 1), duration: 0.5, timingCurve: .bezier(startControlPoint: UnitPoint(x: 0, y: 0), endControlPoint: UnitPoint(x: 0.58, y: 1)))
                }
            }
        }
    }
}

extension View {
    func cardIntroCard(play: Bool) -> some View { modifier(CardIntroCardMotion(play: play)) }
}
