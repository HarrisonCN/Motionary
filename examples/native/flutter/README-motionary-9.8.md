# Motionary → Flutter (9.8)

`motion_view.dart` is generated from a Motionary motion string:

```js
import { toFlutter } from 'motionary/native';
fs.writeFileSync('lib/motion_view.dart', toFlutter('enter: fade-up 500ms smooth stagger 80ms; click: pop', { name: 'MotionView' }));
```

It uses an `AnimationController` with a `Cubic(…)` curve taken from the rule's easing, a press `AnimatedScale`, and `MediaQuery.disableAnimations` to skip the entrance when the platform asks for reduced motion. Use it as `MotionView(index: i, child: …)` inside a list for the stagger.
