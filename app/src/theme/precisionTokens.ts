export const PRECISION_COLORS = {
  // Deep obsidian backgrounds
  bg: "#0a1628",
  overlayScrim: "rgba(0, 0, 0, 0.72)",
  tutorialCardBg: "#0c1120",
  bgSoft: "rgba(6,10,22,0.88)",
  bgSoftAlt: "rgba(8,14,28,0.78)",
  bgPanel: "rgba(6,12,24,0.92)",
  bgPanelMuted: "rgba(8,14,26,0.86)",
  bgPanelSoft: "rgba(6,12,24,0.88)",
  bgPanelStrong: "rgba(6,12,24,0.94)",
  bgMission: "rgba(5,10,20,0.9)",
  bgInventory: "rgba(5,14,30,0.82)",
  bgTargetCard: "rgba(4,12,26,0.94)",
  bgMeta: "rgba(6,12,22,0.82)",
  bgMetaSoft: "rgba(6,12,22,0.84)",
  bgLoadout: "rgba(4,12,26,0.78)",
  bgCard: "rgba(6,18,36,0.74)",
  bgGlass: "rgba(14,24,48,0.72)",

  // Premium text hierarchy
  text: "#f0f2f8",
  textStrong: "#ffffff",
  textMuted: "#8896b0",
  textDim: "#b8c4d8",
  textSubtle: "#7d8da8",
  textSection: "#6880a0",
  textCardTitle: "#edf1f8",
  textCardMeta: "#8898b4",
  textBody: "#a0b0c8",
  textBodyAlt: "#98a6bc",
  textBodyMuted: "#7890b0",
  textPanelIcon: "#6880a0",
  textPanelActive: "#fcd77a",
  textClaim: "#fcd77a",
  textIconButton: "#c0c8d8",
  textMechanic: "#b0c0d8",
  textGhost: "#a0aab8",
  textStatus: "#7888a0",
  textCompleteSub: "#8090a8",
  textCompleteButton: "#d0d8e8",
  textPremium: "#e8edf6",
  textTutorial: "#a0b0c8",
  textTutorialGhost: "#b0b8c8",
  textLiveValue: "#d0d8e8",
  textPlaySubtle: "#4a5568",
  textSoft: "#90a0b8",
  accentSoft: "#22d3ee",

  // Glass borders
  border: "rgba(255,255,255,0.12)",
  borderCard: "rgba(255,255,255,0.1)",
  borderMuted: "rgba(255,255,255,0.05)",
  borderFaint: "rgba(255,255,255,0.04)",
  borderPanel: "rgba(255,255,255,0.1)",
  borderSoft: "rgba(255,255,255,0.12)",
  borderGoldSoft: "rgba(252,215,122,0.2)",
  borderGold: "rgba(252,215,122,0.28)",
  borderGoldStrong: "rgba(252,215,122,0.44)",
  borderGoldHeavy: "rgba(252,215,122,0.48)",
  borderGoldPress: "rgba(252,215,122,0.52)",
  borderGoldActive: "rgba(252,215,122,0.56)",
  borderGuide: "rgba(148,163,184,0.25)",
  borderLight: "rgba(248,250,252,0.12)",

  // Luxe gold primary
  primary: "#f59e0b",
  primaryStrong: "#fbbf24",
  primarySoft: "rgba(251,191,36,0.18)",
  primarySoftMid: "rgba(251,191,36,0.1)",
  primarySoftBadge: "rgba(251,191,36,0.06)",
  primarySoftLow: "rgba(251,191,36,0.08)",
  primarySoftLighter: "rgba(251,191,36,0.06)",
  primaryTint: "rgba(251,191,36,0.14)",
  primaryAura: "rgba(251,191,36,0.06)",

  // Electric cyan accent
  cyan: "#22d3ee",
  cyanSoft: "rgba(34,211,238,0.22)",
  cyanTagBg: "rgba(34,211,238,0.1)",
  cyanAura: "rgba(34,211,238,0.05)",
  cyanTint: "rgba(34,211,238,0.08)",
  cyanGlow: "rgba(34,211,238,0.18)",

  // Glass whites
  whiteSoftest: "rgba(255,255,255,0.02)",
  whiteUltraSoft: "rgba(255,255,255,0.015)",
  whiteSoft: "rgba(255,255,255,0.04)",
  whiteTint: "rgba(255,255,255,0.22)",
  whiteTrack: "rgba(255,255,255,0.06)",

  // Shadows
  shadowBlack: "#000000",
  shadowDeep: "#010810",

  // Feedback
  success: "#34d399",
  danger: "#f87171",

  // Mechanic colors — vivid neon
  mechanicSpeed: "#fb923c",
  mechanicSpeedBg: "rgba(249,115,22,0.12)",
  mechanicStability: "#22d3ee",
  mechanicStabilityBg: "rgba(6,182,212,0.12)",
  mechanicSymmetry: "#4ade80",
  mechanicSymmetryBg: "rgba(74,222,128,0.12)",
  mechanicMemory: "#e879f9",
  mechanicMemoryBg: "rgba(232,121,249,0.12)",

  // Boss
  bossText: "#fca5a5",
  bossBg: "rgba(248,113,113,0.16)",

  // Icon
  iconTileText: "#fcd77a"
} as const;

export const PRECISION_GRADIENTS = {
  hero: ["#0a1628", "#0e1e3a", "#122848", "#0e1e3a", "#0a1628"] as const,
  heroBottom: ["#0e1e3a", "#0a1628"] as const,
  warmOverlay: ["rgba(251,191,36,0.04)", "rgba(251,191,36,0)"] as const,
  cyanOverlay: ["rgba(34,211,238,0.03)", "rgba(34,211,238,0)"] as const,
  diagonalAccent: ["rgba(251,191,36,0.03)", "rgba(34,211,238,0.02)", "rgba(251,191,36,0)"] as const,
  primary: ["#fcd34d", "#f59e0b", "#d97706"] as const,
  cyanGlow: ["rgba(34,211,238,0.12)", "rgba(34,211,238,0)"] as const,
  cardShine: ["rgba(255,255,255,0.06)", "rgba(255,255,255,0)"] as const,
  premiumBanner: ["#f59e0b", "#d97706", "#b45309"] as const,
  meshGlow: ["rgba(34,211,238,0.06)", "rgba(251,191,36,0.04)", "rgba(34,211,238,0.02)", "transparent"] as const
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
  screen: 24,
  giant: 36,
  massive: 48,
  overlay: 64
} as const;

export const PRECISION_RADIUS = {
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
  xxl: 24,
  card: 28,
  pill: 999
} as const;

export const PRECISION_TYPE = {
  caption: 10,
  label: 11,
  body: 13,
  sub: 14,
  title: 16,
  section: 20,
  metric: 26,
  hero: 36,
  display: 42,
  displayLg: 48
} as const;

export const PRECISION_SHADOW = {
  sm: {
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4
  },
  md: {
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8
  },
  lg: {
    shadowOpacity: 0.5,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 16 },
    elevation: 16
  },
  xl: {
    shadowOpacity: 0.55,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 24 },
    elevation: 24
  },
  glow: {
    shadowOpacity: 0.6,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12
  }
} as const;
