import { defineSelect, type UsaSelectElement } from './select';
import { defineCombobox, type UsaComboboxElement } from './combobox';
import { defineMultiSelect, type UsaMultiSelectElement } from './multi-select';
import { defineNumberStepper, type UsaNumberStepperElement } from './number-stepper';
import { definePassword, type UsaPasswordElement } from './password';
import { defineRangeSlider, type UsaRangeSliderElement } from './range-slider';
import { defineConsent, type UsaConsentElement } from './consent';
import { defineCtaPopup, type UsaCtaPopupElement } from './cta-popup';
import { defineValidationSummary, type UsaValidationSummaryElement } from './validation-summary';
/**
 * motionary/components/widgets — the 6.x animated UI widgets, in their own
 * entry so `motionary/components` and `components/lite` keep their size
 * budgets. Every widget is reduced-motion safe and keyboard accessible.
 *
 * ```ts
 * import { defineWidgets } from 'motionary/components/widgets';
 * defineWidgets(); // or defineCarousel(), defineTabBar(), …
 * ```
 * No build step: `<script src="https://unpkg.com/motionary@6/dist/widgets.umd.js">`
 * (registers every widget and every 6.x effect pack; `window.UsaWidgets`).
 */
import { defineCarousel, CAROUSEL_EFFECTS, type UsaCarouselElement } from './carousel';
import { defineTabBar, TAB_INDICATORS, type UsaTabBarElement } from './tab-bar';
import { defineDisclosure, type UsaDisclosureElement } from './disclosure';
import { defineStories, type UsaStoriesElement } from './stories';
import { defineToastStack, stackToast, TOAST_POSITIONS, type UsaToastStackElement, type StackToastOptions } from './toast';
import { defineModal, defineSheet, MODAL_EFFECTS, SHEET_SIDES, type UsaModalElement, type UsaSheetElement } from './overlay';
import { defineMenu, MENU_EFFECTS, type UsaMenuElement } from './menu';
import { defineProgressRing, defineOdometer, PROGRESS_VARIANTS, type UsaProgressRingElement, type UsaOdometerElement } from './meters';
import { defineSkeletonReveal, SKELETON_VARIANTS, type UsaSkeletonRevealElement } from './skeleton-reveal';
import { defineStarRating, type UsaStarRatingElement } from './star-rating';
import { defineMilestones, type UsaMilestonesElement } from './milestones';
import { defineMasonryFlow, type UsaMasonryFlowElement } from './masonry-flow';
import { defineCompare, type UsaCompareElement } from './compare';
import { defineCubeGallery, type UsaCubeGalleryElement } from './cube-gallery';
import { defineDock, type UsaDockElement } from './dock';
import { defineNavMorph, NAV_INDICATORS, type UsaNavMorphElement } from './nav-morph';
import { defineMenuToggle, TOGGLE_VARIANTS, type UsaMenuToggleElement } from './menu-toggle';
import { defineTip, TIP_PLACEMENTS, type UsaTipElement } from './tip';
import { defineStepper, type UsaStepperElement } from './stepper';
import { definePagination, pageWindow, type UsaPaginationElement } from './pagination';
import { defineSegmented, SEGMENTED_VARIANTS, type UsaSegmentedElement } from './segmented';
import { defineSwitch, SWITCH_VARIANTS, type UsaSwitchElement } from './switch';
import { defineKanban, type UsaKanbanElement } from './kanban';
import { defineSwipeDeck, type UsaSwipeDeckElement } from './swipe-deck';
import { defineWeatherCard, WEATHER_CONDITIONS, type UsaWeatherCardElement } from './weather-card';
import { definePullCord, type UsaPullCordElement } from './pull-cord';
import { defineDatePicker, monthGrid, parseISODate, type UsaDatePickerElement } from './date-picker';
import { defineColorPicker, hsvToHex, hexToHsv, type UsaColorPickerElement } from './color-picker';
import { defineFileDrop, type UsaFileDropElement } from './file-drop';
import { defineKeyframeEditor, type UsaKeyframeEditorElement } from './keyframe-editor';
import { defineMusicPlayer, type UsaMusicPlayerElement } from './music-player';
import { defineVolumeKnob, type UsaVolumeKnobElement } from './volume-knob';
import { defineEqualizer, EQ_PRESETS, type UsaEqualizerElement } from './equalizer';
import { defineLyrics, parseLRC, type UsaLyricsElement } from './lyrics';
import { defineBarChart, type UsaBarChartElement } from './bar-chart';
import { defineGauge, type UsaGaugeElement } from './gauge';
import { defineSparkline, SPARK_VARIANTS, sparkPoints, type UsaSparklineElement } from './sparkline';
import { defineKpi, type UsaKpiElement } from './kpi';
import { defineAddToCart, type UsaAddToCartElement } from './add-to-cart';
import { defineCartDrawer, cartTotal, type UsaCartDrawerElement, type CartItem } from './cart-drawer';
import { defineProductGallery, wrapIndex, type UsaProductGalleryElement } from './product-gallery';
import { defineCountdown, splitTime, type UsaCountdownElement } from './countdown';
import { defineMessageList, type UsaMessageListElement, type ChatMessage } from './message-list';
import { defineReactions, parseReactions, type UsaReactionsElement } from './reactions';
import { defineNotificationBell, type UsaNotificationBellElement, type BellNotice } from './notification-bell';
import { definePresence, PRESENCE_STATES, initials, type UsaPresenceElement, type PresenceState } from './presence';
import { defineLeaderboard, rankRows, type UsaLeaderboardElement, type LeaderRow } from './leaderboard';
import { defineXpBar, levelFor, type UsaXpBarElement } from './xp-bar';
import { defineBadgeWall, badgeProgress, type UsaBadgeWallElement, type WallBadge } from './badge-wall';
import { definePrizeWheel, wheelAngle, type UsaPrizeWheelElement } from './prize-wheel';
import { defineGlobe, project, parseMarkers, type UsaGlobeElement, type GlobeMarker } from './globe';
import { defineLocationCard, haversine, formatDistance, type UsaLocationCardElement } from './location-card';
import { defineField, passwordStrength, type UsaFieldElement } from './field';
import { defineOtp, sanitizeCode, type UsaOtpElement } from './otp';
import { defineUploadProgress, formatBytes, type UsaUploadProgressElement } from './upload-progress';
import { defineChatComposer, type UsaChatComposerElement } from './chat-composer';
import { defineSuggestionChips, parseChips, type UsaSuggestionChipsElement } from './suggestion-chips';
import { defineVoiceButton, waveBars, type UsaVoiceButtonElement } from './voice-button';
import { defineCommandPalette, fuzzyMatch, keyLabels, matchesKeys, type UsaCommandPaletteElement, type PaletteCommand } from './command-palette';
import { defineShortcut, type UsaShortcutElement } from './shortcut';
import { defineClockControl, type UsaClockControlElement } from './clock-control';
import { defineHydrate, type UsaHydrateElement } from './hydrate';
import { defineRedEnvelope, type UsaRedEnvelopeElement } from './red-envelope';
import { defineFestivalBanner, FESTIVAL_THEMES, type UsaFestivalBannerElement } from './festival-banner';
import { defineTerminal, type UsaTerminalElement } from './terminal';
import { defineRetroButton, RETRO_VARIANTS, type UsaRetroButtonElement } from './retro-button';
import { defineOrganicCard, type UsaOrganicCardElement } from './organic-card';
import { defineLiquidNav, type UsaLiquidNavElement } from './liquid-nav';
import { defineHudPanel, type UsaHudPanelElement } from './hud-panel';
import { defineRadar, parseTargets, type UsaRadarElement, type RadarTarget } from './radar';
import { defineStickyWall, type UsaStickyWallElement } from './sticky-wall';
import { defineSketchChart, type UsaSketchChartElement } from './sketch-chart';
import { defineThemeSwitcher, type UsaThemeSwitcherElement } from './theme-switcher';
import { defineThemeSurface, type UsaThemeSurfaceElement } from './theme-surface';
import { defineGyroCard, type UsaGyroCardElement } from './gyro-card';
import { defineGestureSticker, type UsaGestureStickerElement, type StickerState } from './gesture-sticker';
import { definePanorama, type UsaPanoramaElement } from './panorama';
import { defineSpatialCard, type UsaSpatialCardElement } from './spatial-card';
import { defineCodeExport, exportComponent, describeComponent, type UsaCodeExportElement, type ExportFormat, type ExportedNode } from './code-export';
import { definePropPanel, parseProps, type UsaPropPanelElement, type PropSpec } from './prop-panel';
import { defineMotion, type UsaMotionElement } from './motion';
import { definePluginStore, type UsaPluginStoreElement } from './plugin-store';
import { defineChapterNav, type UsaChapterNavElement } from './chapter-nav';
import { defineScene, type UsaSceneElement } from './scene';
import { defineLottie, type UsaLottieElement } from './lottie';
import { defineLottieIcon, LOTTIE_ICONS, type UsaLottieIconElement } from './lottie-icon';
import { defineGenArt, type UsaGenArtElement } from './gen-art';
import { defineBgGenerator, backgroundCss, type UsaBgGeneratorElement } from './bg-generator';
import { defineVideoCard, type UsaVideoCardElement } from './video-card';
import { defineHeroVideo, type UsaHeroVideoElement } from './hero-video';
import { defineMotionPrefs, type UsaMotionPrefsElement } from './motion-prefs';
import { definePauseAll, type UsaPauseAllElement } from './pause-all';
import { definePerfMonitor, type UsaPerfMonitorElement, type PerfStats } from './perf-monitor';
import { defineWorkerCanvas, WORKER_SCENES, WORKER_SCENE_FNS, type UsaWorkerCanvasElement } from './worker-canvas';
import { defineMotionSpec, type UsaMotionSpecElement } from './motion-spec';
import { defineNativePreview, type UsaNativePreviewElement } from './native-preview';
import { definePluginCard, type UsaPluginCardElement } from './plugin-card';
import { defineInstallButton, type UsaInstallButtonElement } from './install-button';
import { defineScrollScene, parseScrub, type UsaScrollSceneElement } from './scroll-scene';
import { defineMotionInspector, type UsaMotionInspectorElement } from './motion-inspector';
import { defineRouteTransition, type UsaRouteTransitionElement } from './route-transition';
import { defineTextSplitter, type UsaTextSplitterElement } from './text-splitter';
import { defineScrollRing, type UsaScrollRingElement } from './scroll-ring';
import { defineParallaxLayers, type UsaParallaxLayersElement } from './parallax-layers';
import { defineSmoothScroll, type UsaSmoothScrollElement } from './smooth-scroll';
import { defineGlScene, type UsaGlSceneElement } from './gl-scene';
import { defineGpuParticles, PARTICLE_SIM_WGSL, PARTICLE_DRAW_WGSL, type UsaGpuParticlesElement } from './gpu-particles';
import { defineShaderBackdrop, BACKDROP_PRESETS, POST_PASSES, type UsaShaderBackdropElement } from './shader-backdrop';
import { defineLottiePlayer, type UsaLottiePlayerElement } from './lottie-player';
import { defineRive, RIVE_PEER, RIVE_CDN, loadRiveRuntime, provideRiveRuntime, type UsaRiveElement } from './rive';
import { defineTokenEditor, type UsaTokenEditorElement } from './token-editor';
import { definePhysicsPlayground, PHYSICS_PRESETS, type UsaPhysicsPlaygroundElement } from './physics-playground';
import { defineFileTree } from './file-tree';
import { defineDownloadMenu } from './download-menu';
import { defineTitleSequence } from './title-sequence';
import { defineMotionPrompt, type UsaMotionPromptElement } from './motion-prompt';
import { defineMegaMenu, defineNavFlyout, type UsaMegaMenuElement, type UsaNavFlyoutElement } from './nav-panels';
import { defineFullscreenMenu, type UsaFullscreenMenuElement } from './fullscreen-menu';
import { defineBreadcrumbs, type UsaBreadcrumbsElement, type BreadcrumbItem } from './breadcrumbs';
import { defineMoAliases } from '../mo';
import { defineGravityWell, type UsaGravityWellElement } from './gravity-well';
import { defineLiquidMetal, type UsaLiquidMetalElement } from './liquid-metal';
import { defineReactionField, type UsaReactionFieldElement } from './reaction-field';
import { defineInkFlow, type UsaInkFlowElement } from './ink-flow';
import { defineFluidType, type UsaFluidTypeElement } from './fluid-type';
import { defineMagneticField, type UsaMagneticFieldElement } from './magnetic-field';
import { defineElasticMesh, type UsaElasticMeshElement } from './elastic-mesh';
import { defineSpringLab, type UsaSpringLabElement } from './spring-lab';
import { defineBezierLab, type UsaBezierLabElement } from './bezier-lab';
import { defineTextLoupe, type UsaTextLoupeElement } from './text-loupe';
import { defineRevisionReveal, type UsaRevisionRevealElement } from './revision-reveal';
import { defineHoldAction, type UsaHoldActionElement } from './hold-action';
import { defineScrubNumber, type UsaScrubNumberElement } from './scrub-number';
import { defineFlightStatus, type UsaFlightStatusElement } from './flight-status';
import { defineTransitProgress, type UsaTransitProgressElement } from './transit-progress';
import { defineSunTimeline, type UsaSunTimelineElement } from './sun-timeline';
import { defineDeliveryTracker, type UsaDeliveryTrackerElement } from './delivery-tracker';
import { defineGlucoseSparkline, type UsaGlucoseSparklineElement } from './glucose-sparkline';
import { defineCoffeeTimer, type UsaCoffeeTimerElement } from './coffee-timer';
import { defineVitalWave, type UsaVitalWaveElement } from './vital-wave';
import { defineOrbitPass, type UsaOrbitPassElement } from './orbit-pass';
import { defineMeterCountdown, type UsaMeterCountdownElement } from './meter-countdown';
import { defineRaceTelemetry, type UsaRaceTelemetryElement } from './race-telemetry';
import { defineWorkoutPlayer, type UsaWorkoutPlayerElement } from './workout-player';
import { defineStatusPill, type UsaStatusPillElement } from './status-pill';
import { defineRideStatus, type UsaRideStatusElement } from './ride-status';
import { defineRouteSparkline, type UsaRouteSparklineElement } from './route-sparkline';
import { defineActivityWall, type UsaActivityWallElement } from './activity-wall';
import { defineLuminousSwitch, type UsaLuminousSwitchElement } from './luminous-switch';
import { defineParticleIcon, type UsaParticleIconElement } from './particle-icon';
import { defineParticleButton, type UsaParticleButtonElement } from './particle-button';
import { defineHaloSegmented, type UsaHaloSegmentedElement } from './halo-segmented';
import { defineHaloSlider, type UsaHaloSliderElement } from './halo-slider';
import { defineOrbitProgress, type UsaOrbitProgressElement } from './orbit-progress';

