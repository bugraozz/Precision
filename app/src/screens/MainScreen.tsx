import React from "react";
import { Animated, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ScrollView, Text, View } from "tamagui";
import {
  Reveal, SectionLabel, GlassCard, StatBar, MetaCell,
  PrimaryCta, Chip, StatusPill, ShapeMark, SHAPE_KEYS
} from "../components/ui";
import type { ShapeKey } from "../components/ui";
import { PRECISION_COLORS, PRECISION_GRADIENTS, PRECISION_RADIUS } from "../theme/precisionTokens";
import { ENERGY_REGEN_INTERVAL_MS, ENERGY_REFILL_COIN_COST } from "../progression";
import type { ProgressionState } from "../progression";
import type { DailyShapeState } from "../progression";
import type { ChallengeEntry, LeaderboardEntry, WeeklyLadderEntry } from "../api";
import type { LevelConfig } from "../levels";
import { LEVEL_PACK_V1, getChapterById } from "../levels";
import { t, tShape, tDifficulty, tMode, tFocusHint, tChapterTitle } from "../i18n";
import type { Lang } from "../i18n";
import type { HomePanelKey } from "../types/app";

export type MainScreenProps = {
  homeAnimValues: Animated.Value[];
  homePanelAnim: Animated.Value;
  ctaSheenAnim: Animated.Value;
  progression: ProgressionState;
  selectedLevel: LevelConfig;
  totalBestStars: number;
  energySnapshot: { current: number; cap: number; isPremium: boolean };
  statusText: string;
  challengeShape: string;
  challengeEntries: ChallengeEntry[];
  challengeLoading: boolean;
  challengeResult: { accuracyPercent: number; stars: number; xpGained: number } | null;
  dailyShapeState: DailyShapeState;
  onStartDaily: () => void;
  setScreen: (screen: "main" | "home" | "play" | "complete") => void;
  setHomePanel: (panel: HomePanelKey) => void;
  handlePremiumPurchase: () => void;
  handleBuyEnergyRefill: () => void;
  setChallengeShape: (shape: string) => void;
  startChallengePlay: () => void;
  leaderboardEntries: LeaderboardEntry[];
  leaderboardShapeFilter: string;
  setLeaderboardShapeFilter: (shape: string) => void;
  ladderEntries: WeeklyLadderEntry[];
  lang: Lang;
  setLang: (lang: Lang) => void;
};

const RANK_TONES = [
  PRECISION_COLORS.amberStrong,
  PRECISION_COLORS.cyanStrong,
  PRECISION_COLORS.bronze
] as const;

/* ── Hairline ranking list row ── */
function RankRow({
  index,
  name,
  value,
  badge,
  isSelf,
  showDivider
}: {
  index: number;
  name: string;
  value: string;
  badge: string;
  isSelf: boolean;
  showDivider: boolean;
}) {
  const top = index < 3;
  const tone = top ? RANK_TONES[index] : PRECISION_COLORS.textSubtle;

  return (
    <View
      flexDirection="row"
      ai="center"
      py={12}
      pl={4}
      pr={4}
      h={12}
      borderBottomWidth={1}
      borderBottomColor={showDivider ? PRECISION_COLORS.borderMuted : "transparent"}
    >
      {top ? (
        <View
          w={26} h={26} br={13}
          ai="center" jc="center"
          bg="rgba(255,255,255,0.05)"
        >
          <Text color={tone} fos={11} fow="900">{`0${index + 1}`}</Text>
        </View>
      ) : (
        <View w={26} ai="center" jc="center">
          <Text color={PRECISION_COLORS.textSubtle} fos={11} fow="800">{index + 1}</Text>
        </View>
      )}
      <Text
        color={isSelf ? PRECISION_COLORS.primaryStrong : PRECISION_COLORS.textDim}
        fos={13}
        fow={isSelf ? "800" : "600"}
        f={1}
        numberOfLines={1}
        ml={12}
      >
        {name}
        {isSelf ? <Text color={PRECISION_COLORS.goldStrong} fos={10} fow="800"> · {t("you")}</Text> : null}
      </Text>
      <Text color={PRECISION_COLORS.textSubtle} fos={11} fow="700" ta="right" w={44}>
        {badge}
      </Text>
      <Text color={PRECISION_COLORS.textStrong} fos={13} fow="800" ta="right" w={68} ml={12}>
        {value}
      </Text>
    </View>
  );
}

