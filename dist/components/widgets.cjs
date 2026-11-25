'use strict';

var widgets_textarea = require('../widgets/textarea.cjs');
var widgets_searchField = require('../widgets/search-field.cjs');
var widgets_formStepper = require('../widgets/form-stepper.cjs');
var widgets_select = require('../widgets/select.cjs');
var widgets_combobox = require('../widgets/combobox.cjs');
var widgets_multiSelect = require('../widgets/multi-select.cjs');
var widgets_eclipseToggle = require('../widgets/eclipse-toggle.cjs');
var widgets_hueOrbit = require('../chunks/hue-orbit-BGfcmKZH.cjs');
var widgets_notchSlider = require('../widgets/notch-slider.cjs');
var widgets_bulgeVolume = require('../widgets/bulge-volume.cjs');
var widgets_copyButton = require('../widgets/copy-button.cjs');
var widgets_tileRelay = require('../chunks/tile-relay-mMK6LAU0.cjs');
var widgets_squishKey = require('../widgets/squish-key.cjs');
var widgets_sixDotOrbit = require('../widgets/six-dot-orbit.cjs');
var widgets_centerBars = require('../widgets/center-bars.cjs');
var widgets_quarterRing = require('../widgets/quarter-ring.cjs');
var widgets_triplePulse = require('../widgets/triple-pulse.cjs');
var widgets_breathOrb = require('../widgets/breath-orb.cjs');
var widgets_threeDotBounce = require('../widgets/three-dot-bounce.cjs');
var widgets_infinityLoop = require('../widgets/infinity-loop.cjs');
var widgets_sweepLines = require('../widgets/sweep-lines.cjs');
var widgets_wifiSignal = require('../widgets/wifi-signal.cjs');
var widgets_textReveal = require('../chunks/text-reveal-BHA_e_r_.cjs');
var widgets_jellyButton = require('../widgets/jelly-button.cjs');
var widgets_bounceButton = require('../widgets/bounce-button.cjs');
var widgets_tadaButton = require('../widgets/tada-button.cjs');
var widgets_grooveToggle = require('../widgets/groove-toggle.cjs');
var widgets_cartBadge = require('../chunks/cart-badge-B9j90whk.cjs');
var widgets_chipInput = require('../chunks/chip-input-CgQ9ploI.cjs');
var widgets_planPicker = require('../chunks/plan-picker-BvyfSPXs.cjs');
var widgets_alignSwitch = require('../chunks/align-switch-CElDejnc.cjs');
var widgets_elasticSlider = require('../widgets/elastic-slider.cjs');
var widgets_codeShake = require('../chunks/code-shake-BXKp92Iq.cjs');
var widgets_strengthMeter = require('../chunks/strength-meter-B1ESwLkU.cjs');
var widgets_stepTrack = require('../widgets/step-track.cjs');
var widgets_elasticAccordion = require('../widgets/elastic-accordion.cjs');
var widgets_squishIndicator = require('../chunks/squish-indicator-T2majnp5.cjs');
var widgets_sidebar = require('../widgets/sidebar.cjs');
var widgets_scrollspy = require('../widgets/scrollspy.cjs');
var widgets_pricing = require('../widgets/pricing.cjs');
var widgets_announcementBar = require('../widgets/announcement-bar.cjs');
var widgets_stickyCta = require('../widgets/sticky-cta.cjs');
var widgets_bento = require('../widgets/bento.cjs');
var widgets_emptyState = require('../chunks/empty-state-CCHJt8uP.cjs');
var widgets_lightbox = require('../widgets/lightbox.cjs');
var widgets_dataTable = require('../chunks/data-table-Dy9guuEA.cjs');
var widgets_filterChips = require('../widgets/filter-chips.cjs');
var widgets_hotspots = require('../widgets/hotspots.cjs');
var widgets_fanCarousel = require('../chunks/fan-carousel-zpoSnwJE.cjs');
var widgets_expandCards = require('../widgets/expand-cards.cjs');
var widgets_jsonViewer = require('../chunks/json-viewer-DUfov1T4.cjs');
var widgets_scrollVelocity = require('../chunks/scroll-velocity-BcyZDMbw.cjs');
var widgets_horizontalScroll = require('../chunks/horizontal-scroll-DusRTZFC.cjs');
var widgets_imageTrail = require('../widgets/image-trail.cjs');
var widgets_hoverRevealList = require('../widgets/hover-reveal-list.cjs');
var widgets_liquidGlass = require('../widgets/liquid-glass.cjs');
var widgets_pathMotion = require('../chunks/path-motion-BJ5jD7yj.cjs');
var widgets_cutReveal = require('../chunks/cut-reveal-CRGysVhi.cjs');
var widgets_searchBar = require('../chunks/search-bar-prhV037u.cjs');
var widgets_subscribe = require('../chunks/subscribe-TcPIBfdP.cjs');
var widgets_downloadButton = require('../chunks/download-button-RqYvHsrm.cjs');
var widgets_revealFooter = require('../chunks/reveal-footer-BvjeDtHz.cjs');
var widgets_shapeDivider = require('../chunks/shape-divider-uvGuEyLe.cjs');
var widgets_scrollCue = require('../chunks/scroll-cue-DaNtu4QG.cjs');
var widgets_virtualList = require('../chunks/virtual-list-CoLIIDf7.cjs');
var widgets_infiniteScroll = require('../widgets/infinite-scroll.cjs');
var widgets_contextMenu = require('../chunks/context-menu-Fvb0plyo.cjs');
var widgets_splitPane = require('../chunks/split-pane-Dq5DmrWt.cjs');
var widgets_desktopWindows = require('../chunks/desktop-windows-DF6eUzSU.cjs');
var widgets_stackSlider = require('../chunks/stack-slider-Cj4bWAdl.cjs');
var widgets_morphCard = require('../chunks/morph-card-DlOkzOOo.cjs');
var widgets_scrollZoom = require('../chunks/scroll-zoom-TExkR9AQ.cjs');
var widgets_scrollBg = require('../chunks/scroll-bg-CzwEiH56.cjs');
var widgets_imageTunnel = require('../chunks/image-tunnel-B24fEP_Y.cjs');
var widgets_orbitGallery = require('../chunks/orbit-gallery-DCde86kY.cjs');
var widgets_clothesline = require('../chunks/clothesline-D8r1ZFGO.cjs');
var widgets_elasticFrame = require('../chunks/elastic-frame-Bgj6xpbW.cjs');
var widgets_borderBeam = require('../widgets/border-beam.cjs');
var widgets_progressTabs = require('../widgets/progress-tabs.cjs');
var widgets_codeTabs = require('../widgets/code-tabs.cjs');
var widgets_helpfulVote = require('../widgets/helpful-vote.cjs');
var widgets_shareButton = require('../chunks/share-button-30Bq0Fao.cjs');
var widgets_inlineEdit = require('../widgets/inline-edit.cjs');
var widgets_tagCloud = require('../chunks/tag-cloud-BCnbjBD0.cjs');
var widgets_heatmap = require('../chunks/heatmap-CkBFS5Lo.cjs');
var widgets_donutChart = require('../chunks/donut-chart-C0aB3gHH.cjs');
var widgets_sortableList = require('../chunks/sortable-list-De9Y-Kka.cjs');
var widgets_zoomLens = require('../chunks/zoom-lens-Vld6GmgE.cjs');
var widgets_ratingBars = require('../chunks/rating-bars-DawbbIeq.cjs');
var widgets_checklist = require('../chunks/checklist-Ce3olL3a.cjs');
var widgets_meteors = require('../chunks/meteors-9gvhAzs7.cjs');
var widgets_connectBeam = require('../chunks/connect-beam-Xo0kaiGE.cjs');
var widgets_retroGrid = require('../widgets/retro-grid.cjs');
var widgets_orbitRings = require('../chunks/orbit-rings-DYdUJWwU.cjs');
var widgets_letterSwap = require('../widgets/letter-swap.cjs');
var widgets_rippleGrid = require('../chunks/ripple-grid-DGPzYWE9.cjs');
var widgets_tour = require('../widgets/tour.cjs');
var widgets_signaturePad = require('../widgets/signature-pad.cjs');
var widgets_wheelPicker = require('../widgets/wheel-picker.cjs');
var widgets_mentionInput = require('../widgets/mention-input.cjs');
var widgets_emojiPicker = require('../chunks/emoji-picker-Cxbnq_yU.cjs');
var widgets_commentThread = require('../chunks/comment-thread-BHsD8J70.cjs');
var widgets_diffViewer = require('../widgets/diff-viewer.cjs');
var widgets_lineChart = require('../chunks/line-chart-Dm9uMVcp.cjs');
var widgets_funnelChart = require('../widgets/funnel-chart.cjs');
var widgets_treemap = require('../widgets/treemap.cjs');
var widgets_gantt = require('../widgets/gantt.cjs');
var widgets_waffleChart = require('../widgets/waffle-chart.cjs');
var widgets_splitFlap = require('../widgets/split-flap.cjs');
var widgets_scratchCard = require('../chunks/scratch-card-CKGkO0fI.cjs');
var widgets_pageFlip = require('../chunks/page-flip-QXGJ1FV5.cjs');
var widgets_circularText = require('../chunks/circular-text-BU1a47tg.cjs');
var widgets_pixelTransition = require('../widgets/pixel-transition.cjs');
var widgets_magnetLines = require('../widgets/magnet-lines.cjs');
var widgets_textPressure = require('../widgets/text-pressure.cjs');
var widgets_shuffleGrid = require('../widgets/shuffle-grid.cjs');
var widgets_icon = require('../chunks/icon-B5mClvXb.cjs');
var widgets_iconPicker = require('../chunks/icon-picker-DU1LBm-R.cjs');
var widgets_radialMenu = require('../widgets/radial-menu.cjs');
var widgets_hoverCard = require('../widgets/hover-card.cjs');
var widgets_toggleGroup = require('../widgets/toggle-group.cjs');
var widgets_timePicker = require('../widgets/time-picker.cjs');
var widgets_colorSwatches = require('../widgets/color-swatches.cjs');
var widgets_calendarStrip = require('../widgets/calendar-strip.cjs');
var widgets_comparisonTable = require('../widgets/comparison-table.cjs');
var widgets_radialBars = require('../widgets/radial-bars.cjs');
var widgets_barRace = require('../widgets/bar-race.cjs');
var widgets_bulletChart = require('../widgets/bullet-chart.cjs');
var widgets_slopeChart = require('../widgets/slope-chart.cjs');
var widgets_dotPlot = require('../widgets/dot-plot.cjs');
var widgets_squishStepper = require('../widgets/squish-stepper.cjs');
var widgets_analogStick = require('../chunks/analog-stick-BjHCsEpF.cjs');
var widgets_transferButton = require('../widgets/transfer-button.cjs');
var widgets_lensStack = require('../widgets/lens-stack.cjs');
var widgets_irisDiaphragm = require('../widgets/iris-diaphragm.cjs');
var widgets_contourRelief = require('../widgets/contour-relief.cjs');
var widgets_numberStepper = require('../widgets/number-stepper.cjs');
var widgets_password = require('../widgets/password.cjs');
var widgets_rangeSlider = require('../widgets/range-slider.cjs');
var widgets_consent = require('../widgets/consent.cjs');
var widgets_ctaPopup = require('../widgets/cta-popup.cjs');
var widgets_validationSummary = require('../widgets/validation-summary.cjs');
var widgets_carousel = require('../chunks/carousel-CtzI1LxO.cjs');
var widgets_tabBar = require('../chunks/tab-bar-BvRhwu_Z.cjs');
var widgets_disclosure = require('../widgets/disclosure.cjs');
var widgets_stories = require('../widgets/stories.cjs');
var widgets_toastStack = require('../chunks/toast-stack-DOE1cHRn.cjs');
var widgets_modal = require('../chunks/sheet-BzJEwGbk.cjs');
var widgets_menu = require('../chunks/menu-9GcThZZr.cjs');
var widgets_odometer = require('../chunks/progress-ring-YtKPU2jM.cjs');
var widgets_skeletonReveal = require('../chunks/skeleton-reveal-04UV72HA.cjs');
var widgets_starRating = require('../widgets/star-rating.cjs');
var widgets_milestones = require('../widgets/milestones.cjs');
var widgets_masonryFlow = require('../widgets/masonry-flow.cjs');
var widgets_compare = require('../widgets/compare.cjs');
var widgets_cubeGallery = require('../widgets/cube-gallery.cjs');
var widgets_dock = require('../widgets/dock.cjs');
var widgets_navMorph = require('../chunks/nav-morph-DuNCH5WQ.cjs');
var widgets_menuToggle = require('../chunks/menu-toggle-DcMQeRDt.cjs');
var widgets_tip = require('../chunks/tip-C4ZmZX3u.cjs');
var widgets_stepper = require('../widgets/stepper.cjs');
var widgets_pagination = require('../chunks/pagination-BH2ngIJB.cjs');
var widgets_segmented = require('../chunks/segmented-JA4E5-4e.cjs');
var widgets_switch = require('../chunks/switch-Cs6mszUY.cjs');
var widgets_kanban = require('../widgets/kanban.cjs');
var widgets_swipeDeck = require('../widgets/swipe-deck.cjs');
var widgets_weatherCard = require('../chunks/weather-card-DjTGZGrl.cjs');
var widgets_pullCord = require('../widgets/pull-cord.cjs');
var widgets_datePicker = require('../chunks/date-picker-DBlxYEY6.cjs');
var widgets_colorPicker = require('../chunks/color-picker-8N-NOvcQ.cjs');
var widgets_fileDrop = require('../widgets/file-drop.cjs');
var widgets_keyframeEditor = require('../widgets/keyframe-editor.cjs');
var widgets_musicPlayer = require('../widgets/music-player.cjs');
var widgets_volumeKnob = require('../widgets/volume-knob.cjs');
var widgets_equalizer = require('../chunks/equalizer-DbABxC9W.cjs');
var widgets_lyrics = require('../chunks/lyrics-CchUHmvY.cjs');
var widgets_barChart = require('../widgets/bar-chart.cjs');
var widgets_gauge = require('../widgets/gauge.cjs');
var widgets_sparkline = require('../chunks/sparkline-b6jIA0JR.cjs');
var widgets_kpi = require('../widgets/kpi.cjs');
var widgets_addToCart = require('../widgets/add-to-cart.cjs');
var widgets_cartDrawer = require('../chunks/cart-drawer-DSPlj8F4.cjs');
var widgets_productGallery = require('../chunks/product-gallery-B5ra4XHf.cjs');
var widgets_countdown = require('../chunks/countdown-B3c7zXfX.cjs');
var widgets_messageList = require('../widgets/message-list.cjs');
var widgets_reactions = require('../chunks/reactions-C8aoxmBM.cjs');
var widgets_notificationBell = require('../widgets/notification-bell.cjs');
var widgets_presence = require('../chunks/presence-DKDktgSJ.cjs');
var widgets_leaderboard = require('../chunks/leaderboard-DAxGz-Bv.cjs');
var widgets_xpBar = require('../chunks/xp-bar-CgH7Z424.cjs');
var widgets_badgeWall = require('../chunks/badge-wall-nHmls1DJ.cjs');
var widgets_prizeWheel = require('../chunks/prize-wheel-W_4Wvldc.cjs');
var widgets_globe = require('../chunks/globe-BMVmAz1A.cjs');
var widgets_locationCard = require('../chunks/location-card-ChfmioKU.cjs');
var widgets_field = require('../chunks/field-C_ODaCJ5.cjs');
var widgets_otp = require('../chunks/otp-W5drE539.cjs');
var widgets_uploadProgress = require('../chunks/upload-progress-Dw3IXtf8.cjs');
var widgets_chatComposer = require('../widgets/chat-composer.cjs');
var widgets_suggestionChips = require('../chunks/suggestion-chips-a0-diVWW.cjs');
var widgets_voiceButton = require('../chunks/voice-button-CjB9Skfp.cjs');
var widgets_commandPalette = require('../chunks/command-palette-CF3b-53a.cjs');
var widgets_shortcut = require('../widgets/shortcut.cjs');
var widgets_clockControl = require('../widgets/clock-control.cjs');
var widgets_hydrate = require('../widgets/hydrate.cjs');
var widgets_redEnvelope = require('../widgets/red-envelope.cjs');
var widgets_festivalBanner = require('../chunks/festival-banner-DOMDAkz8.cjs');
var widgets_terminal = require('../widgets/terminal.cjs');
var widgets_retroButton = require('../chunks/retro-button-CFu0VcvW.cjs');
var widgets_organicCard = require('../widgets/organic-card.cjs');
var widgets_liquidNav = require('../widgets/liquid-nav.cjs');
var widgets_hudPanel = require('../widgets/hud-panel.cjs');
var widgets_radar = require('../chunks/radar-CGKx_0Ug.cjs');
var widgets_stickyWall = require('../widgets/sticky-wall.cjs');
var widgets_sketchChart = require('../widgets/sketch-chart.cjs');
var widgets_themeSwitcher = require('../widgets/theme-switcher.cjs');
var widgets_themeSurface = require('../widgets/theme-surface.cjs');
var widgets_gyroCard = require('../widgets/gyro-card.cjs');
var widgets_gestureSticker = require('../widgets/gesture-sticker.cjs');
var widgets_panorama = require('../widgets/panorama.cjs');
var widgets_spatialCard = require('../widgets/spatial-card.cjs');
var widgets_codeExport = require('../chunks/code-export-ZWiwLw-H.cjs');
var widgets_propPanel = require('../chunks/prop-panel-CaR91ZOI.cjs');
var widgets_motion = require('../widgets/motion.cjs');
var widgets_pluginStore = require('../widgets/plugin-store.cjs');
var widgets_chapterNav = require('../widgets/chapter-nav.cjs');
var widgets_scene = require('../widgets/scene.cjs');
var widgets_lottie = require('../widgets/lottie.cjs');
var widgets_lottieIcon = require('../chunks/lottie-icon-tbOmn1bQ.cjs');
var widgets_genArt = require('../widgets/gen-art.cjs');
var widgets_bgGenerator = require('../chunks/bg-generator-D4ssmvZk.cjs');
var widgets_videoCard = require('../widgets/video-card.cjs');
var widgets_heroVideo = require('../widgets/hero-video.cjs');
var widgets_motionPrefs = require('../widgets/motion-prefs.cjs');
var widgets_pauseAll = require('../widgets/pause-all.cjs');
var widgets_perfMonitor = require('../widgets/perf-monitor.cjs');
var widgets_workerCanvas = require('../chunks/worker-canvas-DgGkosGe.cjs');
var widgets_motionSpec = require('../widgets/motion-spec.cjs');
var widgets_nativePreview = require('../widgets/native-preview.cjs');
var widgets_pluginCard = require('../widgets/plugin-card.cjs');
var widgets_installButton = require('../widgets/install-button.cjs');
var widgets_scrollScene = require('../chunks/scroll-scene-BhVNm0uC.cjs');
var widgets_motionInspector = require('../widgets/motion-inspector.cjs');
var widgets_routeTransition = require('../widgets/route-transition.cjs');
var widgets_textSplitter = require('../widgets/text-splitter.cjs');
var widgets_scrollRing = require('../widgets/scroll-ring.cjs');
var widgets_parallaxLayers = require('../widgets/parallax-layers.cjs');
var widgets_smoothScroll = require('../widgets/smooth-scroll.cjs');
var widgets_glScene = require('../chunks/gl-scene-Hq4e8Y-O.cjs');
var widgets_gpuParticles = require('../chunks/gpu-particles-DGwFsyz_.cjs');
var widgets_shaderBackdrop = require('../chunks/shader-backdrop-Ct8UIKNL.cjs');
var widgets_lottiePlayer = require('../chunks/lottie-player-DDZt4_L7.cjs');
var widgets_rive = require('../chunks/rive-xzduMxFp.cjs');
var widgets_tokenEditor = require('../widgets/token-editor.cjs');
var widgets_physicsPlayground = require('../chunks/physics-playground-CeF9qooW.cjs');
var widgets_fileTree = require('../widgets/file-tree.cjs');
var widgets_downloadMenu = require('../widgets/download-menu.cjs');
var widgets_titleSequence = require('../widgets/title-sequence.cjs');
var widgets_motionPrompt = require('../widgets/motion-prompt.cjs');
var widgets_megaMenu = require('../chunks/nav-flyout-CrLUC54W.cjs');
var widgets_fullscreenMenu = require('../widgets/fullscreen-menu.cjs');
var widgets_breadcrumbs = require('../widgets/breadcrumbs.cjs');
var components_mo = require('./mo.cjs');
var widgets_gravityWell = require('../widgets/gravity-well.cjs');
var widgets_liquidMetal = require('../widgets/liquid-metal.cjs');
var widgets_reactionField = require('../widgets/reaction-field.cjs');
var widgets_inkFlow = require('../widgets/ink-flow.cjs');
var widgets_fluidType = require('../widgets/fluid-type.cjs');
var widgets_magneticField = require('../widgets/magnetic-field.cjs');
var widgets_elasticMesh = require('../widgets/elastic-mesh.cjs');
var widgets_springLab = require('../widgets/spring-lab.cjs');
var widgets_bezierLab = require('../widgets/bezier-lab.cjs');
var widgets_textLoupe = require('../widgets/text-loupe.cjs');
var widgets_revisionReveal = require('../widgets/revision-reveal.cjs');
var widgets_holdAction = require('../widgets/hold-action.cjs');
var widgets_scrubNumber = require('../widgets/scrub-number.cjs');
var widgets_flightStatus = require('../widgets/flight-status.cjs');
var widgets_transitProgress = require('../widgets/transit-progress.cjs');
var widgets_sunTimeline = require('../widgets/sun-timeline.cjs');
var widgets_deliveryTracker = require('../widgets/delivery-tracker.cjs');
var widgets_glucoseSparkline = require('../widgets/glucose-sparkline.cjs');
var widgets_coffeeTimer = require('../widgets/coffee-timer.cjs');
var widgets_vitalWave = require('../widgets/vital-wave.cjs');
var widgets_orbitPass = require('../widgets/orbit-pass.cjs');
var widgets_meterCountdown = require('../widgets/meter-countdown.cjs');
var widgets_raceTelemetry = require('../widgets/race-telemetry.cjs');
var widgets_workoutPlayer = require('../widgets/workout-player.cjs');
var widgets_statusPill = require('../widgets/status-pill.cjs');
var widgets_rideStatus = require('../widgets/ride-status.cjs');
var widgets_routeSparkline = require('../widgets/route-sparkline.cjs');
var widgets_activityWall = require('../widgets/activity-wall.cjs');
var widgets_luminousSwitch = require('../widgets/luminous-switch.cjs');
var widgets_particleIcon = require('../widgets/particle-icon.cjs');
var widgets_particleButton = require('../widgets/particle-button.cjs');
var widgets_haloSegmented = require('../widgets/halo-segmented.cjs');
var widgets_haloSlider = require('../widgets/halo-slider.cjs');
var widgets_orbitProgress = require('../widgets/orbit-progress.cjs');
var kit12 = require('../chunks/kit-12-B4H_NaC_.cjs');
var kit15 = require('../chunks/kit-15-D1Ovwhys.cjs');
var kit13 = require('../chunks/kit-13-CsarW7Cz.cjs');
var base = require('../chunks/base-DzZEJhQB.cjs');
var kit = require('../chunks/kit-CujTUbPK.cjs');
var viewport = require('../chunks/viewport-EFYGqMNa.cjs');

