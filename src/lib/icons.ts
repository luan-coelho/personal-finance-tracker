/**
 * Conjunto de ícones do design system Radar.
 * Padrão: viewBox 24×24, fill none, stroke currentColor, traço 1,5,
 * linecap/linejoin round, um único <path d> por ícone.
 * Renderize com o componente <Icon name="..." /> de @/components/ui/icon.
 */
export const icons = {
  // ---------------------------------------------------------------
  // Radar (originais, copiados de icons.json)
  // ---------------------------------------------------------------
  home: 'M3 11l9-8 9 8v10h-6v-6H9v6H3V11z',
  menu: 'M4 7h16M4 12h16M4 17h16',
  'sidebar-collapse':
    'M6 4h12a3 3 0 0 1 3 3v10a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3v-10a3 3 0 0 1 3 -3zM9 4v16M15 10l-2 2 2 2',
  'sidebar-expand':
    'M6 4h12a3 3 0 0 1 3 3v10a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3v-10a3 3 0 0 1 3 -3zM9 4v16M13 10l2 2-2 2',
  'chevron-right': 'M9 6l6 6-6 6',
  'chevron-left': 'M15 6l-6 6 6 6',
  'chevron-down': 'M6 9l6 6 6-6',
  'chevron-up': 'M6 15l6-6 6 6',
  'chevrons-up-down': 'M8 9l4-4 4 4M8 15l4 4 4-4',
  'arrow-right': 'M5 12h14M13 6l6 6-6 6',
  'arrow-left': 'M19 12H5M12 19l-7-7 7-7',
  'arrow-up': 'M12 19V5M5 12l7-7 7 7',
  'arrow-down': 'M12 5v14M5 12l7 7 7-7',
  'arrow-up-right': 'M7 17L17 7M8 7h9v9',
  'arrow-down-left': 'M17 7L7 17M16 17H7V8',
  'arrow-left-right': 'M4 8h16M16 4l4 4-4 4M20 16H4M8 12l-4 4 4 4',
  'external-link': 'M14 4h6v6M20 4l-9 9M18 14v6H4V6h6',
  'log-in': 'M10 4H5v16h5M14 8l4 4-4 4M8 12h10',
  'log-out': 'M15 4h3a2 2 0 012 2v12a2 2 0 01-2 2h-3M10 17l-5-5 5-5M5 12h11',
  search: 'M4 11a7 7 0 1014 0 7 7 0 10-14 0M20 20l-3.5-3.5',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  x: 'M6 6l12 12M18 6L6 18',
  check: 'M5 12l5 5 9-10',
  'more-horizontal': 'M5 12h.01M12 12h.01M19 12h.01',
  'more-vertical': 'M12 5v.01M12 12v.01M12 19v.01',
  pencil: 'M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4',
  trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13',
  copy: 'M10 8h8a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2v-8a2 2 0 0 1 2 -2zM16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2',
  filter: 'M3 5h18l-7 8v6l-4 2v-8L3 5z',
  sliders: 'M4 7h10M18 7h2M4 17h4M12 17h8M14 7a2 2 0 1 0 4 0a2 2 0 1 0 -4 0M8 17a2 2 0 1 0 4 0a2 2 0 1 0 -4 0',
  upload: 'M12 16V4M7 9l5-5 5 5M4 20h16',
  download: 'M12 4v12M7 11l5 5 5-5M4 20h16',
  refresh: 'M20 12a8 8 0 01-14 5.3M4 12a8 8 0 0114-5.3M18 3v4h-4M6 21v-4h4',
  'rotate-cw': 'M20 11a8 8 0 10-2.3 5.7M20 5v6h-6',
  history: 'M20 11a8 8 0 00-14.9-3M4 4v4h4M4 13a8 8 0 0014.9 3M20 20v-4h-4',
  play: 'M8 5.5v13l10.5-6.5z',
  stop: 'M6 6h12v12H6z',
  eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM9 12a3 3 0 1 0 6 0a3 3 0 1 0 -6 0',
  scan: 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5',
  power: 'M12 3v9M6.3 6.3a8 8 0 1011.4 0',
  'check-circle': 'M3 12a9 9 0 1018 0 9 9 0 10-18 0M8 12l3 3 5-6',
  'x-circle': 'M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0M9 9l6 6M15 9l-6 6',
  info: 'M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0M12 11v5M12 8v.5',
  'alert-circle': 'M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0M12 8v5M12 16v.5',
  'alert-triangle': 'M12 3l10 18H2L12 3zM12 10v4M12 17.5v.5',
  'help-circle': 'M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0M9.5 9.5a2.5 2.5 0 015 0c0 1.5-2.5 2-2.5 3.5M12 17h.01',
  clock: 'M3 12a9 9 0 1018 0 9 9 0 10-18 0M12 7v5l3 2',
  timer: 'M10 2h4M12 14V9M4 14a8 8 0 1 0 16 0a8 8 0 1 0 -16 0',
  shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z',
  'shield-check': 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3zM9 12l2 2 4-4',
  lock: 'M7 11h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-6a2 2 0 0 1 2 -2zM8 11V8a4 4 0 018 0v3',
  key: 'M4 15a4 4 0 1 0 8 0a4 4 0 1 0 -8 0M11 12l9-9M17 6l3 3',
  cloud: 'M7 18a5 5 0 01-.7-9.95A6 6 0 0117.9 9a4.5 4.5 0 01-.4 9z',
  'cloud-check': 'M7 18a5 5 0 01-.7-9.95A6 6 0 0117.9 9a4.5 4.5 0 01-.4 9zM9.5 13.5l2 2 3.5-4',
  'cloud-alert': 'M7 18a5 5 0 01-.7-9.95A6 6 0 0117.9 9a4.5 4.5 0 01-.4 9zM12 11v4M12 17.5v.5',
  'cloud-upload': 'M7 18a5 5 0 01-.7-9.95A6 6 0 0117.9 9a4.5 4.5 0 01-.4 9zM12 16v-5M9.5 13.5L12 11l2.5 2.5',
  'cloud-download': 'M7 18a5 5 0 01-.7-9.95A6 6 0 0117.9 9a4.5 4.5 0 01-.4 9zM12 10v6M9.5 13.5L12 16l2.5-2.5',
  'cloud-off': 'M3 3l18 18M7 18a5 5 0 01-.7-9.95M10.5 6.2A6 6 0 0117.9 9a4.5 4.5 0 012.6 7.6',
  'wifi-off': 'M3 3l18 18M8.5 16.5a5 5 0 017 0M5 13a10 10 0 015.5-2.8M19 13a10 10 0 00-3-2M12 20h.01',
  sparkles:
    'M12 3l1.8 4.7 4.7 1.8-4.7 1.8L12 16l-1.8-4.7-4.7-1.8 4.7-1.8zM19 15l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9z',
  sparkle: 'M12 3l1.8 4.7 4.7 1.8-4.7 1.8L12 16l-1.8-4.7-4.7-1.8 4.7-1.8z',
  clipboard: 'M9 4h6v3H9zM7 6H5v15h14V6h-2M9 12h6M9 16h4',
  'clipboard-check': 'M9 4h6v3H9zM7 6H5v15h14V6h-2M9 14l2 2 4-4',
  file: 'M14 3H6v18h12V7zM14 3v4h4',
  'file-text': 'M14 3H6v18h12V7zM14 3v4h4M9 13h6M9 17h4',
  'file-check': 'M14 3H6v18h12V7zM14 3v4h4M9 14l2 2 4-4',
  document: 'M5 4h11l3 3v13H5zM9 10h6M9 14h6M9 18h3',
  save: 'M5 4h11l3 3v13H5zM8 4v5h7V4M8 20v-6h8v6',
  certificate: 'M6 3h12v18l-3-2-3 2-3-2-3 2V3zM9 8h6M9 12h6',
  folder: 'M3 6h6l2 2h10v11H3z',
  layers: 'M4 7l8-4 8 4-8 4zM4 12l8 4 8-4M4 17l8 4 8-4',
  image: 'M4 5h16v14H4zM4 16l5-5 4 4 3-3 4 4M15.5 9.5h.01',
  camera: 'M4 8h3l2-3h6l2 3h3v11H4zM9 13.5a3 3 0 106 0 3 3 0 10-6 0',
  'chart-bar': 'M5 20V11M11 20V5M17 20v-6M3 20h18',
  palette:
    'M12 3a9 9 0 100 18c1 0 1.6-.7 1.6-1.5 0-.4-.2-.8-.5-1.1-.3-.3-.5-.7-.5-1.1 0-.9.7-1.6 1.6-1.6H16a5 5 0 005-5c0-4.3-4-7.7-9-7.7zM7.5 12h.01M9.5 7.5h.01M14.5 7.5h.01',
  calendar: 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4',
  'calendar-plus': 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4M12 13v5M9.5 15.5h5',
  'calendar-check': 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4M9 15l2 2 4-4',
  user: 'M8 8a4 4 0 108 0 4 4 0 10-8 0M4 21a8 8 0 0116 0',
  'user-plus': 'M6 8a4 4 0 1 0 8 0a4 4 0 1 0 -8 0M3 21a7 7 0 0114 0M19 8v6M16 11h6',
  users: 'M5.5 8a3.5 3.5 0 107 0 3.5 3.5 0 10-7 0M2.5 20a6.5 6.5 0 0113 0M16 4.5a3.5 3.5 0 010 7M18 14a6 6 0 013.5 6',
  'id-card': 'M5 5h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10a2 2 0 0 1 2 -2zM7 10h4M7 14h7',
  'graduation-cap': 'M3 9l9-4 9 4-9 4-9-4zM7 11v5c0 1.5 2.5 3 5 3s5-1.5 5-3v-5M21 9v6',
  crown:
    'M3.5 8.5l4.2 3.6L12 5.5l4.3 6.6 4.2-3.6-1.7 9.5H5.2zM6.1000000000000005 19h11.799999999999999a0.9 0.9 0 0 1 0.9 0.9v0a0.9 0.9 0 0 1 -0.9 0.9h-11.799999999999999a0.9 0.9 0 0 1 -0.9 -0.9v0a0.9 0.9 0 0 1 0.9 -0.9z',
  building: 'M4 21V5l8-3v19M12 9h8v12',
  'building-2': 'M4 21V5l8-3v19M12 9h8v12M2 21h20M7 8h2M7 12h2M7 16h2M15 13h2M15 17h2',
  warehouse: 'M3 21h18M4 10h16M12 3l8 5H4l8-5zM6 10v8M10 10v8M14 10v8M18 10v8',
  'map-pin': 'M12 21s-7-6.2-7-11a7 7 0 1114 0c0 4.8-7 11-7 11zM9.5 10a2.5 2.5 0 105 0 2.5 2.5 0 10-5 0',
  sitemap: 'M9 3h6v5H9zM3 16h6v5H3zM15 16h6v5h-6zM12 8v4M6 16v-4h12v4',
  car: 'M4 16v-4l2-5h12l2 5v4M3 12h18M6 16.5a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0M15 16.5a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0',
  mail: 'M3 6h18v12H3zM3 7l9 6 9-6',
  message: 'M4 5h16v11H9l-5 4zM8 9h8M8 12h5',
  phone: 'M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z',
  bell: 'M6 16v-5a6 6 0 0112 0v5l1.5 2h-15L6 16zM10 21h4',
  mic: 'M12 3a3 3 0 00-3 3v6a3 3 0 006 0V6a3 3 0 00-3-3zM5 11a7 7 0 0014 0M12 18v3',
  briefcase: 'M5 7h14a2 2 0 0 1 2 2v9a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-9a2 2 0 0 1 2 -2zM3 11h18M9 7V5h6v2',
  'credit-card': 'M5 5h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10a2 2 0 0 1 2 -2zM3 10h18M7 15h3',
  flask: 'M9 3v5M15 3v5M6 8h12v3a6 6 0 01-12 0V8zM12 17v4',
  sun: 'M8 12a4 4 0 1 0 8 0a4 4 0 1 0 -8 0M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
  moon: 'M20 14.5A8 8 0 019.5 4a8 8 0 1010.5 10.5z',

  // ---------------------------------------------------------------
  // Adicionados neste projeto (desenhados no padrão Radar)
  // ---------------------------------------------------------------
  wallet:
    'M5 7h14a2 2 0 0 1 2 2v9a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-9a2 2 0 0 1 2 -2zM5 7l10 -3l1 3M16 11.5h5v5h-5a2.5 2.5 0 0 1 0 -5z',
  'piggy-bank':
    'M4 13a7 5.5 0 1 0 14 0a7 5.5 0 1 0 -14 0M18 11h3v4h-3M7.5 18v3M14.5 18v3M7 8.6V4.5l3.5 3.1M13 4.5a2 2 0 1 0 4 0a2 2 0 1 0 -4 0',
  target: 'M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0M7 12a5 5 0 1 0 10 0a5 5 0 1 0 -10 0M11 12a1 1 0 1 0 2 0a1 1 0 1 0 -2 0',
  tag: 'M4 4h7l9 9l-7 7l-9 -9zM7 8a1 1 0 1 0 2 0a1 1 0 1 0 -2 0',
  hash: 'M5 9h15M4 15h15M10 4l-2 16M16 4l-2 16',
  'trending-up': 'M3 17l6 -6l4 4l8 -8M15 7h6v6',
  'trending-down': 'M3 7l6 6l4 -4l8 8M15 17h6v-6',
  'arrow-up-circle': 'M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0M12 16V8M8.5 11.5L12 8l3.5 3.5',
  'arrow-down-circle': 'M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0M12 8v8M8.5 12.5L12 16l3.5 -3.5',
  list: 'M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01',
  grid: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',
  table: 'M4 5h16v14H4zM4 10h16M4 14.5h16M10 10v9',
  lightbulb: 'M9 18h6M10 21h4M9 18v-3a6 6 0 1 1 6 0v3',
  zap: 'M13 3L5 14h6l-1 7l8 -11h-6l1 -7z',
  utensils: 'M6 3v5a2 2 0 0 0 4 0V3M8 3v18M18 14v7M18 3c-2 1 -3 4 -3 7v4h3V3z',
  'user-check': 'M6 8a4 4 0 1 0 8 0a4 4 0 1 0 -8 0M3 21a7 7 0 0114 0M16 11l2 2l4 -4',
  'user-x': 'M6 8a4 4 0 1 0 8 0a4 4 0 1 0 -8 0M3 21a7 7 0 0114 0M17 8l4 4M21 8l-4 4',
  smartphone: 'M8 3h8a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2zM11 18h2',
  'shopping-bag': 'M5 8h14l-1 13H6zM9 10V7a3 3 0 0 1 6 0v3',
  'shopping-cart':
    'M3 4h2.5l2 11h11l2 -8H6M7.5 19.5a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0M15.5 19.5a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0',
  store: 'M4.5 4h15L21 9H3zM3 9a3 3 0 0 0 6 0a3 3 0 0 0 6 0a3 3 0 0 0 6 0M5 11.5V20h14v-8.5M10 20v-5h4v5',
  share: 'M12 3v12M8 7l4 -4l4 4M8 11H6v10h12V11h-2',
  gear: 'M10.2 5.8L10.6 3.1L13.4 3.1L13.8 5.8A6.5 6.5 0 0 1 15.1 6.3L17.3 4.7L19.3 6.7L17.7 8.9A6.5 6.5 0 0 1 18.2 10.2L20.9 10.6L20.9 13.4L18.2 13.8A6.5 6.5 0 0 1 17.7 15.1L19.3 17.3L17.3 19.3L15.1 17.7A6.5 6.5 0 0 1 13.8 18.2L13.4 20.9L10.6 20.9L10.2 18.2A6.5 6.5 0 0 1 8.9 17.7L6.7 19.3L4.7 17.3L6.3 15.1A6.5 6.5 0 0 1 5.8 13.8L3.1 13.4L3.1 10.6L5.8 10.2A6.5 6.5 0 0 1 6.3 8.9L4.7 6.7L6.7 4.7L8.9 6.3A6.5 6.5 0 0 1 10.2 5.8zM9 12a3 3 0 1 0 6 0a3 3 0 1 0 -6 0',
  receipt: 'M5 3h14v18l-2.33 -1.5l-2.33 1.5l-2.34 -1.5l-2.33 1.5l-2.33 -1.5L5 21zM9 8h6M9 12h6M9 16h2M14 16h1',
  plane:
    'M12 2c1 0 1.5 1 1.5 2.5V9l7.5 4.5V16l-7.5 -2.5V18l2.5 2v1.5L12 20.5l-4 1V20l2.5 -2v-4.5L3 16v-2.5L10.5 9V4.5C10.5 3 11 2 12 2z',
  heart: 'M12 20C6.5 16.5 3 13.5 3 9.5a4.5 4.5 0 0 1 9 -1.5a4.5 4.5 0 0 1 9 1.5c0 4 -3.5 7 -9 10.5z',
  'heart-pulse':
    'M12 20C6.5 16.5 3 13.5 3 9.5a4.5 4.5 0 0 1 9 -1.5a4.5 4.5 0 0 1 9 1.5c0 4 -3.5 7 -9 10.5zM6 12h3l1.5-3 3 6 1.5-3h3',
  gift: 'M4 8h16v4H4zM5 12v9h14v-9M12 8v13M12 8C11 5 7 4 7 6.5S12 8 12 8zM12 8c1 -3 5 -4 5 -1.5S12 8 12 8z',
  gamepad:
    'M7 7h10a5 5 0 0 1 0 10H7a5 5 0 0 1 0 -10zM7 10v4M5 12h4M14.75 10.5a.75 .75 0 1 0 1.5 0a.75 .75 0 1 0 -1.5 0M17.25 13a.75 .75 0 1 0 1.5 0a.75 .75 0 1 0 -1.5 0',
  'folder-tree': 'M4 3v13.5h6M4 8h6M10 4.5h3.5l1.5 1.5h5v5H10zM10 13h3.5l1.5 1.5h5v5H10z',
  'folder-open': 'M3 19V6h6l2 2h7v3M3 19l3.5 -8h15l-3.5 8z',
  droplet: 'M12 3s-6 6.5 -6 11a6 6 0 0 0 12 0c0 -4.5 -6 -11 -6 -11z',
  droplets:
    'M8.5 8s-5 5.2 -5 8.5a5 5 0 0 0 10 0C13.5 13.2 8.5 8 8.5 8zM17 3s-3 3.2 -3 5.5a3 3 0 0 0 6 0C20 6.2 17 3 17 3z',
  'dollar-sign': 'M12 3v2M12 17v4M16.5 8A3.5 3.5 0 0 0 13 5h-2a3 3 0 0 0 0 6h2a3 3 0 0 1 0 6h-2a3.5 3.5 0 0 1 -3.5 -3',
  banknote: 'M3 6h18v12H3zM9 12a3 3 0 1 0 6 0a3 3 0 1 0 -6 0M6 9h.01M18 15h.01',
  laptop: 'M6 5h12a1 1 0 0 1 1 1v10H5V6a1 1 0 0 1 1 -1zM3 19h18',
  circle: 'M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0',
  'panel-left': 'M6 4h12a3 3 0 0 1 3 3v10a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3v-10a3 3 0 0 1 3 -3zM9 4v16',

  // Categorias (desenhados no padrão Radar para as categorias que caíam na pasta genérica)
  dumbbell: 'M5 8a1 1 0 0 1 1 -1h1a1 1 0 0 1 1 1v8a1 1 0 0 1 -1 1h-1a1 1 0 0 1 -1 -1zM16 8a1 1 0 0 1 1 -1h1a1 1 0 0 1 1 1v8a1 1 0 0 1 -1 1h-1a1 1 0 0 1 -1 -1zM8 12h8M5 10H3v4h2M19 10h2v4h-2',
  repeat: 'M4 11V9a3 3 0 0 1 3 -3h12M16 3l3 3l-3 3M20 13v2a3 3 0 0 1 -3 3H5M8 21l-3 -3l3 -3',
  scissors: 'M3 6a3 3 0 1 0 6 0a3 3 0 1 0 -6 0M3 18a3 3 0 1 0 6 0a3 3 0 1 0 -6 0M8.1 8.1L20 20M8.1 15.9L20 4',
  trophy: 'M7 4h10v5a5 5 0 0 1 -10 0zM7 6H5a2 2 0 0 0 0 4h2.4M17 6h2a2 2 0 0 1 0 4h-2.4M12 14v3M9 21h6l-1 -4h-4z',
  coins: 'M5 6a7 2.5 0 1 0 14 0a7 2.5 0 1 0 -14 0M5 6v4c0 1.4 3.1 2.5 7 2.5s7 -1.1 7 -2.5V6M5 10v4c0 1.4 3.1 2.5 7 2.5s7 -1.1 7 -2.5v-4M5 14v4c0 1.4 3.1 2.5 7 2.5s7 -1.1 7 -2.5v-4',
  'pie-chart': 'M21 12A9 9 0 1 1 12 3v9zM15 3.5a8.5 8.5 0 0 1 5.5 5.5H15z',
  'hand-coins': 'M11 15h2a2 2 0 0 0 0 -4h-3c-.6 0 -1.1 .2 -1.4 .6L3 17M7 21l1.6 -1.4c.3 -.4 .8 -.6 1.4 -.6h4c1.1 0 2.1 -.4 2.8 -1.2l4.6 -4.4a2 2 0 0 0 -2.8 -2.9l-4.2 3.9M2 16l6 6M13.5 5.5a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0 -5 0',
  landmark: 'M3 21h18M5 18h14M4 9h16M12 3l8 6H4zM7 9v9M12 9v9M17 9v9',
  'square-parking': 'M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2zM9 17V7h4a3 3 0 0 1 0 6H9',
  wrench: 'M14.5 6.5a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0L21 6a6 6 0 0 1 -8 8l-7 7a2.1 2.1 0 0 1 -3 -3l7 -7a6 6 0 0 1 8 -8z',
  pill: 'M10.5 20.5a4.95 4.95 0 0 1 -7 -7l10 -10a4.95 4.95 0 0 1 7 7zM8.5 8.5l7 7',
  paw: 'M3 11a2 2 0 1 0 4 0a2 2 0 1 0 -4 0M7 6a2 2 0 1 0 4 0a2 2 0 1 0 -4 0M13 6a2 2 0 1 0 4 0a2 2 0 1 0 -4 0M17 11a2 2 0 1 0 4 0a2 2 0 1 0 -4 0M12 12.5c-2.5 0 -5.5 3 -5.5 5.5c0 1.5 1.2 2.5 2.7 2.5c1 0 1.8 -.5 2.8 -.5s1.8 .5 2.8 .5c1.5 0 2.7 -1 2.7 -2.5c0 -2.5 -3 -5.5 -5.5 -5.5z',
  undo: 'M9 14l-5 -5l5 -5M4 9h10.5a5.5 5.5 0 0 1 0 11H11',
  tv: 'M4 7h16a1 1 0 0 1 1 1v11a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1v-11a1 1 0 0 1 1 -1zM8 3l4 4l4 -4M10.5 11v5l4 -2.5z',
  shirt: 'M8 3l-5 3l2 5l2.5 -1v11h9V10l2.5 1l2 -5l-5 -3c0 1.7 -1.8 3 -4 3s-4 -1.3 -4 -3z',
  'circle-ellipsis': 'M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0M8 12h.01M12 12h.01M16 12h.01',
} as const

export type IconName = keyof typeof icons

/** Ícone usado quando um nome vindo de dados (ex.: reserves.icon) não existe no conjunto. */
export const FALLBACK_ICON: IconName = 'piggy-bank'

export function isIconName(value: unknown): value is IconName {
  return typeof value === 'string' && Object.hasOwn(icons, value)
}

/** Converte um nome arbitrário (ex.: vindo do banco) em IconName válido. */
export function toIconName(value: unknown, fallback: IconName = FALLBACK_ICON): IconName {
  return isIconName(value) ? value : fallback
}
