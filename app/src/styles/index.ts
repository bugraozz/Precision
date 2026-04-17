import { StyleSheet } from "react-native";
import { PRECISION_COLORS } from "../theme/precisionTokens";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PRECISION_COLORS.bg
  },
  heroGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  atmosphereOrbOne: {
    position: "absolute",
    width: 400,
    height: 400,
    borderRadius: 200,
    top: -120,
    right: -100,
    backgroundColor: "rgba(34,211,238,0.07)"
  },
  atmosphereOrbTwo: {
    position: "absolute",
    width: 350,
    height: 350,
    borderRadius: 175,
    bottom: -60,
    left: -140,
    backgroundColor: "rgba(251,191,36,0.06)"
  },
  homeContent: {
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 48,
    alignSelf: "center",
    width: "100%",
    maxWidth: 980
  },
  titleBar: {
    width: 64,
    height: 5,
    borderRadius: 999,
    backgroundColor: PRECISION_COLORS.primaryStrong,
    marginBottom: 18,
    shadowColor: PRECISION_COLORS.primary,
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8
  },
  heroTitle: {
    fontSize: 52,
    fontWeight: "900",
    color: PRECISION_COLORS.textStrong,
    letterSpacing: -1.2
  },
  heroSubtitle: {
    marginTop: 8,
    marginBottom: 32,
    color: PRECISION_COLORS.textMuted,
    fontSize: 15,
    letterSpacing: 2,
    textTransform: "uppercase"
  },
  statsRow: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 24
  },
  statCard: {
    flex: 1,
    borderRadius: 22,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: PRECISION_COLORS.borderCard,
    backgroundColor: PRECISION_COLORS.bgGlass,
    shadowColor: PRECISION_COLORS.shadowBlack,
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6
  },
  statCardGold: {
    borderColor: "rgba(252,215,122,0.3)",
    backgroundColor: "rgba(251,191,36,0.06)"
  },
  statCardCyan: {
    borderColor: "rgba(34,211,238,0.25)",
    backgroundColor: "rgba(34,211,238,0.05)"
  },
  statValue: {
    color: PRECISION_COLORS.textStrong,
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: -0.5
  },
  statLabel: {
    color: PRECISION_COLORS.textMuted,
    fontSize: 10,
    marginTop: 2,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    fontWeight: "800"
  },
  /* ── Stats Grid ── */
  statsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12
  },
  statCardWide: {
    flex: 1,
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderWidth: 1.5,
    borderColor: PRECISION_COLORS.borderCard,
    backgroundColor: "rgba(10,20,42,0.85)"
  },
  statCardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14
  },
  statIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(251,191,36,0.12)",
    borderWidth: 1,
    borderColor: "rgba(252,215,122,0.2)",
    alignItems: "center",
    justifyContent: "center"
  },
  statIconWrapCyan: {
    backgroundColor: "rgba(34,211,238,0.1)",
    borderColor: "rgba(34,211,238,0.2)"
  },
  statEmoji: {
    fontSize: 22
  },
  /* ── Resource Bar ── */
  resourceBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(10,20,42,0.85)",
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 18
  },
  resourceItem: {
    alignItems: "center",
    flex: 1
  },
  resourceDivider: {
    width: 1,
    height: 28,
    backgroundColor: PRECISION_COLORS.borderCard,
    opacity: 0.5
  },
  resourceIcon: {
    fontSize: 16,
    marginBottom: 2
  },
  resourceValue: {
    color: PRECISION_COLORS.textStrong,
    fontSize: 14,
    fontWeight: "900"
  },
  resourceLabel: {
    color: PRECISION_COLORS.textMuted,
    fontSize: 9,
    letterSpacing: 0.5,
    textTransform: "uppercase"
  },
  /* ── Premium Banner ── */
  premiumBanner: {
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: "rgba(252,215,122,0.35)",
    backgroundColor: "rgba(20,16,8,0.9)",
    padding: 18,
    marginBottom: 14,
    overflow: "hidden",
    shadowColor: "#f59e0b",
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8
  },
  premiumBannerGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 22
  },
  premiumBannerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 14
  },
  premiumIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(251,191,36,0.15)",
    borderWidth: 1,
    borderColor: "rgba(252,215,122,0.3)",
    alignItems: "center",
    justifyContent: "center"
  },
  premiumBannerIcon: {
    fontSize: 24
  },
  premiumTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  premiumBannerTitle: {
    color: "#fcd77a",
    fontWeight: "900",
    fontSize: 17,
    letterSpacing: -0.2
  },
  premiumBannerSub: {
    color: "rgba(252,215,122,0.55)",
    fontSize: 11,
    marginTop: 3,
    lineHeight: 16,
    fontWeight: "600"
  },
  premiumActiveBadge: {
    borderRadius: 8,
    backgroundColor: PRECISION_COLORS.primaryStrong,
    paddingHorizontal: 10,
    paddingVertical: 4
  },
  premiumActiveBadgeText: {
    color: "#1a1000",
    fontWeight: "900",
    fontSize: 10,
    letterSpacing: 1.5
  },
  premiumStatsRow: {
    flexDirection: "row",
    gap: 10
  },
  premiumStatChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(251,191,36,0.08)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(252,215,122,0.15)",
    paddingVertical: 9,
    paddingHorizontal: 12
  },
  premiumStatChipIcon: {
    fontSize: 14
  },
  premiumStatChipText: {
    color: "rgba(252,215,122,0.7)",
    fontSize: 12,
    fontWeight: "700"
  },
  /* ── Shop Row ── */
  shopRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 18
  },
  shopButton: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: PRECISION_COLORS.borderCard,
    backgroundColor: PRECISION_COLORS.bgGlass,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: "center"
  },
  shopButtonIcon: {
    fontSize: 20,
    marginBottom: 4
  },
  shopButtonText: {
    color: PRECISION_COLORS.textStrong,
    fontWeight: "800",
    fontSize: 12
  },
  shopButtonPrice: {
    color: PRECISION_COLORS.primaryStrong,
    fontWeight: "900",
    fontSize: 11,
    marginTop: 2
  },
  /* ── Mission Preview Card ── */
  missionPreviewCard: {
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: "rgba(34,211,238,0.25)",
    backgroundColor: "rgba(8,18,38,0.92)",
    padding: 20,
    marginBottom: 18,
    shadowColor: PRECISION_COLORS.cyan,
    shadowOpacity: 0.15,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10
  },
  missionPreviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14
  },
  missionPreviewIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "rgba(34,211,238,0.12)",
    borderWidth: 1.5,
    borderColor: "rgba(34,211,238,0.3)",
    alignItems: "center",
    justifyContent: "center"
  },
  missionPreviewIconText: {
    color: PRECISION_COLORS.cyan,
    fontWeight: "900",
    fontSize: 22
  },
  missionPreviewTitle: {
    color: PRECISION_COLORS.textStrong,
    fontWeight: "900",
    fontSize: 18,
    letterSpacing: -0.3
  },
  missionPreviewSub: {
    color: PRECISION_COLORS.textMuted,
    fontSize: 12,
    marginTop: 3,
    letterSpacing: 0.5
  },
  missionPreviewXp: {
    marginLeft: "auto",
    alignItems: "center",
    backgroundColor: "rgba(251,191,36,0.1)",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(251,191,36,0.2)"
  },
  missionPreviewXpValue: {
    color: PRECISION_COLORS.primaryStrong,
    fontWeight: "900",
    fontSize: 20
  },
  missionPreviewXpLabel: {
    color: PRECISION_COLORS.primaryStrong,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    opacity: 0.7
  },
  missionDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginVertical: 16
  },
  /* ── Mission Info Grid ── */
  missionInfoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 14
  },
  missionInfoItem: {
    width: "47%",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(14,26,50,0.8)",
    paddingVertical: 12,
    paddingHorizontal: 14
  },
  missionInfoLabel: {
    color: PRECISION_COLORS.textMuted,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 4
  },
  missionInfoValue: {
    color: PRECISION_COLORS.textStrong,
    fontWeight: "900",
    fontSize: 16
  },
  missionHintBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(251,191,36,0.06)",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "rgba(251,191,36,0.12)"
  },
  missionHintIcon: {
    fontSize: 14
  },
  /* ── Meta Row (inside metaCard) ── */
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6
  },
  metaDot: {
    color: PRECISION_COLORS.textMuted,
    fontSize: 12
  },
  /* ── Collection UI ── */
  collectionStatsBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: PRECISION_COLORS.borderCard,
    backgroundColor: PRECISION_COLORS.bgGlass,
    paddingVertical: 14,
    paddingHorizontal: 6,
    marginBottom: 16
  },
  collectionStatBox: {
    alignItems: "center",
    flex: 1
  },
  collectionStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: PRECISION_COLORS.borderCard
  },
  collectionStatValue: {
    color: PRECISION_COLORS.textStrong,
    fontWeight: "900",
    fontSize: 20
  },
  collectionStatLabel: {
    color: PRECISION_COLORS.textMuted,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginTop: 3
  },
  loadoutCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: PRECISION_COLORS.cyanSoft,
    backgroundColor: PRECISION_COLORS.bgMission,
    padding: 16,
    marginBottom: 18
  },
  loadoutTitle: {
    color: PRECISION_COLORS.textStrong,
    fontWeight: "900",
    fontSize: 14,
    marginBottom: 12,
    letterSpacing: -0.2
  },
  loadoutSlots: {
    flexDirection: "row",
    gap: 10
  },
  loadoutSlot: {
    flex: 1,
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: PRECISION_COLORS.borderCard,
    backgroundColor: PRECISION_COLORS.bgGlass,
    paddingVertical: 12,
    paddingHorizontal: 8
  },
  loadoutSlotIcon: {
    fontSize: 20,
    marginBottom: 6
  },
  loadoutSlotLabel: {
    color: PRECISION_COLORS.textMuted,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 4
  },
  loadoutSlotValue: {
    color: PRECISION_COLORS.textStrong,
    fontWeight: "800",
    fontSize: 11,
    textAlign: "center"
  },
  collectionModuleTitle: {
    color: PRECISION_COLORS.textSection,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 10,
    marginTop: 6
  },
  emptyModuleCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: PRECISION_COLORS.borderCard,
    borderStyle: "dashed",
    backgroundColor: PRECISION_COLORS.bgGlass,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: "center",
    marginBottom: 14
  },
  emptyModuleText: {
    color: PRECISION_COLORS.textMuted,
    fontSize: 13,
    fontWeight: "700"
  },
  emptyModuleHint: {
    color: PRECISION_COLORS.textSubtle,
    fontSize: 11,
    marginTop: 4
  },
  cosmeticCard: {
    flexDirection: "row",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: PRECISION_COLORS.borderCard,
    backgroundColor: PRECISION_COLORS.bgGlass,
    overflow: "hidden",
    marginBottom: 10,
    shadowColor: PRECISION_COLORS.shadowBlack,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4
  },
  cosmeticCardEquipped: {
    borderColor: PRECISION_COLORS.borderGoldStrong,
    backgroundColor: PRECISION_COLORS.primarySoftLow
  },
  cosmeticColorStrip: {
    width: 5,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16
  },
  cosmeticCardBody: {
    flex: 1,
    padding: 14
  },
  cosmeticCardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  cosmeticName: {
    color: PRECISION_COLORS.textStrong,
    fontWeight: "800",
    fontSize: 14,
    marginBottom: 4
  },
  rarityBadge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 6
  },
  rarityBadgeText: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1
  },
  cosmeticPreviewBar: {
    height: 4,
    borderRadius: 2,
    marginTop: 4,
    opacity: 0.7
  },
  equipButton: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: PRECISION_COLORS.borderSoft,
    backgroundColor: PRECISION_COLORS.bgGlass,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 72,
    alignItems: "center"
  },
  equipButtonActive: {
    borderColor: PRECISION_COLORS.borderGoldActive,
    backgroundColor: PRECISION_COLORS.primarySoft
  },
  equipButtonLabel: {
    color: PRECISION_COLORS.textStrong,
    fontWeight: "800",
    fontSize: 12
  },
  equipButtonLabelActive: {
    color: PRECISION_COLORS.primaryStrong
  },
  claimDeltaLabel: {
    marginTop: 6,
    color: PRECISION_COLORS.accentSoft,
    fontSize: 11,
    fontWeight: "700"
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10
  },
  progressLabel: {
    color: PRECISION_COLORS.textSubtle,
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: "uppercase"
  },
  progressValue: {
    color: PRECISION_COLORS.primaryStrong,
    fontSize: 12,
    fontWeight: "900"
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
    backgroundColor: PRECISION_COLORS.whiteTrack,
    marginBottom: 28
  },
  progressBarFill: {
    height: "100%"
  },
  sectionTitle: {
    color: PRECISION_COLORS.textSection,
    fontSize: 11,
    fontWeight: "900",
    marginBottom: 14,
    letterSpacing: 3,
    textTransform: "uppercase"
  },
  chapterRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 14,
    paddingRight: 12
  },
  chapterChip: {
    minWidth: 164,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: PRECISION_COLORS.border,
    backgroundColor: PRECISION_COLORS.bgGlass,
    paddingVertical: 16,
    paddingHorizontal: 18
  },
  chapterChipSelected: {
    borderColor: PRECISION_COLORS.borderGoldStrong,
    backgroundColor: PRECISION_COLORS.primarySoftMid
  },
  chapterChipLocked: {
    opacity: 0.4
  },
  chapterChipTitle: {
    color: PRECISION_COLORS.textCardTitle,
    fontWeight: "800",
    fontSize: 14
  },
  chapterChipMeta: {
    color: PRECISION_COLORS.textCardMeta,
    marginTop: 5,
    fontSize: 11,
    lineHeight: 16
  },
  missionCard: {
    backgroundColor: PRECISION_COLORS.bgMission,
    borderRadius: 26,
    padding: 22,
    borderWidth: 1,
    borderColor: PRECISION_COLORS.borderCard,
    overflow: "hidden",
    marginBottom: 18,
    shadowColor: PRECISION_COLORS.shadowBlack,
    shadowOpacity: 0.4,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12
  },
  cardTopShine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 56,
    backgroundColor: PRECISION_COLORS.whiteSoft
  },
  missionTitle: {
    color: PRECISION_COLORS.textStrong,
    fontWeight: "900",
    fontSize: 20,
    marginBottom: 8,
    letterSpacing: -0.3
  },
  missionHint: {
    color: PRECISION_COLORS.primaryStrong,
    fontSize: 12,
    letterSpacing: 0.3,
    flex: 1
  },
  missionLine: {
    color: PRECISION_COLORS.textBody,
    marginTop: 4,
    fontSize: 13,
    lineHeight: 20
  },
  /* ── Selected Mission (Levels page) ── */
  selectedMissionCard: {
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: "rgba(34,211,238,0.2)",
    backgroundColor: "rgba(8,18,38,0.92)",
    padding: 20,
    marginBottom: 18
  },
  selectedMissionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 16
  },
  selectedMissionIcon: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: "rgba(34,211,238,0.1)",
    borderWidth: 1,
    borderColor: "rgba(34,211,238,0.25)",
    alignItems: "center",
    justifyContent: "center"
  },
  selectedMissionIconText: {
    color: PRECISION_COLORS.cyan,
    fontWeight: "900",
    fontSize: 22
  },
  selectedMissionName: {
    color: PRECISION_COLORS.textStrong,
    fontWeight: "900",
    fontSize: 18,
    letterSpacing: -0.3
  },
  selectedMissionDifficulty: {
    color: PRECISION_COLORS.textMuted,
    fontSize: 12,
    marginTop: 2,
    letterSpacing: 0.5
  },
  selectedMissionStats: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(14,26,50,0.7)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    paddingVertical: 12,
    paddingHorizontal: 6,
    marginBottom: 14
  },
  selectedMissionStat: {
    flex: 1,
    alignItems: "center"
  },
  selectedMissionStatValue: {
    color: PRECISION_COLORS.textStrong,
    fontWeight: "900",
    fontSize: 16
  },
  selectedMissionStatLabel: {
    color: PRECISION_COLORS.textMuted,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginTop: 3
  },
  selectedMissionStatDivider: {
    width: 1,
    height: 28,
    backgroundColor: "rgba(255,255,255,0.08)"
  },
  selectedMissionHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(251,191,36,0.06)",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "rgba(251,191,36,0.12)"
  },
  selectedMissionHintIcon: {
    fontSize: 14
  },
  selectedMissionHintText: {
    color: PRECISION_COLORS.primaryStrong,
    fontSize: 12,
    letterSpacing: 0.3,
    flex: 1
  },
  metaGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 14
  },
  metaCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: PRECISION_COLORS.borderCard,
    borderRadius: 20,
    backgroundColor: PRECISION_COLORS.bgGlass,
    padding: 16
  },
  metaTitle: {
    color: PRECISION_COLORS.primaryStrong,
    fontWeight: "800",
    marginBottom: 6,
    fontSize: 14,
    letterSpacing: 0.2
  },
  metaLine: {
    color: PRECISION_COLORS.textSoft,
    marginTop: 3,
    fontSize: 13,
    lineHeight: 19
  },
  eventCard: {
    borderWidth: 1,
    borderColor: PRECISION_COLORS.cyanSoft,
    borderRadius: 22,
    backgroundColor: PRECISION_COLORS.bgGlass,
    padding: 18,
    marginBottom: 14,
    shadowColor: PRECISION_COLORS.shadowDeep,
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6
  },
  loadoutPreviewCard: {
    marginTop: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: PRECISION_COLORS.border,
    borderRadius: 18,
    backgroundColor: PRECISION_COLORS.bgLoadout,
    padding: 14
  },
  inventoryCard: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: PRECISION_COLORS.borderCard,
    borderRadius: 18,
    backgroundColor: PRECISION_COLORS.bgInventory,
    padding: 14
  },
  inventoryCardEquipped: {
    borderColor: PRECISION_COLORS.borderGoldHeavy,
    backgroundColor: PRECISION_COLORS.primarySoftLighter
  },
  inventoryCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 5
  },
  inventoryRarity: {
    color: PRECISION_COLORS.primaryStrong,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.5
  },
  inventoryMeta: {
    color: PRECISION_COLORS.textBodyMuted,
    fontSize: 12,
    marginBottom: 10
  },
  homePanelNav: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16
  },
  homePanelButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: PRECISION_COLORS.borderPanel,
    backgroundColor: PRECISION_COLORS.bgGlass,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10
  },
  homePanelButtonActive: {
    borderColor: PRECISION_COLORS.borderGoldActive,
    backgroundColor: PRECISION_COLORS.primaryTint
  },
  homePanelButtonLabel: {
    color: PRECISION_COLORS.textBodyAlt,
    fontSize: 13,
    fontWeight: "700"
  },
  homePanelIcon: {
    width: 20,
    color: PRECISION_COLORS.textPanelIcon,
    fontSize: 12,
    textAlign: "center",
    fontWeight: "900"
  },
  homePanelIconActive: {
    color: PRECISION_COLORS.textPanelActive
  },
  homePanelButtonLabelActive: {
    color: PRECISION_COLORS.textPanelActive
  },
  questRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 8
  },
  claimButton: {
    borderWidth: 1,
    borderColor: PRECISION_COLORS.borderGoldPress,
    backgroundColor: PRECISION_COLORS.primarySoft,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
    minHeight: 38,
    justifyContent: "center"
  },
  claimWideButton: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: PRECISION_COLORS.borderGoldActive,
    backgroundColor: PRECISION_COLORS.primarySoft,
    borderRadius: 14,
    minHeight: 44,
    justifyContent: "center",
    paddingVertical: 10,
    alignItems: "center"
  },
  claimButtonDisabled: {
    opacity: 0.35
  },
  claimButtonLabel: {
    color: PRECISION_COLORS.textClaim,
    fontWeight: "800",
    fontSize: 13
  },
  startButton: {
    flex: 1,
    borderRadius: 20,
    overflow: "hidden",
    paddingVertical: 1,
    shadowColor: PRECISION_COLORS.primary,
    shadowOpacity: 0.5,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 14
  },
  startButtonPressable: {
    width: "100%"
  },
  startButtonSheen: {
    position: "absolute",
    top: -22,
    left: 0,
    width: 48,
    height: 130,
    backgroundColor: PRECISION_COLORS.whiteTint
  },
  startButtonLabel: {
    color: PRECISION_COLORS.textStrong,
    textAlign: "center",
    fontWeight: "900",
    fontSize: 19,
    letterSpacing: 0.6,
    paddingVertical: 16
  },
  playContent: {
    paddingHorizontal: 22,
    paddingTop: 58,
    paddingBottom: 40,
    alignSelf: "center",
    width: "100%",
    maxWidth: 980
  },
  playTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 22
  },
  iconButton: {
    borderWidth: 1,
    borderColor: PRECISION_COLORS.borderSoft,
    borderRadius: 14,
    backgroundColor: PRECISION_COLORS.bgGlass,
    paddingVertical: 10,
    paddingHorizontal: 16,
    minWidth: 68,
    minHeight: 40,
    justifyContent: "center"
  },
  iconButtonLabel: {
    color: PRECISION_COLORS.textIconButton,
    fontWeight: "800",
    fontSize: 11,
    textAlign: "center",
    letterSpacing: 0.8
  },
  topCenterRow: {
    flexDirection: "row",
    gap: 10
  },
  levelBadge: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: PRECISION_COLORS.borderSoft,
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: PRECISION_COLORS.bgPanelStrong
  },
  levelBadgeLabel: {
    color: PRECISION_COLORS.textStrong,
    fontWeight: "900",
    fontSize: 14
  },
  starBadge: {
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10
  },
  starBadgeLabel: {
    color: PRECISION_COLORS.textStrong,
    fontWeight: "900",
    fontSize: 14
  },
  targetBadge: {
    alignSelf: "center",
    borderWidth: 1,
    borderColor: PRECISION_COLORS.borderGoldSoft,
    backgroundColor: PRECISION_COLORS.primarySoftBadge,
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginBottom: 14
  },
  targetBadgeLabel: {
    color: PRECISION_COLORS.primaryStrong,
    fontWeight: "900",
    fontSize: 12,
    letterSpacing: 1.5
  },
  mechanicBanner: {
    borderWidth: 1,
    borderColor: PRECISION_COLORS.borderLight,
    borderRadius: 16,
    backgroundColor: PRECISION_COLORS.bgGlass,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 14,
    alignSelf: "center",
    width: "100%",
    maxWidth: 520
  },
  mechanicBannerTitle: {
    color: PRECISION_COLORS.primaryStrong,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.5,
    textAlign: "center"
  },
  mechanicBannerText: {
    color: PRECISION_COLORS.textMechanic,
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
    lineHeight: 18
  },
  playTitle: {
    textAlign: "center",
    color: PRECISION_COLORS.textStrong,
    fontWeight: "900",
    fontSize: 48,
    letterSpacing: -0.5
  },
  playSubTitle: {
    textAlign: "center",
    color: PRECISION_COLORS.textPlaySubtle,
    marginBottom: 18,
    fontSize: 13,
    letterSpacing: 0.3
  },
  mechanicLiveCard: {
    width: "100%",
    maxWidth: 460,
    alignSelf: "center",
    borderWidth: 1,
    borderColor: PRECISION_COLORS.borderSoft,
    backgroundColor: PRECISION_COLORS.bgGlass,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16
  },
  mechanicLiveTitle: {
    color: PRECISION_COLORS.primaryStrong,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    textAlign: "center"
  },
  mechanicLiveValue: {
    marginTop: 6,
    color: PRECISION_COLORS.textLiveValue,
    fontSize: 14,
    fontWeight: "800",
    textAlign: "center"
  },
  mechanicLiveDanger: {
    color: PRECISION_COLORS.danger
  },
  targetCard: {
    alignSelf: "center",
    width: "100%",
    maxWidth: 360,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: PRECISION_COLORS.cyanSoft,
    backgroundColor: PRECISION_COLORS.bgTargetCard,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    marginBottom: 18,
    shadowColor: PRECISION_COLORS.cyan,
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8
  },
  memoryHiddenText: {
    color: PRECISION_COLORS.primaryStrong,
    fontWeight: "900",
    fontSize: 14,
    paddingVertical: 76,
    textAlign: "center",
    letterSpacing: 0.5
  },
  canvasGlowWrap: {
    position: "relative",
    marginBottom: 18
  },
  canvasGlow: {
    position: "absolute",
    top: -14,
    left: -14,
    right: -14,
    bottom: -14,
    borderRadius: 34,
    backgroundColor: PRECISION_COLORS.cyan,
    opacity: 0.08
  },
  playActionsRow: {
    gap: 10
  },
  playPrimaryPulseWrap: {
    borderRadius: 18,
    shadowColor: PRECISION_COLORS.primary,
    shadowOpacity: 0.45,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10
  },
  playSecondaryPulseWrap: {
    borderRadius: 18
  },
  premiumButton: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: PRECISION_COLORS.borderSoft,
    backgroundColor: PRECISION_COLORS.bgGlass,
    paddingVertical: 14,
    marginBottom: 0,
    shadowColor: PRECISION_COLORS.shadowBlack,
    shadowOpacity: 0.3,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5
  },
  premiumButtonLabel: {
    textAlign: "center",
    color: PRECISION_COLORS.textPremium,
    fontWeight: "800",
    fontSize: 13,
    paddingHorizontal: 10,
    letterSpacing: 0.3
  },
  mainActionColumn: {
    gap: 12,
    marginTop: 4,
    marginBottom: 18
  },
  homeActionRow: {
    flexDirection: "row",
    gap: 14,
    marginTop: 4,
    marginBottom: 16
  },
  primaryButton: {
    backgroundColor: PRECISION_COLORS.primary,
    paddingVertical: 15,
    borderRadius: 18,
    minHeight: 52,
    justifyContent: "center",
    marginTop: 8
  },
  secondaryButton: {
    backgroundColor: PRECISION_COLORS.bgGlass,
    borderWidth: 1,
    borderColor: PRECISION_COLORS.borderSoft,
    paddingVertical: 15,
    borderRadius: 18,
    minHeight: 52,
    justifyContent: "center"
  },
  ghostButton: {
    borderWidth: 1,
    borderColor: PRECISION_COLORS.borderPanel,
    borderRadius: 14,
    backgroundColor: PRECISION_COLORS.bgGlass,
    paddingVertical: 12,
    minHeight: 44,
    justifyContent: "center",
    marginBottom: 12,
    marginTop: 12
  },
  ghostLabel: {
    textAlign: "center",
    color: PRECISION_COLORS.textGhost,
    fontWeight: "700",
    letterSpacing: 0.3
  },
  buttonLabel: {
    color: PRECISION_COLORS.textStrong,
    textAlign: "center",
    fontWeight: "900",
    fontSize: 15
  },
  disabledButton: {
    opacity: 0.4
  },
  buttonPressedPrimary: {
    transform: [{ scale: 0.97 }],
    opacity: 0.85
  },
  buttonPressedSecondary: {
    transform: [{ scale: 0.985 }],
    opacity: 0.9
  },
  buttonPressedSoft: {
    transform: [{ scale: 0.985 }],
    opacity: 0.9
  },
  playButtonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.88
  },
  status: {
    marginTop: 4,
    color: PRECISION_COLORS.textStatus,
    lineHeight: 22,
    marginBottom: 10,
    fontSize: 12,
    textAlign: "center",
    letterSpacing: 0.2
  },
  completeContent: {
    paddingHorizontal: 22,
    paddingTop: 64,
    paddingBottom: 40,
    alignSelf: "center",
    width: "100%",
    maxWidth: 980
  },
  completeTitle: {
    textAlign: "center",
    color: PRECISION_COLORS.textStrong,
    fontWeight: "900",
    fontSize: 42,
    letterSpacing: -0.5
  },
  completeSubtitle: {
    textAlign: "center",
    color: PRECISION_COLORS.textCompleteSub,
    marginTop: 6,
    marginBottom: 14,
    fontSize: 14,
    letterSpacing: 0.2
  },
  completeHomeButton: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: PRECISION_COLORS.borderSoft,
    backgroundColor: PRECISION_COLORS.bgGlass,
    borderRadius: 18,
    paddingVertical: 15
  },
  completeHomeLabel: {
    textAlign: "center",
    color: PRECISION_COLORS.textCompleteButton,
    fontWeight: "800",
    letterSpacing: 0.3
  },
  tutorialOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: PRECISION_COLORS.overlayScrim,
    justifyContent: "center",
    alignItems: "center",
    padding: 28
  },
  tutorialCard: {
    width: "100%",
    maxWidth: 440,
    borderRadius: 24,
    backgroundColor: PRECISION_COLORS.tutorialCardBg,
    borderWidth: 1,
    borderColor: PRECISION_COLORS.borderMuted,
    padding: 24
  },
  tutorialTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: PRECISION_COLORS.textStrong,
    letterSpacing: -0.3
  },
  tutorialText: {
    marginTop: 10,
    color: PRECISION_COLORS.textTutorial,
    lineHeight: 24,
    fontSize: 15
  },
  tutorialActions: {
    marginTop: 18,
    flexDirection: "row",
    gap: 12
  },
  tutorialGhostButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: PRECISION_COLORS.borderSoft,
    borderRadius: 14,
    paddingVertical: 12,
    backgroundColor: PRECISION_COLORS.bgGlass
  },
  tutorialGhostLabel: {
    textAlign: "center",
    color: PRECISION_COLORS.textTutorialGhost,
    fontWeight: "700"
  },
  tutorialPrimaryButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    backgroundColor: PRECISION_COLORS.primary
  },
  tutorialPrimaryLabel: {
    textAlign: "center",
    color: PRECISION_COLORS.textStrong,
    fontWeight: "800"
  },

  // ─── Leaderboard ─────────────────────────────────────────────────────
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "rgba(14,24,48,0.7)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)"
  },
  filterChipActive: {
    backgroundColor: PRECISION_COLORS.primary + "33",
    borderColor: PRECISION_COLORS.primary
  },
  filterChipText: {
    fontSize: 12,
    color: PRECISION_COLORS.textMuted,
    fontWeight: "600"
  },
  filterChipTextActive: {
    color: PRECISION_COLORS.primaryStrong
  },
  leaderboardRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(14,24,48,0.6)",
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)"
  },
  leaderboardRowGold: {
    borderColor: "#fbbf24",
    backgroundColor: "rgba(251,191,36,0.08)"
  },
  leaderboardRowSilver: {
    borderColor: "#9ca3af",
    backgroundColor: "rgba(156,163,175,0.06)"
  },
  leaderboardRowBronze: {
    borderColor: "#cd7f32",
    backgroundColor: "rgba(205,127,50,0.06)"
  },
  leaderboardRank: {
    width: 40,
    alignItems: "center",
    justifyContent: "center"
  },
  leaderboardRankText: {
    fontSize: 16,
    color: PRECISION_COLORS.textMuted,
    fontWeight: "700"
  },
  leaderboardRankTextTop: {
    fontSize: 22
  },
  leaderboardInfo: {
    flex: 1,
    marginLeft: 8
  },
  leaderboardName: {
    fontSize: 14,
    color: PRECISION_COLORS.textStrong,
    fontWeight: "700"
  },
  leaderboardShape: {
    fontSize: 11,
    color: PRECISION_COLORS.textMuted,
    marginTop: 2
  },
  leaderboardStats: {
    alignItems: "flex-end"
  },
  leaderboardAccuracy: {
    fontSize: 18,
    color: PRECISION_COLORS.primaryStrong,
    fontWeight: "800"
  },
  leaderboardStars: {
    fontSize: 12,
    marginTop: 2
  },

  // ─── Challenge ───────────────────────────────────────────────────────
  challengeShapeTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: PRECISION_COLORS.primaryStrong,
    marginTop: 8
  },
  challengePlayButton: {
    backgroundColor: PRECISION_COLORS.primary + "22",
    borderWidth: 1.5,
    borderColor: PRECISION_COLORS.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 12
  },
  challengePlayButtonText: {
    fontSize: 16,
    fontWeight: "800",
    color: PRECISION_COLORS.primaryStrong
  },
  challengeCanvasContainer: {
    marginTop: 12,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    backgroundColor: "rgba(8,14,28,0.95)"
  },
  challengeCanvasHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  challengeCanvasTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: PRECISION_COLORS.textStrong
  },
  challengeCancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.06)"
  },
  challengeCancelText: {
    fontSize: 12,
    color: PRECISION_COLORS.textMuted,
    fontWeight: "600"
  },
  challengeSubmitButton: {
    backgroundColor: PRECISION_COLORS.primary,
    paddingVertical: 14,
    alignItems: "center",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16
  }
});