/**
 * 17.11 looks: ready-made styles for the 17.11 widgets (and every other widget that reads the kit tokens).
 *
 * A look is a palette (its colors) combined with a treatment (its surfaces and effects: borders, shadows, glow,
 * frosted glass, type, picture filters, loop speed). Three families of seventeen treatments each, over thirty palettes,
 * give 510 looks per family (17.11 shipped nine treatments over twelve palettes; 17.14 added eight of each; 17.15 added
 * ten palettes):
 *
 * - `ui` for page blocks: solid, outline, soft, glass, neon, brutal, paper, gradient, terminal, clay, neumorph, retro,
 *   pill, editorial, sketch, luxe, synth
 * - `parts` for interface parts: flat, elevated, outlined, frosted, cyber, blocky, pastel, window, console, tonal,
 *   acrylic, cupertino, compact, skeuo, inset, hairline, dusk
 * - `motion` for motion and depth: vivid, noir, sepia, duotone, glow, polaroid, film, blueprint, holo, charcoal,
 *   infrared, blockbuster, dreamy, matte, thermal, nightvision, comic
 *
 * Put `look="neon-ocean"` (or `data-mo-look="neon-ocean"`) on a widget or any ancestor after `adoptLooks()`, or call
 * `applyLook(el, 'neon-ocean')`, which adopts just that one rule. A look only sets `--mo-kit-*` tokens, the text color
 * and sometimes the font family, so any token can still be overridden next to it. See docs/looks-17-11.md.
 */