export { defineSelect, defineCombobox, defineMultiSelect, defineNumberStepper, definePassword, defineRangeSlider, defineConsent, defineCtaPopup, defineValidationSummary };
export type { UsaSelectElement, UsaComboboxElement, UsaMultiSelectElement, UsaNumberStepperElement, UsaPasswordElement, UsaRangeSliderElement, UsaConsentElement, UsaCtaPopupElement, UsaValidationSummaryElement };

export { defineFlightStatus, defineTransitProgress, defineSunTimeline, defineDeliveryTracker, defineGlucoseSparkline, defineCoffeeTimer, defineVitalWave, defineOrbitPass, defineMeterCountdown, defineRaceTelemetry, defineWorkoutPlayer, defineStatusPill, defineRideStatus, defineRouteSparkline, defineActivityWall };
export type { UsaFlightStatusElement, UsaTransitProgressElement, UsaSunTimelineElement, UsaDeliveryTrackerElement, UsaGlucoseSparklineElement, UsaCoffeeTimerElement, UsaVitalWaveElement, UsaOrbitPassElement, UsaMeterCountdownElement, UsaRaceTelemetryElement, UsaWorkoutPlayerElement, UsaStatusPillElement, UsaRideStatusElement, UsaRouteSparklineElement, UsaActivityWallElement };
export { defineLuminousSwitch, defineParticleIcon, defineParticleButton, defineHaloSegmented, defineHaloSlider, defineOrbitProgress };
export type { UsaLuminousSwitchElement, UsaParticleIconElement, UsaParticleButtonElement, UsaHaloSegmentedElement, UsaHaloSliderElement, UsaOrbitProgressElement };

