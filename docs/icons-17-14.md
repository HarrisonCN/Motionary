# Icons (17.14)

Motionary 17.14 adds an icon section: **503 original line icons** in 24 categories (17.15 added ten categories and
250 icons to the first 253), an `<mo-icon>` element that draws
one of them and can play one of twelve small motions, and an `<mo-icon-picker>` to search and pick them. Every icon was
drawn for Motionary on a 24 × 24 grid with a 2px round stroke and no fill, so a set of them reads as one family. The
lines are stroked with `currentColor`, so an icon takes the colour of the text around it, in light and dark themes alike.

Demo page: [showcase/icons.html](../showcase/icons.html). The home page Collections section opens on an icons tab.

```html
<script type="module">
  import { defineIcon } from 'motionary/widgets/icon';
  import { defineIconPicker } from 'motionary/widgets/icon-picker';
  defineIcon();
  defineIconPicker();
</script>

<button type="button"><mo-icon name="bell" motion="ring"></mo-icon> Notifications</button>
<mo-icon name="heart" motion="beat" trigger="loop" size="32" color="#e11d48" label="Liked"></mo-icon>
<mo-icon-picker value="heart" copy="tag"></mo-icon-picker>
```

Both also register with `defineWidgets('17.14')` (or `defineWidgets()` for everything).

## `<mo-icon>`

| Attribute | Default | What it does |
|---|---|---|
| `name` | | Which icon (see the list below). An unknown name draws nothing. |
| `size` | `24` | Width and height in px (8–512). |
| `stroke` | `2` | Line width (0.5–4). |
| `color` | text colour | Any CSS colour. |
| `label` | | Without it the icon is decorative (`aria-hidden`); with it the icon is an image (`role="img"`) with that name. |
| `motion` | | One of the twelve motions below. |
| `trigger` | `hover` | `loop` (always), `hover` (pointer or focus on the nearest button, link or label, or the icon itself), `click`, or `view` (once, when 60% of it scrolls into view). |
| `duration` | per motion | Length of one run in ms. |

`el.play()` runs the motion once. A run that starts by hover, click, view or `play()` sends `usa:play`
(`{ name, motion }`). Under reduced motion no motion runs, whatever the trigger.

### Motions

| Motion | What it does |
|---|---|
| `spin` | One full turn, at an even speed. |
| `pulse` | Swells a little and fades, then settles. |
| `beat` | A double heartbeat. |
| `bounce` | Hops up twice, the second hop smaller. |
| `wiggle` | Rocks left and right, a little less each time. |
| `shake` | Shakes sideways, like a refused password. |
| `ring` | Swings from the top like a bell. |
| `float` | Drifts up and back down. |
| `flip` | Turns once around its vertical axis. |
| `draw` | Every line traces itself from start to end. |
| `pop` | Grows in from smaller with a slight overshoot. |
| `blink` | Dims and comes back. |

## `<mo-icon-picker>`

A search field, category chips and a grid of icon buttons, with a live count. Typing matches every word against icon
names and category names (English or Chinese, so `天气` finds the weather icons). Arrow keys walk the grid, Home and End
jump to its ends, Down from the search field goes into the grid, Enter or a click picks. The picked icon pops; with
`copy` it is copied to the clipboard; with `name` it is sent with a form through a hidden input.

| Attribute | Default | What it does |
|---|---|---|
| `value` | | The icon picked to start with. |
| `name` | | Form field name. |
| `copy` | off | `name`, `tag` (`<mo-icon name="…"></mo-icon>`) or `svg` markup. |
| `categories` | all | Comma list of category ids to offer. |
| `category-labels` | English | Comma list of chip labels in category order. |
| `size` | `24` | Icon size in the grid, px. |
| `height` | `360` | Grid height in px; it scrolls past that. |
| `compact` | | Hides the names under the icons. |
| `label`, `search-label`, `placeholder`, `all-label`, `empty`, `count-label` | English | Text for the group, field, chips, empty state and count (`{n}` is the number). |

`el.value` is the picked name and `el.search(query)` filters as if typed. A pick sends `usa:pick`
(`{ name, category, copied }`).

## Using the set without the elements

