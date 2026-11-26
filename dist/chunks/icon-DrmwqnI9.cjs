'use strict';

var base = require('./base-DzZEJhQB.cjs');
var moName = require('./mo-name-DR9ysd5S.cjs');
var kit = require('./kit-CujTUbPK.cjs');

/**
 * The built-in icon set: 753 original line icons drawn on a 24 × 24 grid with a 2px round stroke, grouped in
 * 34 categories (17.14 drew the first 253 in 14 categories; 17.15 and 17.17 each added 250 more in 10 new ones). Each icon is a short list of shapes separated by `;`:
 *
 * - `c cx cy r` is a circle,
 * - `r x y width height [radius]` is a rectangle,
 * - anything else is SVG path data.
 *
 * `iconParts()` turns one into element descriptions, `iconSvg()` into markup, and `searchIcons()` filters the set.
 * The shapes carry no colour: they are stroked with `currentColor`, so an icon takes the colour of its text.
 */
/** Categories in display order, with English and Chinese names. */
const ICON_CATEGORIES = [
    { id: 'arrows', en: 'Arrows', zh: '箭头' },
    { id: 'interface', en: 'Interface', zh: '界面' },
    { id: 'media', en: 'Media', zh: '媒体' },
    { id: 'files', en: 'Files', zh: '文件' },
    { id: 'communication', en: 'Communication', zh: '沟通' },
    { id: 'devices', en: 'Devices', zh: '设备' },
    { id: 'weather', en: 'Weather', zh: '天气' },
    { id: 'commerce', en: 'Commerce', zh: '商业' },
    { id: 'editor', en: 'Editor', zh: '编辑' },
    { id: 'travel', en: 'Maps & travel', zh: '地图出行' },
    { id: 'people', en: 'People', zh: '人物' },
    { id: 'nature', en: 'Nature', zh: '自然' },
    { id: 'shapes', en: 'Shapes', zh: '形状' },
    { id: 'time', en: 'Time', zh: '时间' },
    { id: 'development', en: 'Development', zh: '开发' },
    { id: 'security', en: 'Security', zh: '安全' },
    { id: 'health', en: 'Health', zh: '健康' },
    { id: 'food', en: 'Food & drink', zh: '餐饮' },
    { id: 'household', en: 'Household', zh: '家居' },
    { id: 'sports', en: 'Sports', zh: '运动' },
    { id: 'education', en: 'Education', zh: '教育' },
    { id: 'finance', en: 'Finance', zh: '金融' },
    { id: 'charts', en: 'Charts & data', zh: '图表' },
    { id: 'tools', en: 'Tools', zh: '工具' },
    { id: 'animals', en: 'Animals', zh: '动物' },
    { id: 'music', en: 'Music', zh: '音乐' },
    { id: 'gaming', en: 'Games', zh: '游戏' },
    { id: 'transport', en: 'Transport', zh: '交通' },
    { id: 'office', en: 'Office', zh: '办公' },
    { id: 'science', en: 'Science', zh: '科学' },
    { id: 'buildings', en: 'Buildings', zh: '建筑' },
    { id: 'celebration', en: 'Celebration', zh: '节庆' },
    { id: 'clothing', en: 'Clothing', zh: '服饰' },
    { id: 'gestures', en: 'Gestures', zh: '手势' },
];
const FILE = 'M6 2h8l5 5v15H6z;M14 2v5h5';
const FOLDER = 'M3 6a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z';
const BUBBLE = 'M6 5h13a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-5 4V7a2 2 0 0 1 2-2z';
const PHONE = 'M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z';
const CLOUD_TOP = 'M7 14a4.5 4.5 0 0 1-.5-9A6 6 0 0 1 17.5 6 4 4 0 0 1 17 14z';
const PERSON = 'c10 8 4;M2 21a8 8 0 0 1 14.7-4.4';
const FACE = 'c12 12 9;M9 9.5h.5;M14.5 9.5h.5';
const CAL = 'r3 5 18 16 2;M3 10h18;M8 3v4;M16 3v4';
const VIDEO = 'r2 6 13 12 2;M15 10l6-3v10l-6-3';
const SHIELD = 'M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z';
const RECEIPT_EDGE = 'M5 2h14v20l-3-2-2 2-2-2-2 2-2-2-3 2z';
const SCAN_CORNERS = 'M3 8V5a2 2 0 0 1 2-2h3;M16 3h3a2 2 0 0 1 2 2v3;M21 16v3a2 2 0 0 1-2 2h-3;M8 21H5a2 2 0 0 1-2-2v-3';
const AXES = 'M3 3v18h18';
/** A pointing hand, shared by the touch gestures. */
const POINT = 'M10 14V5a1.5 1.5 0 0 1 3 0v6l4 1a2 2 0 0 1 2 2v3a5 5 0 0 1-5 5h-1a5 5 0 0 1-4-2l-3-4a1.5 1.5 0 0 1 2-2z';
/** Every icon by category; names are unique across the whole set. */
const ICON_GROUPS = {
    arrows: {
        'arrow-up': 'M12 19V5;M6 11l6-6 6 6',
        'arrow-down': 'M12 5v14;M6 13l6 6 6-6',
        'arrow-left': 'M19 12H5;M11 6l-6 6 6 6',
        'arrow-right': 'M5 12h14;M13 6l6 6-6 6',
        'arrow-up-right': 'M7 17L17 7;M8 7h9v9',
        'arrow-up-left': 'M17 17L7 7;M16 7H7v9',
        'arrow-down-right': 'M7 7l10 10;M17 8v9H8',
        'arrow-down-left': 'M17 7L7 17;M7 8v9h9',
        'chevron-up': 'M6 15l6-6 6 6',
        'chevron-down': 'M6 9l6 6 6-6',
        'chevron-left': 'M15 6l-6 6 6 6',
        'chevron-right': 'M9 6l6 6-6 6',
        'chevrons-up': 'M7 12l5-5 5 5;M7 18l5-5 5 5',
        'chevrons-down': 'M7 6l5 5 5-5;M7 12l5 5 5-5',
        'chevrons-left': 'M12 7l-5 5 5 5;M18 7l-5 5 5 5',
        'chevrons-right': 'M6 7l5 5-5 5;M12 7l5 5-5 5',
        refresh: 'M20 11a8 8 0 0 0-14.3-4.9L4 8;M4 3v5h5;M4 13a8 8 0 0 0 14.3 4.9L20 16;M20 21v-5h-5',
        'rotate-cw': 'M21 12a9 9 0 1 1-3-6.7;M21 3v6h-6',
        'rotate-ccw': 'M3 12a9 9 0 1 0 3-6.7;M3 3v6h6',
        swap: 'M7 4L3 8l4 4;M3 8h14;M17 12l4 4-4 4;M21 16H7',
        expand: 'M15 3h6v6;M9 21H3v-6;M21 3l-7 7;M3 21l7-7',
        shrink: 'M4 14h6v6;M20 10h-6V4;M14 10l7-7;M3 21l7-7',
        move: 'M12 2v20;M2 12h20;M9 5l3-3 3 3;M9 19l3 3 3-3;M5 9l-3 3 3 3;M19 9l3 3-3 3',
        enter: 'M20 4v7a4 4 0 0 1-4 4H4;M9 10l-5 5 5 5',
    },
    interface: {
        menu: 'M4 6h16;M4 12h16;M4 18h16',
        close: 'M6 6l12 12;M18 6L6 18',
        plus: 'M12 5v14;M5 12h14',
        minus: 'M5 12h14',
        check: 'M5 12.5l4.5 4.5L19 7',
        search: 'c11 11 7;M20 20l-4-4',
        settings: 'M18.7 9.9L21.4 10.4L21.4 13.6L18.7 14.1L18.2 15.3L19.8 17.5L17.5 19.8L15.3 18.2L14.1 18.7L13.6 21.4L10.4 21.4L9.9 18.7L8.7 18.2L6.5 19.8L4.2 17.5L5.8 15.3L5.3 14.1L2.6 13.6L2.6 10.4L5.3 9.9L5.8 8.7L4.2 6.5L6.5 4.2L8.7 5.8L9.9 5.3L10.4 2.6L13.6 2.6L14.1 5.3L15.3 5.8L17.5 4.2L19.8 6.5L18.2 8.7z;c12 12 3',
        home: 'M3 11l9-8 9 8;M5 9.5V21h14V9.5;M10 21v-6h4v6',
        bell: 'M6 16v-5a6 6 0 0 1 12 0v5l2 2H4z;M10 21h4',
        heart: 'M12 20s-8-4.7-8-10.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 8 2.5C20 15.3 12 20 12 20z',
        star: 'M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9z',
        bookmark: 'M6 3h12v18l-6-4-6 4z',
        trash: 'M4 7h16;M9 7V4h6v3;M6 7l1 14h10l1-14;M10 11v6;M14 11v6',
        edit: 'M4 20h4L19 9l-4-4L4 16z;M13.5 6.5l4 4',
        lock: 'r5 11 14 10 2;M8 11V7a4 4 0 0 1 8 0v4',
        unlock: 'r5 11 14 10 2;M8 11V7a4 4 0 0 1 7.7-1.5',
        eye: 'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z;c12 12 3',
        'eye-off': 'M3 3l18 18;M10.6 6.1A9.6 9.6 0 0 1 12 6c6.4 0 10 6 10 6a17 17 0 0 1-2.9 3.5;M6.6 6.6C3.7 8.3 2 12 2 12s3.6 6 10 6a9.3 9.3 0 0 0 4.4-1.1;M9.9 9.9a3 3 0 0 0 4.2 4.2',
        info: 'c12 12 9;M12 11v6;M12 7.5v.5',
        alert: 'M12 3L2 20h20z;M12 10v4;M12 17v.5',
        help: 'c12 12 9;M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6;M12 17v.5',
        filter: 'M3 5h18l-7 8v6l-4 2v-8z',
        sliders: 'M4 6h10;M18 6h2;c16 6 2;M4 12h2;M10 12h10;c8 12 2;M4 18h11;c17 18 2;M19 18h1',
        grid: 'r4 4 6 6 1;r14 4 6 6 1;r4 14 6 6 1;r14 14 6 6 1',
        list: 'M9 6h11;M9 12h11;M9 18h11;M4 6h.5;M4 12h.5;M4 18h.5',
        'more-horizontal': 'c5 12 1;c12 12 1;c19 12 1',
        'more-vertical': 'c12 5 1;c12 12 1;c12 19 1',
        'external-link': 'M14 4h6v6;M20 4l-9 9;M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5',
        link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1;M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
        logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4;M16 17l5-5-5-5;M21 12H9',
        login: 'M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4;M10 17l5-5-5-5;M15 12H3',
        toggle: 'r2 7 20 10 5;c17 12 3',
        power: 'M12 3v9;M6.3 6.3a8 8 0 1 0 11.4 0',
    },
    media: {
        play: 'M7 4l13 8-13 8z',
        pause: 'r6 4 4 16 1;r14 4 4 16 1',
        stop: 'r5 5 14 14 2',
        'skip-forward': 'M5 5l10 7-10 7z;M19 5v14',
        'skip-back': 'M19 5L9 12l10 7z;M5 5v14',
        'fast-forward': 'M3 6l8 6-8 6z;M12 6l8 6-8 6z',
        rewind: 'M21 6l-8 6 8 6z;M12 6l-8 6 8 6z',
        shuffle: 'M3 7h3c5 0 7 10 12 10h3;M3 17h3c2 0 3.3-1.6 4.5-3.5;M13.5 9.5C14.7 7.6 16 7 18 7h3;M18 4l3 3-3 3;M18 14l3 3-3 3',
        repeat: 'M17 2l3 3-3 3;M4 11V9a4 4 0 0 1 4-4h12;M7 22l-3-3 3-3;M20 13v2a4 4 0 0 1-4 4H4',
        volume: 'M4 9h4l5-4v14l-5-4H4z;M16.5 8.5a5 5 0 0 1 0 7;M19 6a8.5 8.5 0 0 1 0 12',
        'volume-mute': 'M4 9h4l5-4v14l-5-4H4z;M17 9l5 6;M22 9l-5 6',
        mic: 'r9 3 6 11 3;M5 11a7 7 0 0 0 14 0;M12 18v3;M9 21h6',
        camera: 'M3 8a2 2 0 0 1 2-2h2.5L9 4h6l1.5 2H19a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z;c12 13 3.5',
        video: VIDEO,
        image: 'r3 4 18 16 2;c8.5 9.5 1.5;M21 16l-5-5-9 9',
        film: 'r3 3 18 18 2;M7 3v18;M17 3v18;M3 8h4;M3 16h4;M17 8h4;M17 16h4;M7 12h10',
        music: 'M9 18V5l11-2v13;c6 18 3;c17 16 3',
        headphones: 'M4 18v-6a8 8 0 0 1 16 0v6;r3 14 4 7 1.5;r17 14 4 7 1.5',
        radio: 'r3 8 18 12 2;M7 8l9-5;c15 14 3;M6 12h3;M6 16h3',
        disc: 'c12 12 9;c12 12 2.5',
        tv: 'r2 6 20 13 2;M8 22h8;M8 2l4 4 4-4',
        cast: 'M3 16a5 5 0 0 1 5 5;M3 12a9 9 0 0 1 9 9;M3 8V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-5;M3 20h.5',
    },
    files: {
        file: FILE,
        'file-text': `${FILE};M9 12h6;M9 16h6;M9 8h2`,
        'file-plus': `${FILE};M12 11v6;M9 14h6`,
        'file-minus': `${FILE};M9 14h6`,
        'file-check': `${FILE};M9 15l2 2 4-4`,
        'file-code': `${FILE};M10 12l-2 2 2 2;M14 12l2 2-2 2`,
        folder: FOLDER,
        'folder-open': 'M3 19V6a1 1 0 0 1 1-1h5l2 2h7a1 1 0 0 1 1 1v2;M3 19l3-8h16l-3 8z',
        'folder-plus': `${FOLDER};M12 11v6;M9 14h6`,
        archive: 'r3 4 18 4 1;M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8;M10 12h4',
        clipboard: 'r8 2 8 4 1;M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2',
        copy: 'r8 8 13 13 2;M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3',
        download: 'M12 3v12;M7 10l5 5 5-5;M4 21h16',
        upload: 'M12 16V4;M7 9l5-5 5 5;M4 20h16',
        save: 'M5 3h11l5 5v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z;M7 3v5h8;M7 21v-7h10v7',
        paperclip: 'M20 11l-8.5 8.5a5 5 0 0 1-7-7L13 4a3.5 3.5 0 0 1 5 5l-8.5 8.5a2 2 0 0 1-2.8-2.8L15 7',
        database: 'M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3z;M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6;M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3',
        inbox: 'M3 13h5l1.5 3h5L16 13h5;M5.5 5h13L21 13v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6z',
    },
    communication: {
        mail: 'r3 5 18 14 2;M3 7l9 6 9-6',
        'mail-open': 'M3 10l9-6 9 6v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z;M3 10l9 6 9-6',
        send: 'M21 3L10 14;M21 3l-7 18-4-7-7-4z',
        message: BUBBLE,
        'message-dots': `${BUBBLE};c9 11.5 1;c12.5 11.5 1;c16 11.5 1`,
        messages: 'M15 4H5a2 2 0 0 0-2 2v8l3-3h9a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z;M17 9h2a2 2 0 0 1 2 2v9l-3-3h-7a2 2 0 0 1-2-2v-1',
        phone: PHONE,
        'phone-call': `${PHONE};M15 3a6 6 0 0 1 6 6;M15 7a2 2 0 0 1 2 2`,
        'video-call': `${VIDEO};c8.5 11 2;M5 16a4 4 0 0 1 7 0`,
        at: 'c12 12 4;M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8',
        share: 'c18 5 3;c6 12 3;c18 19 3;M8.6 10.5l6.8-4;M8.6 13.5l6.8 4',
        rss: 'M4 11a9 9 0 0 1 9 9;M4 4a16 16 0 0 1 16 16;c5 19 1',
        megaphone: 'M3 10v4a1 1 0 0 0 1 1h3l9 5V4L7 9H4a1 1 0 0 0-1 1z;M7 15l1.5 5h3L10 15.5;M19 9.5a3 3 0 0 1 0 5',
        broadcast: 'c12 12 2;M7.8 7.8a6 6 0 0 0 0 8.4;M16.2 16.2a6 6 0 0 0 0-8.4;M5 5a10 10 0 0 0 0 14;M19 19a10 10 0 0 0 0-14',
        reply: 'M9 14L4 9l5-5;M4 9h10a6 6 0 0 1 6 6v5',
        forward: 'M15 14l5-5-5-5;M20 9H10a6 6 0 0 0-6 6v5',
        hash: 'M5 9h15;M4 15h15;M10 3L8 21;M16 3l-2 18',
        voicemail: 'c6 12 4;c18 12 4;M6 16h12',
        translate: 'M3 5h9;M7.5 3v2;M10 5c0 4-3 7-6 8;M5.5 9c1 2 3 3.5 5 4;M13 21l4-9 4 9;M14.5 18h5',
    },
    devices: {
        monitor: 'r2 3 20 14 2;M8 21h8;M12 17v4',
        laptop: 'r4 4 16 11 1.5;M2 19h20',
        smartphone: 'r6 2 12 20 2;M11 18h2',
        tablet: 'r4 2 16 20 2;M11 18.5h2',
        watch: 'r7 6 10 12 3;M9 6l1-3h4l1 3;M9 18l1 3h4l1-3;M12 10v2l1.5 1.5',
        keyboard: 'r2 6 20 12 2;M6 10h.5;M10 10h.5;M14 10h.5;M18 10h.5;M7 14h10',
        mouse: 'r6 3 12 18 6;M12 7v4',
        printer: 'M6 9V3h12v6;r3 9 18 8 2;M6 14h12v7H6z',
        server: 'r3 3 18 8 2;r3 13 18 8 2;M7 7h.5;M7 17h.5',
        cpu: 'r6 6 12 12 2;r9 9 6 6;M9 2v4;M15 2v4;M9 18v4;M15 18v4;M2 9h4;M2 15h4;M18 9h4;M18 15h4',
        battery: 'r2 7 17 10 2;M22 11v2;M5 10v4;M8 10v4',
        'battery-charging': 'r2 7 17 10 2;M22 11v2;M11 9l-2 3h3l-2 3',
        wifi: 'M2 8.5a15 15 0 0 1 20 0;M5 12a10 10 0 0 1 14 0;M8.5 15.5a5 5 0 0 1 7 0;M12 19h.5',
        bluetooth: 'M7 7l10 10-5 4V3l5 4L7 17',
        usb: 'c12 19 2.5;M12 16.5V3;M9 6l3-3 3 3;M12 13L7 10V8;M12 11l5-3V6',
        gamepad: 'M7 7h10a5 5 0 0 1 4.9 6l-.8 4a2.5 2.5 0 0 1-4.3 1.2L14.5 16h-5l-2.3 2.2A2.5 2.5 0 0 1 2.9 17l-.8-4A5 5 0 0 1 7 7z;M7 10v4;M5 12h4;M16 11h.5;M18 13h.5',
        speaker: 'r5 2 14 20 2;c12 14 4;M12 6h.5',
        'hard-drive': 'r2 13 20 7 2;M2 15L5.5 5h13L22 15;M6 16.5h.5;M10 16.5h.5',
        plug: 'M9 2v5;M15 2v5;M6 7h12v4a6 6 0 0 1-12 0z;M12 17v5',
    },
    weather: {
        sun: 'c12 12 4;M12 2v2;M12 20v2;M2 12h2;M20 12h2;M4.9 4.9l1.4 1.4;M17.7 17.7l1.4 1.4;M4.9 19.1l1.4-1.4;M17.7 6.3l1.4-1.4',
        moon: 'M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z',
        cloud: 'M7 19a5 5 0 0 1-.6-10A6.5 6.5 0 0 1 18.5 9 4.5 4.5 0 0 1 18 19z',
        'cloud-rain': `${CLOUD_TOP};M8 17l-1 3;M12 17l-1 3;M16 17l-1 3`,
        'cloud-snow': `${CLOUD_TOP};M8 18h.5;M12 18h.5;M16 18h.5;M10 21h.5;M14 21h.5`,
        'cloud-lightning': `${CLOUD_TOP};M13 14l-3 4h4l-3 4`,
        'cloud-drizzle': `${CLOUD_TOP};M8 17v1;M8 21v1;M12 18v1;M16 17v1;M16 21v1`,
        'cloud-sun': 'c9 8 3;M9 2v1;M3 8h1;M4.8 3.8l.7.7;M13.2 3.8l-.7.7;M10 20a4 4 0 0 1-.4-8 5.5 5.5 0 0 1 10.4 1.5 3.3 3.3 0 0 1-.5 6.5z',
        wind: 'M3 8h11a3 3 0 1 0-3-3;M3 12h16a3 3 0 1 1-3 3;M3 16h7',
        umbrella: 'M3 12a9 9 0 0 1 18 0z;M12 12v7a2 2 0 0 0 4 0;M12 3V2',
        snowflake: 'M12 2v20;M3.3 7l17.4 10;M3.3 17L20.7 7;M9 4l3 2 3-2;M9 20l3-2 3 2',
        thermometer: 'M14 14.8V4a2 2 0 0 0-4 0v10.8a4 4 0 1 0 4 0z;M12 9v8',
        droplet: 'M12 3s7 7 7 12a7 7 0 0 1-14 0c0-5 7-12 7-12z',
        sunrise: 'M5 18a7 7 0 0 1 14 0;M2 18h20;M12 3v6;M9 6l3-3 3 3;M4.2 10.2l1.4 1.4;M18.4 11.6l1.4-1.4;M5 22h14',
        sunset: 'M5 18a7 7 0 0 1 14 0;M2 18h20;M12 3v6;M9 6l3 3 3-3;M4.2 10.2l1.4 1.4;M18.4 11.6l1.4-1.4;M5 22h14',
        rainbow: 'M2 18a10 10 0 0 1 20 0;M6 18a6 6 0 0 1 12 0;M10 18a2 2 0 0 1 4 0',
        tornado: 'M3 4h18;M5 8h14;M7 12h10;M9 16h6;M11 20h2',
        zap: 'M13 2L4 14h7l-1 8 9-12h-7z',
    },
    commerce: {
        cart: 'c9 20 1.5;c18 20 1.5;M2 3h3l2.7 12.5a1 1 0 0 0 1 .8h9.6a1 1 0 0 0 1-.8L21 7H6',
        bag: 'M5 7h14l1 14H4z;M9 10V6a3 3 0 0 1 6 0v4',
        'credit-card': 'r2 5 20 14 2;M2 10h20;M6 15h4',
        wallet: 'M19 8V5H6a2 2 0 0 0 0 4h14v11H6a3 3 0 0 1-3-3V7;M16 14.5h.5',
        tag: 'M3 3h8l10 10-8 8L3 11z;c7.5 7.5 1.5',
        receipt: 'M5 2v20l2.5-1.5L10 22l2-1.5 2 1.5 2.5-1.5L19 22V2l-2.5 1.5L14 2l-2 1.5L10 2 7.5 3.5z;M9 8h6;M9 12h6;M9 16h3',
        gift: 'r3 8 18 4 1;M5 12v9h14v-9;M12 8v13;M12 8C10.5 4 7 4 7 6s2 2 5 2;M12 8c1.5-4 5-4 5-2s-2 2-5 2',
        store: 'M3 9l2-5h14l2 5;M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0;M5 12v9h14v-9;M10 21v-5h4v5',
        package: 'M12 2l9 5v10l-9 5-9-5V7z;M3 7l9 5 9-5;M12 12v10;M7.5 4.5l9 5',
        truck: 'M2 6h12v10H2z;M14 9h4l4 4v3h-8;c6 18 2;c17 18 2',
        dollar: 'M12 2v20;M17 6H9.5a3 3 0 0 0 0 6h5a3 3 0 0 1 0 6H6',
        percent: 'M19 5L5 19;c7 7 2.5;c17 17 2.5',
        coins: 'c8 9 5;c16 15 5',
        banknote: 'r2 6 20 12 2;c12 12 2.5;M6 12h.5;M18 12h.5',
        'bar-chart': 'M3 3v18h18;r7 12 3 6;r12 8 3 10;r17 5 3 13',
        'trending-up': 'M3 17l6-6 4 4 8-8;M15 7h6v6',
        'trending-down': 'M3 7l6 6 4-4 8 8;M15 17h6v-6',
        barcode: 'M3 7V4a1 1 0 0 1 1-1h3;M17 3h3a1 1 0 0 1 1 1v3;M21 17v3a1 1 0 0 1-1 1h-3;M7 21H4a1 1 0 0 1-1-1v-3;M7 8v8;M10 8v8;M13 8v8;M17 8v8',
    },
    editor: {
        bold: 'M7 4h6a4 4 0 0 1 0 8H7z;M7 12h7a4 4 0 0 1 0 8H7z',
        italic: 'M10 4h8;M6 20h8;M14 4l-4 16',
        underline: 'M6 3v7a6 6 0 0 0 12 0V3;M4 21h16',
        strikethrough: 'M4 12h16;M16 6.5A4 4 0 0 0 12 4h-1a3.5 3.5 0 0 0 0 7;M8 17.5a4 4 0 0 0 4 2.5h1a3.5 3.5 0 0 0 3.3-4.5',
        'align-left': 'M4 6h16;M4 10h10;M4 14h16;M4 18h10',
        'align-center': 'M4 6h16;M7 10h10;M4 14h16;M7 18h10',
        'align-right': 'M4 6h16;M10 10h10;M4 14h16;M10 18h10',
        heading: 'M6 4v16;M18 4v16;M6 12h12',
        quote: 'M4 17v-5a6 6 0 0 1 4-5.7;M4 12h4v5H4;M14 17v-5a6 6 0 0 1 4-5.7;M14 12h4v5h-4',
        code: 'M8 7l-5 5 5 5;M16 7l5 5-5 5',
        terminal: 'r2 4 20 16 2;M6 9l3 3-3 3;M12 15h5',
        type: 'M4 7V4h16v3;M12 4v16;M9 20h6',
        'list-ordered': 'M10 6h10;M10 12h10;M10 18h10;M4 5l1.5-1v5;M3.5 14.5a1.2 1.2 0 0 1 2.3.4c0 .8-2.3 2-2.3 3.1h2.5',
        undo: 'M9 14L4 9l5-5;M4 9h11a5 5 0 0 1 0 10h-4',
        redo: 'M15 14l5-5-5-5;M20 9H9a5 5 0 0 0 0 10h4',
        scissors: 'c6 6 3;c6 18 3;M8.1 8.1L20 20;M8.1 15.9L20 4',
        'pen-tool': 'M12 19l7-7 3 3-7 7z;M18 13l-1.5-7.5L2 2l3.5 14.5L13 18z;M2 2l7.6 7.6;c11 11 2',
        eraser: 'M8 20l-3.5-3.5a2 2 0 0 1 0-2.8l9-9a2 2 0 0 1 2.8 0l3.5 3.5a2 2 0 0 1 0 2.8L11 20z;M20 20h-9;M9.5 9l5.5 5.5',
    },
    travel: {
        'map-pin': 'M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z;c12 9.5 2.5',
        map: 'M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3z;M9 3v15;M15 6v15',
        compass: 'c12 12 9;M15.5 8.5l-2 5-5 2 2-5z',
        navigation: 'M3 11l18-8-8 18-2-8z',
        globe: 'c12 12 9;M3 12h18;M12 3a14 14 0 0 1 0 18;M12 3a14 14 0 0 0 0 18',
        plane: 'M21 12c0-1-1-1.5-2-1.5h-4.5L9 3H7l3 7.5H5.5L4 8.5H2.5l1 3.5-1 3.5H4l1.5-2H10L7 21h2l5.5-7.5H19c1 0 2-.5 2-1.5z',
        car: 'M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11;r3 11 18 6 2;c7.5 14 1;c16.5 14 1;M5 17v2;M19 17v2',
        bus: 'r4 3 16 15 2;M4 11h16;M8 18v3;M16 18v3;M8 14.5h.5;M15.5 14.5h.5;M8 7h8',
        train: 'r5 3 14 14 3;M5 10h14;M8 21l2-4;M16 21l-2-4;M9 13.5h.5;M14.5 13.5h.5',
        bike: 'c5.5 17 3.5;c18.5 17 3.5;M5.5 17l4-8h6l3 8;M9.5 9L8 6H6;M12 17l3.5-8;M15 6h2.5',
        anchor: 'c12 5 2;M12 7v14;M5 12H3a9 9 0 0 0 18 0h-2;M8 10h8',
        flag: 'M5 21V4;M5 4h11l-2 4 2 4H5',
        route: 'c6 19 2;c18 5 2;M8 19h8.5a3.5 3.5 0 0 0 0-7h-9a3.5 3.5 0 0 1 0-7H16',
        ticket: 'M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a3 3 0 0 0 0 6v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a3 3 0 0 0 0-6z;M14 5v2;M14 11v2;M14 17v2',
        luggage: 'r5 7 14 13 2;M9 7V4h6v3;M9 11v5;M15 11v5;M8 20v1.5;M16 20v1.5',
        building: 'M4 21V4a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v17;M15 9h4a1 1 0 0 1 1 1v11;M2 21h20;M8 7h3;M8 11h3;M8 15h3',
    },
    people: {
        user: 'c12 8 4;M4 21a8 8 0 0 1 16 0',
        users: 'c9 8 3.5;M2 20a7 7 0 0 1 14 0;M16 4.5a3.5 3.5 0 0 1 0 7;M19 13.5a7 7 0 0 1 3 6.5',
        'user-plus': `${PERSON};M19 14v6;M16 17h6`,
        'user-minus': `${PERSON};M16 17h6`,
        'user-check': `${PERSON};M16 18l2 2 4-4`,
        smile: `${FACE};M8 14a5 5 0 0 0 8 0`,
        frown: `${FACE};M8 16.5a5 5 0 0 1 8 0`,
        meh: `${FACE};M8 15h8`,
        'thumbs-up': 'M7 11v10H3V11z;M7 11l4-8a2.5 2.5 0 0 1 3 2.8L13.5 9H19a2 2 0 0 1 2 2.3l-1.2 7A2 2 0 0 1 17.8 20H7',
        'thumbs-down': 'M7 13V3H3v10z;M7 13l4 8a2.5 2.5 0 0 0 3-2.8L13.5 15H19a2 2 0 0 0 2-2.3l-1.2-7A2 2 0 0 0 17.8 4H7',
        hand: 'M8 13V5.5a1.5 1.5 0 0 1 3 0V11;M11 10.5v-7a1.5 1.5 0 0 1 3 0V11;M14 5.5a1.5 1.5 0 0 1 3 0V12;M17 8.5a1.5 1.5 0 0 1 3 0V15a7 7 0 0 1-7 7h-1.5a6 6 0 0 1-4.6-2.2L4 15.5a1.6 1.6 0 0 1 2.4-2.1L8 15',
        award: 'c12 9 6;M8.5 13.8L7 22l5-3 5 3-1.5-8.2',
    },
    nature: {
        leaf: 'M5 19c0-9 5-14 15-15-1 10-6 15-15 15z;M5 19l8-8',
        tree: 'M12 22v-6;M12 2L5 12h4l-3 4h12l-3-4h4z',
        flower: 'c12 4 2;c16 8 2;c12 12 2;c8 8 2;c12 8 1;M12 14v8;M12 18c2-2 4-2 5-2;M12 19c-2-2-4-2-5-2',
        mountain: 'M2 20L9 8l4 6 3-4 6 10z',
        sprout: 'M12 21v-9;M12 12C12 8 9 6 4 6c0 4 3 6 8 6z;M12 10c0-3 2-6 8-6 0 4-3 6-8 6',
        paw: 'c6 10 2;c10 6 2;c14 6 2;c18 10 2;M8 17c0-3 2-5 4-5s4 2 4 5a2.5 2.5 0 0 1-4 2 2.5 2.5 0 0 1-4-2z',
        fish: 'M21 12c-2.5 4-5.5 6-9 6-3 0-5.5-2-7.5-4L2 17V7l2.5 3C6.5 8 9 6 12 6c3.5 0 6.5 2 9 6z;M16 10.5h.5',
        bug: 'r8 7 8 13 4;M12 11v9;M9 7a3 3 0 0 1 6 0;M3 10l5 1;M21 10l-5 1;M3 17l5-2;M21 17l-5-2;M3 13.5h5;M16 13.5h5',
        feather: 'M20 4c-8 0-14 6-14 14v2l2-2h2c8 0 10-8 10-14z;M4 20l9-9',
        flame: 'M12 22a7 7 0 0 0 7-7c0-5-5-7-5-12-3 2-5 5-5 8-1-1-2-2-2-3-1 2-2 4-2 7a7 7 0 0 0 7 7z',
        planet: 'c12 12 6;M7 18.5C3.5 20.5 2 20.5 2 19.5c0-1 2-3.5 5-6;M17 5.5c3.5-2 5-2 5-1 0 1-2 3.5-5 6',
        sparkles: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z;M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z',
    },
    shapes: {
        circle: 'c12 12 9',
        square: 'r3 3 18 18 2',
        triangle: 'M12 3l10 18H2z',
        diamond: 'M12 2l10 10-10 10L2 12z',
        pentagon: 'M12 2l9.5 7-3.6 11H6.1L2.5 9z',
        hexagon: 'M12 2l8.7 5v10L12 22l-8.7-5V7z',
        octagon: 'M8 2h8l6 6v8l-6 6H8l-6-6V8z',
        cross: 'M9 3h6v6h6v6h-6v6H9v-6H3V9h6z',
        shield: 'M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z',
        crown: 'M3 8l4 4 5-7 5 7 4-4-2 11H5z;M5 21h14',
        infinity: 'M12 12c-2-2.7-4-4-6-4a4 4 0 0 0 0 8c2 0 4-1.3 6-4zm0 0c2 2.7 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.3-6 4z',
        target: 'c12 12 9;c12 12 5;c12 12 1',
        layers: 'M12 2l10 5-10 5L2 7z;M2 12l10 5 10-5;M2 17l10 5 10-5',
        cube: 'M12 2l9 5v10l-9 5-9-5V7z;M12 12l9-5;M12 12L3 7;M12 12v10',
        spiral: 'M12 12a1 1 0 0 1 1 1 2 2 0 0 1-2 2 3 3 0 0 1-3-3 4 4 0 0 1 4-4 5 5 0 0 1 5 5 6 6 0 0 1-6 6 7 7 0 0 1-7-7 8 8 0 0 1 8-8',
        pie: 'c12 12 9;M12 3v9h9',
    },
    time: {
        clock: 'c12 12 9;M12 7v5l3 2',
        alarm: 'c12 13 8;M12 9v4l2 2;M5 3L2 6;M19 3l3 3',
        calendar: CAL,
        'calendar-check': `${CAL};M9 15l2 2 4-4`,
        'calendar-days': `${CAL};M8 14h.5;M12 14h.5;M16 14h.5;M8 18h.5;M12 18h.5`,
        hourglass: 'M6 2h12;M6 22h12;M7 2v4l5 6-5 6v4;M17 2v4l-5 6 5 6v4',
        timer: 'c12 13 8;M12 13l3-3;M10 2h4;M12 2v3',
        history: 'M3 12a9 9 0 1 0 2.6-6.4L3 8;M3 3v5h5;M12 7v5l3 2',
    },
    development: {
        'git-branch': 'c6 5 2;c6 19 2;c18 7 2;M6 7v10;M18 9a6 6 0 0 1-6 6H6',
        'git-commit': 'c12 12 3;M3 12h6;M15 12h6',
        'git-merge': 'c6 5 2;c6 19 2;c18 14 2;M6 7v10;M6 9a6 6 0 0 0 6 5h4',
        'git-pull-request': 'c6 5 2;c6 19 2;c18 19 2;M6 7v10;M18 17V9a3 3 0 0 0-3-3h-4;M13 3l-3 3 3 3',
        'git-fork': 'c6 4 2;c18 4 2;c12 20 2;M6 6v2a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V6;M12 11v7',
        'git-compare': 'c6 18 2;c18 6 2;M6 16V9a3 3 0 0 1 3-3h4;M11 3l3 3-3 3;M18 8v7a3 3 0 0 1-3 3h-4;M13 21l-3-3 3-3',
        braces: 'M8 3H7a2 2 0 0 0-2 2v4a2 2 0 0 1-2 2 2 2 0 0 1 2 2v4a2 2 0 0 0 2 2h1;M16 3h1a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2 2 2 0 0 0-2 2v4a2 2 0 0 1-2 2h-1',
        brackets: 'M8 3H5v18h3;M16 3h3v18h-3',
        function: 'M9 20a3 3 0 0 0 3-3V7a3 3 0 0 1 3-3h1;M8 11h7',
        variable: 'M8 4c-3 3-3 13 0 16;M16 4c3 3 3 13 0 16;M10 9l4 6;M14 9l-4 6',
        api: 'r3 8 18 8 2;M7 14v-3a1 1 0 0 1 2 0v3;M7 12.5h2;M12 14v-4h1.5a1.5 1.5 0 0 1 0 3H12;M17 10v4',
        webhook: 'c6 17 2.5;c18 17 2.5;c12 6 2.5;M8.5 17h7;M7 15l4-6.5;M17 15l-4-6.5',
        regex: 'M17 3v10;M13 5.5l8 5;M21 5.5l-8 5;r3 16 5 5 1',
        binary: 'r4 4 4 7 2;r16 13 4 7 2;M16 4h2v7;M16 11h4;M6 13h2v7;M4 20h6',
        command: 'M9 6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3z',
        component: 'M12 2l4 4-4 4-4-4z;M12 14l4 4-4 4-4-4z;M6 8l4 4-4 4-4-4z;M18 8l4 4-4 4-4-4z',
        rocket: 'M12 2c4 3 5 7 4 13H8C7 9 8 5 12 2z;c12 9 2;M8 15l-3 4h4;M16 15l3 4h-4;M10 19l2 3 2-3',
        bot: 'r4 8 16 12 3;M12 4v4;c12 3 1;M9 13v2;M15 13v2;M2 13v3;M22 13v3',
        workflow: 'r3 3 7 7 1;r14 14 7 7 1;M10 6.5h4a3 3 0 0 1 3 3V14',
        diff: 'M12 4v8;M8 8h8;M8 18h8',
        sitemap: 'r9 2 6 5 1;r2 17 6 5 1;r16 17 6 5 1;M5 17v-3h14v3;M12 7v7',
        'app-window': 'r2 4 20 16 2;M2 9h20;M5 6.5h.5;M8 6.5h.5',
        layout: 'r3 3 18 18 2;M3 9h18;M9 9v12',
        blocks: 'r3 3 8 8 1;r13 13 8 8 1;r13 3 8 8 4',
        puzzle: 'M4 7h4a2 2 0 1 1 4 0h4v4a2 2 0 1 1 0 4v4H4v-4a2 2 0 1 0 0-4z',
    },
    security: {
        'shield-check': `${SHIELD};M8.5 12l2.5 2.5 4.5-5`,
        'shield-alert': `${SHIELD};M12 8v4;M12 16v.5`,
        'shield-off': 'M4 5v6c0 5 3.5 9 8 11 2-.9 3.8-2.2 5.2-3.9;M20 13.5V5l-8-3-4.5 1.7;M2 2l20 20',
        'shield-plus': `${SHIELD};M12 8v7;M8.5 11.5h7`,
        'shield-x': `${SHIELD};M9.5 9.5l5 5;M14.5 9.5l-5 5`,
        key: 'c7.5 15.5 4.5;M10.5 12.5L21 2;M16 7l3 3;M19 4l2 2',
        passkey: 'c9 7 4;M3 21a6 6 0 0 1 9-5;c18 15 2;M18 17v5;M18 20h2',
        fingerprint: 'M12 11v3a7 7 0 0 1-2 5;M8 8.5a5 5 0 0 1 9 3v2a11 11 0 0 1-1 5;M6 12v-1a6 6 0 0 1 1-3.3;M5 17a11 11 0 0 0 1-4;M4.5 5.5a9 9 0 0 1 14 1;M20 11v1a17 17 0 0 1-.5 4',
        'scan-face': `${SCAN_CORNERS};M9 10h.5;M14.5 10h.5;M9 15a4 4 0 0 0 6 0`,
        scan: `${SCAN_CORNERS};M7 12h10`,
        'lock-keyhole': 'r4 10 16 12 2;M8 10V7a4 4 0 0 1 8 0v3;c12 15 1.5;M12 16.5V19',
        password: 'r2 7 20 10 2;M7 10v4;M5.3 11l3.4 2;M8.7 11l-3.4 2;M12 10v4;M10.3 11l3.4 2;M13.7 11l-3.4 2;M16 14h3',
        'id-badge': 'r5 3 14 19 2;M10 3v3h4V3;c12 11 2.5;M8 18a4 4 0 0 1 8 0',
        'id-card': 'r2 5 20 14 2;c8 11 2;M5 16a3 3 0 0 1 6 0;M14 10h5;M14 14h4',
        siren: 'M6 18v-6a6 6 0 0 1 12 0v6;M4 18h16v3H4z;M12 2v2;M3.5 5.5L5 7;M20.5 5.5L19 7',
        virus: 'c12 12 5;M12 2v5;M12 17v5;M2 12h5;M17 12h5;M5 5l3.5 3.5;M15.5 15.5L19 19;M19 5l-3.5 3.5;M8.5 15.5L5 19',
        firewall: 'r2 4 20 16 1;M2 9.5h20;M2 15h20;M8 4v5.5;M15 9.5V15;M8 15v5',
        incognito: 'c7 16 3;c17 16 3;M10 16h4;M3 11h18;M5 11l2-6h10l2 6',
        vault: 'r3 3 18 18 2;c12 12 4;M12 8v1.5;M12 14.5V16;M8 12h1.5;M14.5 12H16',
        cctv: 'M2 7l14 5-1.8 5L1.2 12z;M14.5 17v4H20;M18 10.5l3-1 1 3-3 1',
        hazard: 'M12 3L2 21h20z;M12 10v5;M12 18h.5',
        verified: 'M12 2l2.4 2.1 3.2-.3.9 3.1 2.8 1.6-1.2 3 1.2 3-2.8 1.6-.9 3.1-3.2-.3L12 22l-2.4-2.1-3.2.3-.9-3.1-2.8-1.6 1.2-3-1.2-3 2.8-1.6.9-3.1 3.2.3z;M8.5 12l2.5 2.5 4.5-5',
        'user-lock': 'c9 8 4;M2 21a7 7 0 0 1 11-5.7;r15 16 7 6 1;M16.5 16v-2a2 2 0 0 1 4 0v2',
        ban: 'c12 12 9;M5.6 5.6l12.8 12.8',
        radar: 'c12 12 9;c12 12 5;c12 12 1;M12 12l6-6',
    },
    health: {
        'heart-pulse': 'M20.8 5.6a5.5 5.5 0 0 0-7.8 0L12 6.6l-1-1a5.5 5.5 0 0 0-7.8 7.8L12 22l8.8-8.6a5.5 5.5 0 0 0 0-7.8z;M3 12h5l2-3 3 6 2-3h6',
        activity: 'M2 12h4l3-8 6 16 3-8h4',
        stethoscope: 'M5 3v6a5 5 0 0 0 10 0V3;M10 14v2a5 5 0 0 0 10 0v-2;c20 12 2;M4 3h2;M14 3h2',
        pill: 'M10.5 20.5a5 5 0 0 1-7-7l10-10a5 5 0 0 1 7 7z;M8.5 8.5l7 7',
        capsule: 'r3 8 18 8 4;M12 8v8',
        syringe: 'M18 2l4 4;M17 7l3-3;M19 9L9 19l-4-4L15 5z;M9 11l4 4;M5 19l-3 3;M14 4l6 6',
        bandage: 'M10 3.5a5 5 0 0 1 7 0l3.5 3.5a5 5 0 0 1 0 7L14 20.5a5 5 0 0 1-7 0L3.5 17a5 5 0 0 1 0-7z;M10 12h.5;M13.5 12h.5;M12 10v.5;M12 13.5v.5',
        'first-aid': 'r3 6 18 14 2;M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2;M12 10v6;M9 13h6',
        hospital: 'M3 21h18;M5 21V7h14v14;M9 3h6v4;M12 10v5;M9.5 12.5h5;M10 21v-3h4v3',
        ambulance: 'M2 6h11v11H2z;M13 10h5l4 4v3h-9;c6 18 2;c17 18 2;M7.5 8v5;M5 10.5h5',
        dna: 'M7 3c0 6 10 6 10 12 0 3-2 5-2 6;M17 3c0 6-10 6-10 12 0 3 2 5 2 6;M8 6h8;M8 18h8;M10 12h4',
        microscope: 'M6 18h8;M3 22h18;M14 22a7 7 0 1 0 0-14h-1;M9 14h2;M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2z;M12 6V3a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v3',
        brain: 'M12 5a3 3 0 0 0-5.6-1.5A3 3 0 0 0 4 8a3 3 0 0 0 0 6 3 3 0 0 0 3 5 3 3 0 0 0 5 1z;M12 5a3 3 0 0 1 5.6-1.5A3 3 0 0 1 20 8a3 3 0 0 1 0 6 3 3 0 0 1-3 5 3 3 0 0 1-5 1z',
        bone: 'M17 10c.7-.7 1.6-.9 2.5-1a2.5 2.5 0 1 0-3-3 2.5 2.5 0 1 0-3-3c-.1.9-.3 1.8-1 2.5L7 10c-.7.7-1.6.9-2.5 1a2.5 2.5 0 1 0 3 3 2.5 2.5 0 1 0 3 3c.1-.9.3-1.8 1-2.5z',
        tooth: 'M7 3c-2.5 0-4 2-4 4.5 0 3 1.5 4 2 7 .4 3 1 7 3 7 1.5 0 1.5-5 4-5s2.5 5 4 5c2 0 2.6-4 3-7 .5-3 2-4 2-7C21 5 19.5 3 17 3c-2 0-3 1-5 1S9 3 7 3z',
        weight: 'M6 8h12l3 13H3z;c12 5 2;M10 14h4',
        wheelchair: 'c12 4 1.5;M12 7v6h5l2 5;M12 10h4;M8 11a6 6 0 1 0 7.5 8',
        accessibility: 'c12 12 10;c12 7 1;M7 9.5l5 1 5-1;M12 10.5V14l-3 4;M12 14l3 4',
        'medical-record': 'r5 3 14 19 2;M9 3v2h6V3;M8 13h2l1.5-3 2 6 1.5-3h1',
        'face-mask': 'M5 9h14v5a7 4 0 0 1-14 0z;M8 12h8;M8 15h8;M5 10H3v2a3 3 0 0 0 2.5 3;M19 10h2v2a3 3 0 0 1-2.5 3',
        'blood-type': 'M12 2c4 5 6 8 6 12a6 6 0 0 1-12 0c0-4 2-7 6-12z;M12 12v6;M9 15h6',
        baby: 'c12 13 8;M9 12h.5;M14.5 12h.5;M10 16a3 3 0 0 0 4 0;M12 5a2 2 0 0 0 2-2',
        yoga: 'c12 4 2;M4 12l8-3 8 3;M12 9v5;M7 21l5-7 5 7;M5 21h14',
        lungs: 'M12 3v7;M12 10l-3 2;M12 10l3 2;M8 7c-3 1-5 5-5 10 0 2 1 4 3 4s3-1 3-3V8z;M16 7c3 1 5 5 5 10 0 2-1 4-3 4s-3-1-3-3V8z',
        'heart-plus': 'M19 13.5l-7 7.5-8.8-8.6a5.5 5.5 0 0 1 7.8-7.8l1 1 1-1a5.5 5.5 0 0 1 8.6 6.4;M18 15v6;M15 18h6',
    },
    food: {
        coffee: 'M4 8h13v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z;M17 10h1.5a2.5 2.5 0 0 1 0 5H17;M8 2v3;M12 2v3;M3 22h15',
        cup: 'M6 4h12l-1.5 16a2 2 0 0 1-2 2h-5a2 2 0 0 1-2-2z;M6.5 9h11',
        wine: 'M8 2h8l1 6a5 5 0 0 1-10 0z;M12 13v8;M8 22h8',
        beer: 'M5 6h11v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z;M16 9h2a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2;M9 10v8;M12 10v8;M5 6a3 3 0 0 1 5.5-1.5A3 3 0 0 1 16 6',
        cocktail: 'M3 3h18l-9 10z;M12 13v8;M8 21h8;M15 3l3-1',
        utensils: 'M7 2v20;M4 2v5a3 3 0 0 0 6 0V2;M17 22V2c-2.5 1-4 4-4 8v4h4',
        'chef-hat': 'M6 13.9a4 4 0 0 1 1-7.8 5 5 0 0 1 10 0 4 4 0 0 1 1 7.8V21H6z;M6 17h12',
        pizza: 'M12 2L3 20c6 3 12 3 18 0z;M5.5 15c4 2 9 2 13 0;c10 10 1;c14 13 1;c10.5 17 1',
        apple: 'M12 7c-2-1.5-7-1.5-7 4.5 0 5 3 10.5 7 9.5 4 1 7-4.5 7-9.5 0-6-5-6-7-4.5z;M12 7c0-2.5 1-4 3-5',
        cherry: 'c7 17 4;c17 16 4;M7 13c1-4 4-8 9-10;M17 12c-1-3-1-6-1-9;M16 3c2 0 4 1 5 3',
        carrot: 'M3 21c4-1 9-3 12-6a4 4 0 0 0-6-6c-3 3-5 8-6 12z;M15 9l5-5;M14 5l1-3;M19 10l3-1;M8 13l2 2',
        egg: 'M12 2c-4 0-7 7-7 12a7 7 0 0 0 14 0c0-5-3-12-7-12z',
        bread: 'M5 10a4 4 0 0 1 1-7h12a4 4 0 0 1 1 7v10a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1z',
        cake: 'M4 21v-8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8;M2 21h20;M4 16c2 1.5 4 1.5 6 0s4-1.5 6 0 4 1.5 4 0;M12 11V7;M12 4v.5',
        cookie: 'c12 12 9;c9 9 1;c14.5 10 1;c10 15 1;c15 15 1',
        'ice-cream': 'M7 11l5 11 5-11;M7 11a5 5 0 0 1 10 0z',
        lollipop: 'c12 9 7;M12 16v6;M12 9a3 3 0 0 1 3 3',
        soup: 'M3 12h18a9 9 0 0 1-18 0z;M8 8c0-2 2-2 2-4;M13 8c0-2 2-2 2-4',
        popcorn: 'M6 9l2 13h8l2-13z;M10 9l.5 13;M14 9l-.5 13;M6 9a2.5 2.5 0 0 1 1-4.5 3 3 0 0 1 5-2 3 3 0 0 1 5 2A2.5 2.5 0 0 1 18 9',
        salad: 'M3 11h18a9 9 0 0 1-18 0;M7 11a4 4 0 0 1 6-3.5A4 4 0 0 1 19 11;M10 21h4',
        milk: 'M8 2h8;M9 2v3l-2 4v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V9l-2-4V2;M7 13h10',
        bottle: 'M10 2h4v4l2 3v12a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V9l2-3z;M8 13h8;M8 17h8',
        citrus: 'c12 12 9;c12 12 5;M12 7v10;M7 12h10;M8.5 8.5l7 7;M15.5 8.5l-7 7',
        grapes: 'c9 10 2.5;c15 10 2.5;c12 14.5 2.5;c9 19 2.5;c15 19 2.5;M12 7.5V3;M12 5l3-2',
        burger: 'M4 10a8 6 0 0 1 16 0z;M3 14h18;M5 18h14a2 2 0 0 1-2 3H7a2 2 0 0 1-2-3z',
    },
    household: {
        sofa: 'M4 11V8a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v3;M2 13a2 2 0 0 1 4 0v2h12v-2a2 2 0 0 1 4 0v5H2z;M4 18v2;M20 18v2',
        bed: 'M2 4v16;M22 20v-6a3 3 0 0 0-3-3H10v5;M2 16h20;c6 12.5 2',
        lamp: 'M8 2h8l3 9H5z;M12 11v11;M8 22h8',
        lightbulb: 'M9 18h6;M10 22h4;M12 2a7 7 0 0 0-4 12.7V16h8v-1.3A7 7 0 0 0 12 2z',
        door: 'M4 22h16;M6 22V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v19;M14 12h.5',
        window: 'r3 3 18 18 1;M12 3v18;M3 12h18',
        armchair: 'M5 10V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4;M3 12a2 2 0 0 1 4 0v2h10v-2a2 2 0 0 1 4 0v6H3z;M6 18v3;M18 18v3',
        bath: 'M3 12h18v3a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5z;M6 12V5a2 2 0 0 1 4 0;M7 20l-1 2;M17 20l1 2',
        shower: 'M4 22V8a4 4 0 0 1 8 0v1;M9 9h6;M10 13v.5;M12 15v.5;M14 13v.5;M10 17v.5;M14 17v.5',
        'washing-machine': 'r4 2 16 20 2;M4 7h16;M8 4.5h.5;M11 4.5h.5;c12 14 4',
        fridge: 'r5 2 14 20 2;M5 9h14;M9 5v2;M9 12v3',
        microwave: 'r2 5 20 14 2;r5 8 10 8 1;M18 9v.5;M18 12v.5;M18 15v.5',
        fan: 'c12 12 2;M12 10c0-5 2-8 5-7s1 6-3 8;M14 12c5 0 8 2 7 5s-6 1-8-3;M12 14c0 5-2 8-5 7s-1-6 3-8;M10 12c-5 0-8-2-7-5s6-1 8 3',
        'potted-plant': 'M7 15h10l-1 7H8z;M12 15V9;M12 9c0-4 3-6 7-6 0 4-3 6-7 6;M12 11c0-3-2-5-5-5 0 3 2 5 5 5',
        broom: 'M19 3l-7 8;M8 10l6 6;M8 10c-3 1-5 4-6 11 7-1 10-3 11-6z',
        bucket: 'M4 7l2 14h12l2-14z;M7 7a5 5 0 0 1 10 0',
        hanger: 'M12 7a2 2 0 1 1 2-2c0 1.5-2 1.5-2 3v1;M12 9L2 17a1 1 0 0 0 .5 2h19a1 1 0 0 0 .5-2z',
        shirt: 'M8 3l-5 3 2 5 3-1v11h8V10l3 1 2-5-5-3a4 4 0 0 1-8 0z',
        outlet: 'r3 3 18 18 4;M9 9v3;M15 9v3;M10 16a2 2 0 0 1 4 0',
        thermostat: 'c12 12 9;c12 12 5;M12 3v2;M12 12l2-2',
        garage: 'M3 21V9l9-6 9 6v12;M6 21v-9h12v9;M6 15h12;M6 18h12',
        curtains: 'M3 3h18;M5 3v18;M19 3v18;M5 3c0 6 3 10 5 12;M19 3c0 6-3 10-5 12;M3 21h18',
        mirror: 'M12 2a6 8 0 1 1 0 16 6 8 0 1 1 0-16z;M12 18v4;M8 22h8;M10 6l-2 2',
        stairs: 'M2 21h5v-5h5v-5h5V6h5',
        iron: 'M2 18h19v-3a6 6 0 0 0-6-6H7l-5 9z;M7 9V6h9',
    },
    sports: {
        dumbbell: 'M6 7v10;M18 7v10;M3 9v6;M21 9v6;M6 12h12',
        trophy: 'M8 3h8v6a4 4 0 0 1-8 0z;M8 5H5a3 3 0 0 0 3 5;M16 5h3a3 3 0 0 1-3 5;M12 13v5;M8 21h8;M10 18h4v3',
        medal: 'c12 15 6;M8 3l3 6;M16 3l-3 6;M12 13v4',
        soccer: 'c12 12 9;M12 7l4 3-1.5 4.5h-5L8 10z;M12 3v4;M16 10l4-2;M14.5 14.5l2.5 4;M9.5 14.5L7 18.5;M8 10L4 8',
        basketball: 'c12 12 9;M3 12h18;M12 3v18;M5.6 5.6c3.5 3.5 3.5 9.3 0 12.8;M18.4 5.6c-3.5 3.5-3.5 9.3 0 12.8',
        tennis: 'c12 12 9;M6 5.3c3 3.5 3 9.9 0 13.4;M18 5.3c-3 3.5-3 9.9 0 13.4',
        volleyball: 'c12 12 9;M12 12V3;M12 12l7.8 4.5;M12 12l-7.8 4.5;M8 4c0 5 3 8 8 8',
        rugby: 'M4 20c-1-6 2-15 16-16 1 6-2 15-16 16z;M9 15l6-6;M10 11l3 3;M12 9l2 2',
        golf: 'M12 18V2l7 3-7 3;M5 20a7 2 0 0 0 14 0',
        bowling: 'c12 12 9;c9 8 1;c13 8 1;c11 11 1',
        swim: 'c17 6 2;M2 18c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0;M2 22c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0;M6 14l4-5 3 2 3-2',
        running: 'c15 4 2;M7 22l3-6 3 2v4;M10 16l2-6 4 3 3-1;M12 10L8 9l-3 3',
        skateboard: 'M3 14h18;M3 14l-1-2;M21 14l1-2;c7 18 2;c17 18 2',
        skiing: 'c16 4 2;M3 20l18-3;M6 15l4-4 3 2 3-4;M10 11l-2-3',
        whistle: 'c9 14 5;M13 11h9v4l-5 1;M7 14h.5;M6 6l1 2;M10 5v2',
        stopwatch: 'c12 14 8;M12 14v-4;M10 2h4;M12 2v4;M19 5l1.5 1.5',
        darts: 'c11 13 8;c11 13 4;M11 13l9-9;M17 4h3v3',
        'boxing-glove': 'M6 4h8a4 4 0 0 1 4 4v5a4 4 0 0 1-4 4H8a3 3 0 0 1-3-3V5a1 1 0 0 1 1-1z;M7 17v4h8v-4;M5 9h5',
        racket: 'c15 9 6;M10.8 13.2L3 21;M11 7l8 4;M13 4l6 6',
        tent: 'M2 21L12 3l10 18z;M12 21l-3-6h6z',
        podium: 'M9 8h6v13H9z;M3 13h6v8H3z;M15 15h6v6h-6z;M2 21h20',
        'race-flag': 'M4 22V3;M4 3h16v10H4;M8 3v10;M12 3v10;M16 3v10;M4 8h16',
        helmet: 'M3 15a9 9 0 0 1 18 0v2H3z;M12 6v5;M3 17v2a2 2 0 0 0 2 2h4',
        kettlebell: 'M9 9V6a3 3 0 0 1 6 0v3;c12 15 6',
        'jump-rope': 'M5 3v6;M19 3v6;M5 9c0 10 14 10 14 0;M4 3h2;M18 3h2',
    },
    education: {
        book: 'M4 19V5a2 2 0 0 1 2-2h14v14H6a2 2 0 0 0-2 2 2 2 0 0 0 2 2h14v-4',
        'book-open': 'M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z;M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z',
        notebook: 'r5 2 15 20 2;M9 2v20;M2 6h3;M2 10h3;M2 14h3;M2 18h3',
        'graduation-cap': 'M12 4L2 9l10 5 10-5z;M6 11v5c3 3 9 3 12 0v-5;M22 9v6',
        school: 'M3 21h18;M5 21V10l7-5 7 5v11;M12 2v3;M12 2h4v2h-4;M10 21v-5h4v5;c12 11 1.5',
        backpack: 'M5 10a7 7 0 0 1 14 0v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z;M9 3V2h6v1;M8 14h8v4H8z',
        pencil: 'M17 3l4 4L8 20l-5 1 1-5z;M14 6l4 4',
        ruler: 'M3 17L17 3l4 4L7 21z;M7 13l2 2;M10 10l2 2;M13 7l2 2',
        calculator: 'r4 2 16 20 2;r7 5 10 4 1;M8 13h.5;M12 13h.5;M16 13h.5;M8 17h.5;M12 17h.5;M16 17h.5',
        abacus: 'M4 3v18;M20 3v18;M4 7h16;M4 12h16;M4 17h16;c8 7 1;c11 12 1;c15 17 1',
        'desk-globe': 'c12 9 6;M6.5 15.5a8 8 0 0 0 11-11;M12 17v4;M8 21h8',
        atom: 'c12 12 1;M20.2 20.2c2-2-1.5-8.5-7.8-14.4S5.8 1.8 3.8 3.8s1.5 8.5 7.8 14.4 6.6 4 8.6 2z;M3.8 20.2c-2-2 1.5-8.5 7.8-14.4S20.2 1.8 20.2 3.8s-1.5 8.5-7.8 14.4-6.6 4-8.6 2z',
        flask: 'M9 2h6;M10 2v6L4 19a2 2 0 0 0 2 3h12a2 2 0 0 0 2-3L14 8V2;M7 15h10',
        'test-tube': 'M14 2l8 8;M15.5 3.5L5 14a3.5 3.5 0 0 0 5 5L20.5 8.5;M8 11h7',
        library: 'M3 21h18;M5 3v18;M9 3v18;M13 5l4 16',
        presentation: 'M2 3h20;M4 3v11a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V3;M12 15v3;M8 21l4-3 4 3',
        blackboard: 'r2 3 20 14 1;M7 21l2-4;M17 21l-2-4;M6 8h6;M6 12h9',
        certificate: 'r2 3 20 14 1;c16 13 2.5;M14.5 15l-1 6 2.5-1.5 2.5 1.5-1-6;M6 8h10;M6 11h5',
        exam: 'r4 2 16 20 2;M8 7l1.5 1.5L12 6;M14 7h3;M8 13l1.5 1.5L12 12;M14 13h3;M8 18h9',
        books: 'r3 4 5 17 1;r8 4 5 17 1;M14 5.5l4-1 4 15.5-4 1z',
        telescope: 'M4 11l12-6 2 4-12 6z;M10 13l-3 8;M10 13l3 8;M18 9l3-1.5-1-2L17 7',
        'math-compass': 'c12 4 2;M11 6L5 22;M13 6l6 16;M7 16h10',
        highlighter: 'M9 11l-6 6v3h9l3-3;M22 12l-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4z',
        alphabet: 'M3 18l4-12 4 12;M4.5 14h5;M14 6h4a3 3 0 0 1 0 6h-4z;M14 12h5a3 3 0 0 1 0 6h-5z',
        'sticky-note': 'M4 4h16v10l-6 6H4z;M14 20v-6h6',
    },
    finance: {
        bank: 'M12 3l9 5H3z;M5 11v7;M9.5 11v7;M14.5 11v7;M19 11v7;M3 21h18',
        'piggy-bank': 'M19 9c-1-3-4-5-8-5-5 0-8 3-8 7 0 2 1 4 3 5v4h3v-2h4v2h3v-4c1-.5 2-1.5 2.5-3H21v-4h-1.5c-.2-.3-.3-.7-.5-1z;M8 4.5V3h3;M15 10h.5',
        coin: 'c12 12 9;M14.5 8.5a3 2 0 0 0-5 1.5c0 3 5 1 5 4a3 2 0 0 1-5 1.5;M12 6v2;M12 16v2',
        euro: 'M18 6a7 7 0 1 0 0 12;M4 10h10;M4 14h10',
        pound: 'M17 20H6c2-2 3-4 3-7V8a4 4 0 0 1 8-1;M5 13h9',
        yen: 'M6 3l6 9 6-9;M12 12v9;M7 13h10;M7 17h10',
        bitcoin: 'M7 4h7a4 4 0 0 1 0 8H7z;M7 12h8a4 4 0 0 1 0 8H7z;M9 2v2;M13 2v2;M9 20v2;M13 20v2',
        rupee: 'M6 3h12;M6 8h12;M6 3h3a5 5 0 0 1 0 10H6l9 8',
        invoice: `${RECEIPT_EDGE};M9 7h6;M9 11h6;M9 15h3`,
        'hand-coins': 'M3 15h3l5 2h4a2 2 0 0 0 0-4h-3;M6 21l-3-3;M15 15l5-3a2 2 0 0 1 2 3l-6 5H9;c17 5 3',
        atm: 'r3 3 18 10 2;M7 13v8h10v-8;M10 17h4;M7 8h10',
        cheque: 'r2 6 20 12 2;M6 11h5;M6 14h8;M16 14h2',
        balance: 'M12 3v18;M7 21h10;M5 7h14;M5 7l-3 7a3 3 0 0 0 6 0z;M19 7l-3 7a3 3 0 0 0 6 0z',
        briefcase: 'r2 7 20 14 2;M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2;M2 13h20',
        handshake: 'M2 12l4-4 4 2 4-3 4 2 4 3;M6 8l-4 9;M18 9l4 8;M8 14l3 3a1.5 1.5 0 0 0 2-2;M11 12l3 3a1.5 1.5 0 0 0 2-2l-3-3',
        'tax-receipt': `${RECEIPT_EDGE};M9 15l6-6;M9 9.5h.5;M14.5 14.5h.5`,
        gem: 'M6 3h12l4 6-10 13L2 9z;M2 9h20;M12 22L8 9l3-6;M12 22l4-13-3-6',
        'gold-bars': 'M4 20l2-6h5l2 6z;M11 20l2-6h5l2 6z;M7.5 14l2-6h5l2 6',
        'currency-exchange': 'c8 8 5;M16 11a5 5 0 1 1-5 5;M8 6v4;M16 14v4',
        mortgage: 'M3 11l9-8 9 8;M5 9v12h14V9;M14 12.5a2 1.5 0 0 0-4 0c0 2 4 1 4 3a2 1.5 0 0 1-4 0;M12 10v1;M12 17v1',
        insurance: `${SHIELD};M14 9.5a2 1.5 0 0 0-4 0c0 2 4 1 4 3a2 1.5 0 0 1-4 0;M12 7v1;M12 14v1`,
        ledger: 'r4 2 16 20 1;M8 2v20;M11 7h6;M11 11h6;M11 15h4',
        transfer: 'M4 8h15l-4-4;M20 16H5l4 4',
        cash: 'r2 6 20 12 2;c12 12 3;M6 9v.5;M18 14.5v.5',
        safe: 'r3 3 18 16 2;c11 11 3;M11 8v1;M18 9v4;M6 19v2;M18 19v2',
    },
    charts: {
        'chart-line': `${AXES};M7 15l4-5 3 3 5-6`,
        'chart-area': `${AXES};M7 17V12l4-4 3 3 5-5v11z`,
        'chart-column': `${AXES};M8 17v-5;M13 17V8;M18 17V9`,
        'chart-bars': `${AXES};M7 7h9;M7 12h12;M7 17h5`,
        'chart-pie': 'M21 12A9 9 0 1 1 12 3v9z;M15 3.5A9 9 0 0 1 20.5 9H15z',
        'chart-donut': 'c12 12 9;c12 12 4;M12 3v5;M16 12h5',
        'chart-scatter': `${AXES};c8 15 1;c11 10 1;c15 13 1;c18 7 1;c13 17 1`,
        'chart-candles': `${AXES};r6 9 3 6;M7.5 6v3;M7.5 15v3;r11 7 3 4;M12.5 4v3;M12.5 11v3;r16 10 3 5;M17.5 7v3;M17.5 15v3`,
        'chart-radar': 'M12 2l9.5 7-3.6 11H6.1L2.5 9z;M12 7l5 4-2 6H9l-2-6z',
        funnel: 'M3 4h18;M5 9h14;M8 14h8;M10.5 19h3',
        gauge: 'M3.5 18a9 9 0 1 1 17 0;M12 15l4-6;c12 15 1.5',
        sparkline: 'M2 16l4-6 4 4 4-8 4 6 4-4',
        histogram: 'M3 21h18;M4 21v-6h4v6;M8 21V9h4v12;M12 21V5h4v16;M16 21v-8h4v8',
        'chart-stacked': `${AXES};r7 12 3 6;M7 15h3;r12 8 3 10;M12 13h3;r17 5 3 13;M17 11h3`,
        waterfall: `${AXES};M7 6v5;M11 11v4;M15 9v6;M19 9v9`,
        heatmap: 'r3 3 5 5;r10 3 5 5;r17 3 4 5;r3 10 5 5;r10 10 5 5;r17 10 4 5;r3 17 5 4;r10 17 5 4;r17 17 4 4',
        gantt: 'M3 3v18;M6 6h8;M9 10h9;M7 14h6;M12 18h8',
        table: 'r3 3 18 18 2;M3 9h18;M3 15h18;M9 3v18;M15 3v18',
        kanban: 'r3 3 18 18 2;M8 7v7;M12 7v4;M16 7v9',
        dashboard: 'r3 3 8 9 1;r13 3 8 5 1;r13 10 8 11 1;r3 14 8 7 1',
        'graph-nodes': 'c5 6 2;c19 6 2;c12 18 2;c12 10 2;M6.5 7.5l4 1.5;M17.5 7.5l-4 1.5;M12 12v4',
        flowchart: 'r8 2 8 5 1;M12 7v3;M12 10l5 4-5 4-5-4z;M12 18v4',
        'progress-bar': 'r2 9 20 6 3;M5 12h9',
        'progress-ring': 'M12 3a9 9 0 1 1-9 9;M12 8a4 4 0 1 1-4 4',
        sum: 'M18 4H6l6 8-6 8h12',
    },
    tools: {
        hammer: 'M12 4l2-2 6 6-2 2z;M15 7L4 18l2 2L17 9',
        wrench: 'M15 3a5 5 0 0 0-4.5 7L3 17.5 6.5 21l7.5-7.5A5 5 0 0 0 21 9l-3 3-3-3 3-3a5 5 0 0 0-3-3z',
        screwdriver: 'M14 4l6 6-3 3-6-6z;M12 9l-7 7;M5 16l-2 5 5-2z',
        saw: 'M3 8h15l3 3v4H3z;M3 15l2 2 2-2 2 2 2-2 2 2 2-2 2 2 2-2',
        drill: 'M3 7h11v6H3z;M14 9h4;M18 9.5h4;M7 13l-1 8h4l1-8',
        paintbrush: 'M18 2l4 4-9 9-4-4z;M9 11c-3 0-5 2-5 5 0 2-1 4-2 5 4 0 8-1 9-4',
        'paint-roller': 'r3 2 16 6 2;M19 5h2v6h-9v3;r10 14 4 8 1',
        palette: 'M12 2a10 10 0 0 0 0 20c1.5 0 2-1 2-2s-1-1.5-1-3 1-2 3-2h2a4 4 0 0 0 4-4c0-5-4.5-9-10-9z;c7.5 11 1;c10 7 1;c15 7 1',
        eyedropper: 'M14 7l3 3;M18 2l4 4-4 4-4-4z;M15 9L5 19l-2 3 3-2 10-10',
        magnet: 'M5 3h4v8a3 3 0 0 0 6 0V3h4v8a7 7 0 0 1-14 0z;M5 7h4;M15 7h4',
        toolbox: 'r2 8 20 13 2;M8 8V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v3;M2 13h20;M8 12v3;M16 12v3',
        nut: 'M12 2l8.7 5v10L12 22l-8.7-5V7z;c12 12 3',
        screw: 'M9 3h6;M12 3v3;M8 6h8;M10 6v15l2 2 2-2V6;M10 10l4 2;M10 14l4 2',
        pliers: 'M8 2l2 8;M16 2l-2 8;M10 10l-3 12;M14 10l3 12;c12 10 1.5',
        shovel: 'M19 2l3 3;M20.5 3.5L11 13;M11 13l-1-1-5 2-2 7 7-2 2-5z',
        axe: 'M14 12L4 22;M9 3l6 6 3-3a5 5 0 0 0-6-6z',
        ladder: 'M7 2v20;M17 2v20;M7 6h10;M7 11h10;M7 16h10',
        'tape-measure': 'c10 12 7;c10 12 2;M17 12h5v4h-5',
        'spirit-level': 'r2 8 20 8 2;c12 12 1.5;M9 8v8;M15 8v8',
        flashlight: 'M7 2h10v4l-2 4v12H9V10L7 6z;M7 6h10;M12 13v3',
        gears: 'c8 15 4;c17 7 3;M8 9v2;M8 19v2;M2 15h2;M12 15h2;M17 2v2;M17 10v2;M12 7h2;M20 7h2',
        anvil: 'M3 6h12a6 6 0 0 0 6 6h-3v3l2 4H7l2-4v-3a6 6 0 0 1-6-6z',
        needle: 'M20 4L6 18;M16.5 4.5a2 2 0 0 1 3 3;M6 18l-3 3;M15 9c-3 0-7 3-7 8',
        clamp: 'M4 4h12v4H8v8h8v4H4z;M16 6h3v12h-3',
        trowel: 'M14 10l-8 8;M4 20l2-2;M14 10l7-7-2 8-5 5z',
    },
    animals: {
        cat: 'M5 20V9L4 3l5 4h6l5-4-1 6v11z;M9 13h.5;M14.5 13h.5;M11 16l1 1 1-1',
        dog: 'M8 4H5L3 10l3 1;M16 4h3l2 6-3 1;M8 4h8l2 6v6a6 6 0 0 1-12 0v-6z;M10 12h.5;M13.5 12h.5;M11 16h2',
        bird: 'M16 7h.5;M3 20c6 0 10-3 11-7l1-6a3 3 0 0 1 6 0l-3 2;M14 13c-4 0-8-2-10-6 3 0 7 1 10 3;M10 20l1-3',
        rabbit: 'M9 10V4a1.5 1.5 0 0 1 3 0v6;M13 10V3a1.5 1.5 0 0 1 3 0v7;c12 15 6;M10 15h.5;M13.5 15h.5',
        turtle: 'M4 15a8 6 0 0 1 16 0z;M2 15h20;M6 15l-1 4;M18 15l1 4;M20 12h2;M9 10l3 5 3-5',
        snail: 'c14 13 6;c14 13 2.5;M2 19h18;M4 19c0-3 2-5 4-5;M4 14V9;M7 14V9',
        owl: 'M5 4l3 3h8l3-3v11a7 7 0 0 1-14 0z;c9 11 2;c15 11 2;M11 15l1 1 1-1',
        whale: 'M2 12c0 5 4 8 10 8s10-3 10-8c0-2-2-3-4-2l-2 2H2z;M17 6c1-1 2-1 3 0;M18.5 6V3;M7 15h.5',
        butterfly: 'M12 7v13;M12 9C9 3 3 3 3 8s4 6 9 4;M12 9c3-6 9-6 9-1s-4 6-9 4;M12 12c-4 1-7 3-6 6s5 0 6-3;M12 12c4 1 7 3 6 6s-5 0-6-3',
        bee: 'r8 9 8 11 4;M8 13h8;M8 16h8;M8 11c-3-1-5-4-4-6s4 0 4 3;M16 11c3-1 5-4 4-6s-4 0-4 3;M11 9l-1-4;M13 9l1-4',
        frog: 'c7 7 3;c17 7 3;M4 9c-2 3-2 6 0 9 4 3 12 3 16 0 2-3 2-6 0-9;M8 14c2 2 6 2 8 0;M7 7h.5;M16.5 7h.5',
        horse: 'M9 22v-8L5 15l-2-3 6-8 3-2 1 3 5 4v13;M9 8h.5;M13 5l5 2',
        cow: 'M5 6L2 4v4l3 1;M19 6l3-2v4l-3 1;r5 5 14 15 6;r8 14 8 5 2.5;M10 16.5h.5;M13.5 16.5h.5;M9 10h.5;M14.5 10h.5',
        pig: 'c12 13 8;r9 13 6 4 2;M11 15h.5;M13 15h.5;M6 6L5 2l4 3;M18 6l1-4-4 3;M9 10h.5;M14.5 10h.5',
        duck: 'c9 7 4;M13 7l5 1-5 2;M8 11c-3 1-6 3-6 6a4 4 0 0 0 4 4h11a5 5 0 0 0 5-5l-6 1c-2 0-4-2-5-4;M8 6h.5',
        penguin: 'M12 2a5 5 0 0 0-5 5v7a5 5 0 0 0 10 0V7a5 5 0 0 0-5-5z;M10 7h.5;M13.5 7h.5;M11 9l1 1 1-1;M7 11l-3 4;M17 11l3 4;M9 21h2;M13 21h2',
        elephant: 'M4 18V10a7 7 0 0 1 14 0v3c0 3 1 4 3 4v3c-3 0-5-2-5-5;M8 18v3;M13 18v3;M4 18h12;M9 9h.5;M4 10c-2 0-3-2-2-4',
        giraffe: 'M8 22V12l4-8h3l2 3-3 1-2 4v10;M14 22v-6;M8 16h6;M13 4V2;M15 4V2;M10 15h.5;M12 18h.5',
        octopus: 'M5 12a7 7 0 0 1 14 0v2H5z;M6 14c0 3-2 4-3 6;M10 14c0 3-1 5-2 7;M14 14c0 3 1 5 2 7;M18 14c0 3 2 4 3 6;M9 9h.5;M14.5 9h.5',
        crab: 'r6 10 12 8 4;M6 14H3;M18 14h3;M7 18l-2 3;M17 18l2 3;M8 10L5 5l-2 2 3 1;M16 10l3-5 2 2-3 1;M10 13h.5;M13.5 13h.5',
        squirrel: 'M17 21c3 0 5-3 5-7 0-5-4-8-7-6s-1 6 1 7;M16 15c-1 3-3 5-6 5H5l2-3v-4a4 4 0 0 1 4-4;M9 6l2-3 1 4;M9 11h.5',
        fox: 'M3 3l4 6h10l4-6v8l-9 10-9-10z;M9 13h.5;M14.5 13h.5',
        bear: 'c6 5 2;c18 5 2;c12 13 8;c12 16 2.5;M9 11h.5;M14.5 11h.5',
        deer: 'c12 15 5;M8 4v4l4 3 4-3V4;M5 3v3l3 2;M19 3v3l-3 2;M10 14h.5;M13.5 14h.5',
        dolphin: 'M2 15c4-6 10-9 16-7l3-3v6c0 4-4 8-10 8-3 0-6-1-9-4z;M11 8l2-4 2 3;M16 12h.5',
    },
    music: {
        guitar: 'M21 3l-7 7;M19 2l3 3;M11 9a5 5 0 1 0 4 4l-2-2z;c10 14 1.5',
        piano: 'r2 4 20 16 2;M7 13v7;M12 13v7;M17 13v7;r5.5 4 3 9;r10.5 4 3 9;r15.5 4 3 9',
        drum: 'M3 8v8c0 2 4 4 9 4s9-2 9-4V8;M3 8a9 4 0 0 0 18 0 9 4 0 0 0-18 0z;M8 2l3 5;M16 2l-3 5',
        violin: 'M14 2l-3 9;M10 3l5 1;M8 11a3 3 0 0 0 0 4 3 3 0 0 0-1 4 3 3 0 0 0 6 1 3 3 0 0 0 4-1 3 3 0 0 0-2-4 3 3 0 0 0-2-4z;M10 16h2',
        trumpet: 'M2 10v4;M2 12h12l7-5v10l-7-5;M6 12V9;M9 12V9;M12 12V9',
        saxophone: 'M14 2h4;M16 2v4l-6 8v3a3 3 0 0 0 6 0v-1h4;M13 10h.5;M12 12h.5',
        flute: 'M3 17L19 5l2 2L5 19z;M9 13h.5;M12 11h.5;M15 9h.5',
        harp: 'M5 2v20h14C19 12 12 5 5 2z;M9 6v14;M13 10v10;M5 2h3',
        xylophone: 'M3 6h3v12H3z;M8 7h3v10H8z;M13 8h3v8h-3z;M18 9h3v6h-3z;M2 21l9-4;M22 21l-9-4',
        maraca: 'c9 8 6;M13 12l7 9;M7 6h.5;M10 9h.5;M7 10h.5',
        tambourine: 'c12 12 9;c12 12 6;M12 3v3;M12 18v3;M3 12h3;M18 12h3',
        cymbal: 'M2 10c3-2 17-2 20 0-3 2-17 2-20 0z;M12 8V5;M12 12v10;M8 22h8',
        metronome: 'M8 2h8l4 20H4z;M6 16h12;M12 16l5-11;c14.5 10 1',
        vinyl: 'c12 12 10;c12 12 3;c12 12 .5;M7 8a6 6 0 0 1 4-2',
        cassette: 'r2 5 20 14 2;c8 11 2;c16 11 2;M10 11h4;M6 19l2-4h8l2 4',
        equalizer: 'M4 21v-7;M4 10V3;M12 21v-9;M12 8V3;M20 21v-5;M20 12V3;M2 14h4;M10 8h4;M18 16h4',
        waveform: 'M2 12h2;M6 8v8;M10 4v16;M14 7v10;M18 10v4;M22 12h-2',
        'tuning-fork': 'M8 2v8a4 4 0 0 0 8 0V2;M12 14v8',
        clef: 'M13 22c-3 0-4-3-1-4 3-1 3-5 0-6-3-1-6 1-6 4s3 5 6 4 4-5 2-8L11 4c0-2 3-2 3 0s-2 4-4 6',
        'eighth-note': 'c8 18 3;M11 18V3l6 4',
        'sheet-music': 'M3 6h18;M3 10h18;M3 14h18;M3 18h18;c9 16 2;M11 16V6',
        'mic-stand': 'c12 6 4;M12 10v12;M7 22h10;M9.5 8.5l5-5',
        amplifier: 'r3 3 18 18 2;c12 14 4;c12 14 1;M7 7h.5;M11 7h6',
        playlist: 'M3 6h12;M3 11h12;M3 16h7;c17 18 3;M20 18V8l2 1',
        accordion: 'r2 6 5 12 1;r17 6 5 12 1;M7 7l2 10 2-10 2 10 2-10 2 10',
    },
    gaming: {
        dice: 'r3 3 18 18 3;M8 8h.5;M15.5 8h.5;M12 12h.5;M8 16h.5;M15.5 16h.5',
        'dice-pair': 'r2 8 11 11 2;r12 3 10 10 2;M6 12h.5;M8 15h.5;M15 6h.5;M18.5 9.5h.5',
        'chess-knight': 'M6 21h12;M7 21l1-4h8l-1-8c-1-4-4-6-8-6l-1 3 2 1-4 5 2 2 4-2',
        'chess-pawn': 'c12 6 3;M10 9l-2 9h8l-2-9;M6 21h12;M7 18h10',
        'chess-rook': 'M6 3v4h12V3h-3v2h-2V3h-2v2H9V3z;M8 7l1 11h6l1-11;M5 21h14;M6 18h12',
        'chess-king': 'M12 2v5;M10 4h4;M8 7h8l-1 11H9z;M5 21h14;M6 18h12',
        'playing-card': 'r5 2 14 20 2;M12 9l2 3-2 3-2-3z;M8 5h.5;M15.5 19h.5',
        'card-deck': 'r8 4 12 17 2;M8 6L4 7l3 14 1-.3;M14 10a2 2 0 0 0-2 2c0 2 2 3 2 4 0-1 2-2 2-4a2 2 0 0 0-2-2z',
        joystick: 'r4 16 16 5 2;M12 16V8;c12 6 3;M8 18.5h.5',
        dpad: 'M9 3h6v6h6v6h-6v6H9v-6H3V9h6z;c12 12 1.5',
        'arcade-machine': 'M6 2h12v8l2 2v10H4V12l2-2z;r8 4 8 5 1;M4 14h16;c9 17 1;M14 17h3',
        'handheld-console': 'r6 2 12 20 2;r8 4 8 7 1;M9 16h2;M10 15v2;c15 15.5 1;c14 18 .5',
        'vr-headset': 'M3 8h18a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-5l-2-3h-4l-2 3H3a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z;M7 8V5h10v3',
        sword: 'M21 3v3L10 17l-3-3L18 3z;M5 13l6 6;M7.5 16.5L3 21',
        longbow: 'M5 3c8 3 13 8 16 16;M5 3l16 16;M2 9l11 2 2 11',
        potion: 'M10 3h4;M11 3v4a7 7 0 1 0 2 0V3;M6 15c3-2 9 2 12 0;c10 12 .5',
        'treasure-chest': 'M3 10a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v10H3z;M3 12h18;r10 10 4 4 1;M7 6v14;M17 6v14',
        'pixel-heart': 'M3 7h2V5h4v2h2v2h2V7h2V5h4v2h2v6h-2v2h-2v2h-2v2h-2v2h-2v-2H9v-2H7v-2H5v-2H3z',
        ghost: 'M5 21V10a7 7 0 0 1 14 0v11l-2.5-2-2.5 2-2-2-2 2-2.5-2z;M9 10h.5;M14.5 10h.5',
        'level-up': 'M12 3l7 7h-4v5H9v-5H5z;M5 19h14;M5 22h14',
        'health-bar': 'r2 9 20 6 2;M5 12h9;M18 5v3;M16.5 6.5h3',
        'map-scroll': 'M6 3h13a2 2 0 0 1 0 4h-1v12a2 2 0 0 1-2 2H5a2 2 0 0 1 0-4h1z;M10 9l2 3 2-1 2 3',
        'power-mushroom': 'M3 12a9 9 0 0 1 18 0z;M8 12v6a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-6;c9 8 1.5;c15 8 1.5;M10 15h.5;M13.5 15h.5',
        domino: 'r7 2 10 20 2;M7 12h10;M10 6h.5;M13.5 8h.5;M12 16h.5',
        'card-suits': 'M7 3c-2 2-4 3-4 5a2 2 0 0 0 4 1 2 2 0 0 0 4-1c0-2-2-3-4-5z;M7 9v2;M17 13l4 4-4 4-4-4z;M17 3a2 2 0 0 0-2 2c0 2 2 3 2 4 0-1 2-2 2-4a2 2 0 0 0-2-2z;c7 18 3',
    },
    transport: {
        scooter: 'c5 18 2.5;c19 18 2.5;M7.5 18h9l-3-12h-2;M13.5 6h3;M16.5 18L14 8',
        motorcycle: 'c5 17 3;c19 17 3;M5 17l4-6h6l4 6;M15 11l-2-4h3;M9 11l-1-3H5',
        tram: 'r5 5 14 13 2;M5 12h14;M8 18l-2 4;M16 18l2 4;M9 2h6;M12 2v3;M8.5 15h.5;M15 15h.5',
        metro: 'M6 3h12a2 2 0 0 1 2 2v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V5a2 2 0 0 1 2-2z;M4 10h16;M12 3v7;M7 21l2-3;M17 21l-2-3;M8 14h.5;M15.5 14h.5',
        ship: 'M3 15l2 5h14l2-5z;M5 15V9h14v6;M8 9V5h8v4;M12 2v3',
        sailboat: 'M12 2v15;M12 3l7 12h-7;M12 6l-6 9h6;M3 18h18l-2 3H5z',
        helicopter: 'M3 4h18;M12 4v4;M5 12a5 4 0 0 1 5-4h4a4 4 0 0 1 4 4v1a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3z;M18 12h4;M22 10v4;M8 20h8;M10 16v4;M14 16v4',
        taxi: 'M3 17v-4l2-5h14l2 5v4z;c7 17 2;c17 17 2;M9 4h6v4H9z;M3 13h18',
        van: 'M2 17V6h13l4 4h3v7z;c6 17 2;c17 17 2;M15 6v4h4;M2 11h13',
        tractor: 'c7 16 5;c19 18 3;M4 11V5h7l2 6h6v4;M11 5v6',
        'fire-truck': 'M2 17V9h11V6h5l4 5v6z;c6 17 2;c17 17 2;M2 5l11 2;M13 11h9',
        'police-car': 'M2 16v-4l3-4h14l3 4v4z;c6.5 16 2;c17.5 16 2;M10 8V5a2 2 0 0 1 4 0v3;M8 4L6 3;M16 4l2-1;M2 12h20',
        'cable-car': 'M2 3l20 4;M12 5v4;r5 9 14 11 2;M5 14h14;M9 9v5;M15 9v5',
        'hot-air-balloon': 'M12 2a7 7 0 0 0-7 7c0 4 4 7 5 9h4c1-2 5-5 5-9a7 7 0 0 0-7-7z;M12 2c-2 3-2 13 0 16;r10 19 4 3 .5',
        parachute: 'M2 11a10 8 0 0 1 20 0;M2 11l10 9 10-9;M12 3v17;M7 11l5 9 5-9',
        canoe: 'M2 13h20c-2 4-6 5-10 5s-8-1-10-5z;M16 3L9 17;M15 5l3 1',
        submarine: 'M3 14a5 4 0 0 1 5-4h9a5 4 0 0 1 0 8H8a5 4 0 0 1-5-4z;M10 10V6h4l1 4;M12 6V3;M8 14h.5;M12 14h.5;M16 14h.5',
        tire: 'c12 12 10;c12 12 5;M12 2v5;M12 17v5;M2 12h5;M17 12h5',
        'fuel-pump': 'M4 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16;M2 21h14;M4 10h10;M14 8l3 2v8a1.5 1.5 0 0 0 3 0V8l-3-3',
        'ev-charger': 'r4 3 10 18 2;M10 7l-2 4h3l-2 4;M14 9h3v8a1.5 1.5 0 0 0 3 0V7',
        parking: 'r3 3 18 18 3;M9 17V7h4a3 3 0 0 1 0 6H9',
        'traffic-light': 'r8 2 8 20 3;c12 7 1.5;c12 12 1.5;c12 17 1.5;M8 6H5;M8 12H5;M19 6h-3',
        'steering-wheel': 'c12 12 10;c12 12 2;M3 10c6-2 12-2 18 0;M10.5 13.5L7 21;M13.5 13.5L17 21',
        forklift: 'M3 18V8h6l3 6v4;c6 19 2;c13 19 2;M16 3v16h6;M9 8V4H5',
        airship: 'M2 9a8 4 0 0 1 16 0 8 4 0 0 1-16 0z;M18 9l4-3v6z;r7 15 6 3 1;M9 13v2;M11 13v2',
    },
    office: {
        stapler: 'M3 14h18v4H3z;M4 14l2-6h13a2 2 0 0 1 2 2v4;M8 11h10',
        pushpin: 'M9 2h6;M10 2v6l-4 4h12l-4-4V2;M12 12v10',
        binder: 'r5 2 15 20 2;M5 7H3;M5 12H3;M5 17H3;M10 2v20',
        scanner: 'M3 12h18v7a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z;M3 12l2-6h14l2 6;M7 16h4;M17 16h.5',
        shredder: 'r3 4 18 8 2;M3 9h18;M6 12v9;M9 12v7;M12 12v9;M15 12v6;M18 12v9',
        projector: 'r2 7 20 10 2;c16 12 3;M6 10h4;M6 14h4;M6 17v3;M18 17v3',
        'desk-lamp': 'M4 21h10;M9 21v-6l4-6;M13 9L9 5;M10 3l8 2-4 6-6-4z',
        'office-chair': 'r7 2 10 10 3;M5 12h14;M12 12v6;M7 21l5-3 5 3;M5 9v3;M19 9v3',
        'filing-cabinet': 'r5 2 14 20 2;M5 9h14;M5 16h14;M10 5.5h4;M10 12.5h4;M10 19h4',
        'business-card': 'r2 5 20 14 2;c8 11 2;M5 16c1-2 5-2 6 0;M14 9h5;M14 13h4',
        'name-tag': 'M3 8h18v12H3z;M3 12h18;M9 8V4h6v4;M7 16h10',
        'desk-calendar': 'M4 8h16v13H4z;M4 8l2-5h12l2 5;M12 12v6;M10 13l2-1',
        notepad: 'r5 3 14 19 1;M9 2v3;M12 2v3;M15 2v3;M8 10h8;M8 14h8;M8 18h5',
        checklist: 'M3 6l2 2 3-3;M3 12l2 2 3-3;M3 18l2 2 3-3;M11 7h10;M11 13h10;M11 19h10',
        stamp: 'M9 3h6v6l-1 3h-4l-1-3z;M4 12h16v4H4z;M6 20h12',
        inkwell: 'M7 10h10l2 4v6H5v-6z;M9 10V7h6v3;M21 2l-8 11',
        'fountain-pen': 'M12 2l5 8-5 12-5-12z;M12 10v5;c12 9 1;M8 14h8',
        'pencil-cup': 'M5 11h14l-2 11H7z;M8 11L7 3;M12 11V2l1 2;M16 11l2-7',
        'tape-dispenser': 'M3 17a6 6 0 0 1 12 0;c9 17 2;M3 17h18v3H3z;M15 14h6l-2 3',
        'hole-punch': 'M3 18h18v3H3z;M5 18V9h14v9;M5 9l2-5h10l2 5;c9 14 1;c15 14 1',
        'paper-stack': 'M4 6h14v14H4z;M7 3h14v14;M4 10h14',
        mailbox: 'M4 10a4 4 0 0 1 8 0v8H4z;M8 6h8a4 4 0 0 1 4 4v8h-8;M8 18v4;M16 4v6;M16 4h3v2h-3',
        headset: 'M4 15v-3a8 8 0 0 1 16 0v3;r2 13 4 6 1;r18 13 4 6 1;M20 19a4 4 0 0 1-4 3h-3',
        lanyard: 'M7 2l5 10 5-10;r8 12 8 10 1;c12 16 1.5;M10 20h4',
        'sealed-letter': 'r2 5 20 14 2;M2 7l10 6 10-6;c12 13 2',
    },
    science: {
        beaker: 'M5 3h14;M6 3v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V3;M6 12h12;M10 7h4',
        'petri-dish': 'M2 12a10 4 0 0 0 20 0 10 4 0 0 0-20 0z;M2 12v3a10 4 0 0 0 20 0v-3;c9 12 1;c14 11 .5',
        molecule: 'c12 12 2.5;c5 5 2;c19 6 2;c6 19 2;c19 18 2;M10 10L6.5 6.5;M14 11l3.5-3.5;M10 14l-2.5 3.5;M14 13.5l3.5 3',
        'bunsen-burner': 'M8 21h8;M10 21V11h4v10;M9 11h6;M12 2c-2 3-2 5 0 6 2-1 2-3 0-6z',
        pipette: 'M15 3l6 6;M17 5L6 16l-2 5 5-2L20 8;M8 13l3 3',
        radiation: 'c12 12 2;M12 10L9 4a9 9 0 0 0-6 9h7;M12 10l3-6a9 9 0 0 1 6 9h-7;M10.5 14l-3 6a9 9 0 0 0 9 0l-3-6',
        satellite: 'r9 9 6 6 1;M9 12H5;M15 12h4;r1 9 4 6;r19 9 4 6;M12 15v3;M9 21a3 3 0 0 1 6 0',
        orbit: 'c12 12 2;M3 12a9 4 0 0 0 18 0 9 4 0 0 0-18 0z;c20 9 1',
        comet: 'c16 8 4;M13 11L3 21;M12 8L4 12;M16 12l-4 8',
        galaxy: 'c12 12 1.5;M12 12c0-4 3-7 7-6;M12 12c4 0 7 3 6 7;M12 12c0 4-3 7-7 6;M12 12c-4 0-7-3-6-7',
        meteor: 'c8 16 5;M12 12l9-9;M10 10l7-7;M15 15l7-7;M6 15h.5;M9 18h.5',
        prism: 'M12 3l9 16H3z;M2 13h7;M14 11l8-2;M15 13l7 1;M14.5 15l6.5 4',
        circuit: 'c5 5 2;c19 19 2;c19 5 2;M7 5h6l4 4v8;M5 7v6l4 4h8;M19 7v2',
        resistor: 'M2 12h4l1-3 2 6 2-6 2 6 2-6 2 6 1-3h4',
        trilobite: 'M12 3c-4 0-6 3-6 7 0 5 3 9 6 11 3-2 6-6 6-11 0-4-2-7-6-7z;M8 9h8;M7 13h10;M8 17h8;M12 4v16',
        crystal: 'M12 2l3 5v11H9V7z;M9 18l-3-1V9l3-2;M15 18l3-1V9l-3-2;M4 21h16',
        cell: 'c12 12 9;c13 11 3;c13 11 1;M6 15h.5;M9 18h.5;M17 17h.5',
        bacteria: 'r6 8 12 8 4;M6 12H2;M18 12h4;M9 8L8 4;M15 8l1-4;M9 16l-1 4;M15 16l1 4;M10 12h.5;M13.5 12h.5',
        formula: 'M4 7h6;M7 4v6;M4 17h6;M14 5l6 6;M20 5l-6 6;M14 16h6;M14 19h6',
        'sine-wave': 'M2 12c2-6 4-6 5 0s3 6 5 0 3-6 5 0 3 6 5 0',
        pendulum: 'M4 3h16;M12 3l5 13;c17.5 18.5 2.5;M8 21a6 6 0 0 1-2-3',
        'robot-arm': 'M4 21h8;M8 21v-4;c8 15 2;M9.5 13.5L14 7;c15 6 1.5;M16 5l4 1;M16 7l3 3',
        'solar-panel': 'M4 4h16l2 10H2z;M3 9h18;M8 4l-1 10;M16 4l1 10;M12 14v6;M8 20h8',
        'wind-turbine': 'M12 10v12;M9 22h6;c12 9 1;M12 8V2;M13 10l5 3;M11 10l-5 3',
        'periodic-table': 'r2 4 4 4;r6 4 4 4;r18 4 4 4;r2 8 4 4;r6 8 4 4;r10 10 4 4;r14 10 4 4;r18 8 4 4;M4 17h16;M4 20h16',
    },
    buildings: {
        castle: 'M3 21V6h3v2h3V6h6v2h3V6h3v15z;M3 11h18;M10 21v-5a2 2 0 0 1 4 0v5',
        skyscraper: 'M8 22V5l4-3 4 3v17;M5 22h14;M10 8h4;M10 12h4;M10 16h4',
        cottage: 'M3 11l9-7 9 7;M5 9v12h14V9;M10 21v-6h4v6;M16 6V3h2v5',
        apartment: 'r4 2 16 20 1;M8 6h2;M14 6h2;M8 10h2;M14 10h2;M8 14h2;M14 14h2;M10 22v-4h4v4',
        factory: 'M2 21V11l5 3v-3l5 3v-3l5 3V3h4v18z;M2 21h20;M6 17h2;M11 17h2',
        warehouse: 'M2 21V9l10-6 10 6v12;M6 21v-9h12v9;M6 15h12;M6 18h12',
        lighthouse: 'M10 22l1-13h2l1 13;M8 22h8;M9 9h6;M10 9V6l2-2 2 2v3;M4 4l4 2;M20 4l-4 2',
        windmill: 'M9 22l1-10h4l1 10;M12 10L6 4;M12 10l6-6;M12 10l-6 6;M12 10l6 6',
        bridge: 'M2 17h20;M2 13h20;M4 17v4;M20 17v4;M2 13c4-8 16-8 20 0;M8 9v4;M12 8v5;M16 9v4',
        tower: 'M9 22l3-20 3 20;M10 14h4;M11 8h2;M7 22h10',
        pagoda: 'M12 2v3;M5 8l7-3 7 3;M7 8v3;M17 8v3;M4 14l8-3 8 3;M6 14v7;M18 14v7;M3 21h18',
        igloo: 'M2 20a10 10 0 0 1 20 0z;M9 20v-3a3 3 0 0 1 6 0v3;M4 15h16;M7 11h10',
        barn: 'M3 21V10l3-6h12l3 6v11z;M9 21v-7h6v7;M9 14l6 7;M15 14l-6 7;M10 9h4',
        stadium: 'M2 9a10 4 0 0 0 20 0 10 4 0 0 0-20 0z;M2 9v8a10 4 0 0 0 20 0V9;M7 12v7;M12 13v8;M17 12v7',
        museum: 'M3 9l9-6 9 6z;M5 9v10;M9 9v10;M15 9v10;M19 9v10;M2 21h20;M3 19h18',
        hotel: 'r3 3 18 19 1;M8 22v-4h8v4;M8 7h8;M9 11h.5;M14.5 11h.5;M9 14h.5;M14.5 14h.5',
        cabin: 'M2 12l10-9 10 9;M4 10v11h16V10;M4 14h16;M4 18h16;M10 21v-5h4v5',
        pyramid: 'M12 3l10 18H2z;M12 3l3 18;M7 12h7',
        monument: 'M10 18V5l2-3 2 3v13;M7 18h10v4H7z;M5 22h14',
        gate: 'M3 22V4;M21 22V4;M2 4h20;M3 8h18;M8 8v14;M16 8v14',
        fence: 'M4 21V6l2-3 2 3v15;M11 21V6l2-3 2 3v15;M18 21V6l2-3 2 3v15;M2 10h20;M2 16h20',
        'brick-wall': 'r2 4 20 16;M2 9h20;M2 15h20;M8 4v5;M16 4v5;M12 9v6;M5 15v5;M18 15v5',
        crane: 'M6 22V3;M3 22h6;M6 3l15 3;M6 6h15;M18 6v6;r16 12 4 3',
        city: 'M2 22h20;M4 22V10h5v12;M9 22V4h6v18;M15 22v-9h5v9;M11 8h2;M11 12h2;M6 14h1',
        dome: 'M4 15a8 8 0 0 1 16 0;M3 15h18v6H3z;M12 7V3;M7 21v-3;M12 21v-3;M17 21v-3',
    },
    celebration: {
        balloon: 'M12 2a6 7 0 0 0-6 7c0 4 3 7 6 7s6-3 6-7a6 7 0 0 0-6-7z;M11 16l1 2 1-2;M12 18c-2 2 1 3-1 4',
        balloons: 'c8 8 5;c16 7 4;M8 13l1 9;M16 11l-3 11',
        confetti: 'M4 4l2 3;M10 3v3;M17 4l-2 3;M20 10h-3;M5 12l3 1;r10 10 3 3;M7 18l2-2;M16 16l3 3;M12 19v3',
        'party-popper': 'M3 21l5-13 8 8z;M14 2l1 3;M20 6l-3 2;M22 12l-4-1;M11 5l1 2;M18 3h.5',
        fireworks: 'c12 12 1;M12 2v5;M12 17v5;M2 12h5;M17 12h5;M5 5l3.5 3.5;M15.5 15.5L19 19;M19 5l-3.5 3.5;M8.5 15.5L5 19',
        'party-hat': 'M12 2L5 21h14z;M8 13l8-2;M7 17l10-3;c12 2 1',
        candle: 'r8 10 8 12 1;M12 10V7;M12 2c-1.5 2-1.5 3.5 0 5 1.5-1.5 1.5-3 0-5z;M8 14h8',
        champagne: 'M8 2h8l-1 7a3 3 0 0 1-6 0z;M12 12v9;M8 21h8;M8.5 5h7',
        'toast-glasses': 'M4 4h6l-1 6a2 2 0 0 1-4 0z;M7 12v8;M5 20h4;M14 4h6l-1 6a2 2 0 0 1-4 0z;M17 12v8;M15 20h4;M12 2v2',
        lantern: 'M12 2v2;M8 4h8;M6 8a6 6 0 0 1 12 0v8a6 6 0 0 1-12 0z;M8 20h8;M12 22v-2;M10 6v14;M14 6v14',
        wreath: 'c12 12 8;c12 12 4;M10 20l-2 3;M14 20l2 3;M10 20h4',
        ribbon: 'M12 9c-3-4-3-7 0-7s3 3 0 7L7 22;M12 9l5 13',
        'wedding-ring': 'c12 15 7;M9 5l3-3 3 3-3 3z',
        invitation: 'r3 3 18 18 2;M3 8h18;M8 13h8;M9 16h6;c12 5.5 .5',
        'carnival-mask': 'M2 8c3 0 6 1 10 1s7-1 10-1c0 6-2 9-5 9-2 0-3-2-5-2s-3 2-5 2c-3 0-5-3-5-9z;M6 11h3;M15 11h3',
        'christmas-tree': 'M12 2l5 7h-3l5 7H5l5-7H7z;M12 16v5;M9 21h6',
        snowman: 'c12 7 4;c12 17 5;M10 6h.5;M13.5 6h.5;M7 14L3 11;M17 14l4-3;M12 14h.5;M12 18h.5',
        pumpkin: 'M12 6c-6 0-9 3-9 7s3 8 9 8 9-4 9-8-3-7-9-7z;M12 6c-2 2-2 13 0 15;M12 6c2 2 2 13 0 15;M12 6V3l2-1',
        firecracker: 'r7 9 10 13 1;M7 13h10;M7 18h10;M12 9V6;M12 6c1-2 3-2 4-4;M18 3l1-1;M20 5h2',
        'red-envelope': 'r5 2 14 20 2;M5 8c3 3 11 3 14 0;c12 11 2;M10 16h4;M12 13v6',
        'lucky-knot': 'M12 2v3;M12 5l4 4-4 4-4-4z;M8 9l-3 3 3 3;M16 9l3 3-3 3;M12 13v3;M10 16l-1 6;M14 16l1 6;M12 16v6',
        'disco-ball': 'M12 2v3;c12 13 8;M4 13h16;M12 5v16;M6 8.5c4 2 8 2 12 0;M6 17.5c4-2 8-2 12 0',
        sparkler: 'M3 21l9-9;M14 4l1 4 4 1-4 1-1 4-1-4-4-1 4-1z;M20 2l.5 1.5;M21 12h1',
        'wedding-bells': 'M4 16l1-6a4 4 0 0 1 8 0l1 6z;M12 16l1-7a4 4 0 0 1 7.5 1L21 16z;M8 2v3;M7 19h2;M16 19h2',
        bunting: 'M2 4c6 4 14 4 20 0;M4 5.5l2 6 2-5;M10 7l2 6 2-6;M16 6.5l2 5 2-6',
    },
    clothing: {
        dress: 'M9 2h6l-1 5 5 15H5l5-15z;M8 7h8',
        skirt: 'M7 4h10;M7 4v3h10V4;M7 7L3 20h18L17 7;M10 7l-2 13;M14 7l2 13',
        pants: 'M6 2h12l1 20h-5l-2-12-2 12H5z;M6 6h12',
        shorts: 'M5 4h14l2 13h-7l-2-6-2 6H3z;M5 8h14',
        jacket: 'M8 3l4 4 4-4 5 3-2 6-2-1v11H7V11l-2 1-2-6z;M12 7v15;M9 14h1;M14 14h1',
        hoodie: 'M8 4a4 4 0 0 1 8 0l5 3-2 6-2-1v10H7V12l-2 1-2-6z;M9 4c0 3 1.5 5 3 5s3-2 3-5;M10 9v4;M14 9v4',
        sock: 'M8 2h7v10l3 4a3 3 0 0 1-2 5h-4l-4-4z;M8 6h7',
        sneaker: 'M2 18h20v-2l-6-2-3-5H9l-1 2-3-2H2z;M2 15h20;M10 12l2 1;M11 10l2 1',
        boot: 'M7 2h7v12l6 3v4H5v-4l2-1z;M7 6h7;M5 18h15',
        'high-heel': 'M3 17c0-3 2-4 4-3l7 1 6-6 2 1v12h-2v-4l-5 2H3z',
        sandal: 'M5 21a3 3 0 0 1-2-3V6a4 4 0 0 1 8 0v12a3 3 0 0 1-3 3z;M3 10l8 3;M3 13l8-3',
        'top-hat': 'M7 4h10v12H7z;M3 16h18v2H3z;M7 13h10',
        cap: 'M3 15a9 9 0 0 1 18 0z;M3 15H2v2h14;M12 6v1',
        beanie: 'M4 16a8 8 0 0 1 16 0;r3 16 18 4 1;c12 6 2;M8 10v6;M12 9v7;M16 10v6',
        scarf: 'M6 3h12v5H6z;M8 8L6 22h4l2-14;M6 18h4',
        glove: 'M7 22v-5l-3-5 1-1 3 3V4a1.5 1.5 0 0 1 3 0v6V3a1.5 1.5 0 0 1 3 0v7V4a1.5 1.5 0 0 1 3 0v8l1-3a1.5 1.5 0 0 1 3 1l-2 7v5z;M7 19h10',
        necktie: 'M9 2h6l-1 4h-4z;M10 6L8 17l4 5 4-5-2-11',
        'bow-tie': 'M2 6l8 4v4l-8 4z;M22 6l-8 4v4l8 4z;r10 10 4 4 1',
        glasses: 'c6 15 4;c18 15 4;M10 15c1-1 3-1 4 0;M2 15V7l2-2;M22 15V7l-2-2',
        sunglasses: 'M2 9h20;M3 9l1 6a3 3 0 0 0 6 0l1-6;M13 9l1 6a3 3 0 0 0 6 0l1-6;M11 11h2',
        handbag: 'M4 9h16l-1 12H5z;M8 9V6a4 4 0 0 1 8 0v3;M4 13h16',
        belt: 'M2 9h20v6H2z;r7 8 6 8 1;M10 12h6',
        necklace: 'M4 3c0 7 4 11 8 11s8-4 8-11;M12 14l2 3-2 4-2-4z',
        apron: 'M8 2a4 4 0 0 0 8 0;M8 2v6H5v2l2 1v11h10V11l2-1V8h-3V2;M9 15h6',
        vest: 'M8 2l4 7 4-7 3 2v18h-6V9;M11 22H5V4l3-2;M9 15h.5;M9 18h.5',
    },
    gestures: {
        'hand-wave': 'M8 13V5a1.5 1.5 0 0 1 3 0v6;M11 10V3a1.5 1.5 0 0 1 3 0v7;M14 10V5a1.5 1.5 0 0 1 3 0v8;M8 13l-2-2a1.5 1.5 0 0 0-2 2l4 5a6 6 0 0 0 9-2v-3;M19 3c1 1 2 2 2 4;M3 6c0-2 1-3 2-4',
        peace: 'M9 11L7 3a1.5 1.5 0 0 1 3-.5L12 9;M12 9l1-6.5a1.5 1.5 0 0 1 3 .5l-1 8;M9 11a3 3 0 0 0-2 3v2a6 6 0 0 0 12 0v-3a2 2 0 0 0-4-1;M9 14h6',
        'ok-hand': 'c8 10 3;M11 10h2V4a1.5 1.5 0 0 1 3 0v6;M16 9V6a1.5 1.5 0 0 1 3 0v8a7 7 0 0 1-12 5l-2-4',
        'point-up': 'M10 13V4a2 2 0 0 1 4 0v7l4 1a2 2 0 0 1 2 2v2a6 6 0 0 1-6 6h-2a6 6 0 0 1-6-6v-3a2 2 0 0 1 4 0',
        'point-right': 'M11 10h9a2 2 0 0 1 0 4h-7l-1 4a2 2 0 0 1-2 2H8a6 6 0 0 1-6-6v-2a6 6 0 0 1 6-6h3a2 2 0 0 1 0 4',
        'point-left': 'M13 10H4a2 2 0 0 0 0 4h7l1 4a2 2 0 0 0 2 2h2a6 6 0 0 0 6-6v-2a6 6 0 0 0-6-6h-3a2 2 0 0 0 0 4',
        fist: 'r5 7 14 12 4;M9 7v5;M12 7v5;M15 7v5;M5 12h6v3H8;M8 19v3h9v-3',
        clap: 'M5 12l5-7a1.5 1.5 0 0 1 2.5 1.5L9 11l6-7a1.5 1.5 0 0 1 2.5 1.5L13 11l4-3a1.5 1.5 0 0 1 2 2l-6 8a6 6 0 0 1-8-1z;M18 2l1-1;M21 4l1-.5;M3 4L2 3',
        pinch: 'M7 14a5 5 0 0 0 10 0V9;M7 14V4a1.5 1.5 0 0 1 3 0v6;M10 10l4-2a1.5 1.5 0 0 1 2 2;M17 9V6a1.5 1.5 0 0 1 3 0v3',
        tap: `${POINT};c11.5 4 3`,
        'double-tap': `${POINT};c11.5 4 2;c11.5 4 3.5`,
        'swipe-left': `${POINT};M21 3h-6l2-2;M15 3l2 2`,
        'swipe-right': `${POINT};M15 3h6l-2-2;M21 3l-2 2`,
        'swipe-up': `${POINT};M18 9V3l-2 2;M18 3l2 2`,
        'swipe-down': `${POINT};M18 3v6l-2-2;M18 9l2-2`,
        drag: `${POINT};r16 1 6 6 1`,
        spread: 'M12 14L6 8;M6 8v4;M6 8h4;M12 14l6-6;M18 8v4;M18 8h-4;c12 17 3',
        'rotate-gesture': `${POINT};M16 4a5 5 0 0 1 4 6;M20 10l1-3;M20 10l-3-1`,
        'long-press': `${POINT};M5 5l2 2;M18 5l-2 2;M3 9h2;M18 9h2`,
        'raise-hand': 'M7 14V6a1.5 1.5 0 0 1 3 0v5;M10 11V4a1.5 1.5 0 0 1 3 0v7;M13 11V5a1.5 1.5 0 0 1 3 0v7;M16 12V8a1.5 1.5 0 0 1 3 0v7a7 7 0 0 1-12 3l-3-4a1.5 1.5 0 0 1 3-2z;M3 5l2 1;M3 9h2',
        'high-five': 'M3 20l3-9 2-6a1 1 0 0 1 2 1l-1 5 3-6a1 1 0 0 1 2 1l-2 5;M21 20l-3-9-2-6a1 1 0 0 0-2 1l1 5;M12 2v2;M9 3l1 1;M15 3l-1 1',
        'call-me': 'M6 4a2 2 0 0 1 4 0v8h4V9a2 2 0 0 1 4 0v3l2-1a2 2 0 0 1 2 3l-4 5a6 6 0 0 1-5 2H9a5 5 0 0 1-5-5V8',
        'rock-on': 'M8 12V3a1.5 1.5 0 0 1 3 0v8;M17 12V4a1.5 1.5 0 0 1 3 0v10a7 7 0 0 1-12 4l-3-4a1.5 1.5 0 0 1 3-2;M11 11h6',
        'crossed-fingers': 'M10 12L8 3a1.5 1.5 0 0 1 3 0l1 6;M12 9l2-5a1.5 1.5 0 0 1 3 1l-3 8;M8 12a3 3 0 0 0-1 3v1a6 6 0 0 0 12 0v-2a2 2 0 0 0-3-1',
        'heart-hands': 'M12 20L4 12a4 4 0 0 1 6-6l2 2 2-2a4 4 0 0 1 6 6z;M4 12l-2 2v6;M20 12l2 2v6',
    },
};
/** Every icon by name, flattened from `ICON_GROUPS`. */
const ICONS = /*#__PURE__*/ Object.assign({}, ...Object.values(ICON_GROUPS));
const CATEGORY_OF = /*#__PURE__*/ Object.fromEntries(Object.entries(ICON_GROUPS).flatMap(([cat, icons]) => Object.keys(icons).map((n) => [n, cat])));
/** All icon names in category order, or those of one category. */
function iconNames(category) {
    if (!category)
        return Object.keys(ICONS);
    const group = ICON_GROUPS[category];
    return group ? Object.keys(group) : [];
}
/** The category an icon belongs to, or undefined for an unknown name. */
function iconCategory(name) {
    return CATEGORY_OF[name];
}
const NUM = /^-?\d*\.?\d+$/;
/** One icon's shapes as element descriptions; an unknown name gives []. */
function iconParts(name) {
    const spec = ICONS[name];
    if (!spec)
        return [];
    return spec.split(';').map((s) => {
        const t = s.trim();
        const n = t.slice(1).trim().split(/\s+/);
        if (t[0] === 'c' && n.length === 3 && n.every((x) => NUM.test(x)))
            return { tag: 'circle', attrs: { cx: n[0], cy: n[1], r: n[2] } };
        if (t[0] === 'r' && (n.length === 4 || n.length === 5) && n.every((x) => NUM.test(x))) {
            const attrs = { x: n[0], y: n[1], width: n[2], height: n[3] };
            if (n[4])
                attrs.rx = n[4];
            return { tag: 'rect', attrs };
        }
        return { tag: 'path', attrs: { d: t } };
    });
}
/** Attributes shared by every icon's `<svg>`. */
const ICON_SVG_ATTRS = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': '2',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
};
/**
 * One icon as an `<svg>` string (empty for an unknown name). `size` is in px (24), `stroke` the line width (2).
 * Without a `label` the svg is hidden from screen readers; with one it is an image with that name.
 */