export { defineFileTree, defineDownloadMenu, defineTitleSequence };
export { defineCarousel, defineTabBar, defineDisclosure, defineStories, CAROUSEL_EFFECTS, TAB_INDICATORS };
export type { UsaCarouselElement, UsaTabBarElement, UsaDisclosureElement, UsaStoriesElement };
export { defineToastStack, stackToast, TOAST_POSITIONS, defineModal, defineSheet, MODAL_EFFECTS, SHEET_SIDES, defineMenu, MENU_EFFECTS };
// 13.3.0: phones — soft keyboard (visualViewport) and rotation watcher shared by the overlays (docs/mobile.md)
export { watchViewport, viewportHeight } from '../viewport';
export type { UsaToastStackElement, StackToastOptions, UsaModalElement, UsaSheetElement, UsaMenuElement };

export { defineProgressRing, defineOdometer, PROGRESS_VARIANTS, defineSkeletonReveal, SKELETON_VARIANTS, defineStarRating };
export type { UsaProgressRingElement, UsaOdometerElement, UsaSkeletonRevealElement, UsaStarRatingElement };

export { defineMilestones, defineMasonryFlow, defineCompare, defineCubeGallery };
export type { UsaMilestonesElement, UsaMasonryFlowElement, UsaCompareElement, UsaCubeGalleryElement };