```js
import { ICONS, ICON_CATEGORIES, iconNames, iconSvg, searchIcons } from 'motionary/widgets';

iconSvg('bell', { size: 20, label: 'Notifications' }); // '<svg …>…</svg>'
searchIcons('arrow up');                                 // ['arrow-up', 'arrow-up-right', …]
iconNames('weather');                                    // the 18 weather icons
```

`iconParts(name)` gives the shapes as plain objects (`{ tag, attrs }`) for any renderer, and `iconCategory(name)` the
category. Each entry of `ICONS` is a short list of shapes separated by `;`: `c cx cy r` is a circle, `r x y w h [radius]`
a rectangle, and anything else SVG path data.

## All 503 icons

17.15 added the last ten categories (250 icons), from Development to Tools.

| Category | Count | Icons |
|---|---|---|
| Arrows (`arrows`, 箭头) | 24 | `arrow-up` `arrow-down` `arrow-left` `arrow-right` `arrow-up-right` `arrow-up-left` `arrow-down-right` `arrow-down-left` `chevron-up` `chevron-down` `chevron-left` `chevron-right` `chevrons-up` `chevrons-down` `chevrons-left` `chevrons-right` `refresh` `rotate-cw` `rotate-ccw` `swap` `expand` `shrink` `move` `enter` |
| Interface (`interface`, 界面) | 33 | `menu` `close` `plus` `minus` `check` `search` `settings` `home` `bell` `heart` `star` `bookmark` `trash` `edit` `lock` `unlock` `eye` `eye-off` `info` `alert` `help` `filter` `sliders` `grid` `list` `more-horizontal` `more-vertical` `external-link` `link` `logout` `login` `toggle` `power` |
| Media (`media`, 媒体) | 22 | `play` `pause` `stop` `skip-forward` `skip-back` `fast-forward` `rewind` `shuffle` `repeat` `volume` `volume-mute` `mic` `camera` `video` `image` `film` `music` `headphones` `radio` `disc` `tv` `cast` |
| Files (`files`, 文件) | 18 | `file` `file-text` `file-plus` `file-minus` `file-check` `file-code` `folder` `folder-open` `folder-plus` `archive` `clipboard` `copy` `download` `upload` `save` `paperclip` `database` `inbox` |
| Communication (`communication`, 沟通) | 19 | `mail` `mail-open` `send` `message` `message-dots` `messages` `phone` `phone-call` `video-call` `at` `share` `rss` `megaphone` `broadcast` `reply` `forward` `hash` `voicemail` `translate` |
| Devices (`devices`, 设备) | 19 | `monitor` `laptop` `smartphone` `tablet` `watch` `keyboard` `mouse` `printer` `server` `cpu` `battery` `battery-charging` `wifi` `bluetooth` `usb` `gamepad` `speaker` `hard-drive` `plug` |
| Weather (`weather`, 天气) | 18 | `sun` `moon` `cloud` `cloud-rain` `cloud-snow` `cloud-lightning` `cloud-drizzle` `cloud-sun` `wind` `umbrella` `snowflake` `thermometer` `droplet` `sunrise` `sunset` `rainbow` `tornado` `zap` |
| Commerce (`commerce`, 商业) | 18 | `cart` `bag` `credit-card` `wallet` `tag` `receipt` `gift` `store` `package` `truck` `dollar` `percent` `coins` `banknote` `bar-chart` `trending-up` `trending-down` `barcode` |
| Editor (`editor`, 编辑) | 18 | `bold` `italic` `underline` `strikethrough` `align-left` `align-center` `align-right` `heading` `quote` `code` `terminal` `type` `list-ordered` `undo` `redo` `scissors` `pen-tool` `eraser` |
| Maps & travel (`travel`, 地图出行) | 16 | `map-pin` `map` `compass` `navigation` `globe` `plane` `car` `bus` `train` `bike` `anchor` `flag` `route` `ticket` `luggage` `building` |
| People (`people`, 人物) | 12 | `user` `users` `user-plus` `user-minus` `user-check` `smile` `frown` `meh` `thumbs-up` `thumbs-down` `hand` `award` |
| Nature (`nature`, 自然) | 12 | `leaf` `tree` `flower` `mountain` `sprout` `paw` `fish` `bug` `feather` `flame` `planet` `sparkles` |
| Shapes (`shapes`, 形状) | 16 | `circle` `square` `triangle` `diamond` `pentagon` `hexagon` `octagon` `cross` `shield` `crown` `infinity` `target` `layers` `cube` `spiral` `pie` |
| Time (`time`, 时间) | 8 | `clock` `alarm` `calendar` `calendar-check` `calendar-days` `hourglass` `timer` `history` |
| Development (`development`, 开发) | 25 | `git-branch` `git-commit` `git-merge` `git-pull-request` `git-fork` `git-compare` `braces` `brackets` `function` `variable` `api` `webhook` `regex` `binary` `command` `component` `rocket` `bot` `workflow` `diff` `sitemap` `app-window` `layout` `blocks` `puzzle` |
| Security (`security`, 安全) | 25 | `shield-check` `shield-alert` `shield-off` `shield-plus` `shield-x` `key` `passkey` `fingerprint` `scan-face` `scan` `lock-keyhole` `password` `id-badge` `id-card` `siren` `virus` `firewall` `incognito` `vault` `cctv` `hazard` `verified` `user-lock` `ban` `radar` |
| Health (`health`, 健康) | 25 | `heart-pulse` `activity` `stethoscope` `pill` `capsule` `syringe` `bandage` `first-aid` `hospital` `ambulance` `dna` `microscope` `brain` `bone` `tooth` `weight` `wheelchair` `accessibility` `medical-record` `face-mask` `blood-type` `baby` `yoga` `lungs` `heart-plus` |
| Food & drink (`food`, 餐饮) | 25 | `coffee` `cup` `wine` `beer` `cocktail` `utensils` `chef-hat` `pizza` `apple` `cherry` `carrot` `egg` `bread` `cake` `cookie` `ice-cream` `lollipop` `soup` `popcorn` `salad` `milk` `bottle` `citrus` `grapes` `burger` |
| Household (`household`, 家居) | 25 | `sofa` `bed` `lamp` `lightbulb` `door` `window` `armchair` `bath` `shower` `washing-machine` `fridge` `microwave` `fan` `potted-plant` `broom` `bucket` `hanger` `shirt` `outlet` `thermostat` `garage` `curtains` `mirror` `stairs` `iron` |
| Sports (`sports`, 运动) | 25 | `dumbbell` `trophy` `medal` `soccer` `basketball` `tennis` `volleyball` `rugby` `golf` `bowling` `swim` `running` `skateboard` `skiing` `whistle` `stopwatch` `darts` `boxing-glove` `racket` `tent` `podium` `race-flag` `helmet` `kettlebell` `jump-rope` |
| Education (`education`, 教育) | 25 | `book` `book-open` `notebook` `graduation-cap` `school` `backpack` `pencil` `ruler` `calculator` `abacus` `desk-globe` `atom` `flask` `test-tube` `library` `presentation` `blackboard` `certificate` `exam` `books` `telescope` `math-compass` `highlighter` `alphabet` `sticky-note` |
| Finance (`finance`, 金融) | 25 | `bank` `piggy-bank` `coin` `euro` `pound` `yen` `bitcoin` `rupee` `invoice` `hand-coins` `atm` `cheque` `balance` `briefcase` `handshake` `tax-receipt` `gem` `gold-bars` `currency-exchange` `mortgage` `insurance` `ledger` `transfer` `cash` `safe` |
| Charts & data (`charts`, 图表) | 25 | `chart-line` `chart-area` `chart-column` `chart-bars` `chart-pie` `chart-donut` `chart-scatter` `chart-candles` `chart-radar` `funnel` `gauge` `sparkline` `histogram` `chart-stacked` `waterfall` `heatmap` `gantt` `table` `kanban` `dashboard` `graph-nodes` `flowchart` `progress-bar` `progress-ring` `sum` |
| Tools (`tools`, 工具) | 25 | `hammer` `wrench` `screwdriver` `saw` `drill` `paintbrush` `paint-roller` `palette` `eyedropper` `magnet` `toolbox` `nut` `screw` `pliers` `shovel` `axe` `ladder` `tape-measure` `spirit-level` `flashlight` `gears` `anvil` `needle` `clamp` `trowel` |