function iconSvg(name, opts = {}) {
    const parts = iconParts(name);
    if (!parts.length)
        return '';
    const size = Math.max(8, Math.min(512, opts.size ?? 24));
    const stroke = Math.max(0.5, Math.min(4, opts.stroke ?? 2));
    const esc = (v) => v.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
    const a11y = opts.label ? `role="img" aria-label="${esc(opts.label)}"` : 'aria-hidden="true"';
    const attrs = Object.entries({ ...ICON_SVG_ATTRS, 'stroke-width': String(stroke) }).map(([k, v]) => `${k}="${v}"`).join(' ');
    const body = parts.map((p) => `<${p.tag} ${Object.entries(p.attrs).map(([k, v]) => `${k}="${esc(v)}"`).join(' ')}/>`).join('');
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" ${attrs} ${a11y}>${body}</svg>`;
}
/**
 * Names matching a search, in set order. Every word of the query must appear in the name or the category (English or
 * Chinese category name); `category` narrows to one category first.
 */
function searchIcons(query = '', category = '') {
    const words = query.toLowerCase().trim().split(/[\s,]+/).filter(Boolean);
    const cats = new Map(ICON_CATEGORIES.map((c) => [c.id, `${c.id} ${c.en.toLowerCase()} ${c.zh}`]));
    return iconNames(category || undefined).filter((name) => {
        const hay = `${name} ${name.replace(/-/g, ' ')} ${cats.get(CATEGORY_OF[name]) || ''}`;
        return words.every((w) => hay.includes(w));
    });
}