export { defineDock, defineNavMorph, NAV_INDICATORS, defineMenuToggle, TOGGLE_VARIANTS, defineTip, TIP_PLACEMENTS };
export type { UsaDockElement, UsaNavMorphElement, UsaMenuToggleElement, UsaTipElement };

export { defineStepper, definePagination, pageWindow, defineSegmented, SEGMENTED_VARIANTS, defineSwitch, SWITCH_VARIANTS };
export type { UsaStepperElement, UsaPaginationElement, UsaSegmentedElement, UsaSwitchElement };

export { defineKanban, defineSwipeDeck, defineWeatherCard, WEATHER_CONDITIONS, definePullCord };
export type { UsaKanbanElement, UsaSwipeDeckElement, UsaWeatherCardElement, UsaPullCordElement };

export { defineDatePicker, monthGrid, parseISODate, defineColorPicker, hsvToHex, hexToHsv, defineFileDrop, defineKeyframeEditor };
export type { UsaDatePickerElement, UsaColorPickerElement, UsaFileDropElement, UsaKeyframeEditorElement };

export { defineMusicPlayer, defineVolumeKnob, defineEqualizer, EQ_PRESETS, defineLyrics, parseLRC };
export type { UsaMusicPlayerElement, UsaVolumeKnobElement, UsaEqualizerElement, UsaLyricsElement };

export { defineBarChart, defineGauge, defineSparkline, SPARK_VARIANTS, sparkPoints, defineKpi };
export type { UsaBarChartElement, UsaGaugeElement, UsaSparklineElement, UsaKpiElement };

export { defineAddToCart, defineCartDrawer, cartTotal, defineProductGallery, wrapIndex, defineCountdown, splitTime };
export type { UsaAddToCartElement, UsaCartDrawerElement, CartItem, UsaProductGalleryElement, UsaCountdownElement };

export { defineMessageList, defineReactions, parseReactions, defineNotificationBell, definePresence, PRESENCE_STATES, initials };
export type { UsaMessageListElement, ChatMessage, UsaReactionsElement, UsaNotificationBellElement, BellNotice, UsaPresenceElement, PresenceState };

export { defineLeaderboard, rankRows, defineXpBar, levelFor, defineBadgeWall, badgeProgress, definePrizeWheel, wheelAngle };
export type { UsaLeaderboardElement, LeaderRow, UsaXpBarElement, UsaBadgeWallElement, WallBadge, UsaPrizeWheelElement };

export { defineGlobe, project, parseMarkers, defineLocationCard, haversine, formatDistance };
export type { UsaGlobeElement, GlobeMarker, UsaLocationCardElement };

export { defineField, passwordStrength, defineOtp, sanitizeCode, defineUploadProgress, formatBytes };
export type { UsaFieldElement, UsaOtpElement, UsaUploadProgressElement };

export { defineChatComposer, defineSuggestionChips, parseChips, defineVoiceButton, waveBars };
export type { UsaChatComposerElement, UsaSuggestionChipsElement, UsaVoiceButtonElement };

export { defineCommandPalette, fuzzyMatch, keyLabels, matchesKeys, defineShortcut };
export type { UsaCommandPaletteElement, PaletteCommand, UsaShortcutElement };

export { defineClockControl, defineHydrate };
export type { UsaClockControlElement, UsaHydrateElement };

export { defineRedEnvelope, defineFestivalBanner, FESTIVAL_THEMES };
export type { UsaRedEnvelopeElement, UsaFestivalBannerElement };

export { defineTerminal, defineRetroButton, RETRO_VARIANTS };
export type { UsaTerminalElement, UsaRetroButtonElement };

export { defineOrganicCard, defineLiquidNav };
export type { UsaOrganicCardElement, UsaLiquidNavElement };

export { defineHudPanel, defineRadar, parseTargets };
export type { UsaHudPanelElement, UsaRadarElement, RadarTarget };

export { defineStickyWall, defineSketchChart };
export type { UsaStickyWallElement, UsaSketchChartElement };

export { defineThemeSwitcher, defineThemeSurface };
export type { UsaThemeSwitcherElement, UsaThemeSurfaceElement };

export { defineGyroCard, defineGestureSticker };
export type { UsaGyroCardElement, UsaGestureStickerElement, StickerState };

export { definePanorama, defineSpatialCard };
export type { UsaPanoramaElement, UsaSpatialCardElement };

export { defineCodeExport, exportComponent, describeComponent, definePropPanel, parseProps };
export type { UsaCodeExportElement, ExportFormat, ExportedNode, UsaPropPanelElement, PropSpec };

export { defineMotion, definePluginStore };
export type { UsaMotionElement, UsaPluginStoreElement };

export { defineChapterNav, defineScene };
export type { UsaChapterNavElement, UsaSceneElement };

export { defineLottie, defineLottieIcon, LOTTIE_ICONS };
export type { UsaLottieElement, UsaLottieIconElement };

export { defineGenArt, defineBgGenerator, backgroundCss };
export type { UsaGenArtElement, UsaBgGeneratorElement };

export { defineVideoCard, defineHeroVideo };
export type { UsaVideoCardElement, UsaHeroVideoElement };

export { defineMotionPrefs, definePauseAll };
export type { UsaMotionPrefsElement, UsaPauseAllElement };

export { definePerfMonitor, defineWorkerCanvas, WORKER_SCENES, WORKER_SCENE_FNS };
export type { UsaPerfMonitorElement, PerfStats, UsaWorkerCanvasElement };

export { defineMotionSpec };
export type { UsaMotionSpecElement };

export { defineNativePreview };
export type { UsaNativePreviewElement };

export { definePluginCard, defineInstallButton };
export type { UsaPluginCardElement, UsaInstallButtonElement };

export { defineScrollScene, parseScrub, defineMotionInspector };
export type { UsaScrollSceneElement, UsaMotionInspectorElement };

