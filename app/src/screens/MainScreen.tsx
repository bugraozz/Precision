import React from "react";
import { Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import { ScrollView, Text, View } from "tamagui";
import Pressable from "../components/TamaguiPressable";
import LevelSelector from "../components/LevelSelector";
import { PRECISION_COLORS, PRECISION_GRADIENTS } from "../theme/precisionTokens";
import { styles } from "../styles";
import { PREMIUM_COSMETIC_CATALOG } from "../cosmetics";
import {
  TARGET_PREVIEW_SIZE,
  STABILITY_WOBBLE_WARN,
  STABILITY_WOBBLE_HEAVY,
  SYMMETRY_WARN_ACCURACY,
  SYMMETRY_HEAVY_ACCURACY
} from "../constants/gameplay";
import type { HomePanelKey, RoundFeedback } from "../types/app";
import type { ProgressionState } from "../progression";
import type { ChallengeEntry } from "../api";
import type { LevelConfig } from "../levels";
import { LEVEL_PACK_V1 } from "../levels";
import { ENERGY_REFILL_COIN_COST } from "../progression";
import { t, tShape, tDifficulty, tMode, tFocusHint, tMechanic, tMechanicDesc, tRarity, tQuest } from "../i18n";
import type { Lang } from "../i18n";

export type MainScreenProps = {
  // Animated values
  homeAnimValues: Animated.Value[];
  homePanelAnim: Animated.Value;
  ctaSheenAnim: Animated.Value;
  claimRewardPopAnim: Animated.Value;
  // State
  progression: ProgressionState;
  homePanel: HomePanelKey;
  selectedLevel: LevelConfig;
  selectedLevelId: string;
  selectedChapterId: string;
  totalBestStars: number;
  energySnapshot: { current: number; cap: number; isPremium: boolean };
  premiumCosmeticCount: number;
  dailyStats: { done: number; total: number };
  weeklyStats: { done: number; total: number };
  claimableDaily: unknown[];
  claimableWeekly: unknown[];
  masteryLevels: { circle: number; corner: number; curve: number };
  hasPremiumNoAds: boolean;
  lastClaimRewardText: string | null;
  claimingRewardKeys: Record<string, boolean>;
  statusText: string;
  // Challenge
  challengeShape: string;
  challengeEntries: ChallengeEntry[];
  challengeLoading: boolean;
  challengeResult: { accuracyPercent: number; stars: number; xpGained: number } | null;
  // Cosmetics
  brushInventory: Array<{ id: string; name: string; rarity: string; visual: { strokeColor?: string; trailColor?: string; frameColor?: string } }>;
  trailInventory: Array<{ id: string; name: string; rarity: string; visual: { strokeColor?: string; trailColor?: string; frameColor?: string } }>;
  frameInventory: Array<{ id: string; name: string; rarity: string; visual: { strokeColor?: string; trailColor?: string; frameColor?: string } }>;
  // Mechanic info
  mechanicTag: string;
  mechanicIsBoss: boolean;
  // Handlers
  setHomePanel: (panel: HomePanelKey) => void;
  setScreen: (screen: "main" | "home" | "play" | "complete") => void;
  handlePremiumPurchase: () => void;
  handleBuyEnergyRefill: () => void;
  handleQuestClaim: (boardType: "daily" | "weekly", questId: string) => void;
  handleDailyStreakChest: () => void;
  handleSelectPremiumCosmetic: (itemId: string) => void;
  setChallengeShape: (shape: string) => void;
  loadChallenge: (shape: string) => void;
  startChallengePlay: () => void;
  lang: Lang;
  setLang: (lang: Lang) => void;
};

export default function MainScreen(props: MainScreenProps) {
  const {
    homeAnimValues, homePanelAnim, ctaSheenAnim, claimRewardPopAnim,
    progression, homePanel, selectedLevel, selectedLevelId,
    totalBestStars, energySnapshot, premiumCosmeticCount,
    dailyStats, weeklyStats, claimableDaily, claimableWeekly,
    masteryLevels, hasPremiumNoAds, lastClaimRewardText,
    claimingRewardKeys,
    challengeShape, challengeEntries, challengeLoading, challengeResult,
    brushInventory, trailInventory, frameInventory,
    mechanicTag, mechanicIsBoss,
    setHomePanel, setScreen, handlePremiumPurchase, handleBuyEnergyRefill,
    handleQuestClaim, handleDailyStreakChest, handleSelectPremiumCosmetic,
    setChallengeShape, loadChallenge, startChallengePlay,
    lang, setLang
  } = props;

  return (
    <ScrollView contentContainerStyle={styles.homeContent}>
      <Animated.View
        style={{
          opacity: homeAnimValues[0],
          transform: [
            {
              translateY: homeAnimValues[0].interpolate({
                inputRange: [0, 1],
                outputRange: [18, 0]
              })
            }
          ]
        }}
      >
        <View style={styles.titleBar} />
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View>
            <Text style={styles.heroTitle}>{t("appTitle")}</Text>
            <Text style={styles.heroSubtitle}>{t("appSubtitle")}</Text>
          </View>
          <Pressable
            onPress={() => setLang(lang === "en" ? "tr" : "en")}
            style={({ pressed }) => [
              styles.filterChip,
              styles.filterChipActive,
              pressed && styles.buttonPressedSoft,
              { paddingHorizontal: 14, paddingVertical: 8 }
            ]}
          >
            <Text style={[styles.filterChipText, styles.filterChipTextActive, { fontSize: 14, fontWeight: "700" }]}>
              {lang === "en" ? "TR" : "EN"}
            </Text>
          </Pressable>
        </View>
      </Animated.View>

      <Animated.View
        style={{
          opacity: homeAnimValues[1],
          transform: [
            {
              translateY: homeAnimValues[1].interpolate({
                inputRange: [0, 1],
                outputRange: [18, 0]
              })
            }
          ]
        }}
      >
        <View style={styles.statsGrid}>
          <View style={[styles.statCardWide, styles.statCardGold]}>
            <View style={styles.statCardRow}>
              <View style={styles.statIconWrap}>
                <Text style={styles.statEmoji}>{'\u2B50'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.statValue}>{totalBestStars}</Text>
                <Text style={styles.statLabel}>{t("stars")}</Text>
              </View>
            </View>
          </View>
          <Animated.View
            style={[
              styles.statCardWide,
              styles.statCardCyan,
              {
                transform: [
                  {
                    scale: claimRewardPopAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.06]
                    })
                  }
                ]
              }
            ]}
          >
            <View style={styles.statCardRow}>
              <View style={[styles.statIconWrap, styles.statIconWrapCyan]}>
                <Text style={styles.statEmoji}>{'\uD83E\uDE99'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.statValue}>{progression.coins}</Text>
                <Text style={styles.statLabel}>{t("coins")}</Text>
              </View>
            </View>
            {lastClaimRewardText ? <Text style={styles.claimDeltaLabel}>{lastClaimRewardText}</Text> : null}
          </Animated.View>
        </View>

        <View style={styles.resourceBar}>
          <View style={styles.resourceItem}>
            <Text style={styles.resourceIcon}>{'\u26A1'}</Text>
            <Text style={styles.resourceValue}>{energySnapshot.current}/{energySnapshot.cap}</Text>
            <Text style={styles.resourceLabel}>{t("energy")}{energySnapshot.isPremium ? ` ${t("premiumMultiplier")}` : ""}</Text>
          </View>
          <View style={styles.resourceDivider} />
          <View style={styles.resourceItem}>
            <Text style={styles.resourceIcon}>{'\uD83D\uDC8E'}</Text>
            <Text style={styles.resourceValue}>{progression.gems}</Text>
            <Text style={styles.resourceLabel}>{t("gems")}</Text>
          </View>
          <View style={styles.resourceDivider} />
          <View style={styles.resourceItem}>
            <Text style={styles.resourceIcon}>{'\uD83C\uDFAF'}</Text>
            <Text style={styles.resourceValue}>{progression.completedRounds}</Text>
            <Text style={styles.resourceLabel}>{t("rounds")}</Text>
          </View>
        </View>

        <View style={styles.premiumBanner}>
          <LinearGradient
            colors={["rgba(251,191,36,0.12)", "rgba(251,191,36,0.04)", "rgba(251,191,36,0.08)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.premiumBannerGlow}
          />
          <View style={styles.premiumBannerHeader}>
            <View style={styles.premiumIconWrap}>
              <Text style={styles.premiumBannerIcon}>{'\uD83D\uDC51'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.premiumTitleRow}>
                <Text style={styles.premiumBannerTitle}>{progression.premium.isActive ? t("premiumActive") : t("premiumPack")}</Text>
                {progression.premium.isActive ? (
                  <View style={styles.premiumActiveBadge}>
                    <Text style={styles.premiumActiveBadgeText}>{t("pro")}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.premiumBannerSub}>{progression.premium.isActive ? t("premiumDescActive") : t("premiumDescInactive")}</Text>
            </View>
          </View>
          {progression.premium.isActive ? (
            <View style={styles.premiumStatsRow}>
              <View style={styles.premiumStatChip}>
                <Text style={styles.premiumStatChipIcon}>{'\uD83C\uDFA8'}</Text>
                <Text style={styles.premiumStatChipText}>{premiumCosmeticCount} {t("cosmetics")}</Text>
              </View>
              <View style={styles.premiumStatChip}>
                <Text style={styles.premiumStatChipIcon}>{'\uD83D\uDCE6'}</Text>
                <Text style={styles.premiumStatChipText}>{progression.premium.monthlySpecialItemId ? t("monthlyItem") : t("pending")}</Text>
              </View>
            </View>
          ) : null}
        </View>

        <View style={styles.shopRow}>
          <Pressable
            onPress={() => {
              void handleBuyEnergyRefill();
            }}
            style={({ pressed }) => [styles.shopButton, pressed && styles.buttonPressedPrimary]}
          >
            <Text style={styles.shopButtonIcon}>{'\u26A1'}</Text>
            <Text style={styles.shopButtonText}>{t("energy")}</Text>
            <Text style={styles.shopButtonPrice}>{ENERGY_REFILL_COIN_COST}</Text>
          </Pressable>
        </View>

        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>{t("overallProgress")}</Text>
          <Text style={styles.progressValue}>{Math.round((progression.unlockedLevels.length / LEVEL_PACK_V1.length) * 100)}%</Text>
        </View>
        <View style={styles.progressBarTrack}>
          <LinearGradient
            colors={PRECISION_GRADIENTS.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[
              styles.progressBarFill,
              { width: `${Math.round((progression.unlockedLevels.length / LEVEL_PACK_V1.length) * 100)}%` }
            ]}
          />
        </View>
      </Animated.View>

      <Animated.View
        style={{
          opacity: homeAnimValues[2],
          transform: [
            {
              translateY: homeAnimValues[2].interpolate({
                inputRange: [0, 1],
                outputRange: [18, 0]
              })
            }
          ]
        }}
      >
        <Text style={styles.sectionTitle}>{t("currentMission")}</Text>
        <View style={styles.missionPreviewCard}>
          <View style={styles.missionPreviewHeader}>
            <View style={styles.missionPreviewIcon}>
              <Text style={styles.missionPreviewIconText}>{tShape(selectedLevel.targetShape).slice(0, 1).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.missionPreviewTitle}>L{selectedLevel.index}: {tShape(selectedLevel.targetShape).toUpperCase()}</Text>
              <Text style={styles.missionPreviewSub}>{tDifficulty(selectedLevel.difficulty).toUpperCase()} | {tFocusHint(selectedLevel.mechanicTag)}</Text>
            </View>
            <View style={styles.missionPreviewXp}>
              <Text style={styles.missionPreviewXpValue}>{progression.cumulativeXp}</Text>
              <Text style={styles.missionPreviewXpLabel}>{t("xp")}</Text>
            </View>
          </View>

          <View style={styles.missionDivider} />

          <View style={styles.missionInfoGrid}>
            <View style={styles.missionInfoItem}>
              <Text style={styles.missionInfoLabel}>{t("shape")}</Text>
              <Text style={styles.missionInfoValue}>{tShape(selectedLevel.targetShape).toUpperCase()}</Text>
            </View>
            <View style={styles.missionInfoItem}>
              <Text style={styles.missionInfoLabel}>{t("difficulty")}</Text>
              <Text style={styles.missionInfoValue}>{tDifficulty(selectedLevel.difficulty).toUpperCase()}</Text>
            </View>
            <View style={styles.missionInfoItem}>
              <Text style={styles.missionInfoLabel}>{t("time")}</Text>
              <Text style={styles.missionInfoValue}>{(selectedLevel.timeLimitMs / 1000).toFixed(0)}s</Text>
            </View>
            <View style={styles.missionInfoItem}>
              <Text style={styles.missionInfoLabel}>{t("mode")}</Text>
              <Text style={styles.missionInfoValue}>{tMode(selectedLevel.modeHint).toUpperCase()}</Text>
            </View>
          </View>

          <View style={styles.missionHintBar}>
            <Text style={styles.missionHintIcon}>{"\u26A1"}</Text>
            <Text style={styles.missionHint}>{tFocusHint(selectedLevel.mechanicTag)}</Text>
          </View>
        </View>
      </Animated.View>

      <Animated.View
        style={{
          opacity: homeAnimValues[3],
          transform: [
            {
              translateY: homeAnimValues[3].interpolate({
                inputRange: [0, 1],
                outputRange: [18, 0]
              })
            }
          ]
        }}
      >
        <View style={styles.metaGrid}>
          <View style={styles.metaCard}>
            <Text style={styles.metaTitle}>{"\uD83C\uDFAF"} {t("mastery")}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaLine}>{t("circleLv")}{masteryLevels.circle}</Text>
              <Text style={styles.metaDot}>{"\u00B7"}</Text>
              <Text style={styles.metaLine}>{t("cornerLv")}{masteryLevels.corner}</Text>
              <Text style={styles.metaDot}>{"\u00B7"}</Text>
              <Text style={styles.metaLine}>{t("curveLv")}{masteryLevels.curve}</Text>
            </View>
          </View>
          <View style={styles.metaCard}>
            <Text style={styles.metaTitle}>{"\uD83D\uDCCB"} {t("quests")}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaLine}>{t("dailyAbbr")} {dailyStats.done}/{dailyStats.total}</Text>
              <Text style={styles.metaDot}>{"\u00B7"}</Text>
              <Text style={styles.metaLine}>{t("weeklyAbbr")} {weeklyStats.done}/{weeklyStats.total}</Text>
              <Text style={styles.metaDot}>{"\u00B7"}</Text>
              <Text style={[styles.metaLine, claimableDaily.length + claimableWeekly.length > 0 && { color: PRECISION_COLORS.primaryStrong }]}>{claimableDaily.length + claimableWeekly.length} {t("claimable")}</Text>
            </View>
          </View>
        </View>

        <View style={styles.homePanelNav}>
          {[
            { key: "overview", icon: "O", label: t("overview") },
            { key: "daily", icon: "D", label: t("daily") },
            { key: "weekly", icon: "W", label: t("weekly") },
            { key: "collection", icon: "C", label: t("collection") },
            { key: "challenge", icon: "\uD83C\uDFC6", label: t("challenge") }
          ].map((panel) => (
            <Pressable
              key={panel.key}
              onPress={() => setHomePanel(panel.key as HomePanelKey)}
              style={({ pressed }) => [
                styles.homePanelButton,
                homePanel === panel.key && styles.homePanelButtonActive,
                pressed && styles.buttonPressedSoft
              ]}
            >
              <Text style={[styles.homePanelIcon, homePanel === panel.key && styles.homePanelIconActive]}>
                {panel.icon}
              </Text>
              <Text style={[styles.homePanelButtonLabel, homePanel === panel.key && styles.homePanelButtonLabelActive]}>
                {panel.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Animated.View
          style={{
            opacity: homePanelAnim,
            transform: [
              {
                translateY: homePanelAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [8, 0]
                })
              }
            ]
          }}
        >
          {homePanel === "overview" ? (
            <View style={styles.eventCard}>
              <Text style={styles.metaTitle}>{t("weeklyMiniEvent")}</Text>
              <Text style={styles.metaLine}>{t("event")}: {progression.weeklyEvent.id}</Text>
              <Text style={styles.metaLine}>{t("questProgress")}: {progression.weeklyEvent.quests.filter((q) => q.value >= q.target).length}/12</Text>
              <Text style={styles.metaLine}>{t("rewardChest")}: {progression.weeklyEvent.rewardChestClaimed ? t("claimed") : t("pending")}</Text>
                <Text style={styles.metaLine}>{t("unlockedLevels")}: {progression.unlockedLevels.length}/{LEVEL_PACK_V1.length}</Text>
            </View>

          ) : null}

          {homePanel === "daily" ? (
            <View style={styles.eventCard}>
              <Text style={styles.metaTitle}>{t("dailyQuestBoard")}</Text>
              {progression.dailyBoard.quests.map((quest) => {
                const completed = quest.value >= quest.target;
                const canClaim = completed && !quest.claimed;
                const claimKey = `daily:${quest.id}`;
                const isClaiming = Boolean(claimingRewardKeys[claimKey]);
                const canPressClaim = canClaim && !isClaiming;
                return (
                  <View key={quest.id} style={styles.questRow}>
                    <Text style={styles.metaLine}>{tQuest(quest.id)} ({quest.value}/{quest.target})</Text>
                    <Pressable
                      onPress={() => handleQuestClaim("daily", quest.id)}
                      disabled={!canPressClaim}
                      style={({ pressed }) => [
                        styles.claimButton,
                        !canPressClaim && styles.claimButtonDisabled,
                        pressed && canPressClaim && styles.buttonPressedPrimary
                      ]}
                    >
                      <Text style={styles.claimButtonLabel}>
                        {quest.claimed ? t("claimed") : isClaiming ? t("claiming") : t("claim")}
                      </Text>
                    </Pressable>
                  </View>
                );
              })}
              <Pressable
                onPress={handleDailyStreakChest}
                disabled={
                  !progression.dailyBoard.streakChestAvailable ||
                  progression.dailyBoard.streakChestClaimed ||
                  Boolean(claimingRewardKeys["daily:streak_chest"])
                }
                style={({ pressed }) => [
                  styles.claimWideButton,
                  (!progression.dailyBoard.streakChestAvailable ||
                    progression.dailyBoard.streakChestClaimed ||
                    Boolean(claimingRewardKeys["daily:streak_chest"])) &&
                    styles.claimButtonDisabled,
                  pressed &&
                    progression.dailyBoard.streakChestAvailable &&
                    !progression.dailyBoard.streakChestClaimed &&
                    !claimingRewardKeys["daily:streak_chest"] &&
                    styles.buttonPressedPrimary
                ]}
              >
                <Text style={styles.claimButtonLabel}>
                  {claimingRewardKeys["daily:streak_chest"] ? t("claiming") : t("claimStreakChest")}
                </Text>
              </Pressable>
            </View>
          ) : null}

          {homePanel === "weekly" ? (
            <View style={styles.eventCard}>
              <Text style={styles.metaTitle}>{t("weeklyChallengeLadder")}</Text>
              {progression.weeklyLadder.tiers.map((tier) => {
                const completed = tier.value >= tier.target;
                const canClaim = completed && !tier.claimed;
                const claimKey = `weekly:${tier.id}`;
                const isClaiming = Boolean(claimingRewardKeys[claimKey]);
                const canPressClaim = canClaim && !isClaiming;
                return (
                  <View key={tier.id} style={styles.questRow}>
                    <Text style={styles.metaLine}>{tQuest(tier.id)} ({tier.value}/{tier.target})</Text>
                    <Pressable
                      onPress={() => handleQuestClaim("weekly", tier.id)}
                      disabled={!canPressClaim}
                      style={({ pressed }) => [
                        styles.claimButton,
                        !canPressClaim && styles.claimButtonDisabled,
                        pressed && canPressClaim && styles.buttonPressedPrimary
                      ]}
                    >
                      <Text style={styles.claimButtonLabel}>
                        {tier.claimed ? t("claimed") : isClaiming ? t("claiming") : t("claim")}
                      </Text>
                    </Pressable>
                  </View>
                );
              })}
              <View style={styles.questRow}>
                <Text style={styles.metaLine}>{tQuest(progression.weeklyLadder.catchUpQuest.id)} ({progression.weeklyLadder.catchUpQuest.value}/{progression.weeklyLadder.catchUpQuest.target})</Text>
                {(() => {
                  const catchUpClaimKey = `weekly:${progression.weeklyLadder.catchUpQuest.id}`;
                  const isClaimingCatchUp = Boolean(claimingRewardKeys[catchUpClaimKey]);
                  const canClaimCatchUp =
                    progression.weeklyLadder.catchUpQuest.value >= progression.weeklyLadder.catchUpQuest.target &&
                    !progression.weeklyLadder.catchUpQuest.claimed &&
                    !isClaimingCatchUp;
                  return (
                <Pressable
                  onPress={() => handleQuestClaim("weekly", progression.weeklyLadder.catchUpQuest.id)}
                  disabled={!canClaimCatchUp}
                  style={({ pressed }) => [
                    styles.claimButton,
                    !canClaimCatchUp && styles.claimButtonDisabled,
                    pressed && canClaimCatchUp && styles.buttonPressedPrimary
                  ]}
                >
                    <Text style={styles.claimButtonLabel}>
                    {progression.weeklyLadder.catchUpQuest.claimed ? t("claimed") : isClaimingCatchUp ? t("claiming") : t("claim")}
                  </Text>
                </Pressable>
                  );
                })()}
              </View>
            </View>
          ) : null}

          {homePanel === "collection" ? (
            <View>
              {/* Collection Stats Bar */}
              <View style={styles.collectionStatsBar}>
                <View style={styles.collectionStatBox}>
                  <Text style={styles.collectionStatValue}>{progression.collectionAlbum.completedSets.length}</Text>
                  <Text style={styles.collectionStatLabel}>{t("sets")}</Text>
                </View>
                <View style={styles.collectionStatDivider} />
                <View style={styles.collectionStatBox}>
                  <Text style={styles.collectionStatValue}>{progression.collectionAlbum.unlockedFrames.length}</Text>
                  <Text style={styles.collectionStatLabel}>{t("frames")}</Text>
                </View>
                <View style={styles.collectionStatDivider} />
                <View style={styles.collectionStatBox}>
                  <Text style={styles.collectionStatValue}>{progression.masteryUnlocks.specialChallenges.length}</Text>
                  <Text style={styles.collectionStatLabel}>{t("special")}</Text>
                </View>
                <View style={styles.collectionStatDivider} />
                <View style={styles.collectionStatBox}>
                  <Text style={styles.collectionStatValue}>{premiumCosmeticCount}</Text>
                  <Text style={styles.collectionStatLabel}>{t("cosmetics")}</Text>
                </View>
              </View>

              {/* Live Loadout */}
              <View style={styles.loadoutCard}>
                <Text style={styles.loadoutTitle}>{"\uD83C\uDFA8"} {t("activeLoadout")}</Text>
                <View style={styles.loadoutSlots}>
                  <View style={styles.loadoutSlot}>
                    <Text style={styles.loadoutSlotIcon}>{"\u270F\uFE0F"}</Text>
                    <Text style={styles.loadoutSlotLabel}>{t("brush")}</Text>
                    <Text style={styles.loadoutSlotValue}>{progression.premium.selectedBrushId ? PREMIUM_COSMETIC_CATALOG.find(c => c.id === progression.premium.selectedBrushId)?.name || t("custom") : t("default")}</Text>
                  </View>
                  <View style={styles.loadoutSlot}>
                    <Text style={styles.loadoutSlotIcon}>{"\u2728"}</Text>
                    <Text style={styles.loadoutSlotLabel}>{t("trail")}</Text>
                    <Text style={styles.loadoutSlotValue}>{progression.premium.selectedTrailId ? PREMIUM_COSMETIC_CATALOG.find(c => c.id === progression.premium.selectedTrailId)?.name || t("custom") : t("default")}</Text>
                  </View>
                  <View style={styles.loadoutSlot}>
                    <Text style={styles.loadoutSlotIcon}>{"\uD83D\uDDBC\uFE0F"}</Text>
                    <Text style={styles.loadoutSlotLabel}>{t("frame")}</Text>
                    <Text style={styles.loadoutSlotValue}>{progression.premium.selectedFrameId ? PREMIUM_COSMETIC_CATALOG.find(c => c.id === progression.premium.selectedFrameId)?.name || t("custom") : t("default")}</Text>
                  </View>
                </View>
              </View>

              {/* Brush Module */}
              <Text style={styles.collectionModuleTitle}>{"\u270F\uFE0F"} {t("brushes")}</Text>
              {brushInventory.length === 0 ? (
                <View style={styles.emptyModuleCard}>
                  <Text style={styles.emptyModuleText}>{t("noBrushesYet")}</Text>
                  <Text style={styles.emptyModuleHint}>{t("unlockWithPremium")}</Text>
                </View>
              ) : (
                brushInventory.map((item) => {
                  const isEquipped = progression.premium.selectedBrushId === item.id;
                  const rarityColor = item.rarity === "Mythic" ? "#fb923c" : item.rarity === "Legendary" ? "#a78bfa" : PRECISION_COLORS.cyan;
                  return (
                    <View key={item.id} style={[styles.cosmeticCard, isEquipped && styles.cosmeticCardEquipped]}>
                      <View style={[styles.cosmeticColorStrip, { backgroundColor: item.visual.strokeColor || rarityColor }]} />
                      <View style={styles.cosmeticCardBody}>
                        <View style={styles.cosmeticCardTop}>
                          <View>
                            <Text style={styles.cosmeticName}>{item.name}</Text>
                            <View style={[styles.rarityBadge, { backgroundColor: rarityColor + "22", borderColor: rarityColor + "44" }]}>
                              <Text style={[styles.rarityBadgeText, { color: rarityColor }]}>{tRarity(item.rarity).toUpperCase()}</Text>
                            </View>
                          </View>
                          <Pressable
                            onPress={() => { void handleSelectPremiumCosmetic(item.id); }}
                            style={({ pressed }) => [
                              styles.equipButton,
                              isEquipped && styles.equipButtonActive,
                              pressed && styles.buttonPressedSecondary
                            ]}
                          >
                            <Text style={[styles.equipButtonLabel, isEquipped && styles.equipButtonLabelActive]}>{isEquipped ? t("equipped") : t("equip")}</Text>
                          </Pressable>
                        </View>
                        <View style={[styles.cosmeticPreviewBar, { backgroundColor: item.visual.strokeColor || rarityColor }]} />
                      </View>
                    </View>
                  );
                })
              )}

              {/* Trail Module */}
              <Text style={styles.collectionModuleTitle}>{"\u2728"} {t("trails")}</Text>
              {trailInventory.length === 0 ? (
                <View style={styles.emptyModuleCard}>
                  <Text style={styles.emptyModuleText}>{t("noTrailsYet")}</Text>
                  <Text style={styles.emptyModuleHint}>{t("unlockWithPremium")}</Text>
                </View>
              ) : (
                trailInventory.map((item) => {
                  const isEquipped = progression.premium.selectedTrailId === item.id;
                  const rarityColor = item.rarity === "Mythic" ? "#fb923c" : item.rarity === "Legendary" ? "#a78bfa" : PRECISION_COLORS.cyan;
                  return (
                    <View key={item.id} style={[styles.cosmeticCard, isEquipped && styles.cosmeticCardEquipped]}>
                      <View style={[styles.cosmeticColorStrip, { backgroundColor: item.visual.trailColor || rarityColor }]} />
                      <View style={styles.cosmeticCardBody}>
                        <View style={styles.cosmeticCardTop}>
                          <View>
                            <Text style={styles.cosmeticName}>{item.name}</Text>
                            <View style={[styles.rarityBadge, { backgroundColor: rarityColor + "22", borderColor: rarityColor + "44" }]}>
                              <Text style={[styles.rarityBadgeText, { color: rarityColor }]}>{tRarity(item.rarity).toUpperCase()}</Text>
                            </View>
                          </View>
                          <Pressable
                            onPress={() => { void handleSelectPremiumCosmetic(item.id); }}
                            style={({ pressed }) => [
                              styles.equipButton,
                              isEquipped && styles.equipButtonActive,
                              pressed && styles.buttonPressedSecondary
                            ]}
                          >
                            <Text style={[styles.equipButtonLabel, isEquipped && styles.equipButtonLabelActive]}>{isEquipped ? t("equipped") : t("equip")}</Text>
                          </Pressable>
                        </View>
                        <View style={[styles.cosmeticPreviewBar, { backgroundColor: item.visual.trailColor || rarityColor, height: 6, borderRadius: 3, opacity: 0.6 }]} />
                      </View>
                    </View>
                  );
                })
              )}

              {/* Frame Module */}
              <Text style={styles.collectionModuleTitle}>{"\uD83D\uDDBC\uFE0F"} {t("frames")}</Text>
              {frameInventory.length === 0 ? (
                <View style={styles.emptyModuleCard}>
                  <Text style={styles.emptyModuleText}>{t("noFramesYet")}</Text>
                  <Text style={styles.emptyModuleHint}>{t("unlockWithPremium")}</Text>
                </View>
              ) : (
                frameInventory.map((item) => {
                  const isEquipped = progression.premium.selectedFrameId === item.id;
                  const rarityColor = item.rarity === "Mythic" ? "#fb923c" : item.rarity === "Legendary" ? "#a78bfa" : PRECISION_COLORS.cyan;
                  return (
                    <View key={item.id} style={[styles.cosmeticCard, isEquipped && styles.cosmeticCardEquipped]}>
                      <View style={[styles.cosmeticColorStrip, { backgroundColor: item.visual.frameColor || rarityColor }]} />
                      <View style={styles.cosmeticCardBody}>
                        <View style={styles.cosmeticCardTop}>
                          <View>
                            <Text style={styles.cosmeticName}>{item.name}</Text>
                            <View style={[styles.rarityBadge, { backgroundColor: rarityColor + "22", borderColor: rarityColor + "44" }]}>
                              <Text style={[styles.rarityBadgeText, { color: rarityColor }]}>{tRarity(item.rarity).toUpperCase()}</Text>
                            </View>
                          </View>
                          <Pressable
                            onPress={() => { void handleSelectPremiumCosmetic(item.id); }}
                            style={({ pressed }) => [
                              styles.equipButton,
                              isEquipped && styles.equipButtonActive,
                              pressed && styles.buttonPressedSecondary
                            ]}
                          >
                            <Text style={[styles.equipButtonLabel, isEquipped && styles.equipButtonLabelActive]}>{isEquipped ? t("equipped") : t("equip")}</Text>
                          </Pressable>
                        </View>
                        <View style={[styles.cosmeticPreviewBar, { backgroundColor: item.visual.frameColor || rarityColor, height: 4, borderRadius: 2 }]} />
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          ) : null}

          {homePanel === "challenge" ? (
            <View>
              <View style={styles.eventCard}>
                <Text style={styles.metaTitle}>{"\uD83C\uDFC6"} {t("shapeChallenge")}</Text>
                <Text style={styles.metaLine}>{t("challengeDesc")}</Text>
              </View>

              {/* Shape Picker */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: "row", gap: 8, paddingHorizontal: 4 }}>
                  {[
                    { key: "circle", label: "\u25CF " + tShape("circle") },
                    { key: "square", label: "\u25A0 " + tShape("square") },
                    { key: "triangle", label: "\u25B2 " + tShape("triangle") },
                    { key: "diamond", label: "\u25C6 " + tShape("diamond") },
                    { key: "pentagon", label: "\u2B1F " + tShape("pentagon") },
                    { key: "hexagon", label: "\u2B22 " + tShape("hexagon") },
                    { key: "heart", label: "\u2665 " + tShape("heart") },
                    { key: "star", label: "\u2605 " + tShape("star") }
                  ].map((shape) => (
                    <Pressable
                      key={shape.key}
                      onPress={() => {
                        setChallengeShape(shape.key);
                      }}
                      style={({ pressed }) => [
                        styles.filterChip,
                        challengeShape === shape.key && styles.filterChipActive,
                        pressed && styles.buttonPressedSoft
                      ]}
                    >
                      <Text style={[
                        styles.filterChipText,
                        challengeShape === shape.key && styles.filterChipTextActive
                      ]}>{shape.label}</Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>

              {/* Play Button */}
              <Pressable
                onPress={startChallengePlay}
                style={({ pressed }) => [
                  styles.challengePlayButton,
                  pressed && styles.buttonPressedSecondary
                ]}
              >
                <Text style={styles.challengePlayButtonText}>
                  {"\u25B6"} {t("play")}: {tShape(challengeShape)}
                </Text>
              </Pressable>

              {/* Latest Result */}
              {challengeResult && (
                <View style={[styles.eventCard, { borderColor: PRECISION_COLORS.primaryStrong + "44", marginTop: 12 }]}>
                  <Text style={styles.metaTitle}>{t("yourLatestResult")}</Text>
                  <View style={{ flexDirection: "row", justifyContent: "space-around", marginTop: 8 }}>
                    <View style={{ alignItems: "center" }}>
                      <Text style={styles.leaderboardAccuracy}>{challengeResult.accuracyPercent.toFixed(1)}%</Text>
                      <Text style={styles.metaLine}>{t("accuracy")}</Text>
                    </View>
                    <View style={{ alignItems: "center" }}>
                      <Text style={styles.leaderboardAccuracy}>{"\u2B50".repeat(challengeResult.stars)}</Text>
                      <Text style={styles.metaLine}>{t("stars")}</Text>
                    </View>
                    <View style={{ alignItems: "center" }}>
                      <Text style={styles.leaderboardAccuracy}>+{challengeResult.xpGained}</Text>
                      <Text style={styles.metaLine}>{t("xp")}</Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Rankings */}
              <View style={{ marginTop: 12 }}>
                <Text style={[styles.metaTitle, { marginBottom: 8, paddingHorizontal: 4 }]}>
                  {"\uD83C\uDFC6"} {tShape(challengeShape)} {t("rankings")}
                </Text>
                {challengeLoading ? (
                  <View style={styles.emptyModuleCard}>
                    <Text style={styles.emptyModuleText}>{t("loading")}</Text>
                  </View>
                ) : challengeEntries.length === 0 ? (
                  <View style={styles.emptyModuleCard}>
                    <Text style={styles.emptyModuleText}>{t("noEntriesYet")}</Text>
                    <Text style={styles.emptyModuleHint}>{t("beFirstToSubmit")}</Text>
                  </View>
                ) : (
                  challengeEntries.map((entry, index) => (
                    <View key={`${entry.userId}-${index}`} style={[
                      styles.leaderboardRow,
                      index === 0 && styles.leaderboardRowGold,
                      index === 1 && styles.leaderboardRowSilver,
                      index === 2 && styles.leaderboardRowBronze,
                      entry.userId === "local-user" && { borderColor: PRECISION_COLORS.cyan, borderWidth: 1.5 }
                    ]}>
                      <View style={styles.leaderboardRank}>
                        <Text style={[
                          styles.leaderboardRankText,
                          index < 3 && styles.leaderboardRankTextTop
                        ]}>
                          {index === 0 ? "\uD83E\uDD47" : index === 1 ? "\uD83E\uDD48" : index === 2 ? "\uD83E\uDD49" : `#${index + 1}`}
                        </Text>
                      </View>
                      <View style={styles.leaderboardInfo}>
                        <Text style={styles.leaderboardName}>{entry.displayName}</Text>
                      </View>
                      <View style={styles.leaderboardStats}>
                        <Text style={styles.leaderboardAccuracy}>{entry.accuracyPercent.toFixed(1)}%</Text>
                        <Text style={styles.leaderboardStars}>
                          {"\u2B50".repeat(entry.stars)}
                        </Text>
                      </View>
                    </View>
                  ))
                )}
              </View>
            </View>
          ) : null}

          <View style={styles.eventCard}>
            <Text style={styles.metaTitle}>{t("personalBestGhost")}</Text>
            <Text style={styles.metaLine}>{t("currentLevelPBAccuracy")}: {progression.personalBestByLevel[selectedLevelId]?.accuracyPercent?.toFixed(2) || "--"}%</Text>
            <Text style={styles.metaLine}>{t("currentLevelPBTime")}: {progression.personalBestByLevel[selectedLevelId]?.durationMs || "--"}ms</Text>
            <Text style={styles.metaLine}>{t("mechanic")}: {tMechanic(mechanicTag).toUpperCase()} {mechanicIsBoss ? `| ${t("boss")}` : ""}</Text>
            <Text style={styles.metaLine}>{tMechanicDesc(mechanicTag)}</Text>
          </View>
        </Animated.View>
      </Animated.View>

      <Animated.View
        style={{
          opacity: homeAnimValues[4],
          transform: [
            {
              translateY: homeAnimValues[4].interpolate({
                inputRange: [0, 1],
                outputRange: [18, 0]
              })
            }
          ]
        }}
      >
        <View style={styles.mainActionColumn}>
          <LinearGradient colors={PRECISION_GRADIENTS.primary} style={styles.startButton}>
            <Animated.View
              pointerEvents="none"
              style={[
                styles.startButtonSheen,
                {
                  transform: [
                    {
                      translateX: ctaSheenAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-240, 260]
                      })
                    },
                    { rotate: "18deg" }
                  ]
                }
              ]}
            />
            <Pressable
              style={({ pressed }) => [styles.startButtonPressable, pressed && styles.buttonPressedPrimary]}
              onPress={() => setScreen("home")}
            >
              <Text style={styles.startButtonLabel}>{t("goToLevels")}</Text>
            </Pressable>
          </LinearGradient>

          <Pressable onPress={handlePremiumPurchase} style={({ pressed }) => [styles.premiumButton, pressed && styles.buttonPressedSecondary]}>
            <Text style={styles.premiumButtonLabel}>{hasPremiumNoAds ? t("premiumActive") : t("unlockNoAds")}</Text>
          </Pressable>
        </View>
      </Animated.View>
    </ScrollView>
  );
}