var css = "usa-icon,mo-icon{display:inline-flex;vertical-align:-.125em;line-height:0}.usa-icon{flex:none;overflow:visible;transform-box:fill-box;transform-origin:50% 50%;--usa-icon-dur:1s}.usa-icon[data-run]{animation:var(--usa-icon-kf) var(--usa-icon-dur) var(--usa-icon-ease,ease-in-out) 1 both}.usa-icon[data-run=\"loop\"]{animation-iteration-count:infinite}.usa-icon[data-motion=\"spin\"]{--usa-icon-kf:usa-icon-spin;--usa-icon-ease:linear}.usa-icon[data-motion=\"pulse\"]{--usa-icon-kf:usa-icon-pulse}.usa-icon[data-motion=\"beat\"]{--usa-icon-kf:usa-icon-beat}.usa-icon[data-motion=\"bounce\"]{--usa-icon-kf:usa-icon-bounce;--usa-icon-ease:cubic-bezier(.3,0,.4,1)}.usa-icon[data-motion=\"wiggle\"]{--usa-icon-kf:usa-icon-wiggle}.usa-icon[data-motion=\"shake\"]{--usa-icon-kf:usa-icon-shake}.usa-icon[data-motion=\"ring\"]{--usa-icon-kf:usa-icon-ring;transform-origin:50% 8%}.usa-icon[data-motion=\"float\"]{--usa-icon-kf:usa-icon-float}.usa-icon[data-motion=\"flip\"]{--usa-icon-kf:usa-icon-flip}.usa-icon[data-motion=\"pop\"]{--usa-icon-kf:usa-icon-pop;--usa-icon-ease:cubic-bezier(.34,1.56,.64,1)}.usa-icon[data-motion=\"blink\"]{--usa-icon-kf:usa-icon-blink}.usa-icon[data-motion=\"draw\"][data-run]{animation:none}.usa-icon[data-motion=\"draw\"][data-run]>*{stroke-dasharray:1 1;animation:usa-icon-draw var(--usa-icon-dur) ease-out 1 both}.usa-icon[data-motion=\"draw\"][data-run=\"loop\"]>*{animation-iteration-count:infinite;animation-direction:alternate}@keyframes usa-icon-spin{to{transform:rotate(360deg)}}@keyframes usa-icon-pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.14);opacity:.7}}@keyframes usa-icon-beat{0%,40%,100%{transform:scale(1)}15%{transform:scale(1.25)}28%{transform:scale(1.08)}}@keyframes usa-icon-bounce{0%,100%{transform:translateY(0)}30%{transform:translateY(-28%)}55%{transform:translateY(0)}72%{transform:translateY(-10%)}}@keyframes usa-icon-wiggle{0%,100%{transform:rotate(0)}20%{transform:rotate(-12deg)}40%{transform:rotate(10deg)}60%{transform:rotate(-6deg)}80%{transform:rotate(4deg)}}@keyframes usa-icon-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-12%)}40%{transform:translateX(10%)}60%{transform:translateX(-6%)}80%{transform:translateX(4%)}}@keyframes usa-icon-ring{0%,100%{transform:rotate(0)}12%{transform:rotate(18deg)}26%{transform:rotate(-16deg)}40%{transform:rotate(12deg)}54%{transform:rotate(-8deg)}68%{transform:rotate(4deg)}80%{transform:rotate(0)}}@keyframes usa-icon-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-14%)}}@keyframes usa-icon-flip{0%{transform:perspective(80px) rotateY(0)}100%{transform:perspective(80px) rotateY(360deg)}}@keyframes usa-icon-pop{0%{transform:scale(.55);opacity:.4}100%{transform:scale(1);opacity:1}}@keyframes usa-icon-blink{0%,100%{opacity:1}45%,55%{opacity:.15}}@keyframes usa-icon-draw{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}.usa-ipick{display:grid;gap:12px;color:var(--mo-kit-ink,inherit);font:inherit;--usa-ipick-size:24px;--usa-ipick-cell:56px}.usa-ipick-top{display:flex;flex-wrap:wrap;gap:8px;align-items:center}.usa-ipick-search{flex:1 1 220px;display:flex;align-items:center;gap:8px;padding:0 12px;min-height:40px;border:var(--mo-kit-bw,1px) var(--mo-kit-bs,solid) var(--mo-kit-line,rgb(0 0 0 / .16));border-radius:var(--mo-kit-radius,10px);background:var(--mo-kit-paper,#fff)}.usa-ipick-search input{flex:1;min-width:0;border:0;background:none;font:inherit;color:inherit;padding:8px 0;outline:none}.usa-ipick-search:focus-within{outline:2px solid var(--mo-kit-accent,#4f46e5);outline-offset:2px}.usa-ipick-count{font-size:.85em;opacity:.7;font-variant-numeric:tabular-nums}.usa-ipick-cats{display:flex;flex-wrap:wrap;gap:6px}.usa-ipick-cat{padding:5px 12px;border:1px solid var(--mo-kit-line,rgb(0 0 0 / .16));border-radius:999px;background:var(--mo-kit-paper,#fff);color:inherit;font:inherit;font-size:.85em;cursor:pointer}.usa-ipick-cat[aria-pressed=\"true\"]{background:var(--mo-kit-accent,#4f46e5);color:var(--mo-kit-on-accent,#fff);border-color:transparent}.usa-ipick-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(var(--usa-ipick-cell),1fr));gap:6px;max-height:var(--usa-ipick-height,360px);overflow:auto;padding:4px;margin:0;list-style:none}.usa-ipick-btn{display:grid;place-items:center;gap:4px;width:100%;aspect-ratio:1;padding:6px;border:1px solid transparent;border-radius:var(--mo-kit-radius,10px);background:var(--mo-kit-soft,rgb(0 0 0 / .035));color:inherit;cursor:pointer;transition:transform .18s ease,background .18s ease,border-color .18s ease}.usa-ipick-btn .usa-icon{width:var(--usa-ipick-size);height:var(--usa-ipick-size)}.usa-ipick-btn:hover{transform:translateY(-2px);border-color:var(--mo-kit-line,rgb(0 0 0 / .16))}.usa-ipick-btn:focus-visible{outline:2px solid var(--mo-kit-accent,#4f46e5);outline-offset:2px}.usa-ipick-btn[aria-pressed=\"true\"]{background:var(--mo-kit-accent,#4f46e5);color:var(--mo-kit-on-accent,#fff)}.usa-ipick-btn[aria-pressed=\"true\"] .usa-icon{animation:usa-icon-pop .35s cubic-bezier(.34,1.56,.64,1)}.usa-ipick-btn[hidden]{display:none}.usa-ipick-name{font-size:10px;line-height:1.15;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;opacity:.7}.usa-ipick[data-compact] .usa-ipick-name{display:none}.usa-ipick-empty{padding:24px;text-align:center;opacity:.7}.usa-ipick-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}.usa-ipick[data-static] .usa-ipick-btn{transition:none}.usa-ipick[data-static] .usa-ipick-btn:hover{transform:none}@media (prefers-reduced-motion:reduce){.usa-icon[data-run],.usa-icon[data-run]>*,.usa-ipick-btn[aria-pressed=\"true\"] .usa-icon{animation:none !important}}";