export { defineRouteTransition, defineTextSplitter };
export type { UsaRouteTransitionElement, UsaTextSplitterElement };

export { defineScrollRing, defineParallaxLayers, defineSmoothScroll };
export type { UsaScrollRingElement, UsaParallaxLayersElement, UsaSmoothScrollElement };

export { defineGlScene, defineGpuParticles, PARTICLE_SIM_WGSL, PARTICLE_DRAW_WGSL, defineShaderBackdrop, BACKDROP_PRESETS, POST_PASSES };
export type { UsaGlSceneElement, UsaGpuParticlesElement, UsaShaderBackdropElement };

export { defineLottiePlayer, defineRive, RIVE_PEER, RIVE_CDN, loadRiveRuntime, provideRiveRuntime, defineTokenEditor };
export type { UsaLottiePlayerElement, UsaRiveElement, UsaTokenEditorElement };

export { definePhysicsPlayground, PHYSICS_PRESETS, defineMotionPrompt };
export type { UsaPhysicsPlaygroundElement, UsaMotionPromptElement };

export { defineMegaMenu, defineNavFlyout, defineFullscreenMenu, defineBreadcrumbs };
export type { UsaMegaMenuElement, UsaNavFlyoutElement, UsaFullscreenMenuElement, UsaBreadcrumbsElement, BreadcrumbItem };

/** The widgets by release (tag → define function). */
export { defineGravityWell, type UsaGravityWellElement };
export { defineLiquidMetal, type UsaLiquidMetalElement };
export { defineReactionField, type UsaReactionFieldElement };
export { defineInkFlow, type UsaInkFlowElement };
export { defineFluidType, type UsaFluidTypeElement };
export { defineMagneticField, type UsaMagneticFieldElement };
export { defineElasticMesh, type UsaElasticMeshElement };
export { defineSpringLab, type UsaSpringLabElement };
export { defineBezierLab, type UsaBezierLabElement };
export { defineTextLoupe, type UsaTextLoupeElement };
export { defineRevisionReveal, type UsaRevisionRevealElement };
export { defineHoldAction, type UsaHoldActionElement };
export { defineScrubNumber, type UsaScrubNumberElement };

