import React from "react";
import { Animated, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ScrollView, Text, View } from "tamagui";
import { Reveal, SectionLabel, GlassCard, MetaCell, PrimaryCta, StatusPill, ShapeMark } from "../components/ui";
import { PRECISION_COLORS, PRECISION_GRADIENTS, PRECISION_RADIUS } from "../theme/precisionTokens";
import LevelSelector from "../components/LevelSelector";
import {
  CHAPTERS,
  getLevelsForChapter,
} from "../levels";
import type { ProgressionState } from "../progression";
import type { LevelConfig } from "../levels";
import { t, tShape, tDifficulty, tMode, tFocusHint, tChapterTitle, tChapterHook } from "../i18n";
import type { Lang } from "../i18n";

export type LevelsScreenProps = {
  homeAnimValues: Animated.Value[];
  ctaSheenAnim: Animated.Value;
  progression: ProgressionState;
  selectedLevel: LevelConfig;
  selectedLevelId: string;
  selectedChapterId: string;
  chapterLevels: LevelConfig[];
  chapterStatus: Array<{ id: string; title: string; requiredStars: number; unlocked: boolean }>;
  energySnapshot: { current: number; cap: number; isPremium: boolean };
  statusText: string;
  setScreen: (screen: "main" | "home" | "play" | "complete") => void;
  setSelectedChapterId: (id: string) => void;
  setSelectedLevelId: (id: string) => void;
  setStatusText: (text: string) => void;
  setPlayMode: (mode: "level" | "challenge") => void;
  handleLevelSelect: (levelId: string) => void;
  tryStartMission: (source: "levels" | "retry" | "next") => Promise<boolean>;
  lang: Lang;
};