/** Palette: ink, paper, accent, second accent. `DARK_PALETTES` lists the dark ones. */
const LOOK_PALETTES = {
    indigo: ['#18181b', '#ffffff', '#4f46e5', '#a855f7'],
    ocean: ['#0c2a3e', '#f0f9ff', '#0369a1', '#22d3ee'],
    forest: ['#14281d', '#f3f8f2', '#15803d', '#a3e635'],
    sunset: ['#3b1d0e', '#fff7ed', '#c2410c', '#fb7185'],
    rose: ['#3f0d1f', '#fff1f5', '#be123c', '#f472b6'],
    grape: ['#2a1240', '#faf5ff', '#7c3aed', '#e879f9'],
    amber: ['#2f2104', '#fffbeb', '#b45309', '#facc15'],
    slate: ['#0f172a', '#f8fafc', '#475569', '#94a3b8'],
    mint: ['#062a24', '#f0fdfa', '#0f766e', '#34d399'],
    coral: ['#3a1410', '#fff5f2', '#c43d1c', '#ffb703'],
    midnight: ['#e2e8f0', '#0b1020', '#818cf8', '#22d3ee'],
    ember: ['#fef3c7', '#1c1210', '#fb923c', '#f87171'],
    // 17.14
    cherry: ['#3b0a0f', '#fff5f5', '#b91c1c', '#fca5a5'],
    olive: ['#1f2410', '#f9faf1', '#4d6b0f', '#bef264'],
    cobalt: ['#0b1640', '#f3f6ff', '#1d4ed8', '#60a5fa'],
    plum: ['#2b0b2a', '#fdf4fb', '#a21caf', '#f0abfc'],
    sand: ['#2b2418', '#fbf8f1', '#8a5a1f', '#e7c98b'],
    teal: ['#042f2e', '#effcfa', '#0e7490', '#5eead4'],
    aurora: ['#e0f2fe', '#06121f', '#a78bfa', '#34d399'],
    velvet: ['#fce7f3', '#1a0b16', '#f472b6', '#fbbf24'],
    // 17.15
    lavender: ['#1e1b3a', '#f7f5ff', '#6d28d9', '#c4b5fd'],
    moss: ['#18230f', '#f6f8ef', '#3f6212', '#d9f99d'],
    copper: ['#2a160c', '#fdf6f0', '#9a3412', '#fdba74'],
    lagoon: ['#062430', '#f0fbfc', '#155e75', '#67e8f9'],
    berry: ['#2a0a1f', '#fdf2f8', '#9d174d', '#f9a8d4'],
    sage: ['#1a2620', '#f4f7f4', '#3f6b56', '#a7c4b5'],
    espresso: ['#2b1d16', '#faf6f2', '#6f4e37', '#d6b48c'],
    navy: ['#0a1433', '#f5f7fc', '#1e3a8a', '#fbbf24'],
    obsidian: ['#e5e7eb', '#0a0a0c', '#a3e635', '#38bdf8'],
    abyss: ['#ccfbf1', '#03141a', '#2dd4bf', '#818cf8'],
};
/** The palettes with a dark paper. */
const DARK_PALETTES = ['midnight', 'ember', 'aurora', 'velvet', 'obsidian', 'abyss'];
/* ---------- color math (hex in, hex or rgb() out) ---------- */
const rgbOf = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const hexOf = (c) => '#' + c.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
/** `a` mixed into `b`: `t` = 1 is all `a`. */
function mixHex(a, t, b) {
    const x = rgbOf(a);
    const y = rgbOf(b);
    return hexOf(x.map((v, i) => v * t + y[i] * (1 - t)));
}
/** A hex color with alpha, as `rgb(r g b / a)`. */
const alpha = (hex, a) => `rgb(${rgbOf(hex).join(' ')} / ${a})`;
/** Hue of a hex color in degrees (0–359). */
function hueOf(hex) {
    const [r, g, b] = rgbOf(hex).map((v) => v / 255);
    const max = Math.max(r, g, b);
    const d = max - Math.min(r, g, b);
    if (!d)
        return 0;
    const h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return Math.round((h * 60 + 360) % 360);
}
/** WCAG contrast ratio of two hex colors. */
function contrastRatio(a, b) {
    const lum = (hex) => {
        const [r, g, b2] = rgbOf(hex).map((v) => {
            const c = v / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b2;
    };
    const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
    return (x + 0.05) / (y + 0.05);
}
const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
const NONE = '0 0 0 transparent';
/** A dark surface tinted by `tint`, with light ink and the bright accent: shared by neon, terminal, cyber, console. */
const darkSet = (p, base, tint, amount, ink) => {
    const paper = mixHex(tint, amount, base);
    return { dark: true, paper, bg: paper, ink, accent: p.a2, onAccent: paper, cta: p.a2, onCta: paper, ok: '#4ade80', bad: '#f87171' };
};
/** A light surface even for the dark palettes: deep ink and a deep accent. */
const lightSet = (p, paper) => {
    let accent = p.dark ? mixHex(p.accent, 0.62, '#111111') : p.accent;
    // a very bright accent (obsidian's lime) is still too light for white text after that mix: deepen it until it reads
    for (let t = 0.56; p.dark && t > 0.2 && contrastRatio('#ffffff', accent) < 4.5; t -= 0.06)
        accent = mixHex(p.accent, t, '#111111');
    return { dark: false, paper, bg: paper, ink: p.dark ? mixHex(p.accent, 0.22, '#14121a') : p.ink, accent, onAccent: '#ffffff' };
};
const LOOK_TREATMENTS = {
    ui: {
        solid: () => ({ radius: '14px', shadow: '0 18px 40px -22px rgb(0 0 0 / .45)' }),
        outline: (p) => ({ bw: '2px', line: p.accent, soft: p.paper, radius: '12px', shadow: NONE, cta: p.accent, onCta: p.on }),
        soft: (p) => ({ soft: mixHex(p.accent, 0.12, p.paper), line: 'transparent', radius: '18px', shadow: `0 10px 24px -18px ${alpha(p.accent, 0.6)}`, cta: p.accent, onCta: p.on }),
        glass: (p) => ({
            bg: mixHex(p.a2, 0.3, p.paper),
            paper: alpha(p.paper, 0.55),
            soft: alpha(p.paper, 0.35),
            line: p.dark ? 'rgb(255 255 255 / .16)' : 'rgb(255 255 255 / .6)',
            backdrop: 'blur(14px) saturate(1.5)',
            radius: '20px',
            shadow: `0 24px 48px -24px rgb(0 0 0 / .35), inset 0 1px 0 rgb(255 255 255 / ${p.dark ? 0.12 : 0.55})`,
        }),
        neon: (p) => {
            const d = darkSet(p, '#05050a', p.accent, 0.1, '#f5f5f7');
            return { ...d, soft: mixHex(p.a2, 0.12, d.paper), line: alpha(p.a2, 0.55), glow: `0 0 18px ${alpha(p.a2, 0.45)}`, radius: '12px', shadow: NONE };
        },
        brutal: (p) => ({ radius: '0px', bw: '3px', line: p.ink, shadow: `5px 5px 0 ${p.ink}`, soft: mixHex(p.a2, 0.25, p.paper), cta: p.accent, onCta: p.on, font: MONO }),
        paper: (p) => ({
            ...lightSet(p, mixHex(p.accent, 0.04, '#fffdf5')),
            bs: 'dashed',
            bw: '1.5px',
            dash: '4 4',
            radius: '6px',
            font: 'Georgia, "Times New Roman", serif',
        }),
        gradient: (p) => ({
            soft: mixHex(p.accent, 0.08, p.paper),
            cta: `linear-gradient(135deg, ${p.accent}, ${mixHex(p.a2, 0.55, p.ink)})`,
            onCta: p.on,
            radius: '16px',
            glow: `0 12px 30px -14px ${alpha(p.accent, 0.55)}`,
        }),
        terminal: (p) => {
            const d = darkSet(p, '#070908', p.accent, 0.06, mixHex(p.a2, 0.25, '#e8f5e9'));
            return { ...d, soft: mixHex(p.a2, 0.08, d.paper), line: alpha(p.a2, 0.4), radius: '4px', shadow: NONE, glow: `0 0 0 1px ${alpha(p.a2, 0.25)}`, font: MONO };
        },
        // 17.14
        clay: (p) => {
            const l = lightSet(p, mixHex(p.a2, 0.16, '#fbfaf8'));
            return { ...l, soft: mixHex(p.a2, 0.26, '#ffffff'), line: 'transparent', radius: '26px', shadow: `0 16px 28px -14px ${alpha(l.accent, 0.45)}, inset 0 -6px 12px ${alpha(l.accent, 0.12)}, inset 0 6px 10px rgb(255 255 255 / .7)`, cta: l.accent, onCta: '#ffffff' };
        },
        neumorph: (p) => {
            const base = p.dark ? mixHex(p.accent, 0.06, '#1b1d24') : mixHex(p.accent, 0.05, '#e9ecf2');
            const ink = p.dark ? '#e8eaf0' : p.ink;
            const accent = p.dark ? mixHex(p.accent, 0.8, '#ffffff') : mixHex(p.accent, 0.85, '#000000');
            return { dark: p.dark, paper: base, bg: base, ink, accent, onAccent: p.dark ? base : '#ffffff', soft: base, line: 'transparent', radius: '20px', shadow: p.dark ? '8px 8px 18px rgb(0 0 0 / .55), -6px -6px 14px rgb(255 255 255 / .05)' : '8px 8px 18px rgb(0 0 0 / .14), -8px -8px 18px rgb(255 255 255 / .9)', cta: accent, onCta: p.dark ? base : '#ffffff' };
        },
        retro: (p) => {
            const l = lightSet(p, '#c9c9c4');
            return { ...l, ink: '#111111', soft: '#dcdcd8', line: '#7a7a74', bw: '2px', bs: 'outset', radius: '0px', shadow: '1px 1px 0 #111111', accent: mixHex(l.accent, 0.7, '#000000'), cta: '#000080', onCta: '#ffffff', font: 'Tahoma, Verdana, "MS Sans Serif", sans-serif' };
        },
        pill: (p) => ({ radius: '999px', bw: '1.5px', line: alpha(p.accent, 0.45), soft: mixHex(p.accent, 0.1, p.paper), shadow: `0 6px 16px -10px ${alpha(p.accent, 0.7)}`, cta: p.accent, onCta: p.on }),
        editorial: (p) => {
            const l = lightSet(p, '#fffffb');
            return { ...l, ink: '#111111', soft: '#f3f2ec', line: '#111111', bw: '1px', radius: '0px', shadow: NONE, cta: '#111111', onCta: '#fffffb', font: '"Playfair Display", Didot, "Bodoni MT", Georgia, serif' };
        },
        sketch: (p) => {
            const l = lightSet(p, '#fdfcf7');
            return { ...l, soft: mixHex(p.a2, 0.14, '#fdfcf7'), line: l.ink, bw: '2px', bs: 'solid', radius: '255px 15px 225px 15px / 15px 225px 15px 255px', shadow: `2px 3px 0 ${alpha(l.ink, 0.85)}`, cta: l.accent, onCta: '#ffffff', font: '"Comic Neue", "Comic Sans MS", "Chalkboard SE", "Marker Felt", cursive' };
        },
        luxe: (p) => {
            const d = darkSet(p, '#0d0b08', p.accent, 0.05, '#f3ead6');
            const gold = mixHex(p.a2, 0.25, '#d9b45a');
            return { ...d, accent: gold, onAccent: d.paper, cta: gold, onCta: d.paper, soft: mixHex(gold, 0.08, d.paper), line: alpha(gold, 0.5), radius: '2px', shadow: '0 24px 50px -26px rgb(0 0 0 / .9)', glow: `0 0 0 1px ${alpha(gold, 0.3)}`, font: '"Cormorant Garamond", "Didot", Georgia, serif' };
        },
        synth: (p) => {
            const d = darkSet(p, '#12052a', p.accent, 0.12, '#fbe7ff');
            const pink = mixHex(p.a2, 0.35, '#ff4fd8');
            return { ...d, accent: pink, onAccent: d.paper, cta: `linear-gradient(90deg, ${pink}, ${mixHex(p.a2, 0.4, '#38e1ff')})`, onCta: d.paper, soft: mixHex(pink, 0.1, d.paper), line: alpha(pink, 0.55), radius: '10px', shadow: NONE, glow: `0 0 20px ${alpha(pink, 0.5)}, 0 0 2px ${alpha('#38e1ff', 0.8)}` };
        },
    },
    parts: {
        flat: (p) => ({ shadow: NONE, line: alpha(p.ink, 0.1), soft: mixHex(p.ink, 0.05, p.paper), radius: '10px', cta: p.accent, onCta: p.on }),
        elevated: () => ({ line: 'transparent', radius: '16px', shadow: '0 28px 60px -28px rgb(0 0 0 / .45), 0 2px 8px -2px rgb(0 0 0 / .12)' }),
        outlined: (p) => ({ bw: '1.5px', line: mixHex(p.accent, 0.55, p.paper), soft: mixHex(p.accent, 0.06, p.paper), radius: '12px', shadow: NONE, cta: p.accent, onCta: p.on }),
        frosted: (p) => ({
            bg: mixHex(p.accent, 0.3, p.paper),
            paper: alpha(mixHex(p.accent, 0.06, p.paper), 0.6),
            soft: alpha(p.paper, 0.4),
            line: p.dark ? 'rgb(255 255 255 / .15)' : 'rgb(255 255 255 / .6)',
            backdrop: 'blur(20px) saturate(1.6)',
            radius: '18px',
            shadow: '0 30px 60px -30px rgb(0 0 0 / .4)',
        }),
        cyber: (p) => {
            const d = darkSet(p, '#06070d', p.a2, 0.08, '#e6f1ff');
            return { ...d, soft: mixHex(p.a2, 0.12, d.paper), line: alpha(p.a2, 0.6), radius: '2px', shadow: NONE, glow: `0 0 0 1px ${alpha(p.a2, 0.35)}, 0 0 22px -4px ${alpha(p.a2, 0.55)}`, font: MONO };
        },
        blocky: (p) => ({ radius: '6px', bw: '2px', line: p.ink, shadow: `3px 3px 0 ${p.accent}`, soft: mixHex(p.a2, 0.2, p.paper), cta: p.accent, onCta: p.on }),
        pastel: (p) => {
            const l = lightSet(p, mixHex(p.accent, 0.07, '#ffffff'));
            return { ...l, soft: mixHex(p.a2, 0.18, '#ffffff'), line: mixHex(p.a2, 0.35, '#ffffff'), radius: '22px', shadow: `0 14px 30px -20px ${alpha(p.accent, 0.45)}`, cta: l.accent, onCta: '#ffffff' };
        },
        window: (p) => ({
            radius: '10px',
            soft: mixHex(p.ink, 0.07, p.paper),
            line: alpha(p.ink, 0.16),
            shadow: '0 22px 70px -20px rgb(0 0 0 / .5), 0 0 0 .5px rgb(0 0 0 / .2)',
            cta: p.accent,
            onCta: p.on,
            font: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
        }),
        console: (p) => {
            const d = darkSet(p, '#101216', p.accent, 0.05, '#e5e7eb');
            return { ...d, soft: mixHex('#ffffff', 0.06, d.paper), line: 'rgb(255 255 255 / .12)', radius: '8px', shadow: '0 20px 40px -24px rgb(0 0 0 / .8)', font: MONO };
        },
        // 17.14
        tonal: (p) => ({ soft: mixHex(p.accent, 0.14, p.paper), line: 'transparent', radius: '16px', shadow: NONE, cta: p.accent, onCta: p.on }),
        acrylic: (p) => ({
            bg: mixHex(p.a2, p.dark ? 0.22 : 0.45, p.paper),
            paper: alpha(p.paper, 0.72),
            soft: alpha(mixHex(p.accent, 0.1, p.paper), 0.6),
            line: p.dark ? 'rgb(255 255 255 / .1)' : 'rgb(0 0 0 / .08)',
            backdrop: 'blur(30px) saturate(1.25) brightness(1.05)',
            radius: '8px',
            shadow: '0 8px 16px rgb(0 0 0 / .14)',
            cta: p.accent,
            onCta: p.on,
            font: '"Segoe UI Variable", "Segoe UI", system-ui, sans-serif',
        }),
        cupertino: (p) => ({ radius: '13px', bw: '.5px', line: alpha(p.ink, 0.18), soft: mixHex(p.ink, 0.04, p.paper), shadow: '0 1px 2px rgb(0 0 0 / .08), 0 8px 24px -12px rgb(0 0 0 / .2)', cta: p.accent, onCta: p.on, font: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }),
        compact: (p) => ({ radius: '4px', bw: '1px', line: alpha(p.ink, 0.2), soft: mixHex(p.ink, 0.03, p.paper), shadow: NONE, cta: p.ink, onCta: p.paper, font: 'Inter, "Helvetica Neue", Arial, sans-serif' }),
        skeuo: (p) => ({
            radius: '10px',
            bw: '1px',
            line: alpha(p.ink, 0.28),
            soft: mixHex(p.ink, 0.06, p.paper),
            shadow: `inset 0 1px 0 rgb(255 255 255 / ${p.dark ? 0.12 : 0.8}), 0 1px 2px rgb(0 0 0 / .3), 0 6px 14px -6px rgb(0 0 0 / .35)`,
            cta: `linear-gradient(${mixHex(p.accent, 0.82, '#ffffff')}, ${mixHex(p.accent, 0.85, '#000000')})`,
            onCta: '#ffffff',
        }),
        inset: (p) => ({ radius: '12px', line: 'transparent', soft: mixHex(p.ink, 0.07, p.paper), shadow: `inset 0 2px 6px ${alpha('#000000', p.dark ? 0.6 : 0.16)}, inset 0 0 0 1px ${alpha(p.ink, 0.08)}`, cta: p.accent, onCta: p.on }),
        hairline: (p) => ({ radius: '0px', bw: '1px', line: alpha(p.ink, 0.32), soft: p.paper, shadow: NONE, cta: 'transparent', onCta: p.ink, dash: '1 3', glow: `0 0 0 1px ${alpha(p.accent, 0.18)}` }),
        dusk: (p) => {
            const d = darkSet(p, '#141826', p.accent, 0.1, '#e6e9f5');
            // the second accent lifted toward white, so accent text stays readable on the slate
            const lit = mixHex(p.a2, 0.55, '#ffffff');
            return { ...d, accent: lit, cta: lit, soft: mixHex('#ffffff', 0.07, d.paper), line: 'rgb(255 255 255 / .1)', radius: '14px', shadow: '0 18px 36px -20px rgb(0 0 0 / .9)', glow: `0 1px 0 ${alpha(p.a2, 0.4)} inset` };
        },
    },
    motion: {
        vivid: (p) => ({ mediaFilter: 'saturate(1.35) contrast(1.06)', speed: '1.25', glow: `0 0 24px ${alpha(p.accent, 0.35)}` }),
        noir: (p) => ({
            dark: true,
            paper: '#0b0b0c',
            bg: '#0b0b0c',
            ink: '#f4f4f5',
            accent: mixHex(p.a2, 0.5, '#ffffff'),
            onAccent: '#0b0b0c',
            mediaFilter: 'grayscale(1) contrast(1.2) brightness(.95)',
            frame: '#18181b',
            beamA: '#ffffff',
            beamB: p.a2,
            speed: '.8',
        }),
        sepia: (p) => {
            const paper = mixHex(p.accent, 0.04, '#f6eedc');
            return { dark: false, paper, bg: paper, ink: '#3b2f20', accent: mixHex(p.accent, 0.35, '#6b3f17'), onAccent: '#ffffff', mediaFilter: 'sepia(.75) saturate(1.15) contrast(1.05)', frame: '#fbf6ea', beamA: mixHex(p.accent, 0.35, '#b0895a'), beamB: '#e9d5a8', speed: '.9' };
        },
        duotone: (p) => ({ mediaFilter: `grayscale(1) sepia(1) saturate(2.4) hue-rotate(${(hueOf(p.accent) - 38 + 360) % 360}deg) contrast(1.05)`, frame: mixHex(p.accent, 0.12, p.paper) }),
        glow: (p) => ({ mediaFilter: `brightness(1.06) drop-shadow(0 0 16px ${alpha(p.a2, 0.55)})`, glow: `0 0 32px ${alpha(p.a2, 0.5)}`, beamA: p.a2, beamB: p.accent }),
        polaroid: (p) => {
            const paper = mixHex(p.accent, 0.05, '#fafaf7');
            return { ...lightSet(p, paper), frame: '#ffffff', mediaRadius: '2px', mediaFilter: 'contrast(1.04) saturate(1.08)', shadow: '0 16px 28px -18px rgb(0 0 0 / .55)' };
        },
        film: () => ({ dark: true, paper: '#111111', bg: '#111111', ink: '#ececec', accent: '#f5c542', onAccent: '#111111', mediaFilter: 'contrast(1.12) saturate(.8) sepia(.18)', mediaRadius: '0px', frame: '#1c1c1c', speed: '.7' }),
        blueprint: (p) => {
            const paper = mixHex(p.accent, 0.35, '#0b1b3a');
            return { dark: true, paper, bg: paper, ink: '#e8f1ff', accent: '#e8f1ff', onAccent: paper, line: 'rgb(255 255 255 / .4)', bs: 'dashed', dash: '6 5', mediaFilter: 'grayscale(1) brightness(1.15) contrast(.95)', mediaRadius: '4px', frame: mixHex(p.accent, 0.3, '#0f2550'), beamA: '#e8f1ff', beamB: p.a2 };
        },
        holo: (p) => ({ mediaFilter: 'saturate(1.6) hue-rotate(18deg) contrast(1.05)', glow: `0 0 26px ${alpha(p.a2, 0.45)}`, beamA: p.a2, beamB: p.accent, speed: '1.5', mediaRadius: '22px' }),
        // 17.14
        charcoal: (p) => {
            const paper = '#f2f1ee';
            return { ...lightSet(p, paper), ink: '#1a1a1a', accent: '#1a1a1a', onAccent: paper, mediaFilter: 'grayscale(1) contrast(1.75) brightness(1.05)', mediaRadius: '0px', frame: '#fafaf8', beamA: '#1a1a1a', beamB: '#9ca3af', speed: '.85' };
        },
        infrared: (p) => ({ mediaFilter: 'invert(1) hue-rotate(180deg) saturate(1.8) contrast(1.1)', glow: `0 0 22px ${alpha('#ff3b6b', 0.4)}`, beamA: '#ff3b6b', beamB: p.a2, speed: '1.1' }),
        blockbuster: (p) => {
            const paper = mixHex(p.accent, 0.08, '#0d1416');
            return { dark: true, paper, bg: paper, ink: '#f1ede6', accent: '#ffb35c', onAccent: paper, mediaFilter: 'contrast(1.15) saturate(1.25) sepia(.2) hue-rotate(-12deg)', mediaRadius: '2px', frame: '#0a0f10', beamA: '#ffb35c', beamB: '#2dd4bf', speed: '.75' };
        },
        dreamy: (p) => ({ mediaFilter: 'blur(.6px) brightness(1.08) saturate(1.2) contrast(.92)', glow: `0 0 40px ${alpha(p.a2, 0.4)}`, mediaRadius: '28px', radius: '28px', speed: '.6', beamA: mixHex(p.a2, 0.5, '#ffffff'), beamB: p.a2 }),
        matte: (p) => ({ mediaFilter: 'contrast(.85) brightness(1.08) saturate(.78)', shadow: NONE, mediaRadius: '6px', frame: mixHex(p.ink, 0.05, p.paper), speed: '.9' }),
        thermal: (p) => {
            const paper = '#0a0612';
            return { dark: true, paper, bg: paper, ink: '#fdf2f8', accent: '#facc15', onAccent: paper, mediaFilter: 'grayscale(1) invert(.1) sepia(1) saturate(6) hue-rotate(-40deg) contrast(1.4)', glow: `0 0 26px ${alpha('#f97316', 0.5)}`, frame: '#1a0f24', beamA: '#facc15', beamB: mixHex(p.a2, 0.4, '#ef4444'), speed: '1.3' };
        },
        nightvision: () => {
            const paper = '#030a05';
            return { dark: true, paper, bg: paper, ink: '#c6f7c6', accent: '#4ade80', onAccent: paper, mediaFilter: 'grayscale(1) sepia(1) hue-rotate(70deg) saturate(3.2) brightness(1.15) contrast(1.2)', mediaRadius: '50% / 46%', frame: '#071a0c', glow: '0 0 30px rgb(74 222 128 / .35)', beamA: '#4ade80', beamB: '#bbf7d0', speed: '.95', font: MONO };
        },
        comic: (p) => ({ mediaFilter: 'contrast(1.45) saturate(1.7) brightness(1.03)', bw: '3px', line: p.ink, radius: '4px', mediaRadius: '0px', shadow: `5px 5px 0 ${p.ink}`, frame: '#ffffff', speed: '1.2', font: '"Bangers", "Comic Neue", "Comic Sans MS", cursive' }),
    },
};
const LOOK_FAMILIES = /*#__PURE__*/ Object.keys(LOOK_TREATMENTS);
/* ---------- lookup ---------- */
let index = null;
function build() {
    const m = new Map();
    for (const family of LOOK_FAMILIES) {
        for (const [treatment, make] of Object.entries(LOOK_TREATMENTS[family])) {
            for (const palette of Object.keys(LOOK_PALETTES)) {
                const [ink, paper, accent, a2] = LOOK_PALETTES[palette];
                const dark = DARK_PALETTES.includes(palette);
                const p = { ink, paper, accent, a2, on: dark ? paper : '#ffffff', dark };
                const name = `${treatment}-${palette}`;
                const t = { ink, paper, accent, onAccent: p.on, bg: paper, dark, beamA: accent, beamB: a2, ...make(p) };
                // Every look sets every token, so a look inside another never inherits the outer one's surfaces.
                const solid = t.paper.startsWith('#') ? t.paper : t.bg;
                const spec = {
                    soft: mixHex(t.ink, 0.06, solid),
                    line: alpha(t.ink, 0.14),
                    radius: '14px',
                    shadow: t.dark ? '0 18px 40px -22px rgb(0 0 0 / .8)' : '0 18px 40px -22px rgb(0 0 0 / .45)',
                    glow: NONE,
                    bw: '1px',
                    bs: 'solid',
                    dash: 'none',
                    backdrop: 'none',
                    cta: t.ink,
                    onCta: solid,
                    ok: t.dark ? '#4ade80' : '#15803d',
                    bad: t.dark ? '#f87171' : '#b91c1c',
                    mediaFilter: 'none',
                    mediaRadius: '14px',
                    frame: '#ffffff',
                    speed: '1',
                    ...t,
                };
                m.set(name, { name, family, treatment, palette, ...spec });
            }
        }
    }
    return m;
}
const all = () => (index ?? (index = build()));
/** Every look name, or a family's, in treatment then palette order. */
function lookNames(family) {
    return [...all().values()].filter((l) => !family || l.family === family).map((l) => l.name);
}
/** What a look sets, or null for an unknown name. */
function lookInfo(name) {
    return all().get(name) ?? null;
}
const TOKENS = [
    ['ink', 'ink'], ['paper', 'paper'], ['accent', 'accent'], ['onAccent', 'on-accent'], ['soft', 'soft'], ['line', 'line'],
    ['radius', 'radius'], ['shadow', 'shadow'], ['glow', 'glow'], ['bw', 'border-width'], ['bs', 'border-style'], ['dash', 'dash'],
    ['backdrop', 'backdrop'], ['cta', 'cta'], ['onCta', 'on-cta'], ['ok', 'ok'], ['bad', 'bad'], ['mediaFilter', 'media-filter'],
    ['mediaRadius', 'media-radius'], ['frame', 'frame'], ['speed', 'speed'], ['beamA', 'beam-a'], ['beamB', 'beam-b'],
];
/** A look's custom properties, as `{ '--mo-kit-ink': '#…', … }` (empty for an unknown name). */
function lookTokens(name) {
    const l = lookInfo(name);
    const out = {};
    if (!l)
        return out;
    for (const [key, token] of TOKENS)
        if (l[key] != null)
            out[`--mo-kit-${token}`] = String(l[key]);
    return out;
}
/** The CSS rule for one look (empty for an unknown name). */
function lookRule(name) {
    const l = lookInfo(name);
    if (!l)
        return '';
    const decl = Object.entries(lookTokens(name)).map(([k, v]) => `${k}:${v}`);
    decl.push('color:var(--mo-kit-ink)');
    if (l.font)
        decl.push(`font-family:${l.font}`);
    return `:where([look="${name}"],[data-mo-look="${name}"]){${decl.join(';')}}`;
}
/** The stylesheet for every look, or one family's. */
function looksCss(family) {
    return lookNames(family).map(lookRule).join('\n');
}
/** Add the rules for every look (or one family's) to the document, once. */
function adoptLooks(family) {
    base.adoptStyles(`mo-looks${family ? '-' + family : ''}`, looksCss(family));
}
/** Give `el` a look (adopting just that rule); null removes it. False for an unknown name. */
function applyLook(el, name) {
    if (!el)
        return false;
    if (name == null) {
        el.removeAttribute('data-mo-look');
        return true;
    }
    if (!lookInfo(name))
        return false;
    base.adoptStyles(`mo-look-${name}`, lookRule(name));
    el.setAttribute('data-mo-look', name);
    return true;
}

const WIDGETS = {
    '6.2': { 'usa-carousel': widgets_carousel.defineCarousel, 'usa-tab-bar': widgets_tabBar.defineTabBar, 'usa-disclosure': widgets_disclosure.defineDisclosure, 'usa-stories': widgets_stories.defineStories },
    '6.3': { 'usa-toast-stack': widgets_toastStack.defineToastStack, 'usa-modal': widgets_modal.defineModal, 'usa-sheet': widgets_modal.defineSheet, 'usa-menu': widgets_menu.defineMenu },
    '6.4': { 'usa-progress-ring': widgets_odometer.defineProgressRing, 'usa-odometer': widgets_odometer.defineOdometer, 'usa-skeleton-reveal': widgets_skeletonReveal.defineSkeletonReveal, 'usa-star-rating': widgets_starRating.defineStarRating },
    '6.5': { 'usa-milestones': widgets_milestones.defineMilestones, 'usa-masonry-flow': widgets_masonryFlow.defineMasonryFlow, 'usa-compare': widgets_compare.defineCompare, 'usa-cube-gallery': widgets_cubeGallery.defineCubeGallery },
    '6.6': { 'usa-dock': widgets_dock.defineDock, 'usa-nav-morph': widgets_navMorph.defineNavMorph, 'usa-menu-toggle': widgets_menuToggle.defineMenuToggle, 'usa-tip': widgets_tip.defineTip },
    '6.7': { 'usa-stepper': widgets_stepper.defineStepper, 'usa-pagination': widgets_pagination.definePagination, 'usa-segmented': widgets_segmented.defineSegmented, 'usa-switch': widgets_switch.defineSwitch },
    '6.8': { 'usa-kanban': widgets_kanban.defineKanban, 'usa-swipe-deck': widgets_swipeDeck.defineSwipeDeck, 'usa-weather-card': widgets_weatherCard.defineWeatherCard, 'usa-pull-cord': widgets_pullCord.definePullCord },
    '6.9': { 'usa-date-picker': widgets_datePicker.defineDatePicker, 'usa-color-picker': widgets_colorPicker.defineColorPicker, 'usa-file-drop': widgets_fileDrop.defineFileDrop, 'usa-keyframe-editor': widgets_keyframeEditor.defineKeyframeEditor },
    '7.1': { 'usa-music-player': widgets_musicPlayer.defineMusicPlayer, 'usa-volume-knob': widgets_volumeKnob.defineVolumeKnob, 'usa-equalizer': widgets_equalizer.defineEqualizer, 'usa-lyrics': widgets_lyrics.defineLyrics },
    '7.2': { 'usa-bar-chart': widgets_barChart.defineBarChart, 'usa-gauge': widgets_gauge.defineGauge, 'usa-sparkline': widgets_sparkline.defineSparkline, 'usa-kpi': widgets_kpi.defineKpi },
    '7.3': { 'usa-add-to-cart': widgets_addToCart.defineAddToCart, 'usa-cart-drawer': widgets_cartDrawer.defineCartDrawer, 'usa-product-gallery': widgets_productGallery.defineProductGallery, 'usa-countdown': widgets_countdown.defineCountdown },
    '7.4': { 'usa-message-list': widgets_messageList.defineMessageList, 'usa-reactions': widgets_reactions.defineReactions, 'usa-notification-bell': widgets_notificationBell.defineNotificationBell, 'usa-presence': widgets_presence.definePresence },
    '7.5': { 'usa-leaderboard': widgets_leaderboard.defineLeaderboard, 'usa-xp-bar': widgets_xpBar.defineXpBar, 'usa-badge-wall': widgets_badgeWall.defineBadgeWall, 'usa-prize-wheel': widgets_prizeWheel.definePrizeWheel },
    '7.6': { 'usa-globe': widgets_globe.defineGlobe, 'usa-location-card': widgets_locationCard.defineLocationCard },
    '7.7': { 'usa-field': widgets_field.defineField, 'usa-otp': widgets_otp.defineOtp, 'usa-upload-progress': widgets_uploadProgress.defineUploadProgress },
    '7.8': { 'usa-chat-composer': widgets_chatComposer.defineChatComposer, 'usa-suggestion-chips': widgets_suggestionChips.defineSuggestionChips, 'usa-voice-button': widgets_voiceButton.defineVoiceButton },
    '7.9': { 'usa-command-palette': widgets_commandPalette.defineCommandPalette, 'usa-shortcut': widgets_shortcut.defineShortcut },
    '8.0': { 'usa-clock-control': widgets_clockControl.defineClockControl, 'usa-hydrate': widgets_hydrate.defineHydrate },
    '8.1': { 'usa-red-envelope': widgets_redEnvelope.defineRedEnvelope, 'usa-festival-banner': widgets_festivalBanner.defineFestivalBanner },
    '8.2': { 'usa-terminal': widgets_terminal.defineTerminal, 'usa-retro-button': widgets_retroButton.defineRetroButton },
    '8.3': { 'usa-organic-card': widgets_organicCard.defineOrganicCard, 'usa-liquid-nav': widgets_liquidNav.defineLiquidNav },
    '8.4': { 'usa-hud-panel': widgets_hudPanel.defineHudPanel, 'usa-radar': widgets_radar.defineRadar },
    '8.5': { 'usa-sticky-wall': widgets_stickyWall.defineStickyWall, 'usa-sketch-chart': widgets_sketchChart.defineSketchChart },
    '8.6': { 'usa-theme-switcher': widgets_themeSwitcher.defineThemeSwitcher, 'usa-theme-surface': widgets_themeSurface.defineThemeSurface },
    '8.7': { 'usa-gyro-card': widgets_gyroCard.defineGyroCard, 'usa-gesture-sticker': widgets_gestureSticker.defineGestureSticker },
    '8.8': { 'usa-panorama': widgets_panorama.definePanorama, 'usa-spatial-card': widgets_spatialCard.defineSpatialCard },
    '8.9': { 'usa-code-export': widgets_codeExport.defineCodeExport, 'usa-prop-panel': widgets_propPanel.definePropPanel },
    '9.0': { 'usa-motion': widgets_motion.defineMotion, 'usa-plugin-store': widgets_pluginStore.definePluginStore },
    '9.1': { 'usa-chapter-nav': widgets_chapterNav.defineChapterNav, 'usa-scene': widgets_scene.defineScene },
    '9.2': { 'usa-lottie': widgets_lottie.defineLottie, 'usa-lottie-icon': widgets_lottieIcon.defineLottieIcon },
    '9.3': { 'usa-gen-art': widgets_genArt.defineGenArt, 'usa-bg-generator': widgets_bgGenerator.defineBgGenerator },
    '9.4': { 'usa-video-card': widgets_videoCard.defineVideoCard, 'usa-hero-video': widgets_heroVideo.defineHeroVideo },
    '9.5': { 'usa-motion-prefs': widgets_motionPrefs.defineMotionPrefs, 'usa-pause-all': widgets_pauseAll.definePauseAll },
    '9.6': { 'usa-perf-monitor': widgets_perfMonitor.definePerfMonitor, 'usa-worker-canvas': widgets_workerCanvas.defineWorkerCanvas },
    '9.7': { 'usa-motion-spec': widgets_motionSpec.defineMotionSpec },
    '9.8': { 'usa-native-preview': widgets_nativePreview.defineNativePreview },
    '10.1': { 'usa-plugin-card': widgets_pluginCard.definePluginCard, 'usa-install-button': widgets_installButton.defineInstallButton },
    '10.2': { 'usa-scroll-scene': widgets_scrollScene.defineScrollScene, 'usa-motion-inspector': widgets_motionInspector.defineMotionInspector },
    '10.3': { 'usa-route-transition': widgets_routeTransition.defineRouteTransition, 'usa-text-splitter': widgets_textSplitter.defineTextSplitter },
    '10.4': { 'usa-scroll-ring': widgets_scrollRing.defineScrollRing, 'usa-parallax-layers': widgets_parallaxLayers.defineParallaxLayers, 'usa-smooth-scroll': widgets_smoothScroll.defineSmoothScroll },
    '10.5': { 'usa-gl-scene': widgets_glScene.defineGlScene, 'usa-gpu-particles': widgets_gpuParticles.defineGpuParticles, 'usa-shader-backdrop': widgets_shaderBackdrop.defineShaderBackdrop },
    '10.6': { 'usa-lottie-player': widgets_lottiePlayer.defineLottiePlayer, 'usa-rive': widgets_rive.defineRive, 'usa-token-editor': widgets_tokenEditor.defineTokenEditor },
    '10.7': { 'usa-physics-playground': widgets_physicsPlayground.definePhysicsPlayground, 'usa-motion-prompt': widgets_motionPrompt.defineMotionPrompt },
    '17.3': { 'usa-mega-menu': widgets_megaMenu.defineMegaMenu, 'usa-nav-flyout': widgets_megaMenu.defineNavFlyout, 'usa-fullscreen-menu': widgets_fullscreenMenu.defineFullscreenMenu, 'usa-breadcrumbs': widgets_breadcrumbs.defineBreadcrumbs, 'usa-file-tree': widgets_fileTree.defineFileTree, 'usa-download-menu': widgets_downloadMenu.defineDownloadMenu, 'usa-title-sequence': widgets_titleSequence.defineTitleSequence },
    '17.15': { 'usa-radial-menu': widgets_radialMenu.defineRadialMenu, 'usa-hover-card': widgets_hoverCard.defineHoverCard, 'usa-toggle-group': widgets_toggleGroup.defineToggleGroup, 'usa-time-picker': widgets_timePicker.defineTimePicker, 'usa-color-swatches': widgets_colorSwatches.defineColorSwatches, 'usa-calendar-strip': widgets_calendarStrip.defineCalendarStrip, 'usa-comparison-table': widgets_comparisonTable.defineComparisonTable, 'usa-radial-bars': widgets_radialBars.defineRadialBars, 'usa-bar-race': widgets_barRace.defineBarRace, 'usa-bullet-chart': widgets_bulletChart.defineBulletChart, 'usa-slope-chart': widgets_slopeChart.defineSlopeChart, 'usa-dot-plot': widgets_dotPlot.defineDotPlot },
    '17.14': { 'usa-icon': widgets_icon.defineIcon, 'usa-icon-picker': widgets_iconPicker.defineIconPicker },
    '17.13': { 'usa-tour': widgets_tour.defineTour, 'usa-signature-pad': widgets_signaturePad.defineSignaturePad, 'usa-wheel-picker': widgets_wheelPicker.defineWheelPicker, 'usa-mention-input': widgets_mentionInput.defineMentionInput, 'usa-emoji-picker': widgets_emojiPicker.defineEmojiPicker, 'usa-comment-thread': widgets_commentThread.defineCommentThread, 'usa-diff-viewer': widgets_diffViewer.defineDiffViewer, 'usa-line-chart': widgets_lineChart.defineLineChart, 'usa-funnel-chart': widgets_funnelChart.defineFunnelChart, 'usa-treemap': widgets_treemap.defineTreemap, 'usa-gantt': widgets_gantt.defineGantt, 'usa-waffle-chart': widgets_waffleChart.defineWaffleChart, 'usa-split-flap': widgets_splitFlap.defineSplitFlap, 'usa-scratch-card': widgets_scratchCard.defineScratchCard, 'usa-page-flip': widgets_pageFlip.definePageFlip, 'usa-circular-text': widgets_circularText.defineCircularText, 'usa-pixel-transition': widgets_pixelTransition.definePixelTransition, 'usa-magnet-lines': widgets_magnetLines.defineMagnetLines, 'usa-text-pressure': widgets_textPressure.defineTextPressure, 'usa-shuffle-grid': widgets_shuffleGrid.defineShuffleGrid },
    '17.12': { 'usa-progress-tabs': widgets_progressTabs.defineProgressTabs, 'usa-code-tabs': widgets_codeTabs.defineCodeTabs, 'usa-helpful-vote': widgets_helpfulVote.defineHelpfulVote, 'usa-share-button': widgets_shareButton.defineShareButton, 'usa-inline-edit': widgets_inlineEdit.defineInlineEdit, 'usa-tag-cloud': widgets_tagCloud.defineTagCloud, 'usa-heatmap': widgets_heatmap.defineHeatmap, 'usa-donut-chart': widgets_donutChart.defineDonutChart, 'usa-sortable-list': widgets_sortableList.defineSortableList, 'usa-zoom-lens': widgets_zoomLens.defineZoomLens, 'usa-rating-bars': widgets_ratingBars.defineRatingBars, 'usa-checklist': widgets_checklist.defineChecklist, 'usa-meteors': widgets_meteors.defineMeteors, 'usa-connect-beam': widgets_connectBeam.defineConnectBeam, 'usa-retro-grid': widgets_retroGrid.defineRetroGrid, 'usa-orbit-rings': widgets_orbitRings.defineOrbitRings, 'usa-letter-swap': widgets_letterSwap.defineLetterSwap, 'usa-ripple-grid': widgets_rippleGrid.defineRippleGrid },
    '17.11': { 'usa-search-bar': widgets_searchBar.defineSearchBar, 'usa-subscribe': widgets_subscribe.defineSubscribe, 'usa-download-button': widgets_downloadButton.defineDownloadButton, 'usa-reveal-footer': widgets_revealFooter.defineRevealFooter, 'usa-shape-divider': widgets_shapeDivider.defineShapeDivider, 'usa-scroll-cue': widgets_scrollCue.defineScrollCue, 'usa-virtual-list': widgets_virtualList.defineVirtualList, 'usa-infinite-scroll': widgets_infiniteScroll.defineInfiniteScroll, 'usa-context-menu': widgets_contextMenu.defineContextMenu, 'usa-split-pane': widgets_splitPane.defineSplitPane, 'usa-desktop-windows': widgets_desktopWindows.defineDesktopWindows, 'usa-stack-slider': widgets_stackSlider.defineStackSlider, 'usa-morph-card': widgets_morphCard.defineMorphCard, 'usa-scroll-zoom': widgets_scrollZoom.defineScrollZoom, 'usa-scroll-bg': widgets_scrollBg.defineScrollBg, 'usa-image-tunnel': widgets_imageTunnel.defineImageTunnel, 'usa-orbit-gallery': widgets_orbitGallery.defineOrbitGallery, 'usa-clothesline': widgets_clothesline.defineClothesline, 'usa-elastic-frame': widgets_elasticFrame.defineElasticFrame, 'usa-border-beam': widgets_borderBeam.defineBorderBeam },
    '17.10': { 'usa-sidebar': widgets_sidebar.defineSidebar, 'usa-scrollspy': widgets_scrollspy.defineScrollspy, 'usa-pricing': widgets_pricing.definePricing, 'usa-announcement-bar': widgets_announcementBar.defineAnnouncementBar, 'usa-sticky-cta': widgets_stickyCta.defineStickyCta, 'usa-bento': widgets_bento.defineBento, 'usa-empty-state': widgets_emptyState.defineEmptyState, 'usa-lightbox': widgets_lightbox.defineLightbox, 'usa-data-table': widgets_dataTable.defineDataTable, 'usa-filter-chips': widgets_filterChips.defineFilterChips, 'usa-hotspots': widgets_hotspots.defineHotspots, 'usa-fan-carousel': widgets_fanCarousel.defineFanCarousel, 'usa-expand-cards': widgets_expandCards.defineExpandCards, 'usa-json-viewer': widgets_jsonViewer.defineJsonViewer, 'usa-scroll-velocity': widgets_scrollVelocity.defineScrollVelocity, 'usa-horizontal-scroll': widgets_horizontalScroll.defineHorizontalScroll, 'usa-image-trail': widgets_imageTrail.defineImageTrail, 'usa-hover-reveal-list': widgets_hoverRevealList.defineHoverRevealList, 'usa-liquid-glass': widgets_liquidGlass.defineLiquidGlass, 'usa-path-motion': widgets_pathMotion.definePathMotion, 'usa-cut-reveal': widgets_cutReveal.defineCutReveal },
    '17.9': { 'usa-eclipse-toggle': widgets_eclipseToggle.defineEclipseToggle, 'usa-hue-orbit': widgets_hueOrbit.defineHueOrbit, 'usa-notch-slider': widgets_notchSlider.defineNotchSlider, 'usa-bulge-volume': widgets_bulgeVolume.defineBulgeVolume, 'usa-copy-button': widgets_copyButton.defineCopyButton, 'usa-tile-relay': widgets_tileRelay.defineTileRelay, 'usa-squish-key': widgets_squishKey.defineSquishKey, 'usa-squish-stepper': widgets_squishStepper.defineSquishStepper, 'usa-analog-stick': widgets_analogStick.defineAnalogStick, 'usa-transfer-button': widgets_transferButton.defineTransferButton, 'usa-six-dot-orbit': widgets_sixDotOrbit.defineSixDotOrbit, 'usa-center-bars': widgets_centerBars.defineCenterBars, 'usa-quarter-ring': widgets_quarterRing.defineQuarterRing, 'usa-triple-pulse': widgets_triplePulse.defineTriplePulse, 'usa-breath-orb': widgets_breathOrb.defineBreathOrb, 'usa-three-dot-bounce': widgets_threeDotBounce.defineThreeDotBounce, 'usa-infinity-loop': widgets_infinityLoop.defineInfinityLoop, 'usa-sweep-lines': widgets_sweepLines.defineSweepLines, 'usa-wifi-signal': widgets_wifiSignal.defineWifiSignal, 'usa-text-reveal': widgets_textReveal.defineTextReveal, 'usa-jelly-button': widgets_jellyButton.defineJellyButton, 'usa-bounce-button': widgets_bounceButton.defineBounceButton, 'usa-tada-button': widgets_tadaButton.defineTadaButton, 'usa-groove-toggle': widgets_grooveToggle.defineGrooveToggle, 'usa-cart-badge': widgets_cartBadge.defineCartBadge, 'usa-chip-input': widgets_chipInput.defineChipInput, 'usa-plan-picker': widgets_planPicker.definePlanPicker, 'usa-align-switch': widgets_alignSwitch.defineAlignSwitch, 'usa-elastic-slider': widgets_elasticSlider.defineElasticSlider, 'usa-code-shake': widgets_codeShake.defineCodeShake, 'usa-strength-meter': widgets_strengthMeter.defineStrengthMeter, 'usa-step-track': widgets_stepTrack.defineStepTrack, 'usa-elastic-accordion': widgets_elasticAccordion.defineElasticAccordion, 'usa-squish-indicator': widgets_squishIndicator.defineSquishIndicator },
    '17.8': { 'usa-lens-stack': widgets_lensStack.defineLensStack, 'usa-iris-diaphragm': widgets_irisDiaphragm.defineIrisDiaphragm, 'usa-contour-relief': widgets_contourRelief.defineContourRelief },
    '17.7': { 'usa-textarea': widgets_textarea.defineTextarea, 'usa-search-field': widgets_searchField.defineSearchField, 'usa-form-stepper': widgets_formStepper.defineFormStepper, 'usa-select': widgets_select.defineSelect, 'usa-combobox': widgets_combobox.defineCombobox, 'usa-multi-select': widgets_multiSelect.defineMultiSelect, 'usa-number-stepper': widgets_numberStepper.defineNumberStepper, 'usa-password': widgets_password.definePassword, 'usa-range-slider': widgets_rangeSlider.defineRangeSlider, 'usa-consent': widgets_consent.defineConsent, 'usa-cta-popup': widgets_ctaPopup.defineCtaPopup, 'usa-validation-summary': widgets_validationSummary.defineValidationSummary },
    '17.6': { 'usa-gravity-well': widgets_gravityWell.defineGravityWell, 'usa-liquid-metal': widgets_liquidMetal.defineLiquidMetal, 'usa-reaction-field': widgets_reactionField.defineReactionField, 'usa-ink-flow': widgets_inkFlow.defineInkFlow, 'usa-fluid-type': widgets_fluidType.defineFluidType, 'usa-magnetic-field': widgets_magneticField.defineMagneticField, 'usa-elastic-mesh': widgets_elasticMesh.defineElasticMesh, 'usa-spring-lab': widgets_springLab.defineSpringLab, 'usa-bezier-lab': widgets_bezierLab.defineBezierLab, 'usa-text-loupe': widgets_textLoupe.defineTextLoupe, 'usa-revision-reveal': widgets_revisionReveal.defineRevisionReveal, 'usa-hold-action': widgets_holdAction.defineHoldAction, 'usa-scrub-number': widgets_scrubNumber.defineScrubNumber },
    '17.5': { 'usa-flight-status': widgets_flightStatus.defineFlightStatus, 'usa-transit-progress': widgets_transitProgress.defineTransitProgress, 'usa-sun-timeline': widgets_sunTimeline.defineSunTimeline, 'usa-delivery-tracker': widgets_deliveryTracker.defineDeliveryTracker, 'usa-glucose-sparkline': widgets_glucoseSparkline.defineGlucoseSparkline, 'usa-coffee-timer': widgets_coffeeTimer.defineCoffeeTimer, 'usa-vital-wave': widgets_vitalWave.defineVitalWave, 'usa-orbit-pass': widgets_orbitPass.defineOrbitPass, 'usa-meter-countdown': widgets_meterCountdown.defineMeterCountdown, 'usa-race-telemetry': widgets_raceTelemetry.defineRaceTelemetry, 'usa-workout-player': widgets_workoutPlayer.defineWorkoutPlayer, 'usa-status-pill': widgets_statusPill.defineStatusPill, 'usa-ride-status': widgets_rideStatus.defineRideStatus, 'usa-route-sparkline': widgets_routeSparkline.defineRouteSparkline, 'usa-activity-wall': widgets_activityWall.defineActivityWall },
    '17.4': { 'usa-luminous-switch': widgets_luminousSwitch.defineLuminousSwitch, 'usa-particle-icon': widgets_particleIcon.defineParticleIcon, 'usa-particle-button': widgets_particleButton.defineParticleButton, 'usa-halo-segmented': widgets_haloSegmented.defineHaloSegmented, 'usa-halo-slider': widgets_haloSlider.defineHaloSlider, 'usa-orbit-progress': widgets_orbitProgress.defineOrbitProgress },
};
/** Every widget tag, in release order. */
const WIDGET_TAGS = /*#__PURE__*/ Object.values(WIDGETS).flatMap((g) => Object.keys(g));
/**
 * Register every widget (or only those of one release, e.g. `'6.2'`). 17.3: `mo-*` is the default name — this turns on
 * the `<mo-*>` names first (`defineMoAliases()`); the `usa-*` names stay registered as deprecated aliases.
 */
function defineWidgets(release) {
    components_mo.defineMoAliases();
    for (const [v, group] of Object.entries(WIDGETS))
        if (!release || release === v)
            for (const [tag, fn] of Object.entries(group))
                fn(tag);
}

exports.defineTextarea = widgets_textarea.defineTextarea;
exports.defineSearchField = widgets_searchField.defineSearchField;
exports.defineFormStepper = widgets_formStepper.defineFormStepper;
exports.defineSelect = widgets_select.defineSelect;
exports.defineCombobox = widgets_combobox.defineCombobox;
exports.defineMultiSelect = widgets_multiSelect.defineMultiSelect;
exports.defineEclipseToggle = widgets_eclipseToggle.defineEclipseToggle;
exports.defineHueOrbit = widgets_hueOrbit.defineHueOrbit;
exports.hueColor = widgets_hueOrbit.hueColor;
exports.defineNotchSlider = widgets_notchSlider.defineNotchSlider;
exports.defineBulgeVolume = widgets_bulgeVolume.defineBulgeVolume;
exports.defineCopyButton = widgets_copyButton.defineCopyButton;
exports.defineTileRelay = widgets_tileRelay.defineTileRelay;
exports.relayOrder = widgets_tileRelay.relayOrder;
exports.defineSquishKey = widgets_squishKey.defineSquishKey;
exports.defineSixDotOrbit = widgets_sixDotOrbit.defineSixDotOrbit;
exports.defineCenterBars = widgets_centerBars.defineCenterBars;
exports.defineQuarterRing = widgets_quarterRing.defineQuarterRing;
exports.defineTriplePulse = widgets_triplePulse.defineTriplePulse;
exports.defineBreathOrb = widgets_breathOrb.defineBreathOrb;
exports.defineThreeDotBounce = widgets_threeDotBounce.defineThreeDotBounce;
exports.defineInfinityLoop = widgets_infinityLoop.defineInfinityLoop;
exports.defineSweepLines = widgets_sweepLines.defineSweepLines;
exports.defineWifiSignal = widgets_wifiSignal.defineWifiSignal;
exports.defineTextReveal = widgets_textReveal.defineTextReveal;
exports.revealPieces = widgets_textReveal.revealPieces;
exports.defineJellyButton = widgets_jellyButton.defineJellyButton;
exports.defineBounceButton = widgets_bounceButton.defineBounceButton;
exports.defineTadaButton = widgets_tadaButton.defineTadaButton;
exports.defineGrooveToggle = widgets_grooveToggle.defineGrooveToggle;
exports.badgeText = widgets_cartBadge.badgeText;
exports.defineCartBadge = widgets_cartBadge.defineCartBadge;
exports.defineChipInput = widgets_chipInput.defineChipInput;
exports.splitChips = widgets_chipInput.splitChips;
exports.definePlanPicker = widgets_planPicker.definePlanPicker;
exports.parsePlans = widgets_planPicker.parsePlans;
exports.ALIGNMENTS = widgets_alignSwitch.ALIGNMENTS;
exports.defineAlignSwitch = widgets_alignSwitch.defineAlignSwitch;
exports.defineElasticSlider = widgets_elasticSlider.defineElasticSlider;
exports.defineCodeShake = widgets_codeShake.defineCodeShake;
exports.digitsOf = widgets_codeShake.digitsOf;
exports.STRENGTH_WORDS = widgets_strengthMeter.STRENGTH_WORDS;
exports.defineStrengthMeter = widgets_strengthMeter.defineStrengthMeter;
exports.passwordScore = widgets_strengthMeter.passwordScore;
exports.defineStepTrack = widgets_stepTrack.defineStepTrack;
exports.defineElasticAccordion = widgets_elasticAccordion.defineElasticAccordion;
exports.defineSquishIndicator = widgets_squishIndicator.defineSquishIndicator;
exports.parseOptions = widgets_squishIndicator.parseOptions;
exports.defineSidebar = widgets_sidebar.defineSidebar;
exports.defineScrollspy = widgets_scrollspy.defineScrollspy;
exports.definePricing = widgets_pricing.definePricing;
exports.defineAnnouncementBar = widgets_announcementBar.defineAnnouncementBar;
exports.defineStickyCta = widgets_stickyCta.defineStickyCta;
exports.defineBento = widgets_bento.defineBento;
exports.EMPTY_ICONS = widgets_emptyState.EMPTY_ICONS;
exports.defineEmptyState = widgets_emptyState.defineEmptyState;
exports.defineLightbox = widgets_lightbox.defineLightbox;
exports.compareKeys = widgets_dataTable.compareKeys;
exports.defineDataTable = widgets_dataTable.defineDataTable;
exports.sortKey = widgets_dataTable.sortKey;
exports.defineFilterChips = widgets_filterChips.defineFilterChips;
exports.defineHotspots = widgets_hotspots.defineHotspots;
exports.defineFanCarousel = widgets_fanCarousel.defineFanCarousel;
exports.fanPose = widgets_fanCarousel.fanPose;
exports.defineExpandCards = widgets_expandCards.defineExpandCards;
exports.defineJsonViewer = widgets_jsonViewer.defineJsonViewer;
exports.jsonPath = widgets_jsonViewer.jsonPath;
exports.defineScrollVelocity = widgets_scrollVelocity.defineScrollVelocity;
exports.velocityAmount = widgets_scrollVelocity.velocityAmount;
exports.defineHorizontalScroll = widgets_horizontalScroll.defineHorizontalScroll;
exports.trackOffset = widgets_horizontalScroll.trackOffset;
exports.defineImageTrail = widgets_imageTrail.defineImageTrail;
exports.defineHoverRevealList = widgets_hoverRevealList.defineHoverRevealList;
exports.defineLiquidGlass = widgets_liquidGlass.defineLiquidGlass;
exports.cleanPathData = widgets_pathMotion.cleanPathData;
exports.definePathMotion = widgets_pathMotion.definePathMotion;
exports.defineCutReveal = widgets_cutReveal.defineCutReveal;
exports.stripClips = widgets_cutReveal.stripClips;
exports.defineSearchBar = widgets_searchBar.defineSearchBar;
exports.matchSuggestions = widgets_searchBar.matchSuggestions;
exports.defineSubscribe = widgets_subscribe.defineSubscribe;
exports.isEmail = widgets_subscribe.isEmail;
exports.defineDownloadButton = widgets_downloadButton.defineDownloadButton;
exports.percentLabel = widgets_downloadButton.percentLabel;
exports.defineRevealFooter = widgets_revealFooter.defineRevealFooter;
exports.riseProgress = widgets_revealFooter.riseProgress;
exports.DIVIDER_SHAPES = widgets_shapeDivider.DIVIDER_SHAPES;
exports.defineShapeDivider = widgets_shapeDivider.defineShapeDivider;
exports.dividerPath = widgets_shapeDivider.dividerPath;
exports.CUE_KINDS = widgets_scrollCue.CUE_KINDS;
exports.defineScrollCue = widgets_scrollCue.defineScrollCue;
exports.defineVirtualList = widgets_virtualList.defineVirtualList;
exports.virtualWindow = widgets_virtualList.virtualWindow;
exports.defineInfiniteScroll = widgets_infiniteScroll.defineInfiniteScroll;
exports.defineContextMenu = widgets_contextMenu.defineContextMenu;
exports.placeMenu = widgets_contextMenu.placeMenu;
exports.clampSplit = widgets_splitPane.clampSplit;
exports.defineSplitPane = widgets_splitPane.defineSplitPane;
exports.clampWindow = widgets_desktopWindows.clampWindow;
exports.defineDesktopWindows = widgets_desktopWindows.defineDesktopWindows;
exports.defineStackSlider = widgets_stackSlider.defineStackSlider;
exports.stackPose = widgets_stackSlider.stackPose;
exports.defineMorphCard = widgets_morphCard.defineMorphCard;
exports.invertRect = widgets_morphCard.invertRect;
exports.defineScrollZoom = widgets_scrollZoom.defineScrollZoom;
exports.zoomAt = widgets_scrollZoom.zoomAt;
exports.defineScrollBg = widgets_scrollBg.defineScrollBg;
exports.sectionAt = widgets_scrollBg.sectionAt;
exports.defineImageTunnel = widgets_imageTunnel.defineImageTunnel;
exports.tunnelPose = widgets_imageTunnel.tunnelPose;
exports.defineOrbitGallery = widgets_orbitGallery.defineOrbitGallery;
exports.frontIndex = widgets_orbitGallery.frontIndex;
exports.ringRadius = widgets_orbitGallery.ringRadius;
exports.defineClothesline = widgets_clothesline.defineClothesline;
exports.sagAt = widgets_clothesline.sagAt;
exports.swingStep = widgets_clothesline.swingStep;
exports.defineElasticFrame = widgets_elasticFrame.defineElasticFrame;
exports.elasticPath = widgets_elasticFrame.elasticPath;
exports.defineBorderBeam = widgets_borderBeam.defineBorderBeam;
exports.defineProgressTabs = widgets_progressTabs.defineProgressTabs;
exports.defineCodeTabs = widgets_codeTabs.defineCodeTabs;
exports.defineHelpfulVote = widgets_helpfulVote.defineHelpfulVote;
exports.SHARE_TARGETS = widgets_shareButton.SHARE_TARGETS;
exports.defineShareButton = widgets_shareButton.defineShareButton;
exports.shareUrl = widgets_shareButton.shareUrl;
exports.defineInlineEdit = widgets_inlineEdit.defineInlineEdit;
exports.defineTagCloud = widgets_tagCloud.defineTagCloud;
exports.tagSize = widgets_tagCloud.tagSize;
exports.defineHeatmap = widgets_heatmap.defineHeatmap;
exports.heatLevel = widgets_heatmap.heatLevel;
exports.defineDonutChart = widgets_donutChart.defineDonutChart;
exports.donutArcs = widgets_donutChart.donutArcs;
exports.defineSortableList = widgets_sortableList.defineSortableList;
exports.dropIndex = widgets_sortableList.dropIndex;
exports.defineZoomLens = widgets_zoomLens.defineZoomLens;
exports.lensOffset = widgets_zoomLens.lensOffset;
exports.defineRatingBars = widgets_ratingBars.defineRatingBars;
exports.ratingSummary = widgets_ratingBars.ratingSummary;
exports.defineChecklist = widgets_checklist.defineChecklist;
exports.ringDash = widgets_checklist.ringDash;
exports.defineMeteors = widgets_meteors.defineMeteors;
exports.meteorAt = widgets_meteors.meteorAt;
exports.beamPath = widgets_connectBeam.beamPath;
exports.defineConnectBeam = widgets_connectBeam.defineConnectBeam;
exports.defineRetroGrid = widgets_retroGrid.defineRetroGrid;
exports.defineOrbitRings = widgets_orbitRings.defineOrbitRings;
exports.orbitAngle = widgets_orbitRings.orbitAngle;
exports.defineLetterSwap = widgets_letterSwap.defineLetterSwap;
exports.defineRippleGrid = widgets_rippleGrid.defineRippleGrid;
exports.rippleAt = widgets_rippleGrid.rippleAt;
exports.defineTour = widgets_tour.defineTour;
exports.defineSignaturePad = widgets_signaturePad.defineSignaturePad;
exports.defineWheelPicker = widgets_wheelPicker.defineWheelPicker;
exports.defineMentionInput = widgets_mentionInput.defineMentionInput;
exports.EMOJI = widgets_emojiPicker.EMOJI;
exports.defineEmojiPicker = widgets_emojiPicker.defineEmojiPicker;
exports.filterEmoji = widgets_emojiPicker.filterEmoji;
exports.defineCommentThread = widgets_commentThread.defineCommentThread;
exports.replyCount = widgets_commentThread.replyCount;
exports.defineDiffViewer = widgets_diffViewer.defineDiffViewer;
exports.defineLineChart = widgets_lineChart.defineLineChart;
exports.parseSeries = widgets_lineChart.parseSeries;
exports.defineFunnelChart = widgets_funnelChart.defineFunnelChart;
exports.defineTreemap = widgets_treemap.defineTreemap;
exports.defineGantt = widgets_gantt.defineGantt;
exports.defineWaffleChart = widgets_waffleChart.defineWaffleChart;
exports.defineSplitFlap = widgets_splitFlap.defineSplitFlap;
exports.clearedShare = widgets_scratchCard.clearedShare;
exports.defineScratchCard = widgets_scratchCard.defineScratchCard;
exports.definePageFlip = widgets_pageFlip.definePageFlip;
exports.turnAngle = widgets_pageFlip.turnAngle;
exports.circlePath = widgets_circularText.circlePath;
exports.defineCircularText = widgets_circularText.defineCircularText;
exports.definePixelTransition = widgets_pixelTransition.definePixelTransition;
exports.defineMagnetLines = widgets_magnetLines.defineMagnetLines;
exports.defineTextPressure = widgets_textPressure.defineTextPressure;
exports.defineShuffleGrid = widgets_shuffleGrid.defineShuffleGrid;
exports.ICONS = widgets_icon.ICONS;
exports.ICON_CATEGORIES = widgets_icon.ICON_CATEGORIES;
exports.ICON_GROUPS = widgets_icon.ICON_GROUPS;
exports.ICON_MOTIONS = widgets_icon.ICON_MOTIONS;
exports.ICON_SVG_ATTRS = widgets_icon.ICON_SVG_ATTRS;
exports.ICON_TRIGGERS = widgets_icon.ICON_TRIGGERS;
exports.defineIcon = widgets_icon.defineIcon;
exports.iconCategory = widgets_icon.iconCategory;
exports.iconElement = widgets_icon.iconElement;
exports.iconNames = widgets_icon.iconNames;
exports.iconParts = widgets_icon.iconParts;
exports.iconSvg = widgets_icon.iconSvg;
exports.searchIcons = widgets_icon.searchIcons;
exports.defineIconPicker = widgets_iconPicker.defineIconPicker;
exports.gridStep = widgets_iconPicker.gridStep;
exports.iconCopyText = widgets_iconPicker.iconCopyText;
exports.defineRadialMenu = widgets_radialMenu.defineRadialMenu;
exports.defineHoverCard = widgets_hoverCard.defineHoverCard;
exports.defineToggleGroup = widgets_toggleGroup.defineToggleGroup;
exports.defineTimePicker = widgets_timePicker.defineTimePicker;
exports.defineColorSwatches = widgets_colorSwatches.defineColorSwatches;
exports.defineCalendarStrip = widgets_calendarStrip.defineCalendarStrip;
exports.defineComparisonTable = widgets_comparisonTable.defineComparisonTable;
exports.defineRadialBars = widgets_radialBars.defineRadialBars;
exports.defineBarRace = widgets_barRace.defineBarRace;
exports.defineBulletChart = widgets_bulletChart.defineBulletChart;
exports.defineSlopeChart = widgets_slopeChart.defineSlopeChart;
exports.defineDotPlot = widgets_dotPlot.defineDotPlot;
exports.defineSquishStepper = widgets_squishStepper.defineSquishStepper;
exports.deadZone = widgets_analogStick.deadZone;
exports.defineAnalogStick = widgets_analogStick.defineAnalogStick;
exports.defineTransferButton = widgets_transferButton.defineTransferButton;
exports.defineLensStack = widgets_lensStack.defineLensStack;
exports.defineIrisDiaphragm = widgets_irisDiaphragm.defineIrisDiaphragm;
exports.defineContourRelief = widgets_contourRelief.defineContourRelief;
exports.defineNumberStepper = widgets_numberStepper.defineNumberStepper;
exports.definePassword = widgets_password.definePassword;
exports.defineRangeSlider = widgets_rangeSlider.defineRangeSlider;
exports.defineConsent = widgets_consent.defineConsent;
exports.defineCtaPopup = widgets_ctaPopup.defineCtaPopup;
exports.defineValidationSummary = widgets_validationSummary.defineValidationSummary;
exports.CAROUSEL_EFFECTS = widgets_carousel.CAROUSEL_EFFECTS;
exports.defineCarousel = widgets_carousel.defineCarousel;
exports.TAB_INDICATORS = widgets_tabBar.TAB_INDICATORS;
exports.defineTabBar = widgets_tabBar.defineTabBar;
exports.defineDisclosure = widgets_disclosure.defineDisclosure;
exports.defineStories = widgets_stories.defineStories;
exports.TOAST_POSITIONS = widgets_toastStack.TOAST_POSITIONS;
exports.defineToastStack = widgets_toastStack.defineToastStack;
exports.stackToast = widgets_toastStack.stackToast;
exports.MODAL_EFFECTS = widgets_modal.MODAL_EFFECTS;
exports.SHEET_SIDES = widgets_modal.SHEET_SIDES;
exports.defineModal = widgets_modal.defineModal;
exports.defineSheet = widgets_modal.defineSheet;
exports.MENU_EFFECTS = widgets_menu.MENU_EFFECTS;
exports.defineMenu = widgets_menu.defineMenu;
exports.PROGRESS_VARIANTS = widgets_odometer.PROGRESS_VARIANTS;
exports.defineOdometer = widgets_odometer.defineOdometer;
exports.defineProgressRing = widgets_odometer.defineProgressRing;
exports.SKELETON_VARIANTS = widgets_skeletonReveal.SKELETON_VARIANTS;
exports.defineSkeletonReveal = widgets_skeletonReveal.defineSkeletonReveal;
exports.defineStarRating = widgets_starRating.defineStarRating;
exports.defineMilestones = widgets_milestones.defineMilestones;
exports.defineMasonryFlow = widgets_masonryFlow.defineMasonryFlow;
exports.defineCompare = widgets_compare.defineCompare;
exports.defineCubeGallery = widgets_cubeGallery.defineCubeGallery;
exports.defineDock = widgets_dock.defineDock;
exports.NAV_INDICATORS = widgets_navMorph.NAV_INDICATORS;
exports.defineNavMorph = widgets_navMorph.defineNavMorph;
exports.TOGGLE_VARIANTS = widgets_menuToggle.TOGGLE_VARIANTS;
exports.defineMenuToggle = widgets_menuToggle.defineMenuToggle;
exports.TIP_PLACEMENTS = widgets_tip.TIP_PLACEMENTS;
exports.defineTip = widgets_tip.defineTip;
exports.defineStepper = widgets_stepper.defineStepper;
exports.definePagination = widgets_pagination.definePagination;
exports.pageWindow = widgets_pagination.pageWindow;
exports.SEGMENTED_VARIANTS = widgets_segmented.SEGMENTED_VARIANTS;
exports.defineSegmented = widgets_segmented.defineSegmented;
exports.SWITCH_VARIANTS = widgets_switch.SWITCH_VARIANTS;
exports.defineSwitch = widgets_switch.defineSwitch;
exports.defineKanban = widgets_kanban.defineKanban;
exports.defineSwipeDeck = widgets_swipeDeck.defineSwipeDeck;
exports.WEATHER_CONDITIONS = widgets_weatherCard.WEATHER_CONDITIONS;
exports.defineWeatherCard = widgets_weatherCard.defineWeatherCard;
exports.definePullCord = widgets_pullCord.definePullCord;
exports.defineDatePicker = widgets_datePicker.defineDatePicker;
exports.monthGrid = widgets_datePicker.monthGrid;
exports.parseISODate = widgets_datePicker.parseISODate;
exports.defineColorPicker = widgets_colorPicker.defineColorPicker;
exports.hexToHsv = widgets_colorPicker.hexToHsv;
exports.hsvToHex = widgets_colorPicker.hsvToHex;
exports.defineFileDrop = widgets_fileDrop.defineFileDrop;
exports.defineKeyframeEditor = widgets_keyframeEditor.defineKeyframeEditor;
exports.defineMusicPlayer = widgets_musicPlayer.defineMusicPlayer;
exports.defineVolumeKnob = widgets_volumeKnob.defineVolumeKnob;
exports.EQ_PRESETS = widgets_equalizer.EQ_PRESETS;
exports.defineEqualizer = widgets_equalizer.defineEqualizer;
exports.defineLyrics = widgets_lyrics.defineLyrics;
exports.parseLRC = widgets_lyrics.parseLRC;
exports.defineBarChart = widgets_barChart.defineBarChart;
exports.defineGauge = widgets_gauge.defineGauge;
exports.SPARK_VARIANTS = widgets_sparkline.SPARK_VARIANTS;
exports.defineSparkline = widgets_sparkline.defineSparkline;
exports.sparkPoints = widgets_sparkline.sparkPoints;
exports.defineKpi = widgets_kpi.defineKpi;
exports.defineAddToCart = widgets_addToCart.defineAddToCart;
exports.cartTotal = widgets_cartDrawer.cartTotal;
exports.defineCartDrawer = widgets_cartDrawer.defineCartDrawer;
exports.defineProductGallery = widgets_productGallery.defineProductGallery;
exports.wrapIndex = widgets_productGallery.wrapIndex;
exports.defineCountdown = widgets_countdown.defineCountdown;
exports.splitTime = widgets_countdown.splitTime;
exports.defineMessageList = widgets_messageList.defineMessageList;
exports.defineReactions = widgets_reactions.defineReactions;
exports.parseReactions = widgets_reactions.parseReactions;
exports.defineNotificationBell = widgets_notificationBell.defineNotificationBell;
exports.PRESENCE_STATES = widgets_presence.PRESENCE_STATES;
exports.definePresence = widgets_presence.definePresence;
exports.initials = widgets_presence.initials;
exports.defineLeaderboard = widgets_leaderboard.defineLeaderboard;
exports.rankRows = widgets_leaderboard.rankRows;
exports.defineXpBar = widgets_xpBar.defineXpBar;
exports.levelFor = widgets_xpBar.levelFor;
exports.badgeProgress = widgets_badgeWall.badgeProgress;
exports.defineBadgeWall = widgets_badgeWall.defineBadgeWall;
exports.definePrizeWheel = widgets_prizeWheel.definePrizeWheel;
exports.wheelAngle = widgets_prizeWheel.wheelAngle;
exports.defineGlobe = widgets_globe.defineGlobe;
exports.parseMarkers = widgets_globe.parseMarkers;
exports.project = widgets_globe.project;
exports.defineLocationCard = widgets_locationCard.defineLocationCard;
exports.formatDistance = widgets_locationCard.formatDistance;
exports.haversine = widgets_locationCard.haversine;
exports.defineField = widgets_field.defineField;
exports.passwordStrength = widgets_field.passwordStrength;
exports.defineOtp = widgets_otp.defineOtp;
exports.sanitizeCode = widgets_otp.sanitizeCode;
exports.defineUploadProgress = widgets_uploadProgress.defineUploadProgress;
exports.formatBytes = widgets_uploadProgress.formatBytes;
exports.defineChatComposer = widgets_chatComposer.defineChatComposer;
exports.defineSuggestionChips = widgets_suggestionChips.defineSuggestionChips;
exports.parseChips = widgets_suggestionChips.parseChips;
exports.defineVoiceButton = widgets_voiceButton.defineVoiceButton;
exports.waveBars = widgets_voiceButton.waveBars;
exports.defineCommandPalette = widgets_commandPalette.defineCommandPalette;
exports.fuzzyMatch = widgets_commandPalette.fuzzyMatch;
exports.keyLabels = widgets_commandPalette.keyLabels;
exports.matchesKeys = widgets_commandPalette.matchesKeys;
exports.defineShortcut = widgets_shortcut.defineShortcut;
exports.defineClockControl = widgets_clockControl.defineClockControl;
exports.defineHydrate = widgets_hydrate.defineHydrate;
exports.defineRedEnvelope = widgets_redEnvelope.defineRedEnvelope;
exports.FESTIVAL_THEMES = widgets_festivalBanner.FESTIVAL_THEMES;
exports.defineFestivalBanner = widgets_festivalBanner.defineFestivalBanner;
exports.defineTerminal = widgets_terminal.defineTerminal;
exports.RETRO_VARIANTS = widgets_retroButton.RETRO_VARIANTS;
exports.defineRetroButton = widgets_retroButton.defineRetroButton;
exports.defineOrganicCard = widgets_organicCard.defineOrganicCard;
exports.defineLiquidNav = widgets_liquidNav.defineLiquidNav;
exports.defineHudPanel = widgets_hudPanel.defineHudPanel;
exports.defineRadar = widgets_radar.defineRadar;
exports.parseTargets = widgets_radar.parseTargets;
exports.defineStickyWall = widgets_stickyWall.defineStickyWall;
exports.defineSketchChart = widgets_sketchChart.defineSketchChart;
exports.defineThemeSwitcher = widgets_themeSwitcher.defineThemeSwitcher;
exports.defineThemeSurface = widgets_themeSurface.defineThemeSurface;
exports.defineGyroCard = widgets_gyroCard.defineGyroCard;
exports.defineGestureSticker = widgets_gestureSticker.defineGestureSticker;
exports.definePanorama = widgets_panorama.definePanorama;
exports.defineSpatialCard = widgets_spatialCard.defineSpatialCard;
exports.defineCodeExport = widgets_codeExport.defineCodeExport;
exports.describeComponent = widgets_codeExport.describeComponent;
exports.exportComponent = widgets_codeExport.exportComponent;
exports.definePropPanel = widgets_propPanel.definePropPanel;
exports.parseProps = widgets_propPanel.parseProps;
exports.defineMotion = widgets_motion.defineMotion;
exports.definePluginStore = widgets_pluginStore.definePluginStore;
exports.defineChapterNav = widgets_chapterNav.defineChapterNav;
exports.defineScene = widgets_scene.defineScene;
exports.defineLottie = widgets_lottie.defineLottie;
exports.LOTTIE_ICONS = widgets_lottieIcon.LOTTIE_ICONS;
exports.defineLottieIcon = widgets_lottieIcon.defineLottieIcon;
exports.defineGenArt = widgets_genArt.defineGenArt;
exports.backgroundCss = widgets_bgGenerator.backgroundCss;
exports.defineBgGenerator = widgets_bgGenerator.defineBgGenerator;
exports.defineVideoCard = widgets_videoCard.defineVideoCard;
exports.defineHeroVideo = widgets_heroVideo.defineHeroVideo;
exports.defineMotionPrefs = widgets_motionPrefs.defineMotionPrefs;
exports.definePauseAll = widgets_pauseAll.definePauseAll;
exports.definePerfMonitor = widgets_perfMonitor.definePerfMonitor;
exports.WORKER_SCENES = widgets_workerCanvas.WORKER_SCENES;
exports.WORKER_SCENE_FNS = widgets_workerCanvas.WORKER_SCENE_FNS;
exports.defineWorkerCanvas = widgets_workerCanvas.defineWorkerCanvas;
exports.defineMotionSpec = widgets_motionSpec.defineMotionSpec;
exports.defineNativePreview = widgets_nativePreview.defineNativePreview;
exports.definePluginCard = widgets_pluginCard.definePluginCard;
exports.defineInstallButton = widgets_installButton.defineInstallButton;
exports.defineScrollScene = widgets_scrollScene.defineScrollScene;
exports.parseScrub = widgets_scrollScene.parseScrub;
exports.defineMotionInspector = widgets_motionInspector.defineMotionInspector;
exports.defineRouteTransition = widgets_routeTransition.defineRouteTransition;
exports.defineTextSplitter = widgets_textSplitter.defineTextSplitter;
exports.defineScrollRing = widgets_scrollRing.defineScrollRing;
exports.defineParallaxLayers = widgets_parallaxLayers.defineParallaxLayers;
exports.defineSmoothScroll = widgets_smoothScroll.defineSmoothScroll;
exports.defineGlScene = widgets_glScene.defineGlScene;
exports.PARTICLE_DRAW_WGSL = widgets_gpuParticles.PARTICLE_DRAW_WGSL;
exports.PARTICLE_SIM_WGSL = widgets_gpuParticles.PARTICLE_SIM_WGSL;
exports.defineGpuParticles = widgets_gpuParticles.defineGpuParticles;
exports.BACKDROP_PRESETS = widgets_shaderBackdrop.BACKDROP_PRESETS;
exports.POST_PASSES = widgets_shaderBackdrop.POST_PASSES;
exports.defineShaderBackdrop = widgets_shaderBackdrop.defineShaderBackdrop;
exports.defineLottiePlayer = widgets_lottiePlayer.defineLottiePlayer;
exports.RIVE_CDN = widgets_rive.RIVE_CDN;
exports.RIVE_PEER = widgets_rive.RIVE_PEER;
exports.defineRive = widgets_rive.defineRive;
exports.loadRiveRuntime = widgets_rive.loadRiveRuntime;
exports.provideRiveRuntime = widgets_rive.provideRiveRuntime;
exports.defineTokenEditor = widgets_tokenEditor.defineTokenEditor;
exports.PHYSICS_PRESETS = widgets_physicsPlayground.PHYSICS_PRESETS;
exports.definePhysicsPlayground = widgets_physicsPlayground.definePhysicsPlayground;
exports.defineFileTree = widgets_fileTree.defineFileTree;
exports.defineDownloadMenu = widgets_downloadMenu.defineDownloadMenu;
exports.defineTitleSequence = widgets_titleSequence.defineTitleSequence;
exports.defineMotionPrompt = widgets_motionPrompt.defineMotionPrompt;
exports.defineMegaMenu = widgets_megaMenu.defineMegaMenu;
exports.defineNavFlyout = widgets_megaMenu.defineNavFlyout;
exports.defineFullscreenMenu = widgets_fullscreenMenu.defineFullscreenMenu;
exports.defineBreadcrumbs = widgets_breadcrumbs.defineBreadcrumbs;
exports.defineGravityWell = widgets_gravityWell.defineGravityWell;
exports.defineLiquidMetal = widgets_liquidMetal.defineLiquidMetal;
exports.defineReactionField = widgets_reactionField.defineReactionField;
exports.defineInkFlow = widgets_inkFlow.defineInkFlow;
exports.defineFluidType = widgets_fluidType.defineFluidType;
exports.defineMagneticField = widgets_magneticField.defineMagneticField;
exports.defineElasticMesh = widgets_elasticMesh.defineElasticMesh;
exports.defineSpringLab = widgets_springLab.defineSpringLab;
exports.defineBezierLab = widgets_bezierLab.defineBezierLab;
exports.defineTextLoupe = widgets_textLoupe.defineTextLoupe;
exports.defineRevisionReveal = widgets_revisionReveal.defineRevisionReveal;
exports.defineHoldAction = widgets_holdAction.defineHoldAction;
exports.defineScrubNumber = widgets_scrubNumber.defineScrubNumber;
exports.defineFlightStatus = widgets_flightStatus.defineFlightStatus;
exports.defineTransitProgress = widgets_transitProgress.defineTransitProgress;
exports.defineSunTimeline = widgets_sunTimeline.defineSunTimeline;
exports.defineDeliveryTracker = widgets_deliveryTracker.defineDeliveryTracker;
exports.defineGlucoseSparkline = widgets_glucoseSparkline.defineGlucoseSparkline;
exports.defineCoffeeTimer = widgets_coffeeTimer.defineCoffeeTimer;
exports.defineVitalWave = widgets_vitalWave.defineVitalWave;
exports.defineOrbitPass = widgets_orbitPass.defineOrbitPass;
exports.defineMeterCountdown = widgets_meterCountdown.defineMeterCountdown;
exports.defineRaceTelemetry = widgets_raceTelemetry.defineRaceTelemetry;
exports.defineWorkoutPlayer = widgets_workoutPlayer.defineWorkoutPlayer;
exports.defineStatusPill = widgets_statusPill.defineStatusPill;
exports.defineRideStatus = widgets_rideStatus.defineRideStatus;
exports.defineRouteSparkline = widgets_routeSparkline.defineRouteSparkline;
exports.defineActivityWall = widgets_activityWall.defineActivityWall;
exports.defineLuminousSwitch = widgets_luminousSwitch.defineLuminousSwitch;
exports.defineParticleIcon = widgets_particleIcon.defineParticleIcon;
exports.defineParticleButton = widgets_particleButton.defineParticleButton;
exports.defineHaloSegmented = widgets_haloSegmented.defineHaloSegmented;
exports.defineHaloSlider = widgets_haloSlider.defineHaloSlider;
exports.defineOrbitProgress = widgets_orbitProgress.defineOrbitProgress;
exports.copyText = kit12.copyText;
exports.moveItem = kit12.moveItem;
exports.numbers = kit12.numbers;
exports.rovingIndex = kit12.rovingIndex;
exports.seeded = kit12.seeded;
exports.arcDash = kit15.arcDash;
exports.cellMark = kit15.cellMark;
exports.dayText = kit15.dayText;
exports.formatTime = kit15.formatTime;
exports.frameValues = kit15.frameValues;
exports.hour12 = kit15.hour12;
exports.inkOn = kit15.inkOn;
exports.luminance = kit15.luminance;
exports.parseDay = kit15.parseDay;
exports.raceRanks = kit15.raceRanks;
exports.radialSpots = kit15.radialSpots;
exports.relativeChange = kit15.relativeChange;
exports.rowDiffers = kit15.rowDiffers;
exports.signedNumbers = kit15.signedNumbers;
exports.spreadLabels = kit15.spreadLabels;
exports.stepTime = kit15.stepTime;
exports.timeParts = kit15.timeParts;
exports.weekStartOf = kit15.weekStartOf;
exports.angleTo = kit13.angleTo;
exports.changedSpan = kit13.changedSpan;
exports.clampTo = kit13.clampTo;
exports.dayNumber = kit13.dayNumber;
exports.diffLines = kit13.diffLines;
exports.flapSteps = kit13.flapSteps;
exports.funnelRows = kit13.funnelRows;
exports.ganttSpan = kit13.ganttSpan;
exports.linePath = kit13.linePath;
exports.matchNames = kit13.matchNames;
exports.mentionQuery = kit13.mentionQuery;
exports.niceTicks = kit13.niceTicks;
exports.pressureAt = kit13.pressureAt;
exports.shuffleOrder = kit13.shuffleOrder;
exports.squarify = kit13.squarify;
exports.strokeWidth = kit13.strokeWidth;
exports.tourPlace = kit13.tourPlace;
exports.waffleCells = kit13.waffleCells;
exports.wheelIndex = kit13.wheelIndex;
exports.wheelTilt = kit13.wheelTilt;
exports.cleanColor = kit.cleanColor;
exports.flip = kit.flip;
exports.measure = kit.measure;
exports.safeImageUrl = kit.safeImageUrl;
exports.tween = kit.tween;
exports.viewportHeight = viewport.viewportHeight;
exports.watchViewport = viewport.watchViewport;
exports.LOOK_FAMILIES = LOOK_FAMILIES;
exports.LOOK_PALETTES = LOOK_PALETTES;
exports.LOOK_TREATMENTS = LOOK_TREATMENTS;
exports.WIDGETS = WIDGETS;
exports.WIDGET_TAGS = WIDGET_TAGS;
exports.adoptLooks = adoptLooks;
exports.applyLook = applyLook;
exports.defineWidgets = defineWidgets;
exports.lookInfo = lookInfo;
exports.lookNames = lookNames;
exports.lookRule = lookRule;
exports.lookTokens = lookTokens;
exports.looksCss = looksCss;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.9.0/dist/components/widgets.cjs.map