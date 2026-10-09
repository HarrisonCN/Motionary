# Per-component entry points (10.9)

Load one component instead of a whole group. Every `<usa-*>` widget has its own subpath `motionary/widgets/<name>` (the tag without `usa-`), and every 6.x+ effect has `motionary/effects/<name>`. An entry registers **only its own tag** (or effect) — verified in CI for every entry — and has a fixed gzip budget (`size-budget.json`).

```js
import { defineToastStack } from 'motionary/widgets/toast-stack';
defineToastStack(); // registers <usa-toast-stack> only
import { registerPearlescent } from 'motionary/effects/pearlescent';
import { defineFx } from 'motionary/components/fx';
registerPearlescent(); defineFx(); // <usa-fx effect="pearlescent">
```

Notes: an effect entry imports its pack file (the effects of a pack share helpers), so its size is the pack’s, not the whole 6.x set. Runtime-powered widgets still need their prerequisites (`use(…)`, see the Requires badge). The group entries (`motionary/components/widgets`, `/fx2`, `/lite`) are unchanged.

## Widgets (119)

| Tag | Import | Define |
|---|---|---|
| `<usa-carousel>` | `motionary/widgets/carousel` | `defineCarousel()` |
| `<usa-tab-bar>` | `motionary/widgets/tab-bar` | `defineTabBar()` |
| `<usa-disclosure>` | `motionary/widgets/disclosure` | `defineDisclosure()` |
| `<usa-stories>` | `motionary/widgets/stories` | `defineStories()` |
| `<usa-toast-stack>` | `motionary/widgets/toast-stack` | `defineToastStack()` |
| `<usa-modal>` | `motionary/widgets/modal` | `defineModal()` |
| `<usa-sheet>` | `motionary/widgets/sheet` | `defineSheet()` |
| `<usa-menu>` | `motionary/widgets/menu` | `defineMenu()` |
| `<usa-progress-ring>` | `motionary/widgets/progress-ring` | `defineProgressRing()` |
| `<usa-odometer>` | `motionary/widgets/odometer` | `defineOdometer()` |
| `<usa-skeleton-reveal>` | `motionary/widgets/skeleton-reveal` | `defineSkeletonReveal()` |
| `<usa-star-rating>` | `motionary/widgets/star-rating` | `defineStarRating()` |
| `<usa-milestones>` | `motionary/widgets/milestones` | `defineMilestones()` |
| `<usa-masonry-flow>` | `motionary/widgets/masonry-flow` | `defineMasonryFlow()` |
| `<usa-compare>` | `motionary/widgets/compare` | `defineCompare()` |
| `<usa-cube-gallery>` | `motionary/widgets/cube-gallery` | `defineCubeGallery()` |
| `<usa-dock>` | `motionary/widgets/dock` | `defineDock()` |
| `<usa-nav-morph>` | `motionary/widgets/nav-morph` | `defineNavMorph()` |
| `<usa-menu-toggle>` | `motionary/widgets/menu-toggle` | `defineMenuToggle()` |
| `<usa-tip>` | `motionary/widgets/tip` | `defineTip()` |
| `<usa-stepper>` | `motionary/widgets/stepper` | `defineStepper()` |
| `<usa-pagination>` | `motionary/widgets/pagination` | `definePagination()` |
| `<usa-segmented>` | `motionary/widgets/segmented` | `defineSegmented()` |
| `<usa-switch>` | `motionary/widgets/switch` | `defineSwitch()` |
| `<usa-kanban>` | `motionary/widgets/kanban` | `defineKanban()` |
| `<usa-swipe-deck>` | `motionary/widgets/swipe-deck` | `defineSwipeDeck()` |
| `<usa-weather-card>` | `motionary/widgets/weather-card` | `defineWeatherCard()` |
| `<usa-pull-cord>` | `motionary/widgets/pull-cord` | `definePullCord()` |
| `<usa-date-picker>` | `motionary/widgets/date-picker` | `defineDatePicker()` |
| `<usa-color-picker>` | `motionary/widgets/color-picker` | `defineColorPicker()` |
| `<usa-file-drop>` | `motionary/widgets/file-drop` | `defineFileDrop()` |
| `<usa-keyframe-editor>` | `motionary/widgets/keyframe-editor` | `defineKeyframeEditor()` |
| `<usa-music-player>` | `motionary/widgets/music-player` | `defineMusicPlayer()` |
| `<usa-volume-knob>` | `motionary/widgets/volume-knob` | `defineVolumeKnob()` |
| `<usa-equalizer>` | `motionary/widgets/equalizer` | `defineEqualizer()` |
| `<usa-lyrics>` | `motionary/widgets/lyrics` | `defineLyrics()` |
| `<usa-bar-chart>` | `motionary/widgets/bar-chart` | `defineBarChart()` |
| `<usa-gauge>` | `motionary/widgets/gauge` | `defineGauge()` |
| `<usa-sparkline>` | `motionary/widgets/sparkline` | `defineSparkline()` |
| `<usa-kpi>` | `motionary/widgets/kpi` | `defineKpi()` |
| `<usa-add-to-cart>` | `motionary/widgets/add-to-cart` | `defineAddToCart()` |
| `<usa-cart-drawer>` | `motionary/widgets/cart-drawer` | `defineCartDrawer()` |
| `<usa-product-gallery>` | `motionary/widgets/product-gallery` | `defineProductGallery()` |
| `<usa-countdown>` | `motionary/widgets/countdown` | `defineCountdown()` |
| `<usa-message-list>` | `motionary/widgets/message-list` | `defineMessageList()` |
| `<usa-reactions>` | `motionary/widgets/reactions` | `defineReactions()` |
| `<usa-notification-bell>` | `motionary/widgets/notification-bell` | `defineNotificationBell()` |
| `<usa-presence>` | `motionary/widgets/presence` | `definePresence()` |
| `<usa-leaderboard>` | `motionary/widgets/leaderboard` | `defineLeaderboard()` |
| `<usa-xp-bar>` | `motionary/widgets/xp-bar` | `defineXpBar()` |
| `<usa-badge-wall>` | `motionary/widgets/badge-wall` | `defineBadgeWall()` |
| `<usa-prize-wheel>` | `motionary/widgets/prize-wheel` | `definePrizeWheel()` |
| `<usa-globe>` | `motionary/widgets/globe` | `defineGlobe()` |
| `<usa-location-card>` | `motionary/widgets/location-card` | `defineLocationCard()` |
| `<usa-field>` | `motionary/widgets/field` | `defineField()` |
| `<usa-otp>` | `motionary/widgets/otp` | `defineOtp()` |
| `<usa-upload-progress>` | `motionary/widgets/upload-progress` | `defineUploadProgress()` |
| `<usa-chat-composer>` | `motionary/widgets/chat-composer` | `defineChatComposer()` |
| `<usa-suggestion-chips>` | `motionary/widgets/suggestion-chips` | `defineSuggestionChips()` |
| `<usa-voice-button>` | `motionary/widgets/voice-button` | `defineVoiceButton()` |
| `<usa-command-palette>` | `motionary/widgets/command-palette` | `defineCommandPalette()` |
| `<usa-shortcut>` | `motionary/widgets/shortcut` | `defineShortcut()` |
| `<usa-clock-control>` | `motionary/widgets/clock-control` | `defineClockControl()` |
| `<usa-hydrate>` | `motionary/widgets/hydrate` | `defineHydrate()` |
| `<usa-red-envelope>` | `motionary/widgets/red-envelope` | `defineRedEnvelope()` |
| `<usa-festival-banner>` | `motionary/widgets/festival-banner` | `defineFestivalBanner()` |
| `<usa-terminal>` | `motionary/widgets/terminal` | `defineTerminal()` |
| `<usa-retro-button>` | `motionary/widgets/retro-button` | `defineRetroButton()` |
| `<usa-organic-card>` | `motionary/widgets/organic-card` | `defineOrganicCard()` |
| `<usa-liquid-nav>` | `motionary/widgets/liquid-nav` | `defineLiquidNav()` |
| `<usa-hud-panel>` | `motionary/widgets/hud-panel` | `defineHudPanel()` |
| `<usa-radar>` | `motionary/widgets/radar` | `defineRadar()` |
| `<usa-sticky-wall>` | `motionary/widgets/sticky-wall` | `defineStickyWall()` |
| `<usa-sketch-chart>` | `motionary/widgets/sketch-chart` | `defineSketchChart()` |
| `<usa-theme-switcher>` | `motionary/widgets/theme-switcher` | `defineThemeSwitcher()` |
| `<usa-theme-surface>` | `motionary/widgets/theme-surface` | `defineThemeSurface()` |
| `<usa-gyro-card>` | `motionary/widgets/gyro-card` | `defineGyroCard()` |
| `<usa-gesture-sticker>` | `motionary/widgets/gesture-sticker` | `defineGestureSticker()` |
| `<usa-panorama>` | `motionary/widgets/panorama` | `definePanorama()` |
| `<usa-spatial-card>` | `motionary/widgets/spatial-card` | `defineSpatialCard()` |
| `<usa-code-export>` | `motionary/widgets/code-export` | `defineCodeExport()` |
| `<usa-prop-panel>` | `motionary/widgets/prop-panel` | `definePropPanel()` |
| `<usa-motion>` | `motionary/widgets/motion` | `defineMotion()` |
| `<usa-plugin-store>` | `motionary/widgets/plugin-store` | `definePluginStore()` |
| `<usa-chapter-nav>` | `motionary/widgets/chapter-nav` | `defineChapterNav()` |
| `<usa-scene>` | `motionary/widgets/scene` | `defineScene()` |
| `<usa-lottie>` | `motionary/widgets/lottie` | `defineLottie()` |
| `<usa-lottie-icon>` | `motionary/widgets/lottie-icon` | `defineLottieIcon()` |
| `<usa-gen-art>` | `motionary/widgets/gen-art` | `defineGenArt()` |
| `<usa-bg-generator>` | `motionary/widgets/bg-generator` | `defineBgGenerator()` |
| `<usa-video-card>` | `motionary/widgets/video-card` | `defineVideoCard()` |
| `<usa-hero-video>` | `motionary/widgets/hero-video` | `defineHeroVideo()` |
| `<usa-motion-prefs>` | `motionary/widgets/motion-prefs` | `defineMotionPrefs()` |
| `<usa-pause-all>` | `motionary/widgets/pause-all` | `definePauseAll()` |
| `<usa-perf-monitor>` | `motionary/widgets/perf-monitor` | `definePerfMonitor()` |
| `<usa-worker-canvas>` | `motionary/widgets/worker-canvas` | `defineWorkerCanvas()` |
| `<usa-motion-spec>` | `motionary/widgets/motion-spec` | `defineMotionSpec()` |
| `<usa-native-preview>` | `motionary/widgets/native-preview` | `defineNativePreview()` |
| `<usa-plugin-card>` | `motionary/widgets/plugin-card` | `definePluginCard()` |
| `<usa-install-button>` | `motionary/widgets/install-button` | `defineInstallButton()` |
| `<usa-scroll-scene>` | `motionary/widgets/scroll-scene` | `defineScrollScene()` |
| `<usa-motion-inspector>` | `motionary/widgets/motion-inspector` | `defineMotionInspector()` |
| `<usa-route-transition>` | `motionary/widgets/route-transition` | `defineRouteTransition()` |
| `<usa-text-splitter>` | `motionary/widgets/text-splitter` | `defineTextSplitter()` |
| `<usa-scroll-ring>` | `motionary/widgets/scroll-ring` | `defineScrollRing()` |
| `<usa-parallax-layers>` | `motionary/widgets/parallax-layers` | `defineParallaxLayers()` |
| `<usa-smooth-scroll>` | `motionary/widgets/smooth-scroll` | `defineSmoothScroll()` |
| `<usa-gl-scene>` | `motionary/widgets/gl-scene` | `defineGlScene()` |
| `<usa-three-scene>` | `motionary/widgets/three-scene` | `defineThreeScene()` |
| `<usa-gpu-particles>` | `motionary/widgets/gpu-particles` | `defineGpuParticles()` |
| `<usa-shader-backdrop>` | `motionary/widgets/shader-backdrop` | `defineShaderBackdrop()` |
| `<usa-lottie-player>` | `motionary/widgets/lottie-player` | `defineLottiePlayer()` |
| `<usa-rive>` | `motionary/widgets/rive` | `defineRive()` |
| `<usa-token-editor>` | `motionary/widgets/token-editor` | `defineTokenEditor()` |
| `<usa-physics-playground>` | `motionary/widgets/physics-playground` | `definePhysicsPlayground()` |
| `<usa-motion-prompt>` | `motionary/widgets/motion-prompt` | `defineMotionPrompt()` |
| `<usa-snap-carousel>` | `motionary/widgets/snap-carousel` | `defineSnapCarousel()` |
| `<usa-gl-model>` | `motionary/widgets/gl-model` | `defineGlModel()` |
| `<usa-dotlottie>` | `motionary/widgets/dotlottie` | `defineDotLottie()` |

