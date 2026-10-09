# Motionary → React Native (9.8)

`MotionView.tsx` is generated from a Motionary motion string:

```js
import { toReactNative } from 'motionary/native';
fs.writeFileSync('MotionView.tsx', toReactNative('enter: fade-up 500ms smooth stagger 80ms; click: pop', { name: 'MotionView' }));
```

It uses `Animated` with the native driver, `Easing.bezier(…)` from the rule's easing, springs from Motionary's tokens for presses, and `AccessibilityInfo.isReduceMotionEnabled()` to skip the entrance when the user asked for less motion. `App.tsx` renders a staggered list with it.