/** The motions an icon can play (17.14). */
const ICON_MOTIONS = ['spin', 'pulse', 'beat', 'bounce', 'wiggle', 'shake', 'ring', 'float', 'flip', 'draw', 'pop', 'blink'];
/** When a motion plays: always, on hover or focus of the nearest control, on click, or once when scrolled into view. */
const ICON_TRIGGERS = ['loop', 'hover', 'click', 'view'];
const SVG_NS = 'http://www.w3.org/2000/svg';
/** An icon's `<svg>` element, built with DOM calls (no markup parsing). Unknown names give an empty svg. */
function iconElement(name) {
    const svg = document.createElementNS(SVG_NS, 'svg');
    for (const [k, v] of Object.entries(ICON_SVG_ATTRS))
        svg.setAttribute(k, v);
    for (const part of iconParts(name)) {
        const el = document.createElementNS(SVG_NS, part.tag);
        for (const [k, v] of Object.entries(part.attrs))
            el.setAttribute(k, v);
        // a path length of 1 lets the draw motion trace any shape with the same dash numbers
        el.setAttribute('pathLength', '1');
        svg.append(el);
    }
    return svg;
}
const DURATIONS = { spin: 1200, pulse: 1200, beat: 900, bounce: 900, wiggle: 700, shake: 600, ring: 900, float: 1800, flip: 900, draw: 1100, pop: 450, blink: 900 };
function defineIcon(tag = 'usa-icon') {
    const ctor = base.defineElement(tag, Base => class Icon extends Base {
        static get observedAttributes() { return ['name', 'size', 'stroke', 'color', 'label', 'motion', 'trigger', 'duration']; }
        play() { this._play?.(); }
        mount() {
            const name = this.str('name');
            const svg = iconElement(name);
            svg.classList.add('usa-kit', 'usa-icon');
            svg.dataset.name = name;
            const size = Math.max(8, Math.min(512, this.num('size', 24)));
            svg.setAttribute('width', String(size));
            svg.setAttribute('height', String(size));
            svg.setAttribute('stroke-width', String(Math.max(0.5, Math.min(4, this.num('stroke', 2)))));
            const color = kit.cleanColor(this.str('color'));
            if (color)
                svg.style.color = color;
            const label = this.str('label');
            if (label) {
                svg.setAttribute('role', 'img');
                svg.setAttribute('aria-label', label);
            }
            else
                svg.setAttribute('aria-hidden', 'true');
            svg.setAttribute('focusable', 'false');
            const motion = ICON_MOTIONS.includes(this.str('motion')) ? this.str('motion') : null;
            const trigger = ICON_TRIGGERS.includes(this.str('trigger')) ? this.str('trigger') : 'hover';
            if (motion) {
                svg.dataset.motion = motion;
                svg.style.setProperty('--usa-icon-dur', `${Math.max(150, Math.min(10000, this.num('duration', DURATIONS[motion])))}ms`);
            }
            this.append(svg);
            this.onCleanup(() => svg.remove());
            this._play = undefined;
            if (!motion || this.reduced)
                return;
            if (trigger === 'loop') {
                svg.dataset.run = 'loop';
                return;
            }
            const start = () => {
                if (svg.dataset.run === 'once')
                    return;
                svg.dataset.run = 'once';
                this.emit('play', { name, motion });
            };
            // the run ends when the motion's last animation ends (the draw motion animates every shape)
            this.listen(svg, 'animationend', (e) => {
                if (e.target === svg || e.target === svg.lastElementChild)
                    delete svg.dataset.run;
            });
            this._play = start;
            if (trigger === 'view') {
                let seen = false;
                this.inView((v) => { if (v && !seen) {
                    seen = true;
                    start();
                } }, { threshold: 0.6 });
            }
            else {
                const host = this.closest('button, a, [role="button"], label') || this;
                if (trigger === 'click')
                    this.listen(host, 'click', start);
                else {
                    this.listen(host, 'pointerenter', start);
                    this.listen(host, 'focusin', start);
                }
            }
        }
    }, { id: 'icons', text: css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.ICONS = ICONS;
exports.ICON_CATEGORIES = ICON_CATEGORIES;
exports.ICON_GROUPS = ICON_GROUPS;
exports.ICON_MOTIONS = ICON_MOTIONS;
exports.ICON_SVG_ATTRS = ICON_SVG_ATTRS;
exports.ICON_TRIGGERS = ICON_TRIGGERS;
exports.css = css;
exports.defineIcon = defineIcon;
exports.iconCategory = iconCategory;
exports.iconElement = iconElement;
exports.iconNames = iconNames;
exports.iconParts = iconParts;
exports.iconSvg = iconSvg;
exports.searchIcons = searchIcons;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.17.0/dist/chunks/icon-DrmwqnI9.cjs.map