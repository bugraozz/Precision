export const PRECISION_COLORS = {
  // ── Canvas ────────────────────────────────────────────────────────────────
  bg: "#070508",
  bgSoft: "rgba(8,5,7,0.88)",
  bgPanelStrong: "rgba(12,7,10,0.92)",

  // ── Glass surfaces ────────────────────────────────────────────────────────
  surface: "rgba(255,255,255,0.04)",
  surfaceStrong: "rgba(255,255,255,0.06)",
  surfaceSunken: "rgba(0,0,0,0.35)",

  // ── Text hierarchy ────────────────────────────────────────────────────────
  text: "#f1edee",
  textStrong: "#ffffff",
  textMuted: "#948c90",
  textDim: "#cfc5c9",
  textSubtle: "#767074",
  textBodyMuted: "#8a8186",
  textCardMeta: "#8f878c",
  textClaim: "#ecd9b0",

  // ── Accents ───────────────────────────────────────────────────────────────
  accentSoft: "#67e8f9",

  // ── Crimson / ruby (primary) ──────────────────────────────────────────────
  primary: "#e11d48",
  primaryStrong: "#fb7185",
  primaryDeep: "#9f1239",
  primaryInk: "#ffffff",
  primarySoft: "rgba(225,29,72,0.16)",
  primarySoftMid: "rgba(225,29,72,0.11)",
  primarySoftBadge: "rgba(225,29,72,0.09)",
  primaryTint: "rgba(225,29,72,0.16)",
  primaryAura: "rgba(225,29,72,0.07)",

  // ── Hot rose (premium VIP) ────────────────────────────────────────────────
  pink: "#f43f5e",
  pinkStrong: "#fda4af",
  pinkSoft: "rgba(244,63,94,0.13)",
  pinkSoftBadge: "rgba(244,63,94,0.09)",
  pinkAura: "rgba(244,63,94,0.06)",

  // ── Ice silver (cool counterweight) ───────────────────────────────────────
  cyan: "#aebccd",
  cyanStrong: "#c3d0de",
  cyanSoft: "rgba(174,188,205,0.22)",
  cyanTagBg: "rgba(174,188,205,0.1)",
  cyanAura: "rgba(174,188,205,0.05)",
  cyanTint: "rgba(174,188,205,0.09)",
  cyanGlow: "rgba(174,188,205,0.14)",

  // ── Champagne gold (VIP / highlights) ─────────────────────────────────────
  gold: "#d4af6a",
  goldStrong: "#ecd9b0",
  goldSoft: "rgba(212,175,106,0.14)",

  // ── Emerald (coins / success) ─────────────────────────────────────────────
  emerald: "#34d399",
  emeraldSoft: "rgba(52,211,153,0.12)",

  // ── Amber (stars / rank 1) ────────────────────────────────────────────────
  amber: "#fbbf24",
  amberStrong: "#fcd34d",
  amberSoft: "rgba(251,191,36,0.12)",

  // ── Bronze (rank 3) ───────────────────────────────────────────────────────
  bronze: "#e0a075",

  // ── Glass whites ──────────────────────────────────────────────────────────
  whiteSoftest: "rgba(255,255,255,0.025)",
  whiteSoft: "rgba(255,255,255,0.045)",
  whiteTint: "rgba(255,255,255,0.22)",
  whiteTrack: "rgba(255,255,255,0.07)",

  // ── Borders ───────────────────────────────────────────────────────────────
  border: "rgba(255,255,255,0.09)",
  borderCard: "rgba(255,255,255,0.08)",
  borderMuted: "rgba(255,255,255,0.05)",
  borderFaint: "rgba(255,255,255,0.04)",
  borderPanel: "rgba(255,255,255,0.08)",
  borderSoft: "rgba(255,255,255,0.12)",
  borderGoldSoft: "rgba(212,175,106,0.24)",
  borderGold: "rgba(212,175,106,0.3)",
  borderGoldStrong: "rgba(236,217,176,0.46)",
  borderGoldHeavy: "rgba(236,217,176,0.5)",
  borderGoldPress: "rgba(236,217,176,0.55)",
  borderGoldActive: "rgba(236,217,176,0.55)",
  borderGuide: "rgba(148,163,184,0.25)",
  borderLight: "rgba(248,250,252,0.12)",

  // ── Shadow ────────────────────────────────────────────────────────────────
  shadowBlack: "#000000",
  shadowDeep: "#0a0206",

  // ── Feedback ──────────────────────────────────────────────────────────────
  success: "#34d399",
  danger: "#f87171",

  // ── Mechanics ─────────────────────────────────────────────────────────────
  mechanicSpeed: "#fb923c",
  mechanicSpeedBg: "rgba(251,146,60,0.13)",
  mechanicStability: "#7dd3fc",
  mechanicStabilityBg: "rgba(56,189,248,0.13)",
  mechanicSymmetry: "#4ade80",
  mechanicSymmetryBg: "rgba(74,222,128,0.13)",
  mechanicMemory: "#fda4af",
  mechanicMemoryBg: "rgba(244,63,94,0.13)",

  // ── Boss ──────────────────────────────────────────────────────────────────
  bossText: "#f87171",
  bossBg: "rgba(248,113,113,0.16)",

  // ── Icon ──────────────────────────────────────────────────────────────────
  iconTileText: "#ecd9b0"
} as const;

export const PRECISION_GRADIENTS = {
  /** Full-screen ambience: warm black → deep wine */
  hero: ["#070508", "#100a0e", "#170a12", "#100a0e", "#070508"] as const,
  heroBottom: ["#100a0e", "#070508"] as const,
  /** Ruby melt: rose → crimson → dark ruby */
  primary: ["#fb7185", "#e11d48", "#9f1239"] as const,
  /** Faint vertical sheen on cards */
  cardGloss: ["rgba(255,255,255,0.08)", "rgba(255,255,255,0.015)"] as const,
  cyanGlow: ["rgba(174,188,205,0.1)", "rgba(174,188,205,0)"] as const,
  pinkGlow: ["rgba(244,63,94,0.12)", "rgba(244,63,94,0)"] as const,
  rubyGlow: ["rgba(225,29,72,0.14)", "rgba(225,29,72,0)"] as const
} as const;

export const PRECISION_SPACE = {
  xxs: 2,
  xs: 4,
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  xxl: 22,
  xxxl: 28,
  hero: 34,
  screen: 22,
  giant: 36,
  massive: 48,
  overlay: 64
} as const;

export const PRECISION_RADIUS = {
  sm: 10,
  md: 12,
  lg: 14,
  xl: 16,
  xxl: 20,
  card: 22,
  pill: 999
} as const;

export const PRECISION_TYPE = {
  caption: 9,
  label: 10,
  body: 13,
  sub: 14,
  title: 16,
  section: 19,
  metric: 26,
  hero: 34,
  display: 40,
  displayLg: 48
} as const;

export const PRECISION_SHADOW = {
  sm: {
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3
  },
  md: {
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8
  },
  lg: {
    shadowOpacity: 0.45,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 16 },
    elevation: 14
  },
  glow: {
    shadowOpacity: 0.4,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10
  }
} as const;
