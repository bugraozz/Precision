import React from "react";
import { Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ScrollView, Text, View } from "tamagui";
import Pressable from "../components/TamaguiPressable";
import LevelSelector from "../components/LevelSelector";
import { PRECISION_GRADIENTS } from "../theme/precisionTokens";
import { styles } from "../styles";
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
    homeAnimValues, ctaSheenAnim,
    progression, selectedLevel, selectedLevelId,
    selectedChapterId, chapterLevels, chapterStatus, energySnapshot,
    setScreen, setSelectedChapterId, setSelectedLevelId, setStatusText, setPlayMode,
    handleLevelSelect, tryStartMission,
    lang
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
        <Text style={styles.heroTitle}>{t("levels")}</Text>
        <Text style={styles.heroSubtitle}>{t("selectChapterAndMission")}</Text>
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
        <Text style={styles.sectionTitle}>{t("chapters")}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chapterRow}>
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
                style={({ pressed }) => [
                  styles.chapterChip,
                  selected && styles.chapterChipSelected,
                  !unlocked && styles.chapterChipLocked,
                  pressed && unlocked && styles.buttonPressedSoft
                ]}
              >
                <Text style={styles.chapterChipTitle}>{tChapterTitle(chapter.title)}</Text>
                <Text style={styles.chapterChipMeta}>{unlocked ? tChapterHook(chapter.hook) : `${chapter.requiredStars} ${t("starsLabel")}`}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <LevelSelector
          levels={chapterLevels}
          selectedLevelId={selectedLevelId}
          unlockedLevels={progression.unlockedLevels}
          bestStarsByLevel={progression.bestStarsByLevel}
          onSelect={handleLevelSelect}
        />
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
        <View style={styles.selectedMissionCard}>
          <View style={styles.selectedMissionHeader}>
            <View style={styles.selectedMissionIcon}>
              <Text style={styles.selectedMissionIconText}>{tShape(selectedLevel.targetShape).slice(0, 1).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.selectedMissionName}>{tShape(selectedLevel.targetShape).toUpperCase()}</Text>
              <Text style={styles.selectedMissionDifficulty}>{tDifficulty(selectedLevel.difficulty).toUpperCase()} {"\u00B7"} {tMode(selectedLevel.modeHint).toUpperCase()}</Text>
            </View>
          </View>

          <View style={styles.selectedMissionStats}>
            <View style={styles.selectedMissionStat}>
              <Text style={styles.selectedMissionStatValue}>{(selectedLevel.timeLimitMs / 1000).toFixed(0)}s</Text>
              <Text style={styles.selectedMissionStatLabel}>{t("time")}</Text>
            </View>
            <View style={styles.selectedMissionStatDivider} />
            <View style={styles.selectedMissionStat}>
              <Text style={styles.selectedMissionStatValue}>{energySnapshot.current}/{energySnapshot.cap}</Text>
              <Text style={styles.selectedMissionStatLabel}>{t("energy").toUpperCase()}</Text>
            </View>
            <View style={styles.selectedMissionStatDivider} />
            <View style={styles.selectedMissionStat}>
              <Text style={styles.selectedMissionStatValue}>{progression.cumulativeXp}</Text>
              <Text style={styles.selectedMissionStatLabel}>{t("xp")}</Text>
            </View>
            <View style={styles.selectedMissionStatDivider} />
            <View style={styles.selectedMissionStat}>
              <Text style={styles.selectedMissionStatValue}>{progression.completedRounds}</Text>
              <Text style={styles.selectedMissionStatLabel}>{t("rounds").toUpperCase()}</Text>
            </View>
          </View>

          <View style={styles.selectedMissionHint}>
            <Text style={styles.selectedMissionHintIcon}>{"\u26A1"}</Text>
            <Text style={styles.selectedMissionHintText}>{tFocusHint(selectedLevel.mechanicTag)}</Text>
          </View>
        </View>

        <View style={styles.homeActionRow}>
          <Pressable onPress={() => setScreen("main")} style={({ pressed }) => [styles.iconButton, pressed && styles.buttonPressedSoft]}>
            <Text style={styles.iconButtonLabel}>{t("home")}</Text>
          </Pressable>

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
              disabled={energySnapshot.current <= 0}
              style={({ pressed }) => [
                styles.startButtonPressable,
                energySnapshot.current <= 0 && styles.claimButtonDisabled,
                pressed && energySnapshot.current > 0 && styles.buttonPressedPrimary
              ]}
              onPress={() => {
                setPlayMode("level");
                void tryStartMission("levels");
              }}
            >
              <Text style={styles.startButtonLabel}>{energySnapshot.current > 0 ? t("startMission") : t("noEnergy")}</Text>
            </Pressable>
          </LinearGradient>
        </View>
      </Animated.View>
    </ScrollView>
  );
}