export default function LevelsScreen(props: LevelsScreenProps) {
  const {
    homeAnimValues: reveals,
    progression, selectedLevel, selectedLevelId,
    selectedChapterId, chapterLevels, chapterStatus, energySnapshot, statusText,
    setScreen, setSelectedChapterId, setSelectedLevelId, setStatusText,
    handleLevelSelect, tryStartMission
  } = props;

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
      <Reveal anim={props.homeAnimValues[0]}>
        <LinearGradient colors={PRECISION_GRADIENTS.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ width: 48, height: 4, borderRadius: 4, marginBottom: 16, shadowColor: PRECISION_COLORS.primary, shadowRadius: 14, shadowOpacity: 0.45, shadowOffset: { width: 0, height: 4 } }} />
        <Text fow="900" fos={40} lh={44} color={PRECISION_COLORS.textStrong} ls={-1.3}>{t("levels")}</Text>
        <Text color={PRECISION_COLORS.textMuted} fos={11} mt={6} mb={28} ls={3} textTransform="uppercase" fow="700">
          {t("selectChapterAndMission")}
        </Text>
      </Reveal>

      {/* ── Chapter rail ── */}
      <Reveal anim={props.homeAnimValues[1]}>
        <SectionLabel>{t("chapters")}</SectionLabel>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 18 }}>
          <View style={{ flexDirection: "row", gap: 10, paddingHorizontal: 2 }}>
            {CHAPTERS.map((chapter) => {
              const status = chapterStatus.find((item) => item.id === chapter.id);
              const unlocked = Boolean(status?.unlocked);
              const selected = chapter.id === selectedChapterId;

              return (
                <Pressable
                  key={chapter.id}
                  onPress={() => {
                    if (!unlocked) {
                      setStatusText(`${t("locked")}: ${chapter.requiredStars} ${t("starsRequired")} ${tChapterTitle(chapter.title)}.`);
                      return;
                    }
                    setSelectedChapterId(chapter.id);
                    const firstLevel = getLevelsForChapter(chapter.id)[0];
                    if (firstLevel?.id && progression.unlockedLevels.includes(firstLevel.id)) {
                      setSelectedLevelId(firstLevel.id);
                    }
                  }}
                  style={({ pressed }) => ({
                    paddingHorizontal: 18,
                    paddingVertical: 12,
                    borderRadius: PRECISION_RADIUS.xxl,
                    borderWidth: 1,
                    borderColor: selected
                      ? PRECISION_COLORS.borderGoldStrong
                      : unlocked
                        ? PRECISION_COLORS.border
                        : PRECISION_COLORS.borderFaint,
                    backgroundColor: selected
                      ? PRECISION_COLORS.primarySoft
                      : pressed
                        ? PRECISION_COLORS.surfaceStrong
                        : PRECISION_COLORS.surface,
                    opacity: unlocked ? 1 : 0.5,
                    transform: [{ scale: pressed && unlocked ? 0.96 : 1 }]
                  })}
                >
                  <View flexDirection="row" ai="center" gap={8} mb={4}>
                    <Text
                      color={selected ? PRECISION_COLORS.primaryStrong : unlocked ? PRECISION_COLORS.textStrong : PRECISION_COLORS.textMuted}
                      fow="900"
                      fos={15}
                      ls={-0.3}
                    >
                      {tChapterTitle(chapter.title)}
                    </Text>
                  </View>
                  <Text
                    color={selected ? PRECISION_COLORS.textClaim : unlocked ? PRECISION_COLORS.textMuted : PRECISION_COLORS.textSubtle}
                    fos={10}
                    fow="700"
                    ls={0.5}
                  >
                    {unlocked ? tChapterHook(chapter.hook) : `${chapter.requiredStars} ${t("starsLabel")}`}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        <LevelSelector
          levels={chapterLevels}
          selectedLevelId={selectedLevelId}
          unlockedLevels={progression.unlockedLevels}
          bestStarsByLevel={progression.bestStarsByLevel}
          onSelect={handleLevelSelect}
        />
      </Reveal>

      {/* ── Mission detail ── */}
      <Reveal anim={props.homeAnimValues[2]}>
        <SectionLabel>{t("currentMission")}</SectionLabel>
        <GlassCard accent="red" style={{ marginBottom: 20 }}>
          <View flexDirection="row" ai="center" gap={14} mb={16}>
            <View w={48} h={48} br={PRECISION_RADIUS.xxl} ai="center" jc="center"
              bg={PRECISION_COLORS.primarySoft} bw={1} borderColor="rgba(225,29,72,0.24)">
              <ShapeMark shape={selectedLevel.targetShape} size={22} color={PRECISION_COLORS.primaryStrong} />
            </View>
            <View f={1}>
              <View flexDirection="row" ai="center" gap={8}>
                <Text color={PRECISION_COLORS.textSubtle} fow="900" fos={12} ls={1}>L{selectedLevel.index}</Text>
                <Text color={PRECISION_COLORS.textStrong} fow="900" fos={16} ls={-0.3}>
                  {tShape(selectedLevel.targetShape)}
                </Text>
              </View>
              <Text color={PRECISION_COLORS.textMuted} fos={10} mt={3} ls={0.8} textTransform="uppercase" fow="700">
                {tDifficulty(selectedLevel.difficulty)} · {tMode(selectedLevel.modeHint)}
                {selectedLevel.isBoss ? ` · ${t("boss")}` : ""}
              </Text>
            </View>
          </View>

          <View flexDirection="row" gap={8} mb={12}>
            <MetaCell label={t("time")} value={`${(selectedLevel.timeLimitMs / 1000).toFixed(0)}s`} />
            <MetaCell label={t("energy")} value={`${energySnapshot.current}/${energySnapshot.cap}`} />
            <MetaCell label={t("xp")} value={String(progression.cumulativeXp)} />
          </View>

          <View flexDirection="row" ai="center" gap={10} bg={PRECISION_COLORS.surfaceSunken}
            br={PRECISION_RADIUS.lg} py={12} px={14}>
            <View w={4} h={4} br={2} bg={PRECISION_COLORS.primaryStrong} />
            <Text color={PRECISION_COLORS.textDim} fos={11.5} ls={0.2} f={1} fow="600">
              {tFocusHint(selectedLevel.mechanicTag)}
            </Text>
          </View>
        </GlassCard>

        <View mb="$3">
          <StatusPill text={statusText} />
        </View>

        <View flexDirection="row" gap="$3">
          <Pressable
            onPress={() => setScreen("main")}
            style={({ pressed }) => ({
              paddingHorizontal: 22,
              height: 56,
              borderRadius: PRECISION_RADIUS.xl,
              borderWidth: 1,
              borderColor: PRECISION_COLORS.border,
              backgroundColor: pressed ? PRECISION_COLORS.surfaceStrong : PRECISION_COLORS.surface,
              justifyContent: "center",
              alignItems: "center",
              transform: [{ scale: pressed ? 0.97 : 1 }]
            })}
          >
            <Text color={PRECISION_COLORS.textDim} fow="800" fos={14} ls={0.5}>{t("home")}</Text>
          </Pressable>

          <View f={1}>
            <PrimaryCta
              label={energySnapshot.current > 0 ? t("startMission") : t("noEnergy")}
              onPress={() => {
                if (energySnapshot.current <= 0) return;
                props.setPlayMode("level");
                void tryStartMission("levels");
              }}
              disabled={energySnapshot.current <= 0}
              height={56}
              fontSize={16}
            />
          </View>
        </View>
      </Reveal>
    </ScrollView>
  );
}
