# Live activities (17.5)

Fifteen independent `mo-*` components recreate the supplied video's compact dark activity cards and drifting composition. The [interactive lab](../showcase/activity.html) uses a 960 × 720 reference canvas, native SVG/CSS artwork, repeated rows, staggered column movement and a blur-to-focus entrance. The source video, its soundtrack and third-party assets are not distributed.

## Components

| Tag | Value / data | Behavior |
|---|---|---|
| `mo-flight-status` | `value` 0–100; `origin`, `destination`, `from`, `to`, `departure`, `arrival`, `status` | Gradient route with an aircraft marker |
| `mo-transit-progress` | `value` 0–100; comma-separated `stations` | Route strip and current station |
| `mo-sun-timeline` | `now`, `sunset`, `dusk`; corresponding `*-label` | Day, sunset and dusk capsules |
| `mo-delivery-tracker` | `value` 0–100, `driver`, `status`, `eta`; `stage="out"` selects the map variant | Call/message actions or route map |
| `mo-glucose-sparkline` | `value`, `unit`, `trend`, comma-separated numeric `values`; `start`, `middle`, `end` | Multicolor reading history |
| `mo-coffee-timer` | `value` elapsed seconds, `duration`, `drink` | Explicit start/stop; stops once at duration |
| `mo-vital-wave` | `value`, `unit`, `period`, numeric `values` | Dot-and-stem waveform |
| `mo-orbit-pass` | `value` 0–100; `title`, `eta` | Vector arc, viewing cone and position marker |
| `mo-meter-countdown` | `value` remaining seconds, `max`, `title` | Ring and explicit remaining-time clock |
| `mo-race-telemetry` | `value` 0–100, `lap`, `laps` (CSV), `sector` | Track position and lap records |
| `mo-workout-player` | `value` elapsed seconds, `distance`, `unit`, numeric `values` | Reset, pause/resume and target actions |
| `mo-status-pill` | `value`, `unit`, `status`, `icon`, `tone` | Compact icon/metric capsule |
| `mo-ride-status` | `value` 0–100, `driver`, `status` | Ride display pause/resume and call actions |
| `mo-route-sparkline` | `value`, `unit`, `title`, `status`, numeric `values` | Route/metric chart and details action |
| `mo-activity-wall` | Direct children with `data-column`; `speed` seconds, `paused`, `label` | Drifting columns; pauses on hover, focus, hidden tab and offscreen |

All data cards accept `label` for an accessible group name, `disabled` for native actions, and `animated` for optional ornamental chart motion. Defaults are fixed sample values. No component connects to a service or invents live readings. Health displays do not interpret readings; the orbit card does not calculate real satellite passes. Connect your own data source.

## Import and update

```js
import { defineFlightStatus } from 'motionary/widgets/flight-status';
defineFlightStatus(); // registers mo-flight-status and the deprecated usa-* alias

const flight = document.querySelector('mo-flight-status');
flight.update({ from: 'LHR', to: 'JFK', value: 73, status: 'Arrives in 42m' });
flight.value = 74;
```

```html
<mo-flight-status label="Flight progress" from="LHR" to="JFK"
  origin="London" destination="New York" value="73"
  departure="10:30 AM" arrival="1:25 PM" status="Arrives in 42m">
</mo-flight-status>
```

`update()` only writes observed attributes; unknown keys such as `onclick` or `style` are ignored. Text is escaped. Numeric values are finite, progress is bounded to 0–100 and clocks are nonnegative. Chart values discard invalid numeric entries. Every card has an individual import; importing an entry is safe during SSR, and defining it registers only that component's names.

## Clocks and actions

```js
import { defineCoffeeTimer } from 'motionary/widgets/coffee-timer';
defineCoffeeTimer();
const timer = document.querySelector('mo-coffee-timer');
timer.play();
timer.pause();
timer.reset(); // pause and restore the value at first mount
timer.addEventListener('usa:complete', event => console.log(event.detail.value));
```

Coffee, meter and workout clocks run only when `running` is present and not `"false"`. They suspend offscreen, in a hidden document or while disabled, resume without counting hidden time, and release their interval on disconnect. The clocks measure elapsed active time. Use external data updates for a real-world deadline that continues in the background. Defaults are static; `animated` never starts a timer. Coffee stops at `duration`; the meter stops at zero. The workout clock counts upward until paused. `reset()` restores the first mounted value.

Native buttons emit `usa:action` with `{ action, value, running }` and `usa:change` with the same keys. Action names are `toggle`, `stop`, `reset`, `call`, `message`, `target` and `details`. Call/message are application events, with no automatic navigation or external communication. Supported clocks emit `usa:tick` with `{ value }` and `usa:complete` with `{ value }` once at their boundary. Supplied attribute/property updates do not emit user-action events.

Updates preserve existing native buttons and SVG nodes, so a clock tick retains keyboard focus and the animation's current phase. Gradients have unique IDs across multiple cards. All events bubble and are composed.

## Compose the wall

```js
import { defineActivityWall } from 'motionary/widgets/activity-wall';
import { defineFlightStatus } from 'motionary/widgets/flight-status';
import { defineCoffeeTimer } from 'motionary/widgets/coffee-timer';
defineActivityWall(); defineFlightStatus(); defineCoffeeTimer();
```

```html
<mo-activity-wall label="Activity collection" speed="40">
  <div data-column><mo-flight-status></mo-flight-status></div>
  <div data-column><mo-coffee-timer></mo-coffee-timer></div>
</mo-activity-wall>
```

Register each child independently, or use `defineWidgets('17.5')` from `motionary/components/widgets` to register the whole collection. The wall accepts arbitrary HTML, imposes no component-count limit, and never clones interactive content. Its `play()` / `pause()` methods reflect `paused`. Pausing the wall stops drift and ornamental descendants; use each clock's `pause()` when application time must also stop.

CSS variables: `--usa-activity-width` (card width), `--usa-wall-gap`, `--usa-wall-row-gap`, `--usa-wall-height`, `--usa-wall-background`, `--usa-wall-radius`, `--usa-wall-padding`, and per-column `--usa-wall-offset`. On narrow screens the standalone wall scrolls horizontally; the reference lab scales the entire scene uniformly to preserve the video's proportions. The lab's static comparison and pause controls stop all demo clocks and ornamentation together.

Reduced motion stops chart loops, drifting and the entrance transition immediately, including when the OS preference changes while mounted. Data and real clock text remain readable. Component count and artifact bytes have no enforced caps; [size policy](size-policy.md) describes reporting and the quality checks that remain.

## Validation scope

Unit and browser regressions cover registration, safe data rendering, finite geometry, unique gradient IDs, keyboard actions, focus during updates, opt-in clocks, visible-time suspension, completion, disabled state, disconnect/reconnect and live reduced motion. Physical devices and pixel-identical font rendering across operating systems require separate comparison; the reference video contains no inspectable source or design tokens.