function Rankings({
  heading,
  loading,
  emptyTitle,
  rows
}: {
  heading: string;
  loading: boolean;
  emptyTitle: string;
  rows: Array<{ key: string; name: string; value: string; badge: string; self: boolean }>;
}) {
  return (
    <View>
      <SectionLabel>{heading}</SectionLabel>
      {loading ? (
        <View py={20} ai="center">
          <Text color={PRECISION_COLORS.textSubtle} fos={12} fow="600">{t("loading")}</Text>
        </View>
      ) : rows.length === 0 ? (
        <View py={24} ai="center">
          <View w={5} h={5} br={3} bg={PRECISION_COLORS.borderGold} mb={12} />
          <Text color={PRECISION_COLORS.textDim} fos={13} fow="700">{emptyTitle}</Text>
          <Text color={PRECISION_COLORS.textSubtle} fos={11} fow="600" mt={4} ls={0.3}>
            {t("beFirstToSubmit")}
          </Text>
        </View>
      ) : (
        rows.map((row, i) => (
          <RankRow
            key={row.key}
            index={i}
            name={row.name}
            value={row.value}
            badge={row.badge}
            isSelf={row.self}
            showDivider={i < rows.length - 1}
          />
        ))
      )}
    </View>
  );
}

export default function MainScreen(props: MainScreenProps) {
  const [nowTime, setNowTime] = React.useState(Date.now());
  const [activeTab, setActiveTab] = React.useState<HomePanelKey>("challenge");

  React.useEffect(() => {
    const interval = setInterval(() => setNowTime(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const {
    homeAnimValues, homePanelAnim,
    progression, selectedLevel,
    totalBestStars, energySnapshot, statusText,
    challengeShape, challengeEntries, challengeLoading, challengeResult,
    dailyShapeState, onStartDaily,
    setScreen, setHomePanel, handlePremiumPurchase, handleBuyEnergyRefill,
    setChallengeShape, startChallengePlay,
    leaderboardEntries, leaderboardShapeFilter, setLeaderboardShapeFilter,
    ladderEntries,
    lang, setLang
  } = props;

  const tabs: Array<{ key: HomePanelKey; label: string }> = [
    { key: "challenge", label: t("challenge") },
    { key: "leaderboard", label: t("leaderboard") },
    { key: "weekly", label: t("weeklyLadderGlobal") }
  ];

  const selectTab = (key: HomePanelKey) => {
    setActiveTab(key);
    setHomePanel(key);
  };

  const regenRemainMs = Math.max(
    0,
    ENERGY_REGEN_INTERVAL_MS - (nowTime - (progression.energy.lastRegenTime ?? 0))
  );
  const regenClock = `${String(Math.floor(regenRemainMs / 60000)).padStart(2, "0")}:${String(Math.floor((regenRemainMs % 60000) / 1000)).padStart(2, "0")}`;
  const progressPct = Math.round((progression.unlockedLevels.length / LEVEL_PACK_V1.length) * 100);

  const metricMeta = [
    { label: t("shape"), value: tShape(selectedLevel.targetShape) },
    { label: t("difficulty"), value: tDifficulty(selectedLevel.difficulty) },
    { label: t("time"), value: `${(selectedLevel.timeLimitMs / 1000).toFixed(0)}s` },
    { label: t("mode"), value: tMode(selectedLevel.modeHint) }
  ];

  return (
    <ScrollView
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingTop: 56,
        paddingBottom: 44,
        alignSelf: "center",
        width: "100%",
        maxWidth: 980
      }}
    >
      {/* ── Header ── */}
      <Reveal anim={homeAnimValues[0]}>
        <LinearGradient
          colors={PRECISION_GRADIENTS.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ width: 48, height: 4, borderRadius: 4, marginBottom: 16, shadowColor: PRECISION_COLORS.primary, shadowRadius: 14, shadowOpacity: 0.45, shadowOffset: { width: 0, height: 4 } }}
        />
        <View flexDirection="row" jc="space-between" ai="flex-start" mb={28}>
          <View>
            <Text fow="900" fos={40} lh={44} color={PRECISION_COLORS.textStrong} ls={-1.3}>
              {t("appTitle")}
            </Text>
            <Text mt={6} color={PRECISION_COLORS.textMuted} fos={11} ls={3} textTransform="uppercase" fow="700">
              {t("appSubtitle")}
            </Text>
          </View>
          <Pressable
            onPress={() => setLang(lang === "en" ? "tr" : "en")}
            style={({ pressed }) => ({
              height: 36,
              justifyContent: "center",
              paddingHorizontal: 14,
              borderRadius: PRECISION_RADIUS.md,
              borderWidth: 1,
              borderColor: PRECISION_COLORS.border,
              backgroundColor: pressed ? PRECISION_COLORS.surfaceStrong : PRECISION_COLORS.surface,
              transform: [{ scale: pressed ? 0.96 : 1 }]
            })}
          >
            <Text color={PRECISION_COLORS.textDim} fos={12} fow="800" ls={1}>
              {lang === "en" ? "TR" : "EN"}
            </Text>
          </Pressable>
        </View>
      </Reveal>

      {/* ── Vital stats ── */}
      <Reveal anim={homeAnimValues[1]}>
        <StatBar
          style={{ marginBottom: 12 }}
          items={[
            {
              icon: "star",
              color: PRECISION_COLORS.goldStrong,
              soft: PRECISION_COLORS.goldSoft,
              value: totalBestStars,
              label: t("stars")
            },
            {
              icon: "circle",
              color: PRECISION_COLORS.emerald,
              soft: PRECISION_COLORS.emeraldSoft,
              value: progression.coins,
              label: t("coins")
            }
          ]}
        />

        {/* Energy · Rounds */}
        <GlassCard style={{ marginBottom: 12, padding: 0 }}>
          <View flexDirection="row" py={16} px={16}>
            <View f={1}>
              <Text color={PRECISION_COLORS.textMuted} fos={9} fow="800" ls={1.6} textTransform="uppercase" mb={6}>
                {t("energy")}{energySnapshot.isPremium ? " ×3" : ""}
              </Text>
              <Text color={PRECISION_COLORS.textStrong} fos={17} fow="900">
                {energySnapshot.current} <Text color={PRECISION_COLORS.textSubtle} fos={13} fow="700">/ {energySnapshot.cap}</Text>
              </Text>
              {energySnapshot.current < energySnapshot.cap ? (
                <View flexDirection="row" ai="center" gap={6} mt={6}>
                  <View w={4} h={4} br={2} bg={PRECISION_COLORS.cyanStrong} />
                  <Text color={PRECISION_COLORS.cyanStrong} fos={11} fow="800" ls={0.5}>
                    {regenClock}
                  </Text>
                </View>
              ) : (
                <View flexDirection="row" ai="center" gap={6} mt={6}>
                  <View w={4} h={4} br={2} bg={PRECISION_COLORS.emerald} />
                  <Text color={PRECISION_COLORS.emerald} fos={11} fow="800" ls={0.5}>FULL</Text>
                </View>
              )}
            </View>
            <View w={1} bg={PRECISION_COLORS.borderMuted} my={2} mx={16} />
            <View f={1}>
              <Text color={PRECISION_COLORS.textMuted} fos={9} fow="800" ls={1.6} textTransform="uppercase" mb={6}>
                {t("rounds")}
              </Text>
              <Text color={PRECISION_COLORS.textStrong} fos={17} fow="900">
                {progression.completedRounds}
              </Text>
            </View>
          </View>
        </GlassCard>

        {/* Premium — champagne VIP */}
        <Pressable onPress={handlePremiumPurchase} style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.985 : 1 }] })}>
          <GlassCard accent="gold" style={{ marginBottom: 12 }}>
            <View flexDirection="row" ai="center" gap={12}>
              <View w={40} h={40} br={PRECISION_RADIUS.xl} ai="center" jc="center"
                bg={PRECISION_COLORS.goldSoft} bw={1} borderColor={PRECISION_COLORS.borderGoldSoft}>
                <ShapeMark shape="star" size={17} color={PRECISION_COLORS.goldStrong} strokeWidth={2} />
              </View>
              <View f={1}>
                <View flexDirection="row" ai="center" gap={8}>
                  <Text color={PRECISION_COLORS.goldStrong} fow="900" fos={14} ls={0.2} textTransform="uppercase">
                    {progression.premium.isActive ? t("premiumActive") : t("premiumPack")}
                  </Text>
                  {progression.premium.isActive ? (
                    <View bg={PRECISION_COLORS.goldStrong} br={PRECISION_RADIUS.pill} px={8} py={2}>
                      <Text color={PRECISION_COLORS.bg} fow="900" fos={9} ls={1}>{t("pro")}</Text>
                    </View>
                  ) : null}
                </View>
                <Text color={PRECISION_COLORS.textMuted} fos={11} mt={3} fow="600">
                  {progression.premium.isActive ? t("premiumDescActive") : t("premiumDescInactive")}
                </Text>
              </View>
              {!progression.premium.isActive ? (
                <Text color={PRECISION_COLORS.goldStrong} fos={17} fow="900" pr={2}>›</Text>
              ) : null}
            </View>
          </GlassCard>
        </Pressable>

        {/* Energy refill */}
        <Pressable
          onPress={() => { void handleBuyEnergyRefill(); }}
          style={({ pressed }) => ({
            height: 48,
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            borderRadius: PRECISION_RADIUS.xxl,
            borderWidth: 1,
            borderColor: PRECISION_COLORS.border,
            backgroundColor: pressed ? PRECISION_COLORS.surfaceStrong : PRECISION_COLORS.surface,
            marginBottom: 20,
            transform: [{ scale: pressed ? 0.98 : 1 }]
          })}
        >
          <Text color={PRECISION_COLORS.emerald} fow="800" fos={13} f={1}>+1 {t("energy")}</Text>
          <View flexDirection="row" ai="center" bg={PRECISION_COLORS.emeraldSoft} px={10} py={4} br={PRECISION_RADIUS.pill}>
            <Text color={PRECISION_COLORS.emerald} fow="900" fos={12}>{ENERGY_REFILL_COIN_COST}</Text>
            <Text fos={11} ml={4} color={PRECISION_COLORS.emerald}>◆</Text>
          </View>
        </Pressable>

        {/* Overall progress */}
        <View flexDirection="row" ai="center" jc="space-between" mb={10} px={2}>
          <Text color={PRECISION_COLORS.textMuted} fos={10} fow="800" ls={2} textTransform="uppercase">
            {t("overallProgress")}
          </Text>
          <Text color={PRECISION_COLORS.goldStrong} fos={12} fow="900">{progressPct}%</Text>
        </View>
        <View h={6} br={999} bg={PRECISION_COLORS.whiteTrack} overflow="hidden" mb={28}>
          <LinearGradient
            colors={PRECISION_GRADIENTS.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ height: 6, borderRadius: 999, width: `${progressPct}%` }}
          />
        </View>
      </Reveal>

      {/* ── Current mission ── */}
      <Reveal anim={homeAnimValues[2]}>
        <SectionLabel>{t("currentMission")}</SectionLabel>
        <GlassCard accent="ice" style={{ marginBottom: 28 }}>
          <View flexDirection="row" ai="center" gap={14} mb={16}>
            <View w={48} h={48} br={PRECISION_RADIUS.xxl} ai="center" jc="center"
              bg={PRECISION_COLORS.cyanTint} bw={1} borderColor="rgba(174,188,205,0.18)">
              <ShapeMark shape={selectedLevel.targetShape} size={22} color={PRECISION_COLORS.cyanStrong} />
            </View>
            <View f={1}>
              <View flexDirection="row" ai="center" gap={8}>
                <Text color={PRECISION_COLORS.textSubtle} fow="900" fos={12} ls={1}>L{selectedLevel.index}</Text>
                <Text color={PRECISION_COLORS.textStrong} fow="900" fos={16} ls={-0.3}>
                  {tShape(selectedLevel.targetShape)}
                </Text>
              </View>
              <Text color={PRECISION_COLORS.textMuted} fos={10} mt={3} ls={0.8} textTransform="uppercase" fow="700">
                {tChapterTitle(getChapterById(selectedLevel.chapterId)?.title ?? "")}
                {selectedLevel.isBoss ? ` · ${t("boss")}` : ""}
              </Text>
            </View>
            <View ai="center" bg={PRECISION_COLORS.goldSoft} py={8} px={12} br={PRECISION_RADIUS.lg} bw={1} borderColor={PRECISION_COLORS.borderGoldSoft}>
              <Text color={PRECISION_COLORS.goldStrong} fow="900" fos={16}>{progression.cumulativeXp}</Text>
              <Text color={PRECISION_COLORS.goldStrong} fos={8} fow="800" ls={1.2} textTransform="uppercase" opacity={0.7}>
                {t("xp")}
              </Text>
            </View>
          </View>

          <View flexDirection="row" fw="wrap" gap={8} mb={12}>
            {metricMeta.map((item, i) => (
              <View key={i} style={{ width: "48.5%" }}>
                <MetaCell label={item.label} value={item.value} />
              </View>
            ))}
          </View>

          <View flexDirection="row" ai="center" gap={10} bg={PRECISION_COLORS.surfaceSunken} br={PRECISION_RADIUS.lg} py={12} px={14}>
            <View w={4} h={4} br={2} bg={PRECISION_COLORS.primaryStrong} />
            <Text color={PRECISION_COLORS.textDim} fos={11.5} ls={0.2} f={1} fow="600">
              {tFocusHint(selectedLevel.mechanicTag)}
            </Text>
          </View>
        </GlassCard>
      </Reveal>

      {/* ── Tabs ── */}
      <Reveal anim={homeAnimValues[3]}>
        <View
          flexDirection="row"
          height={48}
          br={PRECISION_RADIUS.pill}
          bw={1}
          borderColor={PRECISION_COLORS.borderCard}
          bg={PRECISION_COLORS.surface}
          p={4}
          mb={20}
        >
          {tabs.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                onPress={() => selectTab(tab.key)}
                style={({ pressed }) => ({
                  flex: 1,
                  borderRadius: PRECISION_RADIUS.pill,
                  backgroundColor: active ? PRECISION_COLORS.primarySoft : "transparent",
                  borderColor: active ? "rgba(225,29,72,0.28)" : "transparent",
                  borderWidth: 1,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                  height: "100%",
                  justifyContent: "center"
                })}
              >
                <Text
                  ta="center"
                  color={active ? PRECISION_COLORS.primaryStrong : PRECISION_COLORS.textMuted}
                  fos={11}
                  fow={active ? "900" : "700"}
                  ls={1.2}
                  textTransform="uppercase"
                  numberOfLines={1}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Animated.View
          style={{
            opacity: homePanelAnim,
            transform: [
              { translateY: homePanelAnim.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }
            ]
          }}
        >
          {/* ——— Challenge ——— */}
          {activeTab === "challenge" ? (
            <View>
              {/* Daily shape */}
              <Pressable onPress={onStartDaily} style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.985 : 1 }] })}>
                <GlassCard accent={dailyShapeState.playedToday ? "gold" : "red"} style={{ marginBottom: 16 }}>
                  <View flexDirection="row" ai="center" gap={14}>
                    <View w={48} h={48} br={PRECISION_RADIUS.xxl} ai="center" jc="center"
                      bg={dailyShapeState.playedToday ? PRECISION_COLORS.goldSoft : PRECISION_COLORS.primarySoft}
                      bw={1}
                      borderColor={dailyShapeState.playedToday ? PRECISION_COLORS.borderGoldSoft : "rgba(225,29,72,0.24)"}>
                      <ShapeMark
                        shape={dailyShapeState.shape}
                        size={22}
                        color={dailyShapeState.playedToday ? PRECISION_COLORS.goldStrong : PRECISION_COLORS.primaryStrong}
                      />
                    </View>
                    <View f={1}>
                      <View flexDirection="row" ai="center" gap={8}>
                        <Text color={PRECISION_COLORS.textStrong} fow="900" fos={14} ls={0.2} textTransform="uppercase">
                          {t("dailyShape")}
                        </Text>
                        {dailyShapeState.streak > 0 ? (
                          <View bg={PRECISION_COLORS.amberSoft} br={PRECISION_RADIUS.pill} px={8} py={2}>
                            <Text color={PRECISION_COLORS.amberStrong} fow="900" fos={9} ls={0.8}>
                              {`▲ ${dailyShapeState.streak}`}
                            </Text>
                          </View>
                        ) : null}
                      </View>
                      <Text color={PRECISION_COLORS.textMuted} fos={11.5} mt={3} fow="600">
                        {dailyShapeState.streak > 0
                          ? `${t("dailyStreakLabel")} ${dailyShapeState.streak} · ${tShape(dailyShapeState.shape)}`
                          : tShape(dailyShapeState.shape)}
                        {dailyShapeState.bestAccuracy > 0
                          ? ` · ${t("dailyBest")} ${(dailyShapeState.bestAccuracy).toFixed(1)}%`
                          : ""}
                      </Text>
                    </View>
                    <View
                      bg={dailyShapeState.playedToday ? PRECISION_COLORS.goldSoft : PRECISION_COLORS.primary}
                      br={PRECISION_RADIUS.lg} px={14} py={10}
                      bw={1}
                      borderColor={dailyShapeState.playedToday ? PRECISION_COLORS.borderGoldSoft : "transparent"}
                    >
                      <Text
                        color={dailyShapeState.playedToday ? PRECISION_COLORS.goldStrong : PRECISION_COLORS.primaryInk}
                        fow="900" fos={12} ls={0.6} textTransform="uppercase"
                      >
                        {dailyShapeState.playedToday ? t("dailyReplay") : t("dailyPlay")}
                      </Text>
                    </View>
                  </View>
                </GlassCard>
              </Pressable>

              <View mb={16} px={2}>
                <Text color={PRECISION_COLORS.textStrong} fow="800" fos={15} ls={-0.2} mb={4}>
                  {t("shapeChallenge")}
                </Text>
                <Text color={PRECISION_COLORS.textMuted} fos={12} fow="500" lh={18}>
                  {t("challengeDesc")}
                </Text>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                <View style={{ flexDirection: "row", gap: 8, paddingHorizontal: 2 }}>
                  {SHAPE_KEYS.map((shape) => (
                    <Chip
                      key={shape}
                      label={tShape(shape) as string}
                      icon={shape}
                      active={challengeShape === shape}
                      onPress={() => setChallengeShape(shape)}
                    />
                  ))}
                </View>
              </ScrollView>

              <PrimaryCta
                label={`${t("play")} — ${tShape(challengeShape)}`}
                onPress={startChallengePlay}
                height={52}
              />

              {challengeResult ? (
                <View mt={20}>
                  <SectionLabel>{t("yourLatestResult")}</SectionLabel>
                  <View flexDirection="row" py={8}>
                    <View ai="center" f={1}>
                      <Text color={PRECISION_COLORS.textStrong} fos={17} fow="900">
                        {challengeResult.accuracyPercent.toFixed(1)}%
                      </Text>
                      <Text color={PRECISION_COLORS.textMuted} fos={9} ls={1.2} textTransform="uppercase" fow="800" mt={4}>
                        {t("accuracy")}
                      </Text>
                    </View>
                    <View w={1} bg={PRECISION_COLORS.borderMuted} my={4} />
                    <View ai="center" f={1}>
                      <Text color={PRECISION_COLORS.amberStrong} fos={17} fow="900">
                        {"★".repeat(challengeResult.stars)}{"☆".repeat(Math.max(0, 3 - challengeResult.stars))}
                      </Text>
                      <Text color={PRECISION_COLORS.textMuted} fos={9} ls={1.2} textTransform="uppercase" fow="800" mt={4}>
                        {t("stars")}
                      </Text>
                    </View>
                    <View w={1} bg={PRECISION_COLORS.borderMuted} my={4} />
                    <View ai="center" f={1}>
                      <Text color={PRECISION_COLORS.emerald} fos={17} fow="900">+{challengeResult.xpGained}</Text>
                      <Text color={PRECISION_COLORS.textMuted} fos={9} ls={1.2} textTransform="uppercase" fow="800" mt={4}>
                        {t("xp")}
                      </Text>
                    </View>
                  </View>
                </View>
              ) : null}

              <View mt={16}>
                <Rankings
                  heading={`${tShape(challengeShape)} ${t("rankings")}`}
                  loading={challengeLoading}
                  emptyTitle={t("noEntriesYet")}
                  rows={challengeEntries.map((entry, i) => ({
                    key: `${entry.userId}-${i}`,
                    name: entry.displayName,
                    value: `${entry.accuracyPercent.toFixed(1)}%`,
                    badge: "★".repeat(entry.stars),
                    self: entry.userId === "local-user"
                  }))}
                />
              </View>
            </View>
          ) : null}

          {/* ——— Leaderboard ——— */}
          {activeTab === "leaderboard" ? (
            <View>
              <View mb={16} px={2}>
                <Text color={PRECISION_COLORS.textStrong} fow="800" fos={15} ls={-0.2} mb={4}>
                  {t("globalRankings")}
                </Text>
                <Text color={PRECISION_COLORS.textMuted} fos={12} fow="500" lh={18}>
                  {t("globalRankingsDesc")}
                </Text>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                <View style={{ flexDirection: "row", gap: 8, paddingHorizontal: 2 }}>
                  <Chip
                    label={t("allShapes")}
                    active={leaderboardShapeFilter === ""}
                    onPress={() => setLeaderboardShapeFilter("")}
                  />
                  {SHAPE_KEYS.map((shape) => (
                    <Chip
                      key={shape}
                      label={tShape(shape) as string}
                      icon={shape}
                      active={leaderboardShapeFilter === shape}
                      onPress={() => setLeaderboardShapeFilter(shape)}
                    />
                  ))}
                </View>
              </ScrollView>

              <Rankings
                heading={t("globalRankings")}
                loading={false}
                emptyTitle={t("noLeaderboardData")}
                rows={leaderboardEntries.map((entry, i) => ({
                  key: `${entry.userId}-${i}`,
                  name: entry.displayName,
                  value: `${entry.accuracyPercent.toFixed(1)}%`,
                  badge: "★".repeat(entry.stars),
                  self: entry.userId === "local-user"
                }))}
              />
            </View>
          ) : null}

          {/* ——— Weekly ladder ——— */}
          {activeTab === "weekly" ? (
            <View>
              <View mb={16} px={2}>
                <Text color={PRECISION_COLORS.textStrong} fow="800" fos={15} ls={-0.2} mb={4}>
                  {t("weeklyLadderGlobal")}
                </Text>
                <Text color={PRECISION_COLORS.textMuted} fos={12} fow="500" lh={18}>
                  {t("weeklyLadderGlobalDesc")}
                </Text>
              </View>

              <Rankings
                heading={t("weeklyLadderGlobal")}
                loading={false}
                emptyTitle={t("noLadderData")}
                rows={ladderEntries.map((entry, i) => ({
                  key: `${entry.userId}-${i}`,
                  name: entry.displayName,
                  value: String(entry.ladderPoints),
                  badge: "★".repeat(entry.stars),
                  self: entry.userId === "local-user"
                }))}
              />
            </View>
          ) : null}
        </Animated.View>
      </Reveal>

      {/* ── Status feedback + CTA ── */}
      <Reveal anim={homeAnimValues[4]}>
        <View mb={16}>
          <StatusPill text={statusText} />
        </View>
        <PrimaryCta label={t("goToLevels")} onPress={() => setScreen("home")} />
      </Reveal>
    </ScrollView>
  );
}