export const WIDGETS: Record<string, Record<string, (tag?: string) => CustomElementConstructor | undefined>> = {
  '6.2': { 'usa-carousel': defineCarousel, 'usa-tab-bar': defineTabBar, 'usa-disclosure': defineDisclosure, 'usa-stories': defineStories },
  '6.3': { 'usa-toast-stack': defineToastStack, 'usa-modal': defineModal, 'usa-sheet': defineSheet, 'usa-menu': defineMenu },
  '6.4': { 'usa-progress-ring': defineProgressRing, 'usa-odometer': defineOdometer, 'usa-skeleton-reveal': defineSkeletonReveal, 'usa-star-rating': defineStarRating },
  '6.5': { 'usa-milestones': defineMilestones, 'usa-masonry-flow': defineMasonryFlow, 'usa-compare': defineCompare, 'usa-cube-gallery': defineCubeGallery },
  '6.6': { 'usa-dock': defineDock, 'usa-nav-morph': defineNavMorph, 'usa-menu-toggle': defineMenuToggle, 'usa-tip': defineTip },
  '6.7': { 'usa-stepper': defineStepper, 'usa-pagination': definePagination, 'usa-segmented': defineSegmented, 'usa-switch': defineSwitch },
  '6.8': { 'usa-kanban': defineKanban, 'usa-swipe-deck': defineSwipeDeck, 'usa-weather-card': defineWeatherCard, 'usa-pull-cord': definePullCord },
  '6.9': { 'usa-date-picker': defineDatePicker, 'usa-color-picker': defineColorPicker, 'usa-file-drop': defineFileDrop, 'usa-keyframe-editor': defineKeyframeEditor },
  '7.1': { 'usa-music-player': defineMusicPlayer, 'usa-volume-knob': defineVolumeKnob, 'usa-equalizer': defineEqualizer, 'usa-lyrics': defineLyrics },
  '7.2': { 'usa-bar-chart': defineBarChart, 'usa-gauge': defineGauge, 'usa-sparkline': defineSparkline, 'usa-kpi': defineKpi },
  '7.3': { 'usa-add-to-cart': defineAddToCart, 'usa-cart-drawer': defineCartDrawer, 'usa-product-gallery': defineProductGallery, 'usa-countdown': defineCountdown },
  '7.4': { 'usa-message-list': defineMessageList, 'usa-reactions': defineReactions, 'usa-notification-bell': defineNotificationBell, 'usa-presence': definePresence },
  '7.5': { 'usa-leaderboard': defineLeaderboard, 'usa-xp-bar': defineXpBar, 'usa-badge-wall': defineBadgeWall, 'usa-prize-wheel': definePrizeWheel },
  '7.6': { 'usa-globe': defineGlobe, 'usa-location-card': defineLocationCard },
  '7.7': { 'usa-field': defineField, 'usa-otp': defineOtp, 'usa-upload-progress': defineUploadProgress },
  '7.8': { 'usa-chat-composer': defineChatComposer, 'usa-suggestion-chips': defineSuggestionChips, 'usa-voice-button': defineVoiceButton },
  '7.9': { 'usa-command-palette': defineCommandPalette, 'usa-shortcut': defineShortcut },
  '8.0': { 'usa-clock-control': defineClockControl, 'usa-hydrate': defineHydrate },
  '8.1': { 'usa-red-envelope': defineRedEnvelope, 'usa-festival-banner': defineFestivalBanner },
  '8.2': { 'usa-terminal': defineTerminal, 'usa-retro-button': defineRetroButton },
  '8.3': { 'usa-organic-card': defineOrganicCard, 'usa-liquid-nav': defineLiquidNav },
  '8.4': { 'usa-hud-panel': defineHudPanel, 'usa-radar': defineRadar },
  '8.5': { 'usa-sticky-wall': defineStickyWall, 'usa-sketch-chart': defineSketchChart },
  '8.6': { 'usa-theme-switcher': defineThemeSwitcher, 'usa-theme-surface': defineThemeSurface },
  '8.7': { 'usa-gyro-card': defineGyroCard, 'usa-gesture-sticker': defineGestureSticker },
  '8.8': { 'usa-panorama': definePanorama, 'usa-spatial-card': defineSpatialCard },
  '8.9': { 'usa-code-export': defineCodeExport, 'usa-prop-panel': definePropPanel },
  '9.0': { 'usa-motion': defineMotion, 'usa-plugin-store': definePluginStore },
  '9.1': { 'usa-chapter-nav': defineChapterNav, 'usa-scene': defineScene },
  '9.2': { 'usa-lottie': defineLottie, 'usa-lottie-icon': defineLottieIcon },
  '9.3': { 'usa-gen-art': defineGenArt, 'usa-bg-generator': defineBgGenerator },
  '9.4': { 'usa-video-card': defineVideoCard, 'usa-hero-video': defineHeroVideo },
  '9.5': { 'usa-motion-prefs': defineMotionPrefs, 'usa-pause-all': definePauseAll },
  '9.6': { 'usa-perf-monitor': definePerfMonitor, 'usa-worker-canvas': defineWorkerCanvas },
  '9.7': { 'usa-motion-spec': defineMotionSpec },
  '9.8': { 'usa-native-preview': defineNativePreview },
  '10.1': { 'usa-plugin-card': definePluginCard, 'usa-install-button': defineInstallButton },
  '10.2': { 'usa-scroll-scene': defineScrollScene, 'usa-motion-inspector': defineMotionInspector },
  '10.3': { 'usa-route-transition': defineRouteTransition, 'usa-text-splitter': defineTextSplitter },
  '10.4': { 'usa-scroll-ring': defineScrollRing, 'usa-parallax-layers': defineParallaxLayers, 'usa-smooth-scroll': defineSmoothScroll },
  '10.5': { 'usa-gl-scene': defineGlScene, 'usa-gpu-particles': defineGpuParticles, 'usa-shader-backdrop': defineShaderBackdrop },
  '10.6': { 'usa-lottie-player': defineLottiePlayer, 'usa-rive': defineRive, 'usa-token-editor': defineTokenEditor },
  '10.7': { 'usa-physics-playground': definePhysicsPlayground, 'usa-motion-prompt': defineMotionPrompt },
  '17.3': { 'usa-mega-menu': defineMegaMenu, 'usa-nav-flyout': defineNavFlyout, 'usa-fullscreen-menu': defineFullscreenMenu, 'usa-breadcrumbs': defineBreadcrumbs, 'usa-file-tree': defineFileTree, 'usa-download-menu': defineDownloadMenu, 'usa-title-sequence': defineTitleSequence },
  '17.7': { 'usa-select': defineSelect, 'usa-combobox': defineCombobox, 'usa-multi-select': defineMultiSelect, 'usa-number-stepper': defineNumberStepper, 'usa-password': definePassword, 'usa-range-slider': defineRangeSlider, 'usa-consent': defineConsent, 'usa-cta-popup': defineCtaPopup, 'usa-validation-summary': defineValidationSummary },
  '17.6': { 'usa-gravity-well': defineGravityWell, 'usa-liquid-metal': defineLiquidMetal, 'usa-reaction-field': defineReactionField, 'usa-ink-flow': defineInkFlow, 'usa-fluid-type': defineFluidType, 'usa-magnetic-field': defineMagneticField, 'usa-elastic-mesh': defineElasticMesh, 'usa-spring-lab': defineSpringLab, 'usa-bezier-lab': defineBezierLab, 'usa-text-loupe': defineTextLoupe, 'usa-revision-reveal': defineRevisionReveal, 'usa-hold-action': defineHoldAction, 'usa-scrub-number': defineScrubNumber },
  '17.5': { 'usa-flight-status': defineFlightStatus, 'usa-transit-progress': defineTransitProgress, 'usa-sun-timeline': defineSunTimeline, 'usa-delivery-tracker': defineDeliveryTracker, 'usa-glucose-sparkline': defineGlucoseSparkline, 'usa-coffee-timer': defineCoffeeTimer, 'usa-vital-wave': defineVitalWave, 'usa-orbit-pass': defineOrbitPass, 'usa-meter-countdown': defineMeterCountdown, 'usa-race-telemetry': defineRaceTelemetry, 'usa-workout-player': defineWorkoutPlayer, 'usa-status-pill': defineStatusPill, 'usa-ride-status': defineRideStatus, 'usa-route-sparkline': defineRouteSparkline, 'usa-activity-wall': defineActivityWall },
  '17.4': { 'usa-luminous-switch': defineLuminousSwitch, 'usa-particle-icon': defineParticleIcon, 'usa-particle-button': defineParticleButton, 'usa-halo-segmented': defineHaloSegmented, 'usa-halo-slider': defineHaloSlider, 'usa-orbit-progress': defineOrbitProgress },
};

/** Every widget tag, in release order. */
export const WIDGET_TAGS: string[] = /*#__PURE__*/ Object.values(WIDGETS).flatMap((g) => Object.keys(g));

/**
 * Register every widget (or only those of one release, e.g. `'6.2'`). 17.3: `mo-*` is the default name — this turns on
 * the `<mo-*>` names first (`defineMoAliases()`); the `usa-*` names stay registered as deprecated aliases.
 */
export function defineWidgets(release?: string): void {
  defineMoAliases();
  for (const [v, group] of Object.entries(WIDGETS)) if (!release || release === v) for (const [tag, fn] of Object.entries(group)) fn(tag);
}

