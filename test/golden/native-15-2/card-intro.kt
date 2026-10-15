// motionary 15.2 — Jetpack Compose export of "Card intro" (motionary/studio/native). Generated; edit the scene, not this file.
// Usage: Modifier.cardIntroTitle(play = visible, reduceMotion = …)
package motionary.generated

import androidx.compose.animation.animateColor
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.unit.dp

object CardIntroMotion {
    const val DURATION_MILLIS = 600
}

/** Layer "title" (#title). */
@Composable
fun Modifier.cardIntroTitle(play: Boolean, reduceMotion: Boolean = false): Modifier {
    val transition = updateTransition(targetState = play, label = "title")
    val opacity by transition.animateFloat(label = "opacity", transitionSpec = {
        if (reduceMotion || !targetState) snap() else keyframes {
            durationMillis = 600
            0f at 0 using CubicBezierEasing(0.2f, 0f, 0f, 1f)
            1f at 400 using LinearEasing
        }
    }) { on -> if (on) 1f else 0f }
    val ty by transition.animateFloat(label = "ty", transitionSpec = {
        if (reduceMotion || !targetState) snap() else keyframes {
            durationMillis = 600
            20f at 0 using CubicBezierEasing(0.2f, 0f, 0f, 1f)
            0f at 400 using LinearEasing
        }
    }) { on -> if (on) 0f else 20f }
    val sx by transition.animateFloat(label = "sx", transitionSpec = {
        if (reduceMotion || !targetState) snap() else keyframes {
            durationMillis = 600
            0.9f at 0 using CubicBezierEasing(0.2f, 0f, 0f, 1f)
            1f at 400 using LinearEasing
        }
    }) { on -> if (on) 1f else 0.9f }
    val sy by transition.animateFloat(label = "sy", transitionSpec = {
        if (reduceMotion || !targetState) snap() else keyframes {
            durationMillis = 600
            0.9f at 0 using CubicBezierEasing(0.2f, 0f, 0f, 1f)
            1f at 400 using LinearEasing
        }
    }) { on -> if (on) 1f else 0.9f }
    return this.graphicsLayer {
        alpha = opacity
        translationY = ty.dp.toPx()
        scaleX = sx
        scaleY = sy
    }
}

/** Layer "card" (.card). */
@Composable
fun Modifier.cardIntroCard(play: Boolean, reduceMotion: Boolean = false): Modifier {
    val transition = updateTransition(targetState = play, label = "card")
    val background by transition.animateColor(label = "background", transitionSpec = {
        if (reduceMotion || !targetState) snap() else keyframes {
            durationMillis = 600
            Color(0xFFFFFFFF) at 0 using LinearEasing
            Color(0xFFFFFFFF) at 100 using CubicBezierEasing(0f, 0f, 0.58f, 1f)
            Color(0xFF0F172A) at 600 using LinearEasing
        }
    }) { on -> if (on) Color(0xFF0F172A) else Color(0xFFFFFFFF) }
    return this.background(background)
}
