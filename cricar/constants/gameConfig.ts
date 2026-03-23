export const GAME_CONFIG = {
  // Over limit options
  OVER_OPTIONS: [5, 10, 20] as const,

  // Default stamina
  MAX_STAMINA: 100,

  // Stamina cost for the fallback skill when player has 0 stamina
  MIN_SKILL_STAMINA_COST: 5,

  // DRS reviews per innings
  DRS_REVIEWS_PER_INNINGS: 2,

  // Multiplayer
  ROOM_CODE_LENGTH: 6,
  DISCONNECT_TIMEOUT_SECONDS: 30,
  MAX_RECONNECT_ATTEMPTS: 3,

  // Connection latency thresholds (ms)
  BLUETOOTH_MAX_LATENCY: 15,
  LAN_MAX_LATENCY: 30,

  // Card scanning
  SCAN_RATE_LIMIT_PER_HOUR: 10,

  // Transfer
  TRANSFER_FEE_INR: 10,
  TRANSFER_EXPIRY_HOURS: 24,

  // Upgrade
  PACK_UPGRADE_PRICE_INR: 50,

  // Tournament
  MAX_TOURNAMENT_TEAMS: [4, 8, 16] as const,

  // Fielder tap window (seconds)
  MIN_FIELDER_TAP_WINDOW: 0.8,
  MAX_FIELDER_TAP_WINDOW: 2.0,

  // BLE
  BLE_SERVICE_UUID: 'CRICAR-MATCH',
  BLE_SCAN_TIMEOUT_MS: 10000,
  BLE_ADVERTISING_INTERVAL_MS: 2000,

  // mDNS
  MDNS_SERVICE_TYPE: '_cricar._tcp',
  MDNS_BROADCAST_INTERVAL_MS: 2000,
} as const;

export const COLORS = {
  primary: '#1B5E20',
  primaryLight: '#4CAF50',
  primaryDark: '#0A1128',
  secondary: '#FF6F00',
  secondaryLight: '#FFA726',
  background: '#0A1128',
  surface: '#1A2744',
  surfaceLight: '#243B5E',
  text: '#FFFFFF',
  textSecondary: '#B0BEC5',
  error: '#EF5350',
  success: '#66BB6A',
  warning: '#FFA726',
  border: '#37474F',
  cardGold: '#FFD700',
  cardSilver: '#C0C0C0',
  cardBronze: '#CD7F32',
} as const;

export const FONTS = {
  regular: 'System',
  bold: 'System',
  mono: 'SpaceMono',
} as const;

