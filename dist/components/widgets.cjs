'use strict';

var widgets_select = require('../widgets/select.cjs');
var widgets_combobox = require('../widgets/combobox.cjs');
var widgets_multiSelect = require('../widgets/multi-select.cjs');
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
var widgets_scrollScene = require('../chunks/scroll-scene-bhKJefLg.cjs');
var widgets_motionInspector = require('../widgets/motion-inspector.cjs');
var widgets_routeTransition = require('../widgets/route-transition.cjs');
var widgets_textSplitter = require('../widgets/text-splitter.cjs');
var widgets_scrollRing = require('../widgets/scroll-ring.cjs');
var widgets_parallaxLayers = require('../widgets/parallax-layers.cjs');
var widgets_smoothScroll = require('../widgets/smooth-scroll.cjs');
var widgets_glScene = require('../chunks/gl-scene-lG0HvTr5.cjs');
var widgets_gpuParticles = require('../chunks/gpu-particles-DGwFsyz_.cjs');
var widgets_shaderBackdrop = require('../chunks/shader-backdrop-Ct8UIKNL.cjs');
var widgets_lottiePlayer = require('../chunks/lottie-player-CY5npFg0.cjs');
var widgets_rive = require('../chunks/rive-xzduMxFp.cjs');
var widgets_tokenEditor = require('../widgets/token-editor.cjs');
var widgets_physicsPlayground = require('../chunks/physics-playground-CT29Alyt.cjs');
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
var viewport = require('../chunks/viewport-EFYGqMNa.cjs');

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
    '17.7': { 'usa-select': widgets_select.defineSelect, 'usa-combobox': widgets_combobox.defineCombobox, 'usa-multi-select': widgets_multiSelect.defineMultiSelect, 'usa-number-stepper': widgets_numberStepper.defineNumberStepper, 'usa-password': widgets_password.definePassword, 'usa-range-slider': widgets_rangeSlider.defineRangeSlider, 'usa-consent': widgets_consent.defineConsent, 'usa-cta-popup': widgets_ctaPopup.defineCtaPopup, 'usa-validation-summary': widgets_validationSummary.defineValidationSummary },
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

exports.defineSelect = widgets_select.defineSelect;
exports.defineCombobox = widgets_combobox.defineCombobox;
exports.defineMultiSelect = widgets_multiSelect.defineMultiSelect;
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
exports.viewportHeight = viewport.viewportHeight;
exports.watchViewport = viewport.watchViewport;
exports.WIDGETS = WIDGETS;
exports.WIDGET_TAGS = WIDGET_TAGS;
exports.defineWidgets = defineWidgets;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.7.0/dist/components/widgets.cjs.map