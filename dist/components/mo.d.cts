/** Documented attributes of every shipped `<usa-*>` element, keyed by tag (attribute values are strings / flags). */
interface LegacyAttributes {
    'usa-accordion': {
        duration?: string | boolean | number;
        multiple?: string | boolean | number;
    };
    'usa-acrylic': {
        blur?: string | boolean | number;
        shimmer?: string | boolean | number;
        tint?: string | boolean | number;
        'tint-opacity'?: string | boolean | number;
    };
    'usa-add-to-cart': {
        added?: string | boolean | number;
        cart?: string | boolean | number;
        from?: string | boolean | number;
        hold?: string | boolean | number;
        item?: string | boolean | number;
        label?: string | boolean | number;
    };
    'usa-ambient': {
        color?: string | boolean | number;
        density?: string | boolean | number;
        effect?: string | boolean | number;
        opacity?: string | boolean | number;
        speed?: string | boolean | number;
    };
    'usa-anim-icon': {
        label?: string | boolean | number;
        name?: string | boolean | number;
        size?: string | boolean | number;
        trigger?: string | boolean | number;
    };
    'usa-audio': {
        cooldown?: string | boolean | number;
        label?: string | boolean | number;
        source?: string | boolean | number;
        threshold?: string | boolean | number;
    };
    'usa-aurora': {
        colors?: string | boolean | number;
        intensity?: string | boolean | number;
        speed?: string | boolean | number;
    };
    'usa-auto-animate': {
        duration?: string | boolean | number;
        'no-scale'?: string | boolean | number;
    };
    'usa-auto-skeleton': {
        loading?: string | boolean | number;
    };
    'usa-avatar-stack': {
        label?: string | boolean | number;
        max?: string | boolean | number;
        overlap?: string | boolean | number;
        size?: string | boolean | number;
    };
    'usa-back-to-top': {
        'focus-target'?: string | boolean | number;
        label?: string | boolean | number;
        offset?: string | boolean | number;
    };
    'usa-badge': {
        dot?: string | boolean | number;
        label?: string | boolean | number;
        max?: string | boolean | number;
        'show-zero'?: string | boolean | number;
        value?: string | boolean | number;
    };
    'usa-badge-wall': {
        label?: string | boolean | number;
    };
    'usa-bar-chart': {
        horizontal?: string | boolean | number;
        label?: string | boolean | number;
        labels?: string | boolean | number;
        max?: string | boolean | number;
        unit?: string | boolean | number;
        values?: string | boolean | number;
    };
    'usa-bg-generator': {
        label?: string | boolean | number;
        palette?: string | boolean | number;
        seed?: string | boolean | number;
        style?: string | boolean | number;
    };
    'usa-blobs': {
        blur?: string | boolean | number;
        colors?: string | boolean | number;
        speed?: string | boolean | number;
    };
    'usa-bottom-sheet': {
        open?: string | boolean | number;
        snap?: string | boolean | number;
        start?: string | boolean | number;
    };
    'usa-breadcrumbs': {
        label?: string | boolean | number;
        max?: string | boolean | number;
    };
    'usa-button': {
        deform?: string | boolean | number;
        disabled?: string | boolean | number;
        haptic?: string | boolean | number;
        morph?: string | boolean | number;
        reset?: string | boolean | number;
        shape?: string | boolean | number;
        state?: string | boolean | number;
    };
    'usa-card': {
        color?: string | boolean | number;
        depth?: string | boolean | number;
        disabled?: string | boolean | number;
        effect?: string | boolean | number;
        trigger?: string | boolean | number;
    };
    'usa-card-stack': {
        disabled?: string | boolean | number;
        loop?: string | boolean | number;
        offset?: string | boolean | number;
        threshold?: string | boolean | number;
        visible?: string | boolean | number;
    };
    'usa-carousel': {
        autoplay?: string | boolean | number;
        effect?: string | boolean | number;
        index?: string | boolean | number;
        label?: string | boolean | number;
        loop?: string | boolean | number;
        'no-controls'?: string | boolean | number;
        'no-dots'?: string | boolean | number;
    };
    'usa-carousel-3d': {
        autoplay?: string | boolean | number;
        index?: string | boolean | number;
        perspective?: string | boolean | number;
        radius?: string | boolean | number;
    };
    'usa-cart-drawer': {
        currency?: string | boolean | number;
        items?: string | boolean | number;
        label?: string | boolean | number;
    };
    'usa-chapter-nav': {
        for?: string | boolean | number;
        label?: string | boolean | number;
        orientation?: string | boolean | number;
    };
    'usa-chat-composer': {
        busy?: string | boolean | number;
        label?: string | boolean | number;
        placeholder?: string | boolean | number;
        rows?: string | boolean | number;
        value?: string | boolean | number;
    };
    'usa-check': {
        kind?: string | boolean | number;
        label?: string | boolean | number;
        size?: string | boolean | number;
        start?: string | boolean | number;
    };
    'usa-checkbox': {
        checked?: string | boolean | number;
        disabled?: string | boolean | number;
        indeterminate?: string | boolean | number;
        label?: string | boolean | number;
        value?: string | boolean | number;
    };
    'usa-click': {
        color?: string | boolean | number;
        count?: string | boolean | number;
        disabled?: string | boolean | number;
        effect?: string | boolean | number;
        haptic?: string | boolean | number;
        shape?: string | boolean | number;
        trigger?: string | boolean | number;
    };
    'usa-clock-control': {
        label?: string | boolean | number;
        speeds?: string | boolean | number;
    };
    'usa-code-export': {
        for?: string | boolean | number;
        formats?: string | boolean | number;
    };
    'usa-color-picker': {
        swatches?: string | boolean | number;
    };
    'usa-command-palette': {
        hotkey?: string | boolean | number;
        inline?: string | boolean | number;
        label?: string | boolean | number;
        placeholder?: string | boolean | number;
    };
    'usa-compare': {
        hover?: string | boolean | number;
        intro?: string | boolean | number;
        label?: string | boolean | number;
        labels?: string | boolean | number;
        orientation?: string | boolean | number;
        position?: string | boolean | number;
    };
    'usa-countdown': {
        label?: string | boolean | number;
        labels?: string | boolean | number;
        seconds?: string | boolean | number;
        to?: string | boolean | number;
        units?: string | boolean | number;
    };
    'usa-counter': {
        decimals?: string | boolean | number;
        duration?: string | boolean | number;
        from?: string | boolean | number;
        grouping?: string | boolean | number;
        locale?: string | boolean | number;
        prefix?: string | boolean | number;
        start?: string | boolean | number;
        suffix?: string | boolean | number;
        to?: string | boolean | number;
    };
    'usa-cube': {
        autoplay?: string | boolean | number;
        perspective?: string | boolean | number;
        size?: string | boolean | number;
    };
    'usa-cube-gallery': {
        autoplay?: string | boolean | number;
        axis?: string | boolean | number;
        label?: string | boolean | number;
    };
    'usa-cursor': {
        color?: string | boolean | number;
        'hide-native'?: string | boolean | number;
        mode?: string | boolean | number;
        size?: string | boolean | number;
        targets?: string | boolean | number;
    };
    'usa-date-picker': {
        'first-day'?: string | boolean | number;
        locale?: string | boolean | number;
        max?: string | boolean | number;
        min?: string | boolean | number;
    };
    'usa-depth': {
        rotate?: string | boolean | number;
        source?: string | boolean | number;
        strength?: string | boolean | number;
    };
    'usa-dialog': {
        kind?: string | boolean | number;
        label?: string | boolean | number;
        'no-backdrop-close'?: string | boolean | number;
        'no-esc'?: string | boolean | number;
        open?: string | boolean | number;
    };
    'usa-disclosure': {
        multiple?: string | boolean | number;
        spring?: string | boolean | number;
    };
    'usa-distort': {};
    'usa-dock': {
        bounce?: string | boolean | number;
        label?: string | boolean | number;
        magnify?: string | boolean | number;
        orientation?: string | boolean | number;
        range?: string | boolean | number;
    };
    'usa-dot-network': {
        color?: string | boolean | number;
        gap?: string | boolean | number;
        radius?: string | boolean | number;
    };
    'usa-dotlottie': {
        'state-machine'?: string | boolean | number;
        theme?: string | boolean | number;
    };
    'usa-double-tap': {
        color?: string | boolean | number;
        delay?: string | boolean | number;
        disabled?: string | boolean | number;
        icon?: string | boolean | number;
    };
    'usa-download-menu': {};
    'usa-draggable': {
        axis?: string | boolean | number;
        bounds?: string | boolean | number;
        disabled?: string | boolean | number;
        inertia?: string | boolean | number;
        preset?: string | boolean | number;
        snap?: string | boolean | number;
        'spring-back'?: string | boolean | number;
        step?: string | boolean | number;
    };
    'usa-draw': {
        duration?: string | boolean | number;
        repeat?: string | boolean | number;
        stagger?: string | boolean | number;
        trigger?: string | boolean | number;
    };
    'usa-drawer': {};
    'usa-equalizer': {
        bands?: string | boolean | number;
        label?: string | boolean | number;
        preset?: string | boolean | number;
    };
    'usa-fab': {
        direction?: string | boolean | number;
        gap?: string | boolean | number;
    };
    'usa-festival-banner': {
        dismissible?: string | boolean | number;
        label?: string | boolean | number;
        theme?: string | boolean | number;
    };
    'usa-field': {
        error?: string | boolean | number;
        hint?: string | boolean | number;
        label?: string | boolean | number;
        strength?: string | boolean | number;
    };
    'usa-file-drop': {
        accept?: string | boolean | number;
        label?: string | boolean | number;
        multiple?: string | boolean | number;
        simulate?: string | boolean | number;
    };
    'usa-file-tree': {};
    'usa-fullpage': {
        axis?: string | boolean | number;
        dots?: string | boolean | number;
    };
    'usa-fullscreen-menu': {
        label?: string | boolean | number;
        variant?: string | boolean | number;
    };
    'usa-fx': {
        effect?: string | boolean | number;
        once?: string | boolean | number;
        options?: string | boolean | number;
        self?: string | boolean | number;
        trigger?: string | boolean | number;
    };
    'usa-gauge': {
        label?: string | boolean | number;
        max?: string | boolean | number;
        min?: string | boolean | number;
        unit?: string | boolean | number;
        value?: string | boolean | number;
        zones?: string | boolean | number;
    };
    'usa-gen-art': {
        art?: string | boolean | number;
        label?: string | boolean | number;
        palette?: string | boolean | number;
        seed?: string | boolean | number;
    };
    'usa-gesture-fx': {
        angle?: string | boolean | number;
        duration?: string | boolean | number;
        effect?: string | boolean | number;
        gesture?: string | boolean | number;
        options?: string | boolean | number;
        self?: string | boolean | number;
        velocity?: string | boolean | number;
    };
    'usa-gesture-sticker': {
        label?: string | boolean | number;
        max?: string | boolean | number;
        min?: string | boolean | number;
    };
    'usa-gl-model': {};
    'usa-gl-scene': {
        animation?: string | boolean | number;
        'animation-speed'?: string | boolean | number;
        'auto-rotate'?: string | boolean | number;
        background?: string | boolean | number;
        color?: string | boolean | number;
        controls?: string | boolean | number;
        exposure?: string | boolean | number;
        label?: string | boolean | number;
        metallic?: string | boolean | number;
        roughness?: string | boolean | number;
        shape?: string | boolean | number;
        src?: string | boolean | number;
        video?: string | boolean | number;
        'video-scrub'?: string | boolean | number;
    };
    'usa-glitch': {
        intensity?: string | boolean | number;
        text?: string | boolean | number;
    };
    'usa-globe': {
        lon?: string | boolean | number;
        markers?: string | boolean | number;
        speed?: string | boolean | number;
        tilt?: string | boolean | number;
    };
    'usa-gpu-particles': {
        colors?: string | boolean | number;
        count?: string | boolean | number;
        label?: string | boolean | number;
        mode?: string | boolean | number;
        pointer?: string | boolean | number;
        size?: string | boolean | number;
        speed?: string | boolean | number;
        trail?: string | boolean | number;
    };
    'usa-gradient-text': {
        angle?: string | boolean | number;
        colors?: string | boolean | number;
        speed?: string | boolean | number;
    };
    'usa-grain': {
        blend?: string | boolean | number;
        opacity?: string | boolean | number;
        scale?: string | boolean | number;
    };
    'usa-grid-glow': {
        color?: string | boolean | number;
        radius?: string | boolean | number;
        size?: string | boolean | number;
    };
    'usa-gyro-card': {
        glare?: string | boolean | number;
        max?: string | boolean | number;
    };
    'usa-handwriting': {
        duration?: string | boolean | number;
        font?: string | boolean | number;
        size?: string | boolean | number;
        stroke?: string | boolean | number;
        text?: string | boolean | number;
    };
    'usa-hero-video': {
        label?: string | boolean | number;
        poster?: string | boolean | number;
        scrub?: string | boolean | number;
    };
    'usa-hold': {
        color?: string | boolean | number;
        disabled?: string | boolean | number;
        duration?: string | boolean | number;
        label?: string | boolean | number;
    };
    'usa-hud-panel': {
        color?: string | boolean | number;
        status?: string | boolean | number;
        title?: string | boolean | number;
    };
    'usa-hydrate': {
        duration?: string | boolean | number;
        effect?: string | boolean | number;
        stagger?: string | boolean | number;
    };
    'usa-icon-morph': {
        icons?: string | boolean | number;
        index?: string | boolean | number;
        labels?: string | boolean | number;
        preset?: string | boolean | number;
        size?: string | boolean | number;
        toggle?: string | boolean | number;
    };
    'usa-install-button': {
        cdn?: string | boolean | number;
        dev?: string | boolean | number;
        manager?: string | boolean | number;
        managers?: string | boolean | number;
        package?: string | boolean | number;
    };
    'usa-kanban': {
        label?: string | boolean | number;
    };
    'usa-keyframe-editor': {
        for?: string | boolean | number;
    };
    'usa-kpi': {
        caption?: string | boolean | number;
        delta?: string | boolean | number;
        invert?: string | boolean | number;
        label?: string | boolean | number;
        locale?: string | boolean | number;
        trend?: string | boolean | number;
    };
    'usa-leaderboard': {
        label?: string | boolean | number;
        limit?: string | boolean | number;
        me?: string | boolean | number;
    };
    'usa-like': {
        color?: string | boolean | number;
        count?: string | boolean | number;
        disabled?: string | boolean | number;
        haptic?: string | boolean | number;
        label?: string | boolean | number;
        liked?: string | boolean | number;
        size?: string | boolean | number;
    };
    'usa-liquid': {};
    'usa-liquid-nav': {
        label?: string | boolean | number;
        orientation?: string | boolean | number;
        value?: string | boolean | number;
    };
    'usa-loading-bar': {
        color?: string | boolean | number;
        height?: string | boolean | number;
        label?: string | boolean | number;
    };
    'usa-location-card': {
        address?: string | boolean | number;
        distance?: string | boolean | number;
        'from-lat'?: string | boolean | number;
        'from-lon'?: string | boolean | number;
        href?: string | boolean | number;
        lat?: string | boolean | number;
        lon?: string | boolean | number;
        name?: string | boolean | number;
        unit?: string | boolean | number;
    };
    'usa-lottie': {
        label?: string | boolean | number;
        loop?: string | boolean | number;
        speed?: string | boolean | number;
        src?: string | boolean | number;
    };
    'usa-lottie-icon': {
        color?: string | boolean | number;
        label?: string | boolean | number;
        name?: string | boolean | number;
        size?: string | boolean | number;
        trigger?: string | boolean | number;
    };
    'usa-lottie-player': {
        animation?: string | boolean | number;
        autoplay?: string | boolean | number;
        background?: string | boolean | number;
        fit?: string | boolean | number;
        hover?: string | boolean | number;
        label?: string | boolean | number;
        loop?: string | boolean | number;
        mode?: string | boolean | number;
        scrub?: string | boolean | number;
        segment?: string | boolean | number;
        speed?: string | boolean | number;
        src?: string | boolean | number;
    };
    'usa-lyrics': {
        for?: string | boolean | number;
        label?: string | boolean | number;
    };
    'usa-magnetic': {
        disabled?: string | boolean | number;
        radius?: string | boolean | number;
        strength?: string | boolean | number;
    };
    'usa-marquee': {
        direction?: string | boolean | number;
        gap?: string | boolean | number;
        'pause-on-hover'?: string | boolean | number;
        paused?: string | boolean | number;
        speed?: string | boolean | number;
    };
    'usa-mask-reveal': {
        at?: string | boolean | number;
        delay?: string | boolean | number;
        duration?: string | boolean | number;
        repeat?: string | boolean | number;
        shape?: string | boolean | number;
        trigger?: string | boolean | number;
    };
    'usa-masonry': {
        columns?: string | boolean | number;
        gap?: string | boolean | number;
        min?: string | boolean | number;
    };
    'usa-masonry-flow': {
        gap?: string | boolean | number;
        min?: string | boolean | number;
    };
    'usa-mega-menu': {
        'close-delay'?: string | boolean | number;
        delay?: string | boolean | number;
        label?: string | boolean | number;
    };
    'usa-menu': {
        effect?: string | boolean | number;
        placement?: string | boolean | number;
    };
    'usa-menu-toggle': {
        for?: string | boolean | number;
        label?: string | boolean | number;
        variant?: string | boolean | number;
    };
    'usa-message-list': {
        label?: string | boolean | number;
    };
    'usa-milestones': {
        layout?: string | boolean | number;
    };
    'usa-modal': {
        effect?: string | boolean | number;
        label?: string | boolean | number;
        persistent?: string | boolean | number;
    };
    'usa-morph': {
        duration?: string | boolean | number;
        interval?: string | boolean | number;
        paths?: string | boolean | number;
        trigger?: string | boolean | number;
    };
    'usa-motion': {
        rules?: string | boolean | number;
    };
    'usa-motion-inspector': {
        interval?: string | boolean | number;
        scope?: string | boolean | number;
    };
    'usa-motion-prefs': {
        label?: string | boolean | number;
    };
    'usa-motion-prompt': {
        format?: string | boolean | number;
        label?: string | boolean | number;
        placeholder?: string | boolean | number;
        value?: string | boolean | number;
    };
    'usa-motion-spec': {
        label?: string | boolean | number;
        rules?: string | boolean | number;
    };
    'usa-motion-switch': {
        label?: string | boolean | number;
        labels?: string | boolean | number;
    };
    'usa-motion-theme': {
        name?: string | boolean | number;
    };
    'usa-music-player': {
        artist?: string | boolean | number;
        cover?: string | boolean | number;
        duration?: string | boolean | number;
        src?: string | boolean | number;
        title?: string | boolean | number;
    };
    'usa-native-preview': {
        name?: string | boolean | number;
        platform?: string | boolean | number;
        rules?: string | boolean | number;
    };
    'usa-nav-flyout': {
        'close-delay'?: string | boolean | number;
        delay?: string | boolean | number;
        label?: string | boolean | number;
    };
    'usa-nav-morph': {
        active?: string | boolean | number;
        indicator?: string | boolean | number;
        label?: string | boolean | number;
    };
    'usa-navbar': {
        target?: string | boolean | number;
        threshold?: string | boolean | number;
    };
    'usa-notification-bell': {
        label?: string | boolean | number;
    };
    'usa-odometer': {
        decimals?: string | boolean | number;
        duration?: string | boolean | number;
        locale?: string | boolean | number;
        prefix?: string | boolean | number;
        suffix?: string | boolean | number;
        value?: string | boolean | number;
    };
    'usa-organic-card': {
        seed?: string | boolean | number;
        tint?: string | boolean | number;
    };
    'usa-otp': {
        label?: string | boolean | number;
        length?: string | boolean | number;
        mode?: string | boolean | number;
        value?: string | boolean | number;
    };
    'usa-overscroll': {
        axis?: string | boolean | number;
        disabled?: string | boolean | number;
        max?: string | boolean | number;
        preset?: string | boolean | number;
    };
    'usa-pack': {
        name?: string | boolean | number;
    };
    'usa-pagination': {
        label?: string | boolean | number;
        siblings?: string | boolean | number;
        total?: string | boolean | number;
    };
    'usa-panorama': {
        autorotate?: string | boolean | number;
        label?: string | boolean | number;
        src?: string | boolean | number;
    };
    'usa-parallax-layers': {
        engine?: string | boolean | number;
        horizontal?: string | boolean | number;
        pointer?: string | boolean | number;
        preview?: string | boolean | number;
        range?: string | boolean | number;
        strength?: string | boolean | number;
    };
    'usa-particles': {
        color?: string | boolean | number;
        count?: string | boolean | number;
        interactive?: string | boolean | number;
        links?: string | boolean | number;
        paused?: string | boolean | number;
        size?: string | boolean | number;
        speed?: string | boolean | number;
    };
    'usa-pause-all': {
        label?: string | boolean | number;
        'resume-label'?: string | boolean | number;
        scope?: string | boolean | number;
    };
    'usa-perf-monitor': {
        corner?: string | boolean | number;
        warn?: string | boolean | number;
    };
    'usa-physics-playground': {
        gravity?: string | boolean | number;
        label?: string | boolean | number;
        preset?: string | boolean | number;
        spawn?: string | boolean | number;
        src?: string | boolean | number;
    };
    'usa-pinch-zoom': {
        'double-tap'?: string | boolean | number;
        max?: string | boolean | number;
        min?: string | boolean | number;
        preset?: string | boolean | number;
    };
    'usa-player': {
        controls?: string | boolean | number;
        loop?: string | boolean | number;
        rate?: string | boolean | number;
        src?: string | boolean | number;
        trigger?: string | boolean | number;
    };
    'usa-plugin-card': {
        author?: string | boolean | number;
        downloads?: string | boolean | number;
        engine?: string | boolean | number;
        integrity?: string | boolean | number;
        name?: string | boolean | number;
        src?: string | boolean | number;
        title?: string | boolean | number;
        version?: string | boolean | number;
    };
    'usa-plugin-store': {
        label?: string | boolean | number;
        query?: string | boolean | number;
    };
    'usa-popover': {
        placement?: string | boolean | number;
    };
    'usa-post-fx': {};
    'usa-presence': {
        name?: string | boolean | number;
        speaking?: string | boolean | number;
        src?: string | boolean | number;
        status?: string | boolean | number;
    };
    'usa-press': {
        bounce?: string | boolean | number;
        disabled?: string | boolean | number;
        scale?: string | boolean | number;
    };
    'usa-prize-wheel': {
        duration?: string | boolean | number;
        label?: string | boolean | number;
        segments?: string | boolean | number;
        turns?: string | boolean | number;
    };
    'usa-product-gallery': {
        index?: string | boolean | number;
        nozoom?: string | boolean | number;
        zoom?: string | boolean | number;
    };
    'usa-progress': {
        indeterminate?: string | boolean | number;
        label?: string | boolean | number;
        max?: string | boolean | number;
        value?: string | boolean | number;
    };
    'usa-progress-ring': {
        duration?: string | boolean | number;
        gradient?: string | boolean | number;
        max?: string | boolean | number;
        'no-label'?: string | boolean | number;
        value?: string | boolean | number;
        variant?: string | boolean | number;
    };
    'usa-prop-panel': {
        for?: string | boolean | number;
        label?: string | boolean | number;
        props?: string | boolean | number;
    };
    'usa-pull-cord': {
        label?: string | boolean | number;
        threshold?: string | boolean | number;
    };
    'usa-pull-refresh': {
        disabled?: string | boolean | number;
        label?: string | boolean | number;
        threshold?: string | boolean | number;
    };
    'usa-radar': {
        label?: string | boolean | number;
        rings?: string | boolean | number;
        speed?: string | boolean | number;
        targets?: string | boolean | number;
    };
    'usa-reactions': {
        counts?: string | boolean | number;
        emojis?: string | boolean | number;
        picker?: string | boolean | number;
    };
    'usa-red-envelope': {
        amount?: string | boolean | number;
        currency?: string | boolean | number;
        from?: string | boolean | number;
        message?: string | boolean | number;
        opened?: string | boolean | number;
    };
    'usa-retro-button': {
        disabled?: string | boolean | number;
        type?: string | boolean | number;
        variant?: string | boolean | number;
    };
    'usa-reveal': {
        delay?: string | boolean | number;
        distance?: string | boolean | number;
        duration?: string | boolean | number;
        easing?: string | boolean | number;
        effect?: string | boolean | number;
        repeat?: string | boolean | number;
        'root-margin'?: string | boolean | number;
        threshold?: string | boolean | number;
    };
    'usa-ripple': {
        centered?: string | boolean | number;
        color?: string | boolean | number;
        disabled?: string | boolean | number;
        duration?: string | boolean | number;
        opacity?: string | boolean | number;
    };
    'usa-rive': {
        animation?: string | boolean | number;
        artboard?: string | boolean | number;
        autoplay?: string | boolean | number;
        fit?: string | boolean | number;
        label?: string | boolean | number;
        'runtime-src'?: string | boolean | number;
        src?: string | boolean | number;
        'state-machine'?: string | boolean | number;
    };
    'usa-route-transition': {
        'cross-document'?: string | boolean | number;
        current?: string | boolean | number;
        effect?: string | boolean | number;
        engine?: string | boolean | number;
        history?: string | boolean | number;
        links?: string | boolean | number;
        selector?: string | boolean | number;
    };
    'usa-scene': {
        autoplay?: string | boolean | number;
        camera?: string | boolean | number;
        strength?: string | boolean | number;
    };
    'usa-scramble': {
        chars?: string | boolean | number;
        duration?: string | boolean | number;
        text?: string | boolean | number;
        trigger?: string | boolean | number;
    };
    'usa-scroll-highlight': {
        color?: string | boolean | number;
        dim?: string | boolean | number;
        mode?: string | boolean | number;
        text?: string | boolean | number;
    };
    'usa-scroll-progress': {
        label?: string | boolean | number;
        target?: string | boolean | number;
    };
    'usa-scroll-ring': {
        'back-to-top'?: string | boolean | number;
        engine?: string | boolean | number;
        for?: string | boolean | number;
        horizontal?: string | boolean | number;
        label?: string | boolean | number;
        preview?: string | boolean | number;
        size?: string | boolean | number;
        thickness?: string | boolean | number;
    };
    'usa-scroll-scene': {
        end?: string | boolean | number;
        markers?: string | boolean | number;
        pin?: string | boolean | number;
        preview?: string | boolean | number;
        scrub?: string | boolean | number;
        stagger?: string | boolean | number;
        start?: string | boolean | number;
        'toggle-class'?: string | boolean | number;
    };
    'usa-scrolly': {
        offset?: string | boolean | number;
    };
    'usa-segmented': {
        label?: string | boolean | number;
        value?: string | boolean | number;
        variant?: string | boolean | number;
    };
    'usa-shader': {};
    'usa-shader-backdrop': {
        colors?: string | boolean | number;
        intensity?: string | boolean | number;
        label?: string | boolean | number;
        post?: string | boolean | number;
        preset?: string | boolean | number;
        speed?: string | boolean | number;
    };
    'usa-sheet': {
        label?: string | boolean | number;
        persistent?: string | boolean | number;
        side?: string | boolean | number;
    };
    'usa-shimmer-text': {
        angle?: string | boolean | number;
        color?: string | boolean | number;
        duration?: string | boolean | number;
        shine?: string | boolean | number;
    };
    'usa-shortcut': {
        for?: string | boolean | number;
        keys?: string | boolean | number;
        label?: string | boolean | number;
        listen?: string | boolean | number;
    };
    'usa-skeleton': {
        avatar?: string | boolean | number;
        circle?: string | boolean | number;
        height?: string | boolean | number;
        lines?: string | boolean | number;
        loading?: string | boolean | number;
        radius?: string | boolean | number;
        width?: string | boolean | number;
    };
    'usa-skeleton-reveal': {
        loading?: string | boolean | number;
        variant?: string | boolean | number;
    };
    'usa-sketch-chart': {
        color?: string | boolean | number;
        label?: string | boolean | number;
        labels?: string | boolean | number;
        type?: string | boolean | number;
        values?: string | boolean | number;
    };
    'usa-slider': {
        disabled?: string | boolean | number;
        label?: string | boolean | number;
        max?: string | boolean | number;
        min?: string | boolean | number;
        step?: string | boolean | number;
        value?: string | boolean | number;
    };
    'usa-smooth-scroll': {
        anchors?: string | boolean | number;
        duration?: string | boolean | number;
        ease?: string | boolean | number;
        horizontal?: string | boolean | number;
        lerp?: string | boolean | number;
        offset?: string | boolean | number;
        preview?: string | boolean | number;
        touch?: string | boolean | number;
        'wheel-multiplier'?: string | boolean | number;
        wrapper?: string | boolean | number;
    };
    'usa-snap-carousel': {
        align?: string | boolean | number;
        autoplay?: string | boolean | number;
        gap?: string | boolean | number;
        index?: string | boolean | number;
        label?: string | boolean | number;
        'no-controls'?: string | boolean | number;
        'no-dots'?: string | boolean | number;
    };
    'usa-sparkline': {
        color?: string | boolean | number;
        label?: string | boolean | number;
        values?: string | boolean | number;
        variant?: string | boolean | number;
    };
    'usa-spatial-card': {};
    'usa-spinner': {
        kind?: string | boolean | number;
        label?: string | boolean | number;
        size?: string | boolean | number;
    };
    'usa-splash': {
        exit?: string | boolean | number;
        label?: string | boolean | number;
        manual?: string | boolean | number;
        min?: string | boolean | number;
    };
    'usa-split-text': {
        by?: string | boolean | number;
        delay?: string | boolean | number;
        duration?: string | boolean | number;
        from?: string | boolean | number;
        repeat?: string | boolean | number;
        stagger?: string | boolean | number;
        text?: string | boolean | number;
        trigger?: string | boolean | number;
    };
    'usa-spotlight': {
        border?: string | boolean | number;
        color?: string | boolean | number;
        size?: string | boolean | number;
    };
    'usa-spring': {
        damping?: string | boolean | number;
        delay?: string | boolean | number;
        duration?: string | boolean | number;
        effect?: string | boolean | number;
        mass?: string | boolean | number;
        preset?: string | boolean | number;
        repeat?: string | boolean | number;
        stiffness?: string | boolean | number;
        trigger?: string | boolean | number;
    };
    'usa-stagger': {
        delay?: string | boolean | number;
        distance?: string | boolean | number;
        duration?: string | boolean | number;
        easing?: string | boolean | number;
        effect?: string | boolean | number;
        interval?: string | boolean | number;
        repeat?: string | boolean | number;
        threshold?: string | boolean | number;
    };
    'usa-star-rating': {
        icon?: string | boolean | number;
        label?: string | boolean | number;
        max?: string | boolean | number;
        readonly?: string | boolean | number;
        step?: string | boolean | number;
        value?: string | boolean | number;
    };
    'usa-stepper': {
        clickable?: string | boolean | number;
        label?: string | boolean | number;
        orientation?: string | boolean | number;
    };
    'usa-sticky-stack': {
        gap?: string | boolean | number;
        scale?: string | boolean | number;
        top?: string | boolean | number;
    };
    'usa-sticky-wall': {
        label?: string | boolean | number;
        seed?: string | boolean | number;
    };
    'usa-stories': {
        duration?: string | boolean | number;
        loop?: string | boolean | number;
    };
    'usa-story': {
        label?: string | boolean | number;
        template?: string | boolean | number;
        zoom?: string | boolean | number;
    };
    'usa-suggestion-chips': {
        dismiss?: string | boolean | number;
        items?: string | boolean | number;
        label?: string | boolean | number;
    };
    'usa-swipe-deck': {
        label?: string | boolean | number;
        threshold?: string | boolean | number;
    };
    'usa-swipeable': {
        axis?: string | boolean | number;
        disabled?: string | boolean | number;
        dismiss?: string | boolean | number;
        distance?: string | boolean | number;
        preset?: string | boolean | number;
    };
    'usa-switch': {
        disabled?: string | boolean | number;
        label?: string | boolean | number;
        name?: string | boolean | number;
        value?: string | boolean | number;
        variant?: string | boolean | number;
    };
    'usa-tab-bar': {
        indicator?: string | boolean | number;
        label?: string | boolean | number;
        selected?: string | boolean | number;
    };
    'usa-tabs': {
        indicator?: string | boolean | number;
    };
    'usa-terminal': {
        loop?: string | boolean | number;
        prompt?: string | boolean | number;
        speed?: string | boolean | number;
        theme?: string | boolean | number;
        title?: string | boolean | number;
    };
    'usa-text-rotate': {
        effect?: string | boolean | number;
        interval?: string | boolean | number;
        paused?: string | boolean | number;
        words?: string | boolean | number;
    };
    'usa-text-splitter': {
        duration?: string | boolean | number;
        effect?: string | boolean | number;
        loop?: string | boolean | number;
        split?: string | boolean | number;
        stagger?: string | boolean | number;
        trigger?: string | boolean | number;
    };
    'usa-theme-surface': {
        theme?: string | boolean | number;
    };
    'usa-theme-switcher': {
        label?: string | boolean | number;
        persist?: string | boolean | number;
        target?: string | boolean | number;
        themes?: string | boolean | number;
        value?: string | boolean | number;
    };
    'usa-tilt': {
        disabled?: string | boolean | number;
        glare?: string | boolean | number;
        max?: string | boolean | number;
        perspective?: string | boolean | number;
        reverse?: string | boolean | number;
        scale?: string | boolean | number;
    };
    'usa-timeline': {
        duration?: string | boolean | number;
        overlap?: string | boolean | number;
        repeat?: string | boolean | number;
        scrub?: string | boolean | number;
        smooth?: string | boolean | number;
        stagger?: string | boolean | number;
        trigger?: string | boolean | number;
    };
    'usa-tip': {
        delay?: string | boolean | number;
        placement?: string | boolean | number;
        text?: string | boolean | number;
        trigger?: string | boolean | number;
    };
    'usa-title-sequence': {};
    'usa-toast-stack': {
        duration?: string | boolean | number;
        max?: string | boolean | number;
        position?: string | boolean | number;
    };
    'usa-toaster': {
        label?: string | boolean | number;
        max?: string | boolean | number;
        position?: string | boolean | number;
    };
    'usa-token-editor': {
        apply?: string | boolean | number;
        format?: string | boolean | number;
        groups?: string | boolean | number;
        label?: string | boolean | number;
    };
    'usa-typewriter': {
        delay?: string | boolean | number;
        'delete-speed'?: string | boolean | number;
        loop?: string | boolean | number;
        pause?: string | boolean | number;
        speed?: string | boolean | number;
        start?: string | boolean | number;
        text?: string | boolean | number;
        words?: string | boolean | number;
    };
    'usa-upload-progress': {
        message?: string | boolean | number;
        name?: string | boolean | number;
        size?: string | boolean | number;
        status?: string | boolean | number;
        value?: string | boolean | number;
    };
    'usa-video-card': {
        duration?: string | boolean | number;
        label?: string | boolean | number;
    };
    'usa-view-switch': {
        active?: string | boolean | number;
        duration?: string | boolean | number;
        effect?: string | boolean | number;
    };
    'usa-voice-button': {
        bars?: string | boolean | number;
        label?: string | boolean | number;
        listening?: string | boolean | number;
    };
    'usa-volume-knob': {
        label?: string | boolean | number;
        max?: string | boolean | number;
        min?: string | boolean | number;
    };
    'usa-water-ripple': {
        color?: string | boolean | number;
        damping?: string | boolean | number;
        strength?: string | boolean | number;
    };
    'usa-wave-text': {
        amplitude?: string | boolean | number;
        speed?: string | boolean | number;
        stagger?: string | boolean | number;
        text?: string | boolean | number;
    };
    'usa-weather-card': {
        condition?: string | boolean | number;
        label?: string | boolean | number;
        place?: string | boolean | number;
        temp?: string | boolean | number;
        unit?: string | boolean | number;
    };
    'usa-worker-canvas': {
        label?: string | boolean | number;
        scene?: string | boolean | number;
    };
    'usa-xp-bar': {
        level?: string | boolean | number;
        per?: string | boolean | number;
        xp?: string | boolean | number;
    };
}
/** Every shipped `<usa-*>` tag. */
type WithMoNames<T> = T & {
    [K in keyof T as K extends `usa-${infer Name}` ? `mo-${Name}` : never]: T[K];
};
type UsaElementAttributeMap = WithMoNames<LegacyAttributes>;
type UsaElementTag = keyof UsaElementAttributeMap;

/** The `mo-*` alias of a default `usa-*` tag (`usa-switch` → `mo-switch`), or `null` for any other tag. */
declare const aliasTag: (tag: string) => string | null;
/** Return a copy of the stylesheet with public tag selectors. */
declare const aliasCss: (text: string) => string;
/**
 * Turn on the `<mo-*>` names: every `usa-*` element defined from now on gets its `mo-*` alias, and so do the default
 * components already defined and any `usa-*` definition behind a `<mo-*>` element already on the page. Idempotent.
 */
declare function defineMoAliases(): void;

type LegacyTag = Extract<UsaElementTag, `usa-${string}`>;
type PublicDomElements = {
    [K in LegacyTag as K extends `usa-${infer Name}` ? `mo-${Name}` : never]: K extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[K] : HTMLElement;
};
declare global {
    interface HTMLElementTagNameMap extends PublicDomElements {
    }
}

export { aliasCss, aliasTag, defineMoAliases };