declare global {
  interface HTMLElementTagNameMap {
    'usa-select': UsaSelectElement;
    'mo-select': UsaSelectElement;
    'usa-combobox': UsaComboboxElement;
    'mo-combobox': UsaComboboxElement;
    'usa-multi-select': UsaMultiSelectElement;
    'mo-multi-select': UsaMultiSelectElement;
    'usa-number-stepper': UsaNumberStepperElement;
    'mo-number-stepper': UsaNumberStepperElement;
    'usa-password': UsaPasswordElement;
    'mo-password': UsaPasswordElement;
    'usa-range-slider': UsaRangeSliderElement;
    'mo-range-slider': UsaRangeSliderElement;
    'usa-consent': UsaConsentElement;
    'mo-consent': UsaConsentElement;
    'usa-cta-popup': UsaCtaPopupElement;
    'mo-cta-popup': UsaCtaPopupElement;
    'usa-validation-summary': UsaValidationSummaryElement;
    'mo-validation-summary': UsaValidationSummaryElement;
    'usa-gravity-well': UsaGravityWellElement;
    'mo-gravity-well': UsaGravityWellElement;
    'usa-liquid-metal': UsaLiquidMetalElement;
    'mo-liquid-metal': UsaLiquidMetalElement;
    'usa-reaction-field': UsaReactionFieldElement;
    'mo-reaction-field': UsaReactionFieldElement;
    'usa-ink-flow': UsaInkFlowElement;
    'mo-ink-flow': UsaInkFlowElement;
    'usa-fluid-type': UsaFluidTypeElement;
    'mo-fluid-type': UsaFluidTypeElement;
    'usa-magnetic-field': UsaMagneticFieldElement;
    'mo-magnetic-field': UsaMagneticFieldElement;
    'usa-elastic-mesh': UsaElasticMeshElement;
    'mo-elastic-mesh': UsaElasticMeshElement;
    'usa-spring-lab': UsaSpringLabElement;
    'mo-spring-lab': UsaSpringLabElement;
    'usa-bezier-lab': UsaBezierLabElement;
    'mo-bezier-lab': UsaBezierLabElement;
    'usa-text-loupe': UsaTextLoupeElement;
    'mo-text-loupe': UsaTextLoupeElement;
    'usa-revision-reveal': UsaRevisionRevealElement;
    'mo-revision-reveal': UsaRevisionRevealElement;
    'usa-hold-action': UsaHoldActionElement;
    'mo-hold-action': UsaHoldActionElement;
    'usa-scrub-number': UsaScrubNumberElement;
    'mo-scrub-number': UsaScrubNumberElement;
    'usa-flight-status': UsaFlightStatusElement;
    'mo-flight-status': UsaFlightStatusElement;
    'usa-transit-progress': UsaTransitProgressElement;
    'mo-transit-progress': UsaTransitProgressElement;
    'usa-sun-timeline': UsaSunTimelineElement;
    'mo-sun-timeline': UsaSunTimelineElement;
    'usa-delivery-tracker': UsaDeliveryTrackerElement;
    'mo-delivery-tracker': UsaDeliveryTrackerElement;
    'usa-glucose-sparkline': UsaGlucoseSparklineElement;
    'mo-glucose-sparkline': UsaGlucoseSparklineElement;
    'usa-coffee-timer': UsaCoffeeTimerElement;
    'mo-coffee-timer': UsaCoffeeTimerElement;
    'usa-vital-wave': UsaVitalWaveElement;
    'mo-vital-wave': UsaVitalWaveElement;
    'usa-orbit-pass': UsaOrbitPassElement;
    'mo-orbit-pass': UsaOrbitPassElement;
    'usa-meter-countdown': UsaMeterCountdownElement;
    'mo-meter-countdown': UsaMeterCountdownElement;
    'usa-race-telemetry': UsaRaceTelemetryElement;
    'mo-race-telemetry': UsaRaceTelemetryElement;
    'usa-workout-player': UsaWorkoutPlayerElement;
    'mo-workout-player': UsaWorkoutPlayerElement;
    'usa-status-pill': UsaStatusPillElement;
    'mo-status-pill': UsaStatusPillElement;
    'usa-ride-status': UsaRideStatusElement;
    'mo-ride-status': UsaRideStatusElement;
    'usa-route-sparkline': UsaRouteSparklineElement;
    'mo-route-sparkline': UsaRouteSparklineElement;
    'usa-activity-wall': UsaActivityWallElement;
    'mo-activity-wall': UsaActivityWallElement;
    'usa-luminous-switch': UsaLuminousSwitchElement;
    'mo-luminous-switch': UsaLuminousSwitchElement;
    'usa-particle-icon': UsaParticleIconElement;
    'mo-particle-icon': UsaParticleIconElement;
    'usa-particle-button': UsaParticleButtonElement;
    'mo-particle-button': UsaParticleButtonElement;
    'usa-halo-segmented': UsaHaloSegmentedElement;
    'mo-halo-segmented': UsaHaloSegmentedElement;
    'usa-halo-slider': UsaHaloSliderElement;
    'mo-halo-slider': UsaHaloSliderElement;
    'usa-orbit-progress': UsaOrbitProgressElement;
    'mo-orbit-progress': UsaOrbitProgressElement;
    'usa-carousel': UsaCarouselElement;
    'usa-mega-menu': UsaMegaMenuElement;
    'mo-mega-menu': UsaMegaMenuElement;
    'usa-nav-flyout': UsaNavFlyoutElement;
    'mo-nav-flyout': UsaNavFlyoutElement;
    'usa-fullscreen-menu': UsaFullscreenMenuElement;
    'mo-fullscreen-menu': UsaFullscreenMenuElement;
    'usa-breadcrumbs': UsaBreadcrumbsElement;
    'mo-breadcrumbs': UsaBreadcrumbsElement;
    'usa-tab-bar': UsaTabBarElement;
    'usa-disclosure': UsaDisclosureElement;
    'usa-stories': UsaStoriesElement;
    'usa-toast-stack': UsaToastStackElement;
    'usa-modal': UsaModalElement;
    'usa-sheet': UsaSheetElement;
    'usa-menu': UsaMenuElement;
    'usa-progress-ring': UsaProgressRingElement;
    'usa-odometer': UsaOdometerElement;
    'usa-skeleton-reveal': UsaSkeletonRevealElement;
    'usa-star-rating': UsaStarRatingElement;
    'usa-milestones': UsaMilestonesElement;
    'usa-masonry-flow': UsaMasonryFlowElement;
    'usa-compare': UsaCompareElement;
    'usa-cube-gallery': UsaCubeGalleryElement;
    'usa-dock': UsaDockElement;
    'usa-nav-morph': UsaNavMorphElement;
    'usa-menu-toggle': UsaMenuToggleElement;
    'usa-tip': UsaTipElement;
    'usa-stepper': UsaStepperElement;
    'usa-pagination': UsaPaginationElement;
    'usa-segmented': UsaSegmentedElement;
    'usa-switch': UsaSwitchElement;
    'usa-kanban': UsaKanbanElement;
    'usa-swipe-deck': UsaSwipeDeckElement;
    'usa-weather-card': UsaWeatherCardElement;
    'usa-pull-cord': UsaPullCordElement;
    'usa-date-picker': UsaDatePickerElement;
    'usa-color-picker': UsaColorPickerElement;
    'usa-file-drop': UsaFileDropElement;
    'usa-keyframe-editor': UsaKeyframeEditorElement;
    'usa-music-player': UsaMusicPlayerElement;
    'usa-volume-knob': UsaVolumeKnobElement;
    'usa-equalizer': UsaEqualizerElement;
    'usa-lyrics': UsaLyricsElement;
    'usa-bar-chart': UsaBarChartElement;
    'usa-gauge': UsaGaugeElement;
    'usa-sparkline': UsaSparklineElement;
    'usa-kpi': UsaKpiElement;
    'usa-add-to-cart': UsaAddToCartElement;
    'usa-cart-drawer': UsaCartDrawerElement;
    'usa-product-gallery': UsaProductGalleryElement;
    'usa-countdown': UsaCountdownElement;
    'usa-message-list': UsaMessageListElement;
    'usa-reactions': UsaReactionsElement;
    'usa-notification-bell': UsaNotificationBellElement;
    'usa-presence': UsaPresenceElement;
    'usa-leaderboard': UsaLeaderboardElement;
    'usa-xp-bar': UsaXpBarElement;
    'usa-badge-wall': UsaBadgeWallElement;
    'usa-prize-wheel': UsaPrizeWheelElement;
    'usa-globe': UsaGlobeElement;
    'usa-location-card': UsaLocationCardElement;
    'usa-field': UsaFieldElement;
    'usa-otp': UsaOtpElement;
    'usa-upload-progress': UsaUploadProgressElement;
    'usa-chat-composer': UsaChatComposerElement;
    'usa-suggestion-chips': UsaSuggestionChipsElement;
    'usa-voice-button': UsaVoiceButtonElement;
    'usa-command-palette': UsaCommandPaletteElement;
    'usa-shortcut': UsaShortcutElement;
    'usa-clock-control': UsaClockControlElement;
    'usa-hydrate': UsaHydrateElement;
    'usa-red-envelope': UsaRedEnvelopeElement;
    'usa-festival-banner': UsaFestivalBannerElement;
    'usa-terminal': UsaTerminalElement;
    'usa-retro-button': UsaRetroButtonElement;
    'usa-organic-card': UsaOrganicCardElement;
    'usa-liquid-nav': UsaLiquidNavElement;
    'usa-hud-panel': UsaHudPanelElement;
    'usa-radar': UsaRadarElement;
    'usa-sticky-wall': UsaStickyWallElement;
    'usa-sketch-chart': UsaSketchChartElement;
    'usa-theme-switcher': UsaThemeSwitcherElement;
    'usa-theme-surface': UsaThemeSurfaceElement;
    'usa-gyro-card': UsaGyroCardElement;
    'usa-gesture-sticker': UsaGestureStickerElement;
    'usa-panorama': UsaPanoramaElement;
    'usa-spatial-card': UsaSpatialCardElement;
    'usa-code-export': UsaCodeExportElement;
    'usa-prop-panel': UsaPropPanelElement;
    'usa-motion': UsaMotionElement;
    'usa-plugin-store': UsaPluginStoreElement;
    'usa-chapter-nav': UsaChapterNavElement;
    'usa-scene': UsaSceneElement;
    'usa-lottie': UsaLottieElement;
    'usa-lottie-icon': UsaLottieIconElement;
    'usa-gen-art': UsaGenArtElement;
    'usa-bg-generator': UsaBgGeneratorElement;
    'usa-video-card': UsaVideoCardElement;
    'usa-hero-video': UsaHeroVideoElement;
    'usa-motion-prefs': UsaMotionPrefsElement;
    'usa-pause-all': UsaPauseAllElement;
    'usa-perf-monitor': UsaPerfMonitorElement;
    'usa-worker-canvas': UsaWorkerCanvasElement;
    'usa-motion-spec': UsaMotionSpecElement;
    'usa-native-preview': UsaNativePreviewElement;
    'usa-plugin-card': UsaPluginCardElement;
    'usa-install-button': UsaInstallButtonElement;
    'usa-scroll-scene': UsaScrollSceneElement;
    'usa-motion-inspector': UsaMotionInspectorElement;
    'usa-route-transition': UsaRouteTransitionElement;
    'usa-text-splitter': UsaTextSplitterElement;
    'usa-scroll-ring': UsaScrollRingElement;
    'usa-parallax-layers': UsaParallaxLayersElement;
    'usa-smooth-scroll': UsaSmoothScrollElement;
    'usa-gl-scene': UsaGlSceneElement;
    'usa-gpu-particles': UsaGpuParticlesElement;
    'usa-shader-backdrop': UsaShaderBackdropElement;
    'usa-lottie-player': UsaLottiePlayerElement;
    'usa-rive': UsaRiveElement;
    'usa-token-editor': UsaTokenEditorElement;
    'usa-physics-playground': UsaPhysicsPlaygroundElement;
    'usa-motion-prompt': UsaMotionPromptElement;
  }
}