## Effects (141)

| Effect | Import | Register | Pack |
|---|---|---|---|
| `fluid` | `motionary/effects/fluid` | `registerFluid()` | gpu |
| `smoke` | `motionary/effects/smoke` | `registerSmoke()` | gpu |
| `fire` | `motionary/effects/fire` | `registerFire()` | gpu |
| `ink` | `motionary/effects/ink` | `registerInk()` | gpu |
| `fireflies` | `motionary/effects/fireflies` | `registerFireflies()` | gpu |
| `sakura` | `motionary/effects/sakura` | `registerSakura()` | gpu |
| `leaves` | `motionary/effects/leaves` | `registerLeaves()` | gpu |
| `splash` | `motionary/effects/splash` | `registerSplash()` | gpu |
| `liquid-text` | `motionary/effects/liquid-text` | `registerLiquidText()` | text |
| `neon-write` | `motionary/effects/neon-write` | `registerNeonWrite()` | text |
| `particle-text` | `motionary/effects/particle-text` | `registerParticleText()` | text |
| `glitch-text` | `motionary/effects/glitch-text` | `registerGlitchText()` | text |
| `text-trail` | `motionary/effects/text-trail` | `registerTextTrail()` | text |
| `font-breathe` | `motionary/effects/font-breathe` | `registerFontBreathe()` | text |
| `flip-chars` | `motionary/effects/flip-chars` | `registerFlipChars()` | text |
| `light-follow` | `motionary/effects/light-follow` | `registerLightFollow()` | light |
| `refraction` | `motionary/effects/refraction` | `registerRefraction()` | light |
| `brushed-metal` | `motionary/effects/brushed-metal` | `registerBrushedMetal()` | light |
| `pearlescent` | `motionary/effects/pearlescent` | `registerPearlescent()` | light |
| `god-rays` | `motionary/effects/god-rays` | `registerGodRays()` | light |
| `pointer-shadow` | `motionary/effects/pointer-shadow` | `registerPointerShadow()` | light |
| `depth-stack` | `motionary/effects/depth-stack` | `registerDepthStack()` | depth |
| `product-spin` | `motionary/effects/product-spin` | `registerProductSpin()` | depth |
| `card-flip-3d` | `motionary/effects/card-flip-3d` | `registerCardFlip3d()` | depth |
| `origami` | `motionary/effects/origami` | `registerOrigami()` | depth |
| `orbit-camera` | `motionary/effects/orbit-camera` | `registerOrbitCamera()` | depth |
| `path-morph` | `motionary/effects/path-morph` | `registerPathMorph()` | morph |
| `blob-button` | `motionary/effects/blob-button` | `registerBlobButton()` | morph |
| `stroke-draw` | `motionary/effects/stroke-draw` | `registerStrokeDraw()` | morph |
| `noise-reveal` | `motionary/effects/noise-reveal` | `registerNoiseReveal()` | morph |
| `icon-swap` | `motionary/effects/icon-swap` | `registerIconSwap()` | morph |
| `ripple-dissolve` | `motionary/effects/ripple-dissolve` | `registerRippleDissolve()` | transitions |
| `shatter` | `motionary/effects/shatter` | `registerShatter()` | transitions |
| `mosaic-flip` | `motionary/effects/mosaic-flip` | `registerMosaicFlip()` | transitions |
| `liquid-wipe` | `motionary/effects/liquid-wipe` | `registerLiquidWipe()` | transitions |
| `page-curl` | `motionary/effects/page-curl` | `registerPageCurl()` | transitions |
| `camera-dolly` | `motionary/effects/camera-dolly` | `registerCameraDolly()` | transitions |
| `rain-glass` | `motionary/effects/rain-glass` | `registerRainGlass()` | weather |
| `snowfall` | `motionary/effects/snowfall` | `registerSnowfall()` | weather |
| `lightning` | `motionary/effects/lightning` | `registerLightning()` | weather |
| `fog` | `motionary/effects/fog` | `registerFog()` | weather |
| `aurora-veil` | `motionary/effects/aurora-veil` | `registerAuroraVeil()` | weather |
| `day-cycle` | `motionary/effects/day-cycle` | `registerDayCycle()` | weather |
| `soft-body` | `motionary/effects/soft-body` | `registerSoftBody()` | physics |
| `magnet` | `motionary/effects/magnet` | `registerMagnet()` | physics |
| `cloth` | `motionary/effects/cloth` | `registerCloth()` | physics |
| `rope` | `motionary/effects/rope` | `registerRope()` | physics |
| `pinball` | `motionary/effects/pinball` | `registerPinball()` | physics |
| `focus-draw` | `motionary/effects/focus-draw` | `registerFocusDraw()` | focus |
| `marching-ants` | `motionary/effects/marching-ants` | `registerMarchingAnts()` | focus |
| `success-check` | `motionary/effects/success-check` | `registerSuccessCheck()` | focus |
| `highlight-sweep` | `motionary/effects/highlight-sweep` | `registerHighlightSweep()` | focus |
| `waveform-scope` | `motionary/effects/waveform-scope` | `registerWaveformScope()` | music |
| `radial-spectrum` | `motionary/effects/radial-spectrum` | `registerRadialSpectrum()` | music |
| `spectrum-mirror` | `motionary/effects/spectrum-mirror` | `registerSpectrumMirror()` | music |
| `sound-particles` | `motionary/effects/sound-particles` | `registerSoundParticles()` | music |
| `beat-bounce` | `motionary/effects/beat-bounce` | `registerBeatBounce()` | music |
| `vinyl-spin` | `motionary/effects/vinyl-spin` | `registerVinylSpin()` | music |
| `bars-grow` | `motionary/effects/bars-grow` | `registerBarsGrow()` | chart |
| `line-draw` | `motionary/effects/line-draw` | `registerLineDraw()` | chart |
| `ring-sweep` | `motionary/effects/ring-sweep` | `registerRingSweep()` | chart |
| `sankey-flow` | `motionary/effects/sankey-flow` | `registerSankeyFlow()` | chart |
| `number-roll` | `motionary/effects/number-roll` | `registerNumberRoll()` | chart |
| `dots-pop` | `motionary/effects/dots-pop` | `registerDotsPop()` | chart |
| `fly-to-cart` | `motionary/effects/fly-to-cart` | `registerFlyToCart()` | shop |
| `price-flip` | `motionary/effects/price-flip` | `registerPriceFlip()` | shop |
| `stock-pulse` | `motionary/effects/stock-pulse` | `registerStockPulse()` | shop |
| `sale-shine` | `motionary/effects/sale-shine` | `registerSaleShine()` | shop |
| `badge-pop` | `motionary/effects/badge-pop` | `registerBadgePop()` | shop |
| `typing-dots` | `motionary/effects/typing-dots` | `registerTypingDots()` | social |
| `message-in` | `motionary/effects/message-in` | `registerMessageIn()` | social |
| `reaction-burst` | `motionary/effects/reaction-burst` | `registerReactionBurst()` | social |
| `read-receipt` | `motionary/effects/read-receipt` | `registerReadReceipt()` | social |
| `mention-glow` | `motionary/effects/mention-glow` | `registerMentionGlow()` | social |
| `achievement-unlock` | `motionary/effects/achievement-unlock` | `registerAchievementUnlock()` | game |
| `level-up` | `motionary/effects/level-up` | `registerLevelUp()` | game |
| `chest-open` | `motionary/effects/chest-open` | `registerChestOpen()` | game |
| `coin-burst` | `motionary/effects/coin-burst` | `registerCoinBurst()` | game |
| `xp-gain` | `motionary/effects/xp-gain` | `registerXpGain()` | game |
| `route-draw` | `motionary/effects/route-draw` | `registerRouteDraw()` | geo |
| `marker-pulse` | `motionary/effects/marker-pulse` | `registerMarkerPulse()` | geo |
| `pin-drop` | `motionary/effects/pin-drop` | `registerPinDrop()` | geo |
| `globe-spin` | `motionary/effects/globe-spin` | `registerGlobeSpin()` | geo |
| `field-shake` | `motionary/effects/field-shake` | `registerFieldShake()` | form |
| `field-success` | `motionary/effects/field-success` | `registerFieldSuccess()` | form |
| `label-float` | `motionary/effects/label-float` | `registerLabelFloat()` | form |
| `form-cascade` | `motionary/effects/form-cascade` | `registerFormCascade()` | form |
| `stream-text` | `motionary/effects/stream-text` | `registerStreamText()` | ai |
| `thinking-glow` | `motionary/effects/thinking-glow` | `registerThinkingGlow()` | ai |
| `voice-wave` | `motionary/effects/voice-wave` | `registerVoiceWave()` | ai |
| `gen-skeleton` | `motionary/effects/gen-skeleton` | `registerGenSkeleton()` | ai |
| `firework-burst` | `motionary/effects/firework-burst` | `registerFireworkBurst()` | festival |
| `lantern-rise` | `motionary/effects/lantern-rise` | `registerLanternRise()` | festival |
| `xmas-snow` | `motionary/effects/xmas-snow` | `registerXmasSnow()` | festival |
| `spooky-float` | `motionary/effects/spooky-float` | `registerSpookyFloat()` | festival |
| `pixelate-in` | `motionary/effects/pixelate-in` | `registerPixelateIn()` | retro |
| `crt-power` | `motionary/effects/crt-power` | `registerCrtPower()` | retro |
| `vhs-glitch` | `motionary/effects/vhs-glitch` | `registerVhsGlitch()` | retro |
| `y2k-shine` | `motionary/effects/y2k-shine` | `registerY2kShine()` | retro |
| `vine-grow` | `motionary/effects/vine-grow` | `registerVineGrow()` | organic |
| `bloom` | `motionary/effects/bloom` | `registerBloom()` | organic |
| `water-drop` | `motionary/effects/water-drop` | `registerWaterDrop()` | organic |
| `breathe` | `motionary/effects/breathe` | `registerBreathe()` | organic |
| `hud-frame` | `motionary/effects/hud-frame` | `registerHudFrame()` | cyber |
| `scanline-sweep` | `motionary/effects/scanline-sweep` | `registerScanlineSweep()` | cyber |
| `hologram` | `motionary/effects/hologram` | `registerHologram()` | cyber |
| `data-decode` | `motionary/effects/data-decode` | `registerDataDecode()` | cyber |
| `paper-unfold` | `motionary/effects/paper-unfold` | `registerPaperUnfold()` | paper |
| `pencil-sketch` | `motionary/effects/pencil-sketch` | `registerPencilSketch()` | paper |
| `watercolor` | `motionary/effects/watercolor` | `registerWatercolor()` | paper |
| `crumple` | `motionary/effects/crumple` | `registerCrumple()` | paper |
| `neon-ignite` | `motionary/effects/neon-ignite` | `registerNeonIgnite()` | surface |
| `neon-pulse` | `motionary/effects/neon-pulse` | `registerNeonPulse()` | surface |
| `glass-frost` | `motionary/effects/glass-frost` | `registerGlassFrost()` | surface |
| `neu-press` | `motionary/effects/neu-press` | `registerNeuPress()` | surface |
| `swipe-hint` | `motionary/effects/swipe-hint` | `registerSwipeHint()` | gesture3 |
| `pinch-hint` | `motionary/effects/pinch-hint` | `registerPinchHint()` | gesture3 |
| `tilt-wobble` | `motionary/effects/tilt-wobble` | `registerTiltWobble()` | gesture3 |
| `depth-in` | `motionary/effects/depth-in` | `registerDepthIn()` | gesture3 |
| `portal-open` | `motionary/effects/portal-open` | `registerPortalOpen()` | spatial |
| `orbit-in` | `motionary/effects/orbit-in` | `registerOrbitIn()` | spatial |
| `spatial-float` | `motionary/effects/spatial-float` | `registerSpatialFloat()` | spatial |
| `depth-pop` | `motionary/effects/depth-pop` | `registerDepthPop()` | spatial |
| `dolly-in` | `motionary/effects/dolly-in` | `registerDollyIn()` | cinema |
| `pan-reveal` | `motionary/effects/pan-reveal` | `registerPanReveal()` | cinema |
| `letterbox` | `motionary/effects/letterbox` | `registerLetterbox()` | cinema |
| `rack-focus` | `motionary/effects/rack-focus` | `registerRackFocus()` | cinema |
| `lottie-play` | `motionary/effects/lottie-play` | `registerLottiePlay()` | lottie |
| `icon-pop` | `motionary/effects/icon-pop` | `registerIconPop()` | lottie |
| `halftone-in` | `motionary/effects/halftone-in` | `registerHalftoneIn()` | genart |
| `mesh-drift` | `motionary/effects/mesh-drift` | `registerMeshDrift()` | genart |
| `kaleido` | `motionary/effects/kaleido` | `registerKaleido()` | genart |
| `grain-flicker` | `motionary/effects/grain-flicker` | `registerGrainFlicker()` | genart |
| `film-burn` | `motionary/effects/film-burn` | `registerFilmBurn()` | video |
| `jump-cut` | `motionary/effects/jump-cut` | `registerJumpCut()` | video |
| `safe-fade` | `motionary/effects/safe-fade` | `registerSafeFade()` | safe |
| `focus-glow` | `motionary/effects/focus-glow` | `registerFocusGlow()` | safe |
| `color-pulse` | `motionary/effects/color-pulse` | `registerColorPulse()` | safe |
| `underline-sweep` | `motionary/effects/underline-sweep` | `registerUnderlineSweep()` | safe |
| `idle-reveal` | `motionary/effects/idle-reveal` | `registerIdleReveal()` | perf3 |
| `gpu-lift` | `motionary/effects/gpu-lift` | `registerGpuLift()` | perf3 |
